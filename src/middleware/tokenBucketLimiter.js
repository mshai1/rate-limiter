const buckets = new Map();

const MAX_CAPACITY = 5; //max token
const REFILL_RATE = 1;  //tokens per second

function tokenBucketLimiter(req, res, next) {
    const key = req.ip;
    const now = Date.now();

    if(!buckets.has(key)) {
        buckets.set(key, {
            tokens: MAX_CAPACITY,
            lastRefill: now
        });
    }

    const bucket = buckets.get(key);

    //Calculate time passed
    const timePassed = (now - bucket.lastRefill) / 1000;

    //Calculate how many tokens to add
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
        const tokenMissing = MAX_CAPACITY - bucket.tokens;
        const secondsUntilFull = Math.ceil(tokenMissing / REFILL_RATE);

        res.setHeader("X-RateLimit-Reset", secondsUntilFull);
        res.set("X-RateLimit-Remaining", bucket.tokens);
        res.set("X-RateLimit-Limit", MAX_CAPACITY);
        return next();
    }

    const current = Date.now();
    const timeSinceLastRefill = (current - bucket.lastRefill) / 1000;
    
    const retryAfter = Math.ceil(
        (1/REFILL_RATE) - timeSinceLastRefill
    );

    res.setHeader("Retry-After", retryAfter > 0 ? retryAfter: 1);
    return res.status(429).json({
        error: "Rate limit exceeded"
    });
}

module.exports = tokenBucketLimiter;