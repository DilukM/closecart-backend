import express, { json as _json } from "express";
import { config } from "dotenv";
import cors from "cors";
import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import connectDB from "./config/db.js";
import http from "http";
import { Server } from "socket.io";
import Logger from "./utils/logger.js";

// Load env vars
config();

const app = express();
const CCserver = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: [
    "https://www.closecartlk.com",
    "https://closecartlk.com",
    "https://www.merchant.closecartlk.com",
    "https://merchant.closecartlk.com",
    "http://www.closecartlk.com",
    "http://closecartlk.com",
    "http://www.merchant.closecartlk.com",
    "http://merchant.closecartlk.com",

    "http://localhost:3000", // For local development
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply CORS with options
app.use(cors(corsOptions));

// Configure Socket.io with the same CORS settings
const io = new Server(CCserver, {
  cors: corsOptions,
});

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
import location from "./routes/location.js";
import consumer from "./routes/consumer.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import geocodingRoutes from "./routes/geocodingRoutes.js";
import superAdmin from "./routes/superAdmin.js";
import superAdminDashboard from "./routes/superAdminDashboard.js";

// Body parser
app.use(_json());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Mount routers
app.use("/api/v1/auth", auth);
app.use("/api/v1/shops", shops);
app.use("/api/v1/offers", offers);
app.use("/api/v1/location", location);
app.use("/api/v1/consumer", consumer);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/geocoding", geocodingRoutes);
app.use("/api/v1/superadmin", superAdmin);
app.use("/api/v1/superadmin/dashboard", superAdminDashboard);

// WebSocket Connection
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Receiving location updates from users
  socket.on("updateLocation", async (data) => {
    const { userId, latitude, longitude, timestamp } = data;

    try {
      // Save every location update (for tracking movement)
      const location = new Location({ userId, latitude, longitude, timestamp });
      await location.save();

      console.log(`Location saved for user: ${userId}`);
    } catch (error) {
      console.error("Error saving location:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

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
