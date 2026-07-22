# ResQMap
## Emergency Facility Discovery and Navigation Platform

ResQMap is planned as a full-stack web application that will help users discover nearby emergency facilities based on their location and get directions to them.

### Current Status
**Phase 0 - Initial Project Setup**
Currently, the repository is initialized with the project structure and baseline documentation. No application features or dependencies are implemented or installed yet.

### Planned V1 Product Direction
The core workflow for the initial version (V1) is planned as:
1. **User Location:** Obtain the user's current geographic location.
2. **Emergency Facility Category:** The user selects a category of emergency facility (e.g., Hospital, Pharmacy, Fire Station).
3. **Nearby Facilities:** Find facilities within a nearby radius matching the chosen category.
4. **Map Display:** Display the user's location and nearby facilities on an interactive map supporting both 2D and 3D visualization modes with user-controlled switching.
5. **Facility Selection:** Allow the user to select a specific facility on the map or from a list.
6. **Facility Information:** Show details such as name, distance, status, and contact information.
7. **Directions:** Provide routing and directions from the user's location to the selected facility.

*Note: This workflow is a future product direction. No features are implemented during Phase 0.*

### Planned Tech Stack
* **Frontend:** React, Vite, Tailwind CSS
* **Mapping:** MapLibre GL JS + React-compatible MapLibre integration
* **Map Data / Tiles:** OpenStreetMap-compatible map data and vector tile sources (exact tile/style provider undecided and will be finalized before implementation)
* **Backend:** Node.js, Express
* **Database:** No database initially. MongoDB may be introduced later only if a concrete requirement for persistent application data emerges.
* **Geospatial Services:** Exact services for nearby facility discovery, geocoding, and routing will be selected and documented when those features are implemented. Specific external APIs are not finalized or integrated during Phase 0.
* **Future AI Direction:** LangChain, RAG, and agentic AI are future possibilities and are not part of the initial V1 implementation. They must not be implemented or configured during Phase 0.

## Frontend Visual Direction
ResQMap features a dark, modern, map-first interface inspired by professional geospatial command-center and location-discovery interfaces. The visual system includes:
* **Map-First Layout:** The interactive map acts as the primary visual element, filling the main viewport.
* **Dark Application Theme:** A professional dark interface with a dark map style, high-contrast roads/features, clearly visible facility markers, and a restrained accent color for active states and important actions.
* **Left-Side Control/Results Panel:** A compact sidebar containing search inputs, category selection controls, and nearby facility list results.
* **Facility Detail Card:** A dedicated overlay card or panel presenting information (e.g., name, address, distance, contact details, and routing details) when a facility is selected.
* **2D/3D Map Switching:** A clean header or panel control to toggle camera rendering modes.
* **Purposeful UI Animations:** Functional animations to improve spatial understanding, such as smooth transitions for sliding panels, staggered entries for facility results, map marker animations when loaded or selected (scaling/pulsing), and smooth camera transitions when focusing on a selected facility or switching map modes.

## Map Visualization
ResQMap supports a planned 2D mode and a planned 3D/perspective mode using the same MapLibre-based map foundation:
* **2D Map Mode:** A conventional top-down interactive map view supporting panning, zooming, marker display, and routing, suitable for quickly understanding roads and locations.
* **3D/Perspective Map Mode:** A perspective-based map view supporting camera pitch/tilt, bearing/rotation, more immersive spatial visualization, and 3D building visualization where supported by the style/data source.

Both modes are visualization options built on a single shared map engine and underlying application data (such as coordinates, selected category, and facility data). The user can switch between these modes via a UI control. No 3D building data or specific tile provider is finalized at this stage.

### Incremental Development Principle
ResQMap will be developed incrementally. Features and dependencies must not be added before their planned development stage. We adhere strictly to the roadmap, ensuring each phase is verified and stable before moving forward.

### Project Documentation
Detailed documentation is available in the `docs/` directory:
* [Project Overview](docs/00_Project_Overview.md)
* [Product Requirements](docs/01_Product_Requirements.md)
* [Technical Architecture](docs/02_Technical_Architecture.md)
* [Decision Log](docs/03_Decision_Log.md)
