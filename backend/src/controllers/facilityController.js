/**
 * Controller for managing emergency facilities using the Geoapify Places API.
 */

// Helper to calculate Haversine distance in meters
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radius of the Earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

exports.getFacilities = async (req, res) => {
  try {
    const { lat, lng, category } = req.query;

    // 1. Validate latitude
    const latNum = parseFloat(lat);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      return res.status(400).json({
        error: "Invalid or missing latitude. Must be a number between -90 and 90."
      });
    }

    // 2. Validate longitude
    const lngNum = parseFloat(lng);
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      return res.status(400).json({
        error: "Invalid or missing longitude. Must be a number between -180 and 180."
      });
    }

    // 3. Validate category
    const validCategories = ['hospital', 'police', 'fire_station', 'pharmacy'];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({
        error: `Invalid or missing category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    // 4. Validate Geoapify API key is set
    const apiKey = process.env.GEOAPIFY_API_KEY;
    if (!apiKey) {
      console.error("GEOAPIFY_API_KEY is not defined in environment variables.");
      return res.status(500).json({
        error: "Geoapify API key is not configured on the server."
      });
    }

    // 5. Map internal categories to Geoapify Places API categories
    const categoryMap = {
      hospital: 'healthcare.hospital',
      police: 'service.police',
      fire_station: 'service.fire_station',
      pharmacy: 'healthcare.pharmacy'
    };
    const geoapifyCategory = categoryMap[category];

    // 6. Build the request URL for Geoapify Places API
    // Search within a radius of approximately 5000 meters.
    // Use filter=circle:lon,lat,radius and bias=proximity:lon,lat to sort by distance.
    const url = `https://api.geoapify.com/v2/places?categories=${geoapifyCategory}&filter=circle:${lngNum},${latNum},5000&bias=proximity:${lngNum},${latNum}&limit=50&apiKey=${apiKey}`;

    // 7. Fetch data from Geoapify
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Geoapify API error response (Status ${response.status}): ${errorText}`);
      return res.status(502).json({
        error: "Failed to fetch facilities from Geoapify API"
      });
    }

    const data = await response.json();

    // 8. Validate structure of response
    if (!data || !Array.isArray(data.features)) {
      console.error("Invalid response format received from Geoapify API:", data);
      return res.status(502).json({
        error: "Invalid response format from Geoapify API"
      });
    }

    // 9. Format response to exact requested format
    const facilities = data.features
      .map(feature => {
        const props = feature.properties || {};
        let itemLat = props.lat;
        let itemLng = props.lon;

        // Fallback to geometry coordinates if properties.lat/lon is missing
        if (itemLat === undefined || itemLng === undefined) {
          if (feature.geometry && Array.isArray(feature.geometry.coordinates)) {
            itemLng = feature.geometry.coordinates[0];
            itemLat = feature.geometry.coordinates[1];
          }
        }

        // If coordinates cannot be determined, skip this feature
        if (itemLat === undefined || itemLng === undefined) {
          return null;
        }

        // Determine distance
        let distance = props.distance;
        if (distance === undefined) {
          distance = calculateDistance(latNum, lngNum, itemLat, itemLng);
        }

        const address = props.formatted || props.address_line1 || "Address not available";
        const name = props.name || `${category.charAt(0).toUpperCase() + category.slice(1)} Facility`;

        return {
          id: props.place_id || feature.id || `${itemLat}-${itemLng}`,
          name: name,
          category: category,
          lat: itemLat,
          lng: itemLng,
          address: address,
          distance: distance
        };
      })
      .filter(item => item !== null);

    // Return the clean JSON array of facilities
    return res.status(200).json(facilities);

  } catch (error) {
    console.error(`Error in getFacilities: ${error.message}`);
    return res.status(500).json({
      error: "Internal server error while fetching facilities"
    });
  }
};
