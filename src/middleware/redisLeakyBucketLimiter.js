const { redisClient } = require("../redisClient");

const CAPACITY = 5;
const LEAK_RATE = 1;

async function redisLeakyBucketLimiter(req, res, next) {
    let bucket;
    const identifier = req.ip;
    const key = `rate-limit:${identifier}`;
    const now = Date.now();

    const data = await redisClient.get(key);
    if(!data) {
        bucket = {
            water:0,
            lastLeak:now
        };
    } else {
        bucket = JSON.parse(data);
    }

    const timePassed = (now - bucket.lastLeak) / 1000;

    const leakedToken = Math.floor(timePassed * LEAK_RATE);

    if(leakedToken > 0)
    {
        bucket.water = Math.max(0, bucket.water - leakedToken);
        bucket.lastLeak += (leakedToken/LEAK_RATE) * 1000;
    }


    if(bucket.water < CAPACITY) {
        bucket.water += 1;

        await redisClient.set(key, JSON.stringify(bucket), { EX: 3600 });

        const remaining = CAPACITY - bucket.water;
        res.set("X-RateLimit-Limit", CAPACITY);
        res.set("X-RateLimit-Remaining", remaining);

        return next();
    }

    const timeSinceLastLeak = (Date.now() - bucket.lastLeak) / 1000;
    const retryAfter = Math.ceil((1/LEAK_RATE) - timeSinceLastLeak);

    res.setHeader("Retry-After", retryAfter > 0 ? retryAfter : 1);
    return res.status(429).json({
        error: "Rate limit exceeded"
    });

}

module.exports = redisLeakyBucketLimiter;