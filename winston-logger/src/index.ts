import express from "express";
import weatherRoutes from "./weather.js";
import userRoutes from "./user.js";
import gameRoutes from "./game.js";
import logger from "./logger.js";

//Anywhere we have console.logs we can use logger
//logger.info("Fetched all items");
//logger.error("Error fetching items" + error.message);

const app = express();

app.use("/api/weather", weatherRoutes);
app.use("/api/users", userRoutes);
app.use("/api/games", gameRoutes);
