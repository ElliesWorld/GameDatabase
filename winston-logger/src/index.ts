import express from "express";
import cors from "cors";
import weatherRoutes from "./weather.js";
import userRoutes from "./user.js";
import gameRoutes from "./game.js";
import dotenv from "dotenv";
import logger, { requestLogger } from "./logger.js";

//Anywhere we have console.logs we can use logger
//logger.info("Fetched all items");
//logger.error("Error fetching items" + error.message);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));//Allow requests from any origin 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(requestLogger);

app.use("/api/weather", weatherRoutes);
app.use("/api/users", userRoutes);
app.use("/api/games", gameRoutes);

app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Server error: ${err.message}`);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  //console.log(`Server running on http://localhost:${PORT}`);
});