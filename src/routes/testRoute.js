const express = require("express");
const router = express.Router();
//const redisSlidingWindowLimiter = require("../middleware/redisSlidingwindow");
const redisLeakyBucketLimiter = require("../middleware/redisLeakyBucketLimiter")

router.get("/test", redisLeakyBucketLimiter, (req, res) => {
    res.json({
        message: "Request successful",
        timestamp: Date.now()
    });
});

module.exports = router;