const express = require("express");
const router = express.Router();
const redisSlidingWindowLimiter = require("../middleware/redisSlidingwindow");

router.get("/test", redisSlidingWindowLimiter, (req, res) => {
    res.json({
        message: "Request successful",
        timestamp: Date.now()
    });
});

module.exports = router;