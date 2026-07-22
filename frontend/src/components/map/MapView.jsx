import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import {
  MAP_STYLES,
  INITIAL_MAP_STATE,
  PERSPECTIVE_PITCH,
  PERSPECTIVE_BEARING,
  CAMERA_TRANSITION_DURATION
} from '../../constants/mapConfig';

// Helper to determine active building opacity based on theme & mode
const getBuildingOpacity = (map, currentMode) => {
  if (currentMode !== '3D') return 0;
  const isRaster = map.getStyle().layers.some(l => l.type === 'raster');
  return isRaster ? 0.45 : 0.65; // Translucent on Satellite overlay, standard slate on Dark
};

// Helper function to dynamically add 3D buildings if supported by style
const add3DBuildingLayer = (map, currentMode) => {
  if (map.getLayer('3d-buildings')) return;

  const style = map.getStyle();
  const sources = style.sources;
  
  // Look for any vector tile source in the current map style
  const vectorSourceId = Object.keys(sources).find(
    (id) => sources[id].type === 'vector'
  );

  if (vectorSourceId) {
    // Find the first symbol layer (labels) to render buildings underneath them
    const layers = style.layers;
    let labelLayerId;
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].type === 'symbol' && layers[i].layout && layers[i].layout['text-field']) {
        labelLayerId = layers[i].id;
        break;
      }
    }

    const isRaster = layers.some(l => l.type === 'raster');

    // Add 3D extrusion layer for buildings
    map.addLayer(
      {
        id: '3d-buildings',
        source: vectorSourceId,
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          // Emerald HUD color for satellite view, standard slate color for dark mode
          'fill-extrusion-color': isRaster
            ? [
                'interpolate',
                ['linear'],
                ['coalesce', ['get', 'render_height'], ['get', 'height'], 10],
                0, '#047857',   // Emerald 700 (darker bottom)
                100, '#34d399'  // Emerald 400 (glowing tops)
              ]
            : [
                'interpolate',
                ['linear'],
                ['coalesce', ['get', 'render_height'], ['get', 'height'], 10],
                0, '#1a1e27',   // Lighter slate surface
                30, '#252c39',  // Medium slate
                100, '#333d4f'  // Highlight slate
              ],
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14, 0,
            14.2, [
              'coalesce',
              ['get', 'render_height'],
              ['get', 'height'],
              15
            ]
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14, 0,
            14.2, [
              'coalesce',
              ['get', 'render_min_height'],
              ['get', 'min_height'],
              0
            ]
          ],
          'fill-extrusion-opacity': getBuildingOpacity(map, currentMode)
        }
      },
      labelLayerId
    );
  }
};

const MapView = ({ mode, mapStyle }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const modeRef = useRef(mode);
  
  // Track current mode in ref to avoid stale state in map event listeners
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create a new MapLibre instance
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES[mapStyle],
      center: [INITIAL_MAP_STATE.longitude, INITIAL_MAP_STATE.latitude],
      zoom: INITIAL_MAP_STATE.zoom,
      pitch: mode === '3D' ? PERSPECTIVE_PITCH : INITIAL_MAP_STATE.pitch,
      bearing: mode === '3D' ? PERSPECTIVE_BEARING : INITIAL_MAP_STATE.bearing,
      attributionControl: false,
    });

    mapRef.current = map;

    // Add navigation controls (zoom, pan, compass)
    map.addControl(new maplibregl.NavigationControl({
      showCompass: true,
      visualizePitch: true
    }), 'bottom-right');

    // Run whenever a style finishes loading (on initial load and style changes)
    map.on('style.load', () => {
      add3DBuildingLayer(map, modeRef.current);
      
      // Sync opacity based on current camera view mode
      if (map.getLayer('3d-buildings')) {
        map.setPaintProperty(
          '3d-buildings',
          'fill-extrusion-opacity',
          getBuildingOpacity(map, modeRef.current)
        );
      }
    });

    // Clean up map instance on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle Map Style changes dynamically while preserving camera state
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.setStyle(MAP_STYLES[mapStyle]);
  }, [mapStyle]);

  // Handle 2D / 3D camera transitions when mode changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const targetPitch = mode === '3D' ? PERSPECTIVE_PITCH : 0;
    const targetBearing = mode === '3D' ? PERSPECTIVE_BEARING : 0;

    map.easeTo({
      pitch: targetPitch,
      bearing: targetBearing,
      duration: CAMERA_TRANSITION_DURATION,
      essential: true
    });

    // Transition buildings visibility (opacity)
    if (map.getLayer('3d-buildings')) {
      map.setPaintProperty(
        '3d-buildings',
        'fill-extrusion-opacity',
        getBuildingOpacity(map, mode)
      );
    }
  }, [mode]);

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full bg-slate-950" 
      />
    </div>
  );
};

export default MapView;
