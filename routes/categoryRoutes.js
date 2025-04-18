import { Router } from "express";
const router = Router();
import {
  createCategory,
  getAllCategories,
  deleteCategory,
} from "../controllers/categoryController.js";

// Create a new category
router.post("/", createCategory);

// Get all categories
router.get("/", getAllCategories);

// Delete a category
router.delete("/:id", deleteCategory);

export default router;
