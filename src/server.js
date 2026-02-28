const express = require("express");
const testRoutes = require("./routes/testRoute");
const { connectRedis } = require("./redisClient");

const app = express();
app.use(express.json());
app.use("/api", testRoutes);

const PORT = 3000;
console.log("REDIS URL =", process.env.REDIS_URL);

async function startServer() {
    await connectRedis();

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});

}

startServer();