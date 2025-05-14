import ErrorResponse from "../utils/errorResponse.js";
import fetch from "node-fetch";

/**
 * @desc    Convert coordinates to address using OpenStreetMap Nominatim
 * @route   GET /api/geocoding/reverse
 * @access  Private
 */
export async function getAddressFromCoords(req, res, next) {
  try {
    // Extract lat and lng from query parameters
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return next(new ErrorResponse('Please provide lat and lng parameters', 400));
    }

    // Make sure to follow Nominatim usage policy
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "CloseCart API Server", // Identify your application
        },
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    if (data && data.display_name) {
      res.status(200).json({
        success: true,
        address: data.display_name,
        details: data.address
      });
    } else {
      res.status(404).json({
        success: false,
        address: "Address not found"
      });
    }
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Convert address to coordinates using OpenStreetMap Nominatim
 * @route   GET /api/geocoding/forward
 * @access  Private
 */
export async function getCoordsFromAddress(req, res, next) {
  try {
    const { address } = req.query;

    if (!address) {
      return next(new ErrorResponse('Please provide an address parameter', 400));
    }

    // Make sure to follow Nominatim usage policy
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&limit=1`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "CloseCart API Server", // Identify your application
        },
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    if (data && data.length > 0) {
      res.status(200).json({
        success: true,
        location: {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        },
        displayName: data[0].display_name
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Location not found"
      });
    }
  } catch (err) {
    next(err);
  }
}
