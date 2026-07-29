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

const EXCLUDE_HOSPITAL = [
  'clinic', 'dental clinic', 'medical centre', 'medical center',
  'diagnostic centre', 'diagnostic center', 'pathology', 'laboratory', 'lab',
  'imaging centre', 'imaging center', 'nursing home', 'homeopathy', 'ayurveda',
  'physiotherapy', 'wellness centre', 'wellness center', 'health centre', 'health center',
  'dispensary', 'polyclinic', 'ivf centre', 'ivf clinic', 'cosmetic clinic', 'skin clinic',
  'eye clinic', 'ent clinic'
];

const PREFER_HOSPITAL = [
  'hospital', 'general hospital', 'medical college', 'trauma centre', 'trauma center',
  'multi speciality', 'multispeciality', 'government hospital', 'municipal hospital',
  'civil hospital', 'super speciality', 'super speciality hospital', 'emergency hospital'
];

const KEEP_POLICE = [
  'police station', 'traffic police', 'police headquarter', 'police headquarters',
  'police chowk', 'police chowkey', 'police chowkie', 'police chowky', 'police chowki',
  'control room', 'police control'
];

const EXCLUDE_POLICE = [
  'housing', 'colony', 'quarters', 'quarter', 'welfare', 'training', 'school',
  'academy', 'museum', 'administrative', 'administration', 'association'
];

const KEEP_FIRE = [
  'fire station', 'fire brigade', 'fire control'
];

const EXCLUDE_FIRE = [
  'equipment', 'store', 'office', 'training', 'admin'
];

const PREFER_PHARMACY = [
  '24x7', '24/7', '24 hours', 'medical store', 'retail', 'hospital pharmacy',
  'chemist', 'pharmacy', 'drugstore', 'medicals', 'medical', 'forever'
];

const EXCLUDE_PHARMACY = [
  'wholesale', 'distributor', 'supplier', 'surgical', 'veterinary',
  'homeopathy', 'homeopathic', 'ayurveda', 'ayurvedic', 'aurvedic',
  'cosmetic store', 'cosmetics store', 'cosmetic shop', 'cosmetics shop',
  'wellness shop', 'wellness store', 'wellness center', 'wellness centre',
  'pathology', 'laboratory', 'lab', 'diagnostic'
];

// Regular expressions with word boundaries
const excludeHospitalRegex = new RegExp(`\\b(${EXCLUDE_HOSPITAL.map(k => k.replace(/centre/g, 'cent(re|er)').replace(/center/g, 'cent(re|er)')).join('|')})\\b`, 'i');
const preferHospitalRegex = new RegExp(`\\b(${PREFER_HOSPITAL.map(k => k.replace(/centre/g, 'cent(re|er)').replace(/center/g, 'cent(re|er)')).join('|')})\\b`, 'i');

const keepPoliceRegex = new RegExp(`\\b(${KEEP_POLICE.map(k => k.replace(/centre/g, 'cent(re|er)').replace(/center/g, 'cent(re|er)')).join('|')})\\b`, 'i');
const excludePoliceRegex = new RegExp(`\\b(${EXCLUDE_POLICE.map(k => k.replace(/centre/g, 'cent(re|er)').replace(/center/g, 'cent(re|er)')).join('|')})\\b`, 'i');

const keepFireRegex = new RegExp(`\\b(${KEEP_FIRE.map(k => k.replace(/centre/g, 'cent(re|er)').replace(/center/g, 'cent(re|er)')).join('|')})\\b`, 'i');
const excludeFireRegex = new RegExp(`\\b(${EXCLUDE_FIRE.map(k => k.replace(/centre/g, 'cent(re|er)').replace(/center/g, 'cent(re|er)')).join('|')})\\b`, 'i');

const preferPharmacyRegex = new RegExp(`\\b(${PREFER_PHARMACY.map(k => k.replace(/centre/g, 'cent(re|er)').replace(/center/g, 'cent(re|er)')).join('|')})\\b`, 'i');
const excludePharmacyRegex = new RegExp(`\\b(${EXCLUDE_PHARMACY.map(k => k.replace(/centre/g, 'cent(re|er)').replace(/center/g, 'cent(re|er)')).join('|')})\\b`, 'i');

const getFacilityMetadataText = (props) => {
  const texts = [];
  if (props.name) texts.push(props.name);
  if (Array.isArray(props.categories)) texts.push(...props.categories);
  if (props.datasource && props.datasource.raw) {
    const raw = props.datasource.raw;
    if (raw.healthcare) texts.push(raw.healthcare);
    if (raw.amenity) texts.push(raw.amenity);
    if (raw['healthcare:speciality']) texts.push(raw['healthcare:speciality']);
    if (raw.description) texts.push(raw.description);
    if (raw.hospital) texts.push(raw.hospital);
  }
  return texts.join(' ').toLowerCase();
};

const hasEmergencyMetadata = (props) => {
  if (props.datasource && props.datasource.raw) {
    const raw = props.datasource.raw;
    if (raw.emergency === 'yes' || raw.emergency === true) {
      return true;
    }
  }
  return false;
};

const isClosed = (props) => {
  if (props.closed === true || props.closed === 'yes') return true;
  if (props.datasource && props.datasource.raw) {
    const raw = props.datasource.raw;
    if (raw.closed === 'yes' || raw.closed === true || raw.abandoned === 'yes' || raw.historic === 'yes') {
      return true;
    }
  }
  return false;
};

const isTemporary = (props) => {
  const name = (props.name || '').toLowerCase();
  if (name.includes('temporary') || name.includes('temp ') || name.includes('mobile unit') || name.includes('camp')) {
    return true;
  }
  if (props.datasource && props.datasource.raw) {
    const raw = props.datasource.raw;
    if (raw.temporary === 'yes' || raw.temporary === true) {
      return true;
    }
  }
  return false;
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

    // 6. Build parallel request URLs to capture close/bias results reliably
    const closeUrl = `https://api.geoapify.com/v2/places?categories=${geoapifyCategory}&filter=circle:${lngNum},${latNum},500&bias=proximity:${lngNum},${latNum}&limit=50&apiKey=${apiKey}`;
    const farUrl = `https://api.geoapify.com/v2/places?categories=${geoapifyCategory}&filter=circle:${lngNum},${latNum},5000&bias=proximity:${lngNum},${latNum}&limit=100&apiKey=${apiKey}`;

    const responses = await Promise.allSettled([
      fetch(closeUrl).then(r => r.ok ? r.json() : null),
      fetch(farUrl).then(r => r.ok ? r.json() : null)
    ]);

    let features = [];
    for (const result of responses) {
      if (result.status === 'fulfilled' && result.value && Array.isArray(result.value.features)) {
        features.push(...result.value.features);
      }
    }

    // 7. Map features to initial facilities format with general checks
    const facilities = features.map(feature => {
      const props = feature.properties || {};

      // Remove facilities with no name
      if (!props.name || props.name.trim() === '') {
        return null;
      }

      // Remove permanently closed locations
      if (isClosed(props)) {
        return null;
      }

      // Remove temporary facilities
      if (isTemporary(props)) {
        return null;
      }

      let itemLat = props.lat;
      let itemLng = props.lon;

      if (itemLat === undefined || itemLng === undefined) {
        if (feature.geometry && Array.isArray(feature.geometry.coordinates)) {
          itemLng = feature.geometry.coordinates[0];
          itemLat = feature.geometry.coordinates[1];
        }
      }

      // Remove invalid coordinates
      if (itemLat === undefined || itemLng === undefined || 
          isNaN(itemLat) || itemLat < -90 || itemLat > 90 || 
          isNaN(itemLng) || itemLng < -180 || itemLng > 180) {
        return null;
      }

      let distance = props.distance;
      if (distance === undefined) {
        distance = calculateDistance(latNum, lngNum, itemLat, itemLng);
      }

      // Remove facilities outside search radius (5000m)
      if (distance > 5000) {
        return null;
      }

      const address = props.formatted || props.address_line1 || "Address not available";

      return {
        id: props.place_id || feature.id || `${itemLat}-${itemLng}`,
        name: props.name,
        category: category,
        lat: itemLat,
        lng: itemLng,
        address: address,
        distance: distance,
        rawProperties: props
      };
    }).filter(item => item !== null);

    // 8. Remove duplicate facilities
    const deduplicated = [];
    const seenIds = new Set();
    const seenNamesCoords = [];

    for (const item of facilities) {
      if (seenIds.has(item.id)) continue;

      const isDup = seenNamesCoords.some(prev => {
        // Identical coordinates check (within 10m)
        const sameCoords = calculateDistance(prev.lat, prev.lng, item.lat, item.lng) < 10;

        // Duplicate name + close coordinates check (within 200m)
        const nameMatch = prev.name.toLowerCase() === item.name.toLowerCase();
        const closeCoords = calculateDistance(prev.lat, prev.lng, item.lat, item.lng) < 200;

        return sameCoords || (nameMatch && closeCoords);
      });

      if (isDup) continue;

      seenIds.add(item.id);
      seenNamesCoords.push({ lat: item.lat, lng: item.lng, name: item.name });
      deduplicated.push(item);
    }

    // 9. Intelligent category filtering and scoring
    let filtered = [];

    if (category === 'hospital') {
      const processedItems = deduplicated.map(item => {
        const metadataText = getFacilityMetadataText(item.rawProperties);
        const isExcluded = excludeHospitalRegex.test(metadataText);
        const isPreferred = preferHospitalRegex.test(item.name) || hasEmergencyMetadata(item.rawProperties);

        let relevance = 0;
        if (preferHospitalRegex.test(item.name)) relevance += 5;
        if (hasEmergencyMetadata(item.rawProperties)) relevance += 5;
        if (isExcluded) relevance -= 20;

        let importance = 0;
        const nameLower = item.name.toLowerCase();
        if (/\b(government|municipal|civil|general|medical college|trauma)\b/i.test(nameLower)) importance += 10;
        else if (/\b(super speciality|multispeciality|multi speciality)\b/i.test(nameLower)) importance += 5;
        else if (/\bhospital\b/i.test(nameLower)) importance += 2;

        return { ...item, isExcluded, isPreferred, relevance, importance };
      });

      filtered = processedItems.filter(item => !item.isExcluded && item.isPreferred);
      if (filtered.length < 5) {
        filtered = processedItems.filter(item => !item.isExcluded);
      }
    } 
    else if (category === 'police') {
      const processedItems = deduplicated.map(item => {
        const nameLower = item.name.toLowerCase();
        const metadataText = getFacilityMetadataText(item.rawProperties);

        const isExcluded = excludePoliceRegex.test(nameLower) || excludePoliceRegex.test(metadataText);

        return { ...item, isExcluded };
      });

      const filteredPolice = processedItems.filter(item => !item.isExcluded);

      // Sort strictly by distance (nearest first)
      filteredPolice.sort((a, b) => a.distance - b.distance);

      // Limit response to at least 50
      const finalPolice = filteredPolice.slice(0, 50).map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        lat: item.lat,
        lng: item.lng,
        address: item.address,
        distance: item.distance
      }));

      return res.status(200).json(finalPolice);
    } 
    else if (category === 'fire_station') {
      const processedItems = deduplicated.map(item => {
        const nameLower = item.name.toLowerCase();
        const metadataText = getFacilityMetadataText(item.rawProperties);

        const matchesKeep = keepFireRegex.test(nameLower) || keepFireRegex.test(metadataText);
        const matchesExclude = excludeFireRegex.test(nameLower) || excludeFireRegex.test(metadataText);

        const isExcluded = !matchesKeep || matchesExclude;

        let relevance = 0;
        if (matchesKeep) relevance += 10;
        if (matchesExclude) relevance -= 20;

        let importance = 0;
        if (/\bheadquarters?\b/i.test(nameLower) || /\bcontrol\b/i.test(nameLower)) importance += 10;
        else if (/\bstation\b/i.test(nameLower)) importance += 5;

        return { ...item, isExcluded, isPreferred: matchesKeep, relevance, importance };
      });

      filtered = processedItems.filter(item => !item.isExcluded);
    } 
    else if (category === 'pharmacy') {
      const processedItems = deduplicated.map(item => {
        const nameLower = item.name.toLowerCase();
        const metadataText = getFacilityMetadataText(item.rawProperties);

        let isExcluded = excludePharmacyRegex.test(nameLower) || excludePharmacyRegex.test(metadataText);

        // Exception: do not exclude if cosmetics matched but name also has strong pharmacy terms
        if (isExcluded && /\bcosmetics?\b/i.test(nameLower)) {
          if (/\b(pharmacy|chemist|medical|drugstore|medicos?)\b/i.test(nameLower)) {
            isExcluded = false;
          }
        }

        const isPreferred = preferPharmacyRegex.test(nameLower) || hasEmergencyMetadata(item.rawProperties);

        let relevance = 0;
        if (isPreferred) relevance += 5;
        if (isExcluded) relevance -= 20;

        let importance = 0;
        if (/\b(24x?7|24 hours|hospital)\b/i.test(nameLower)) importance += 10;
        else if (/\b(pharmacy|chemist|drugstore)\b/i.test(nameLower)) importance += 5;
        else if (/\bmedicals?\b/i.test(nameLower)) importance += 3;

        return { ...item, isExcluded, isPreferred, relevance, importance };
      });

      filtered = processedItems.filter(item => !item.isExcluded);
    }

    // Sort every category by: 1. Distance (ascending), 2. Relevance (descending), 3. Facility Importance (descending)
    filtered.sort((a, b) => {
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance;
      }
      return b.importance - a.importance;
    });

    // Limit to nearest 20 facilities and format response
    const finalFacilities = filtered.slice(0, 20).map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      lat: item.lat,
      lng: item.lng,
      address: item.address,
      distance: item.distance
    }));

    return res.status(200).json(finalFacilities);

  } catch (error) {
    console.error(`Error in getFacilities: ${error.message}`);
    return res.status(500).json({
      error: "Internal server error while fetching facilities"
    });
  }
};
