import express, { json as _json } from "express";
import { config } from "dotenv";
import cors from "cors";
import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import connectDB from "./config/db.js";
import Logger from "./utils/logger.js";

// Load env vars
config();

const app = express();
app.use(_json());

// Connect to database
connectDB().then(() => {
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });
});

// Route files
import auth from "./routes/auth.js";
import shops from "./routes/shops.js";
import offers from "./routes/offers.js";

// Body parser
app.use(_json());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Enable CORS
app.use(cors());

// Mount routers
app.use("/api/v1/auth", auth);
app.use("/api/v1/shops", shops);
app.use("/api/v1/offers", offers);

// Error handling middleware
import errorHandler from "./middleware/error.js";
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  Logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  Logger.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
