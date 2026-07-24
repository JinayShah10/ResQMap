# Location Architecture: ResQMap

This document details the planned location architectural design for ResQMap. No location functionality is implemented in this phase.

## 1. Browser Geolocation API
The application will retrieve the user's physical position via standard browser APIs:
* **Method:** Use `navigator.geolocation.getCurrentPosition()` to fetch coordinates (latitude, longitude) and precision data.
* **Consent:** The user will be prompted by the browser to allow location access.
* **Error Handling:** If location access is denied, timed out, or unavailable, the application will gracefully catch the error and resort to a configured default fallback coordinate.

## 2. Temporary Frontend Location State
The user's coordinate location will be held dynamically:
* **State Scope:** React context or global state hooks will store the coordinates in memory.
* **Persistence:** The location state is strictly transient and lives in the client application scope. It is not saved across browser refreshes unless caching behaviors (such as sessionStorage) are introduced later.

## 3. MapLibre User Marker
To visualize the user's location on the interactive map:
* **Visual Representation:** A dedicated coordinate marker (e.g., a pulsing blue dot) will be added to the MapLibre instance.
* **Interactions:** The viewport can center or pan to the user's location upon initial load or when a "Find Me" UI button is triggered.

## 4. Mumbai as Initial Fallback Map Location
If geolocation coordinates are unavailable (e.g., permission denied or unsupported browser):
* **Fallback Coordinates:** The map will initialize centered on Mumbai, India.
* **Values:**
  * **Latitude:** `19.0760`
  * **Longitude:** `72.8777`
  * **Default Zoom:** Suitable scale to view local emergency structures (e.g., `12`).

## 5. Persistence Considerations
* **No Database Storage:** The user's coordinates are *not* sent to or stored in MongoDB.
* **Privacy by Design:** User location is treated as ephemeral client data, keeping the database transaction layer focused purely on facility indexing and authentication scopes.
