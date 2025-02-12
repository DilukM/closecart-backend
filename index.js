const express = require("express");
const json = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./config/db");
const logger = require("./utils/logger");

// Load env vars
dotenv.config();

const app = express();
app.use(json());

// Connect to database
connectDB().then(() => {
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });
});

// Route files
const auth = require("./routes/auth");
const shops = require("./routes/shops");
const offers = require("./routes/offers");

// Body parser
app.use(express.json());

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
const errorHandler = require("./middleware/error");
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
