const express = require("express");
const router = express.Router();
//const redisSlidingWindowLimiter = require("../middleware/redisSlidingwindow");
const tokenBucketLimiter = require("../middleware/tokenBucketLimiter")

router.get("/test", tokenBucketLimiter, (req, res) => {
    res.json({
        message: "Request successful",
        timestamp: Date.now()
    });
});

module.exports = router;