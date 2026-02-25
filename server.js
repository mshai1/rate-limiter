const express = require("express");
const testRoutes = require("./routes/testRoute");

const app = express();
app.use(express.json());
app.use("/api", testRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})