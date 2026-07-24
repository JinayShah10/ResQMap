import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { MAP_STYLES } from '../../constants/mapConfig';

const GeospatialBackground = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const vehicleMarkerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Inject CSS keyframes for custom navigation markers, chevron bounces, and pulse triggers
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      @keyframes bgMarkerPulse {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(2.4); opacity: 0; }
      }
      @keyframes bgMarkerArrival {
        0% { transform: scale(1); box-shadow: 0 0 12px #10b981; }
        50% { transform: scale(1.4); box-shadow: 0 0 28px #34d399, 0 0 14px #10b981; }
        100% { transform: scale(1); box-shadow: 0 0 12px #10b981; }
      }
      @keyframes chevronBounce {
        0% { transform: translateY(0); }
        100% { transform: translateY(-4px); }
      }
      .bg-facility-marker {
        position: relative;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: #10b981;
        border: 2px solid #ffffff;
        box-shadow: 0 0 12px #10b981;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease-out;
      }
      .bg-facility-marker-ring {
        position: absolute;
        inset: -2px;
        border-radius: 50%;
        border: 2px solid #10b981;
        animation: bgMarkerPulse 2s infinite;
      }
      .bg-facility-marker-cross {
        color: #080a0e;
        font-size: 14px;
        font-weight: 900;
        line-height: 1;
        margin-top: -1px;
      }
      .bg-marker-arrival-flash {
        animation: bgMarkerArrival 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .bg-vehicle-marker-wrapper {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 42px;
        height: 42px;
      }
      .bg-vehicle-marker-chevron {
        color: #10b981;
        font-size: 20px;
        font-weight: 900;
        line-height: 1;
        text-shadow: 0 0 8px #10b981;
        animation: chevronBounce 0.6s infinite alternate;
        margin-bottom: -4px;
      }
      .bg-vehicle-marker-car {
        width: 14px;
        height: 24px;
        background-color: #ffffff;
        border: 2px solid #10b981;
        border-radius: 4px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
      }
    `;
    document.head.appendChild(styleTag);

    // Zoom and pitch for a highly detailed, street-level 3D view
    const baseZoom = 16.5;
    const basePitch = 64;

    // Start (Nariman Point NSC Bose Rd) and End (Bombay Hospital) coordinate vectors
    const startCoord = [72.8228, 18.9275];
    const destCoord = [72.8300, 18.9415];

    // Verified offline-fallback road route coordinates (along NSC Bose Rd -> Veer Nariman Rd -> Maharshi Karve Rd)
    const offlineRouteCoords = [
      [72.8228, 18.9275], // NSC Bose Rd / Marine Drive (Origin Start)
      [72.8225, 18.9290],
      [72.8222, 18.9305],
      [72.8219, 18.9320],
      [72.8216, 18.9335],
      [72.8214, 18.9345], // Junction NSC Bose Rd / Veer Nariman Rd
      [72.8235, 18.9348], // Veer Nariman Rd
      [72.8250, 18.9350],
      [72.8260, 18.9352], // Junction Veer Nariman Rd / M Karve Rd
      [72.8265, 18.9375], // M Karve Rd
      [72.8270, 18.9390],
      [72.8274, 18.9410], // Junction M Karve Rd / Anandilal Podar Marg
      [72.8290, 18.9415], // Anandilal Podar Marg
      [72.8300, 18.9415]  // Bombay Hospital (Destination)
    ];

    let activeRouteCoords = [...offlineRouteCoords];
    let map = null;
    let animationFrameId = null;
    let hospitalMarker = null;
    let vehicleMarker = null;

    // Helper functions for segments calculation
    const setupNavigation = (coords) => {
      const segments = [];
      let totalRouteLength = 0;

      for (let i = 0; i < coords.length - 1; i++) {
        const p1 = coords[i];
        const p2 = coords[i+1];
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const length = Math.sqrt(dx * dx + dy * dy);
        segments.push({ p1, p2, startLen: totalRouteLength, length });
        totalRouteLength += length;
      }

      const interpolate = (p1, p2, r) => [
        p1[0] + (p2[0] - p1[0]) * r,
        p1[1] + (p2[1] - p1[1]) * r
      ];

      const getRouteState = (t) => {
        const targetDist = t * totalRouteLength;
        for (let idx = 0; idx < segments.length; idx++) {
          const seg = segments[idx];
          if (targetDist >= seg.startLen && targetDist <= seg.startLen + seg.length) {
            const ratio = (targetDist - seg.startLen) / seg.length;
            const pos = interpolate(seg.p1, seg.p2, ratio);
            const dx = seg.p2[0] - seg.p1[0];
            const dy = seg.p2[1] - seg.p1[1];
            const heading = Math.atan2(dx, dy) * 180 / Math.PI;
            return { pos, heading };
          }
        }
        const lastSeg = segments[segments.length - 1];
        const dx = lastSeg.p2[0] - lastSeg.p1[0];
        const dy = lastSeg.p2[1] - lastSeg.p1[1];
        return {
          pos: destCoord,
          heading: Math.atan2(dx, dy) * 180 / Math.PI
        };
      };

      // Calculate remaining route segment list dynamically (hiding travelled path behind the car)
      const getRemainingRoute = (t, currentPos) => {
        const targetDist = t * totalRouteLength;
        const remaining = [currentPos];
        
        for (let idx = 0; idx < segments.length; idx++) {
          const seg = segments[idx];
          if (seg.startLen + seg.length > targetDist) {
            remaining.push(seg.p2);
          }
        }
        return remaining;
      };

      const firstState = getRouteState(0);
      const firstHeadingRad = firstState.heading * Math.PI / 180;
      
      // Shift initial camera center slightly to the right of the travel vector 
      // (This positions the vehicle on the left side of the screen, away from the right-hand card)
      const firstPerpAngle = firstHeadingRad + Math.PI / 2;
      const firstCamCenter = [
        firstState.pos[0] + Math.sin(firstHeadingRad) * 0.0001 + Math.sin(firstPerpAngle) * 0.00075,
        firstState.pos[1] + Math.cos(firstHeadingRad) * 0.0001 + Math.cos(firstPerpAngle) * 0.00075
      ];

      // Create MapLibre Map Instance
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: MAP_STYLES.DARK,
        center: firstCamCenter,
        zoom: baseZoom,
        pitch: basePitch,
        bearing: firstState.heading,
        interactive: false,
        dragPan: false,
        scrollZoom: false,
        boxZoom: false,
        dragRotate: false,
        keyboard: false,
        doubleClickZoom: false,
        touchZoomRotate: false,
        attributionControl: false
      });

      mapRef.current = map;

      const handleResize = () => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      };
      window.addEventListener('resize', handleResize);

      // Add 3D Extruded buildings from Carto vector tiles
      map.on('style.load', () => {
        const style = map.getStyle();
        const sources = style.sources;
        const vectorSourceId = Object.keys(sources).find(
          (id) => sources[id].type === 'vector'
        );

        if (vectorSourceId) {
          map.addLayer({
            id: '3d-buildings-bg',
            source: vectorSourceId,
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 14,
            paint: {
              'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['coalesce', ['get', 'render_height'], ['get', 'height'], 10],
                0, '#161d27',  // Dark slate bases
                30, '#222b3b', // Medium slate body
                100, '#323f56' // Highlighted rooftops
              ],
              'fill-extrusion-height': [
                'coalesce',
                ['get', 'render_height'],
                ['get', 'height'],
                15
              ],
              'fill-extrusion-base': [
                'coalesce',
                ['get', 'render_min_height'],
                ['get', 'min_height'],
                0
              ],
              'fill-extrusion-opacity': 0.85
            }
          });
        }
      });

      // Add Destination Hospital Marker
      const markerEl = document.createElement('div');
      markerEl.className = 'bg-facility-marker';
      
      const markerRing = document.createElement('div');
      markerRing.className = 'bg-facility-marker-ring';
      markerEl.appendChild(markerRing);

      const markerCross = document.createElement('div');
      markerCross.className = 'bg-facility-marker-cross';
      markerCross.innerText = '+';
      markerEl.appendChild(markerCross);

      hospitalMarker = new maplibregl.Marker({ element: markerEl })
        .setLngLat(destCoord)
        .addTo(map);

      // Add White navigation vehicle marker with glowing green chevron arrow
      const vehicleEl = document.createElement('div');
      vehicleEl.className = 'bg-vehicle-marker-wrapper';

      const chevronArrow = document.createElement('div');
      chevronArrow.className = 'bg-vehicle-marker-chevron';
      chevronArrow.innerText = '▲';
      vehicleEl.appendChild(chevronArrow);

      const carBody = document.createElement('div');
      carBody.className = 'bg-vehicle-marker-car';
      vehicleEl.appendChild(carBody);

      vehicleMarker = new maplibregl.Marker({ element: vehicleEl })
        .setLngLat(firstState.pos)
        .addTo(map);

      vehicleMarkerRef.current = vehicleMarker;

      let progress = 0;

      map.on('load', () => {
        map.resize();

        // Add source for route line
        map.addSource('route-source', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: coords
            }
          }
        });

        // Triple line overlay for high contrast, glowing green tactical route style
        map.addLayer({
          id: 'route-line-bg',
          type: 'line',
          source: 'route-source',
          paint: {
            'line-color': '#161c26', // Dark slate borders
            'line-width': 8,
            'line-opacity': 0.85
          }
        });

        map.addLayer({
          id: 'route-line-glow',
          type: 'line',
          source: 'route-source',
          paint: {
            'line-color': '#10b981', // Glowing green shadow
            'line-width': 6,
            'line-opacity': 0.3
          }
        });

        map.addLayer({
          id: 'route-line-active',
          type: 'line',
          source: 'route-source',
          paint: {
            'line-color': '#34d399', // Bright emerald green ribbon
            'line-width': 3,
            'line-opacity': 0.85
          }
        });

        map.addLayer({
          id: 'route-line-core',
          type: 'line',
          source: 'route-source',
          paint: {
            'line-color': '#ffffff', // Glowing white core
            'line-width': 1.2,
            'line-opacity': 0.9
          }
        });

        // Animation Loop
        const loop = () => {
          // Slow speed increment for natural travel
          progress += 0.00032;
          if (progress > 1) {
            progress = 0;
            
            // Trigger hospital marker arrival visual flash
            markerEl.classList.add('bg-marker-arrival-flash');
            setTimeout(() => {
              markerEl.classList.remove('bg-marker-arrival-flash');
            }, 600);
          }

          const routeState = getRouteState(progress);

          // Update vehicle marker position and rotation bearing
          if (vehicleMarkerRef.current) {
            vehicleMarkerRef.current.setLngLat(routeState.pos);
            vehicleEl.style.transform = `rotate(${routeState.heading}deg)`;
          }

          // Dynamically slice the route so the path behind the moving vehicle is hidden
          const remainingCoords = getRemainingRoute(progress, routeState.pos);
          const source = map.getSource('route-source');
          if (source) {
            source.setData({
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: remainingCoords
              }
            });
          }

          // Camera target: offset to the right of the path so vehicle is placed on the left side of the viewport
          const headingRad = routeState.heading * Math.PI / 180;
          const perpAngle = headingRad + Math.PI / 2;
          const targetCamLng = routeState.pos[0] + Math.sin(headingRad) * 0.0001 + Math.sin(perpAngle) * 0.00075;
          const targetCamLat = routeState.pos[1] + Math.cos(headingRad) * 0.0001 + Math.cos(perpAngle) * 0.00075;

          // Camera center lerp
          const currentCenter = map.getCenter();
          const nextLng = currentCenter.lng + (targetCamLng - currentCenter.lng) * 0.04;
          const nextLat = currentCenter.lat + (targetCamLat - currentCenter.lat) * 0.04;
          map.setCenter([nextLng, nextLat]);

          // Camera bearing lerp to align with direction of travel (heading)
          const currentBearing = map.getBearing();
          let diff = routeState.heading - currentBearing;
          
          // Handle degree wrap-around transitions smoothly
          while (diff < -180) diff += 360;
          while (diff > 180) diff -= 360;

          const nextBearing = currentBearing + diff * 0.035;
          map.setBearing(nextBearing);

          // Live-update the floating HUD panels directly in the DOM (Zero React render overhead)
          const distEl = document.getElementById('nav-distance');
          const etaEl = document.getElementById('nav-eta');
          const roadEl = document.getElementById('nav-road');
          const progressEl = document.getElementById('nav-progress-bar');
          const percentEl = document.getElementById('nav-progress-percent');
          const statusEl = document.getElementById('nav-status');

          const totalDistance = 2.0; // km
          const totalMinutes = 5;    // min

          if (distEl) distEl.innerText = ((1 - progress) * totalDistance).toFixed(1) + ' km';
          if (etaEl) etaEl.innerText = Math.ceil((1 - progress) * totalMinutes) + ' min';
          if (roadEl) {
            roadEl.innerText = progress < 0.45 ? 'Marine Drive' : progress < 0.75 ? 'Veer Nariman Rd' : 'Maharshi Karve Rd';
          }
          if (progressEl) progressEl.style.width = (progress * 100) + '%';
          if (percentEl) percentEl.innerText = Math.floor(progress * 100) + '%';
          if (statusEl) {
            statusEl.innerText = progress > 0.98 ? 'ARRIVED' : 'NAVIGATING';
            statusEl.className = progress > 0.98 ? 'text-emerald-400 font-bold animate-pulse' : 'text-emerald-400 font-bold';
          }

          animationFrameId = requestAnimationFrame(loop);
        };

        loop();
      });
    };

    // Fetch the actual road-network geometry from public tokenless OSRM API (guaranteed to follow OSM roads)
    const routingUrl = `https://router.project-osrm.org/route/v1/driving/${startCoord[0]},${startCoord[1]};${destCoord[0]},${destCoord[1]}?geometries=geojson&overview=full`;
    
    fetch(routingUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.code === 'Ok' && data.routes && data.routes[0]) {
          const fetchedCoords = data.routes[0].geometry.coordinates;
          if (fetchedCoords && fetchedCoords.length > 2) {
            activeRouteCoords = fetchedCoords;
          }
        }
        setupNavigation(activeRouteCoords);
      })
      .catch((error) => {
        console.warn('OSRM routing fetch failed, loading verified offline road-aligned route fallback.', error);
        setupNavigation(activeRouteCoords);
      });

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      styleTag.remove();
      if (hospitalMarker) {
        hospitalMarker.remove();
      }
      if (vehicleMarker) {
        vehicleMarker.remove();
      }
      if (map) {
        map.remove();
      }
    };
  }, []);

  return (
    <div 
      ref={mapContainerRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        backgroundColor: '#080a0e',
        pointerEvents: 'none'
      }}
    />
  );
};

export default GeospatialBackground;
