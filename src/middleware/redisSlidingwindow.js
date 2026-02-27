const { redisClient} = require("../redisClient");

const WINDOW_SIZE = 10; //seconds
const MAX_REQUESTS = 5;

async function redisSlidingWindowLimiter(req, res, next) {
    try {
        const ip = req.ip;
        const key = `rate_limit_sliding:${ip}`;
        const now = Date.now();
        const windowStart = now - WINDOW_SIZE * 1000;

        //Remove old requests
        await redisClient.zRemRangeByScore(key, 0, windowStart);

        //Count remaining requests in window
        const requestCount = await redisClient.zCard(key);

        if(requestCount >= MAX_REQUESTS) {
            const oldestRequest = await redisClient.zRange(key, 0, 0, { WITHSCORES: true });

            if (!oldestRequest.length) {
                return res.status(429).json({
                    error: "Rate limit exceeded",
                    retryAfter: WINDOW_SIZE
                });
            }
            const oldestTimestamp = Number(oldestRequest[0]);
            console.log("Oldest request: ", oldestRequest);

            const retryAfter = Math.ceil(
                (oldestTimestamp + WINDOW_SIZE * 1000 - now) / 1000
            );

            return res.status(429).json({
                "error": "Rate limit exceeded",
                retryAfter: Math.max(retryAfter, 0)
            });
        }

        //Add current request timestamp
        await redisClient.zAdd(key, {
            score: now,
            value: now.toString()
        });

        //Ensure key expires
        await redisClient.expire(key, WINDOW_SIZE);

        const remaining = MAX_REQUESTS - requestCount - 1;

        res.set("X-RateLimit-Limit", MAX_REQUESTS);
        res.set("X-RateLimit-Remaining", remaining);
        res.set("X-RateLimit-Reset", Math.floor((now + WINDOW_SIZE * 1000) / 1000)
        );

        next();
    } catch(err) {
        console.error("Sliding window limiter error:", err);
        next();
    }
}

module.exports = redisSlidingWindowLimiter;