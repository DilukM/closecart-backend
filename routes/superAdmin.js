import express from "express";
import {
  registerSuperAdmin,
  loginSuperAdmin,
  getSuperAdminProfile,
} from "../controllers/superAdmin.js";
import { protectSuperAdmin } from "../middleware/superAdminAuth.js";

const router = express.Router();

router.post("/register", registerSuperAdmin);
router.post("/login", loginSuperAdmin);
router.get("/me", protectSuperAdmin, getSuperAdminProfile);

export default router;
