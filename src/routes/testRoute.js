const express = require("express");
const router = express.Router();
//const redisSlidingWindowLimiter = require("../middleware/redisSlidingwindow");
const redisTokenBucketLimiter = require("../middleware/redisTokenBucketLimiter")

router.get("/test", redisTokenBucketLimiter, (req, res) => {
    res.json({
        message: "Request successful",
        timestamp: Date.now()
    });
});

module.exports = router;