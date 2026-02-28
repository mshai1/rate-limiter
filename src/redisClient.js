const { createClient } = require("redis");

console.log("Redis connecting to: ", process.env.REDIS_URL);
const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on("error", (err) => {
    console.log("Redis Client Error:", err);
});

async function connectRedis() {
    await redisClient.connect();
    console.log("Connected to Redis");
}

module.exports = { redisClient, connectRedis };