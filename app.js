require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");
const loggerMiddleware = require("./middleware/loggerMiddleware");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(helmet());
app.use(loggerMiddleware);

app.use(userRoutes);
app.use("/projects", projectRoutes);
app.use("/organizations", organizationRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to ForgeOps");
});

app.use(errorMiddleware);

module.exports = app;
