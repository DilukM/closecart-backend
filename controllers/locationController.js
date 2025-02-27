
import Location from "../models/location.js";

// Save or update user location
export async function updateLocation  (req, res) {
  const { userId, latitude, longitude } = req.body;

  try {
    let location = await Location.findOne({ userId });

    if (location) {
      location.latitude = latitude;
      location.longitude = longitude;
      location.updatedAt = Date.now();
    } else {
      location = new Location({ userId, latitude, longitude });
    }

    await location.save();
    res.status(200).json({ success: true, message: 'Location updated', location });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all user locations
export async function getAllLocations (req, res)  {
  try {
    const locations = await Location.find();
    res.status(200).json({ success: true, locations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
