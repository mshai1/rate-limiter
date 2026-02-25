const express = require("express");
const router = express.Router();
const fixedWindowLimiter = require("../middleware/fixedWindow");

router.get("/test", fixedWindowLimiter, (req, res) => {
    res.json({
        message: "Request successful",
        timestamp: Date.now()
    });
});

module.exports = router;