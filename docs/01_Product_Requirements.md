# Product Requirements: ResQMap V1 Core Workflow

This document defines the functional requirements for the planned V1 core workflow. Each requirement is written in clear, testable language to guide subsequent implementation and verification phases.

## 1. User Location
* **Requirement:** The system must determine the user's geographic coordinates (latitude and longitude).
* **Details:** The frontend will request location access from the user's browser using the Geolocation API. If access is denied or unavailable, the application must prompt the user to search/input a custom location or display a default fallback view with clear instructions.
* **Test Criteria:**
  * Verify that coordinates are retrieved when permission is granted.
  * Verify that a user is notified and given an option to enter location manually if permission is denied.

## 2. Emergency Facility Category Selection
* **Requirement:** The user must be able to select an emergency facility category from a pre-defined list.
* **Details:** The system will offer at least three core categories initially: "Hospital", "Pharmacy", and "Fire Station". The UI must provide a clear and simple mechanism (e.g., buttons, select dropdown, or tabs) to select one category at a time.
* **Test Criteria:**
  * Verify that selecting a category updates the application state.
  * Verify that only one category can be active for the search at any given time.

## 3. Nearby Facility Discovery
* **Requirement:** The system must retrieve a list of emergency facilities matching the selected category within a designated radius of the user's location.
* **Details:** The discovery query will use the user's current coordinates and selected category. Results must be retrieved from an external service (to be determined in the implementation phase) and passed to the frontend.
* **Test Criteria:**
  * Verify that querying retrieves a list of facilities that match the selected category.
  * Verify that facilities returned are within the geographic vicinity of the user's coordinates.

## 4. Map Display
* **Requirement:** The system must render an interactive map displaying the user's location and nearby facility markers.
* **Details:** The map will use OpenStreetMap-compatible vector tiles rendered via MapLibre GL JS (and a React-compatible integration). The map must center on the user's location and plot markers for the user and each discovered facility.
* **Test Criteria:**
  * Verify that the map is visible on the screen.
  * Verify that a distinct marker represents the user.
  * Verify that markers are plotted for each discovered facility.

## 5. Facility Selection
* **Requirement:** The user must be able to select a facility on the map or from a list to view its details.
* **Details:** Clicking a map marker or a facility list item must set that facility as the active selection, triggering the display of its detailed card or popup.
* **Test Criteria:**
  * Verify that clicking a map marker highlights or displays details for that specific facility.
  * Verify that clicking a list item triggers the same selection behavior.

## 6. Facility Information
* **Requirement:** The system must display essential details for the selected facility.
* **Details:** The details card/popup must display the facility's name, address, distance from the user, status (if available), and contact phone number.
* **Test Criteria:**
  * Verify that the detailed card contains name, address, distance, and contact details.

## 7. Directions and Route Display
* **Requirement:** The system must request and draw a route on the map from the user's location to the selected facility.
* **Details:** Upon selection, the application will compute routing steps and draw a polyline route on the map showing the path to the facility.
* **Test Criteria:**
  * Verify that a route line is drawn on the map connecting the user's location to the selected facility marker.

## Frontend Visualization and Interaction Requirements
1. **Requirement:** The application shall provide a dark primary visual theme.
2. **Requirement:** The map shall be the primary visual area of the application.
3. **Requirement:** The application shall provide a control and results area for user interaction (sidebar layout).
4. **Requirement:** Facility results and map markers shall represent the same underlying facilities.
5. **Requirement:** Selecting a facility from the results should eventually provide corresponding visual feedback on the map (centering, highlighting, route visualization).
6. **Requirement:** Selecting a map facility should eventually provide corresponding visual feedback in the results interface.
7. **Requirement:** The application shall provide 2D and 3D/perspective map visualization modes.
8. **Requirement:** The user shall be able to switch between the supported map modes.
9. **Requirement:** The two map modes shall use shared underlying application and facility data.
10. **Requirement:** User interface transitions and map interactions should use purposeful animations where appropriate (marker loads, panel collapses, camera swoops, route drawing).
11. **Requirement:** Animations must not interfere with usability or application performance.
