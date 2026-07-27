import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import {
  MAP_STYLES,
  INITIAL_MAP_STATE,
  PERSPECTIVE_PITCH,
  PERSPECTIVE_BEARING,
  CAMERA_TRANSITION_DURATION
} from '../../constants/mapConfig';
import { mockFacilities } from '../../data/mockFacilities';

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

const MapView = ({ mode, mapStyle, selectedCategory, selectedFacility, setSelectedFacility }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const modeRef = useRef(mode);
  const markersRef = useRef([]);
  const popupRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [hasCentered, setHasCentered] = useState(false);
  const userMarkerInstanceRef = useRef(null);

  // Inject custom CSS for user location marker animations
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      @keyframes userLocationPulse {
        0% {
          transform: scale(0.9);
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
        }
        70% {
          transform: scale(1);
          box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
        }
        100% {
          transform: scale(0.9);
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
        }
      }
      .user-location-marker {
        width: 100%;
        height: 100%;
        background-color: #3b82f6;
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 8px rgba(59, 130, 246, 0.8);
        animation: userLocationPulse 2s infinite ease-in-out;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .user-location-inner {
        width: 8px;
        height: 8px;
        background-color: #ffffff;
        border-radius: 50%;
      }
    `;
    document.head.appendChild(styleEl);
    return () => {
      styleEl.remove();
    };
  }, []);

  // Track browser geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      return;
    }

    const handleSuccess = (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ latitude, longitude });
    };

    const handleError = (error) => {
      console.warn(`Geolocation error: ${error.message}`);
    };

    // Request initial position
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    // Start watchPosition for updates
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Update user marker on coordinate changes and fly to location once
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady || !userLocation) return;

    const { latitude, longitude } = userLocation;

    if (!userMarkerInstanceRef.current) {
      const container = document.createElement('div');
      container.style.width = '20px';
      container.style.height = '20px';
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'center';

      const inner = document.createElement('div');
      inner.className = 'user-location-marker';
      
      const dot = document.createElement('div');
      dot.className = 'user-location-inner';
      inner.appendChild(dot);
      
      container.appendChild(inner);

      userMarkerInstanceRef.current = new maplibregl.Marker({ element: container })
        .setLngLat([longitude, latitude])
        .addTo(map);
    } else {
      userMarkerInstanceRef.current.setLngLat([longitude, latitude]);
    }

    // Centering the map on the user's location on initial load
    if (!hasCentered) {
      map.flyTo({
        center: [longitude, latitude],
        zoom: 14.0,
        duration: 1500,
        essential: true
      });
      setHasCentered(true);
    }
  }, [userLocation, isMapReady, hasCentered]);

  // Clean up user marker on unmount
  useEffect(() => {
    return () => {
      if (userMarkerInstanceRef.current) {
        userMarkerInstanceRef.current.remove();
        userMarkerInstanceRef.current = null;
      }
    };
  }, []);
  
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

    // Run when style finishes loading
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

    // Mark map as ready once load event fires
    map.on('load', () => {
      setIsMapReady(true);
    });

    // Create popup instance
    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 15
    });

    // Clean up map instance on unmount
    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Dynamically update markers on the map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Filter facilities based on active category
    const filtered = mockFacilities.filter(
      (facility) => facility.category === selectedCategory
    );

    filtered.forEach((facility) => {
      // Outer wrapper element (Geographic anchor - position managed by MapLibre)
      const el = document.createElement('div');
      const isSelected = selectedFacility && selectedFacility.id === facility.id;
      const size = isSelected ? 34 : 26;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';

      // Inner visual icon element (Scale animation, colors, shadow/glow applied here)
      const innerEl = document.createElement('div');
      innerEl.style.width = '100%';
      innerEl.style.height = '100%';
      innerEl.style.borderRadius = '50%';
      innerEl.style.backgroundColor = isSelected ? '#10b981' : '#1a1e27';
      innerEl.style.border = isSelected ? '2px solid #ffffff' : '2px solid #ef4444';
      innerEl.style.boxShadow = isSelected 
        ? '0 0 16px rgba(16, 185, 129, 0.75)' 
        : '0 2px 6px rgba(0, 0, 0, 0.4)';
      innerEl.style.display = 'flex';
      innerEl.style.alignItems = 'center';
      innerEl.style.justifyContent = 'center';
      innerEl.style.fontSize = isSelected ? '16px' : '12px';
      innerEl.style.cursor = 'pointer';
      innerEl.style.transition = 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
      innerEl.style.transform = 'scale(1)';

      // Set category specific emojis
      let emoji = '📍';
      if (facility.category === 'Hospitals') emoji = '🏥';
      else if (facility.category === 'Police Stations') emoji = '🚨';
      else if (facility.category === 'Fire Stations') emoji = '🚒';
      else if (facility.category === 'Pharmacies') emoji = '💊';
      else if (facility.category === 'Blood Banks') emoji = '🩸';

      innerEl.innerText = emoji;
      el.appendChild(innerEl);

      // Hover scale micro-animations and popup previews on the inner visual icon
      innerEl.addEventListener('mouseenter', () => {
        innerEl.style.transform = 'scale(1.10)';
        innerEl.style.boxShadow = isSelected 
          ? '0 0 24px rgba(16, 185, 129, 0.95)' 
          : '0 0 12px rgba(239, 68, 68, 0.7)';
        if (!isSelected) {
          innerEl.style.backgroundColor = '#252c39'; // Subtle hover color shift
        }

        // Only show popup on devices that support true hover pointer interactions (desktop)
        const supportsHover = window.matchMedia('(hover: hover)').matches;
        if (supportsHover && popupRef.current && mapRef.current) {
          popupRef.current
            .setLngLat([facility.longitude, facility.latitude])
            .setHTML(`
              <div style="font-family: inherit; text-align: left; min-width: 200px; max-width: 245px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 4px;">
                  <h4 style="margin: 0; font-size: 12px; font-weight: 700; color: #f1f3f7; line-height: 1.2;">${facility.name}</h4>
                  <span style="font-size: 9px; font-weight: 600; background-color: #12141a; color: #34d399; border: 1px solid #252c39; padding: 2px 4px; border-radius: 3px; white-space: nowrap; flex-shrink: 0;">${facility.category}</span>
                </div>
                <p style="margin: 4px 0 2px 0; font-size: 10px; color: #b0bcd3; line-height: 1.3; display: flex; align-items: flex-start; gap: 4px;">
                  <span style="flex-shrink: 0; margin-top: 1px;">📍</span>
                  <span>${facility.address}</span>
                </p>
                <p style="margin: 2px 0 0 0; font-size: 10px; color: #b0bcd3; display: flex; align-items: center; gap: 4px;">
                  <span style="flex-shrink: 0;">📞</span>
                  <span>${facility.phone}</span>
                </p>
              </div>
            `)
            .addTo(mapRef.current);
        }
      });

      innerEl.addEventListener('mouseleave', () => {
        innerEl.style.transform = 'scale(1)';
        innerEl.style.boxShadow = isSelected 
          ? '0 0 16px rgba(16, 185, 129, 0.75)' 
          : '0 2px 6px rgba(0, 0, 0, 0.4)';
        if (!isSelected) {
          innerEl.style.backgroundColor = '#1a1e27';
        }

        if (popupRef.current) {
          popupRef.current.remove();
        }
      });

      // Selection click action
      innerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedFacility(facility);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([facility.longitude, facility.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Cleanup markers on updates/unmount
    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
      }
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [selectedCategory, selectedFacility, isMapReady, setSelectedFacility]);

  // Smooth camera zoom/pan to selected facility coordinates
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady || !selectedFacility) return;

    map.flyTo({
      center: [selectedFacility.longitude, selectedFacility.latitude],
      zoom: 16.0,
      duration: CAMERA_TRANSITION_DURATION,
      essential: true
    });
  }, [selectedFacility, isMapReady]);

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
