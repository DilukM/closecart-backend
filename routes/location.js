import { Router } from "express";
import {
  updateLocation,
  getAllLocations,
} from "../controllers/locationController.js";
import { findMostVisitedPlaces, findFavoritePlaces } from '../services/locationAnalysis.js';

const router = Router();

router.post("/update", updateLocation);
router.get("/all", getAllLocations);

router.get('/most-visited/:userId', async (req, res) => {
  const places = await findMostVisitedPlaces(req.params.userId);
  res.json(places);
});

router.get('/favorites/:userId', async (req, res) => {
  const places = await findFavoritePlaces(req.params.userId);
  res.json(places);
});

export default router;
