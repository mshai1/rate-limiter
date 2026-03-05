const { redisClient } = require("../redisClient");

const MAX_CAPACITY = 5;
const REFILL_RATE = 1;

async function redisTokenBucketLimiter(req, res, next) {
    try {
        let bucket;
        const identifier = req.ip;
        const key = `rate_limit:${identifier}`;

        const data = await redisClient.get(key);
        if(!data) {
            bucket = {
                tokens: MAX_CAPACITY,
                lastRefill: Date.now()
            };
        } else {
            bucket = JSON.parse(data);
        }

        //Calculate time passed
        const timePassed = (Date.now() - bucket.lastRefill) / 1000;

        //Calculate number of tokens added
        const tokenAdded = Math.floor(timePassed * REFILL_RATE);

        if(tokenAdded > 0) {
            bucket.tokens = Math.min(
                MAX_CAPACITY,
                bucket.tokens + tokenAdded
            );
            bucket.lastRefill += (tokenAdded / REFILL_RATE) * 1000;
        }

        if(bucket.tokens > 0) {
            bucket.tokens -= 1;

            await redisClient.set(key, JSON.stringify(bucket), {
                EX: 3600
            });

            const tokenMissing = MAX_CAPACITY - bucket.tokens;
            const secondsUntilFull = Math.ceil(tokenMissing / REFILL_RATE);

            res.set("X-RateLimit-Reset", secondsUntilFull);
            res.set("X-RateLimit-Remaining", bucket.tokens);
            res.set("X-RateLimit-Limit", MAX_CAPACITY);
            return next();
        }

        const current  = Date.now();
        const timeSinceLastRefill = (current - bucket.lastRefill) / 1000;
        
        const retryAfter = Math.ceil(
            (1/REFILL_RATE) - timeSinceLastRefill
        );

        res.setHeader("Retry-After", retryAfter > 0 ? retryAfter:1);
        return res.status(429).json({
            error: "Rate limit exceeded"
        });

    } catch (err) {
        console.error("Redis limiter error:", err);
        next();
    }
}

module.exports = redisTokenBucketLimiter;