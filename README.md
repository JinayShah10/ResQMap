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
4. **Map Display:** Display the user's location and nearby facilities on an interactive map.
5. **Facility Selection:** Allow the user to select a specific facility on the map or from a list.
6. **Facility Information:** Show details such as name, distance, status, and contact information.
7. **Directions:** Provide routing and directions from the user's location to the selected facility.

*Note: This workflow is a future product direction. No features are implemented during Phase 0.*

### Planned Tech Stack
* **Frontend:** React, Vite, Tailwind CSS
* **Mapping:** Leaflet, React Leaflet, OpenStreetMap
* **Backend:** Node.js, Express
* **Database:** No database initially. MongoDB may be introduced later only if a concrete requirement for persistent application data emerges.
* **Geospatial Services:** Exact services for nearby facility discovery, geocoding, and routing will be selected and documented when those features are implemented. Specific external APIs are not finalized or integrated during Phase 0.
* **Future AI Direction:** LangChain, RAG, and agentic AI are not part of the initial V1 implementation. They must not be implemented or configured during Phase 0.

### Incremental Development Principle
ResQMap will be developed incrementally. Features and dependencies must not be added before their planned development stage. We adhere strictly to the roadmap, ensuring each phase is verified and stable before moving forward.

### Project Documentation
Detailed documentation is available in the `docs/` directory:
* [Project Overview](docs/00_Project_Overview.md)
* [Product Requirements](docs/01_Product_Requirements.md)
* [Technical Architecture](docs/02_Technical_Architecture.md)
* [Decision Log](docs/03_Decision_Log.md)
