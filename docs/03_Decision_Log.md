# Decision Log: ResQMap

This document records the architectural, design, and scope decisions made for the ResQMap project.

| Decision | Status | Reason |
| :--- | :--- | :--- |
| **Project name: ResQMap** | Decided | Clear project identity. |
| **Development approach: Incremental** | Decided | Prevent uncontrolled scope expansion. |
| **Initial V1 direction: Emergency facility discovery and navigation** | Decided | Core product purpose. |
| **Frontend: React + Vite + Tailwind CSS** | Planned | Existing knowledge and suitable for the project. |
| **Mapping: Leaflet + React Leaflet + OpenStreetMap** | Planned | Open mapping foundation suitable for the project. |
| **Backend: Node.js + Express** | Planned | Existing knowledge and suitable for the project. |
| **Database** | Not required initially | No persistent application data has been defined yet. MongoDB may be introduced later if a concrete requirement for persistent application data emerges. |
| **Geospatial services** | To be decided later | Select services when the relevant feature is implemented. |
| **AI/RAG/agentic AI** | Not part of initial V1 scope | Keep the core application focused. |
