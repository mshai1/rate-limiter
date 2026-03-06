const buckets = new Map();

const CAPACTIY = 5;
const LEAK_RATE = 1;

function leakyBucketLimiter(req, res, next) {
    const key = req.ip;
    const now = Date.now();

    if(!buckets.has(key)) {
        buckets.set(key, {
            water: 0,
            lastLeak:now
        });
    }

    const bucket = buckets.get(key);

    //Calculate the time passed
    const timePassed = (now - bucket.lastLeak) / 1000;

    const leakedToken = Math.floor(timePassed * LEAK_RATE);

    bucket.water = Math.max(0, bucket.water - leakedToken);
    bucket.lastLeak += (leakedToken/LEAK_RATE) * 1000;

    if(bucket.water < CAPACTIY) {
        bucket.water += 1;
        const remaining = CAPACTIY - bucket.water;
        res.set("X-RateLimit-Limit", CAPACTIY);
        res.set("X-RateLimit-Remaining", remaining)

        return next();
    }

    const timeSinceLastLeak = (now - bucket.lastLeak) / 1000;
    const retyrAfter = Math.ceil((1/LEAK_RATE)) - timeSinceLastLeak;

    res.setHeader("Retry-After", retyrAfter > 0 ? retyrAfter : 1);
    return res.status(429).json({
        "error": "Rate limit exceeded"
    });
}

module.exports = leakyBucketLimiter;