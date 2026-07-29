// MAP CONFIGURATION
// This file isolates the map style and baseline coordinates.
// The map style source is development-compatible and runs without API keys.
// REPLACEABLE: To change the map provider or style, update the MAP_STYLES below.

export const MAP_STYLES = {
  DARK: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  
  // Esri World Imagery raster tile configuration as the satellite provider.
  // This is a free, tokenless satellite tileset suitable for development.
  SATELLITE: {
    version: 8,
    sources: {
      'esri-satellite': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
      },
      'carto-vector': {
        type: 'vector',
        url: 'https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json'
      }
    },
    layers: [
      {
        id: 'satellite-layer',
        type: 'raster',
        source: 'esri-satellite',
        minzoom: 0,
        maxzoom: 20
      }
    ]
  }
};

export const INITIAL_MAP_STATE = {
  longitude: 72.8777, // Mumbai, India (default temporary view)
  latitude: 19.0760,
  zoom: 13.5, // Initial zoom suitable for structural visualization
  pitch: 0,   // Default 2D pitch
  bearing: 0,
};

export const CAMERA_TRANSITION_DURATION = 1500; // in ms
export const PERSPECTIVE_PITCH = 55; // Pitch for 3D/perspective mode (45-60 deg)
export const PERSPECTIVE_BEARING = -15; // Bearing for 3D/perspective mode

export const API_BASE_URL = 'http://localhost:5002/api/auth';

