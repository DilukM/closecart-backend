import Location from "../models/location.js";
import { kmeans } from "ml-kmeans";

export const findMostVisitedPlaces = async (userId) => {
  const locations = await Location.find({ userId });

  if (locations.length === 0) return [];

  const dataPoints = locations.map((loc) => [loc.latitude, loc.longitude]);

  // K-Means clustering (group locations into frequent places)
  const clusters = kmeans(dataPoints, 3); // 3 clusters (common places)

  return clusters.centroids.map((center) => ({
    latitude: center[0],
    longitude: center[1],
  }));
};

export const findFavoritePlaces = async (userId) => {
  const locations = await Location.find({ userId }).sort({ timestamp: 1 });

  const timeSpent = new Map(); // Track time spent at each place

  for (let i = 1; i < locations.length; i++) {
    const prev = locations[i - 1];
    const curr = locations[i];

    const timeDiff =
      (new Date(curr.timestamp) - new Date(prev.timestamp)) / 1000; // in seconds

    const key = `${prev.latitude},${prev.longitude}`;
    if (timeSpent.has(key)) {
      timeSpent.set(key, timeSpent.get(key) + timeDiff);
    } else {
      timeSpent.set(key, timeDiff);
    }
  }

  // Find locations where the user spent the most time
  const favoriteLocations = [...timeSpent.entries()]
    .filter(([_, time]) => time > 3600) // More than 1 hour
    .sort((a, b) => b[1] - a[1]) // Sort by time spent
    .map(([coords]) => {
      const [latitude, longitude] = coords.split(",").map(Number);
      return { latitude, longitude };
    });

  return favoriteLocations;
};
