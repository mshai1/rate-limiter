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

        if(requestCount > maxRequests) {
            const ttl = await redisClient.ttl(key);

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