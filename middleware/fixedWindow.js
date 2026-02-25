const windowSizeMs = 10 * 1000; //10 seconds
const maxRequests = 5;

//In-memory store
const ipStore = new Map();

function fixedWindowLimiter(req, res, next) {
    const ip = req.ip;
    const currentTime = Date.now();

    if(!ipStore.has(ip)) {
        ipStore.set(ip, {
            count:1,
            windowStart:currentTime
        });
        return next();
    }

    const record = ipStore.get(ip);

    //If Window expired -> reset
    if(currentTime - record.startTime > windowSizeMs) {
        record.count = 1;
        record.windowStart = currentTime;
        next();
    }

    //If limit exceeded
    if(record.count > maxRequests) {
        const retryAfter = Math.ceil(
            (windowSizeMs - (currentTime - record.windowStart)) / 1000
        );
        return res.status(429).json({
            error:"Rate limit exceeded",
            retryAfter
        });
    }

    //Otherwise increment count
    record.count++;
    next();
}

module.exports = fixedWindowLimiter;