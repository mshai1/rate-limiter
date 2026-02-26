const express = require("express");
const router = express.Router();
const redisFixedWindowLimiter = require("../middleware/redisFixedWindow");

router.get("/test", redisFixedWindowLimiter, (req, res) => {
    res.json({
        message: "Request successful",
        timestamp: Date.now()
    });
});

module.exports = router;