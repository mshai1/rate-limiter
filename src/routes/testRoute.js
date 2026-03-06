const express = require("express");
const router = express.Router();
//const redisSlidingWindowLimiter = require("../middleware/redisSlidingwindow");
const leakyBucketLimiter = require("../middleware/leakyBucketLimiter")

router.get("/test", leakyBucketLimiter, (req, res) => {
    res.json({
        message: "Request successful",
        timestamp: Date.now()
    });
});

module.exports = router;