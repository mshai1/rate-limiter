const { redisClient } = require("../redisClient");

const windowSize = 10; //seconds
const maxRequests = 5;

async function redisFixedWindowLimiter(req, res, next) {
    try {
        const ip = req.ip;
        const key = `rate_limit:${ip}`;

        const requestCount = await redisClient.incr(key);

        //If first request, set expiration
        if(requestCount === 1) {
            await redisClient.expire(key, windowSize);
        }

        const ttl = await redisClient.ttl(key);
        const remaining = Math.max(0, maxRequests - requestCount);
        const resetTimestamp = Math.floor(Date.now() / 1000) + ttl;

        //Set headers for every request
        res.set("X-RateLimit-Limit", maxRequests);
        res.set("X_RateLimit-Remaining", remaining);
        res.set("X-RateLimit-Reset", resetTimestamp);
        
        if(requestCount > maxRequests) {
            return res.status(429).json({
                error: "Rate limit exceeded",
                retryAfter:ttl
            });
        }

        next();
    } catch (err) {
        console.error("Redis limiter error:", err);
        next(); //fail open for now
    }    
}

module.exports = redisFixedWindowLimiter;