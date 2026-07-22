# Decision Log: ResQMap

This document records the architectural, design, and scope decisions made for the ResQMap project.

| Decision | Status | Reason |
| :--- | :--- | :--- |
| **Project name: ResQMap** | Decided | Clear project identity. |
| **Development approach: Incremental** | Decided | Prevent uncontrolled scope expansion. |
| **Initial V1 direction: Emergency facility discovery and navigation** | Decided | Core product purpose. |
| **Frontend: React + Vite + Tailwind CSS** | Planned | Existing knowledge and suitable for the project. |
| **Map rendering engine: MapLibre GL JS** | Planned | Supports both 2D and perspective/3D map experiences |
| **React MapLibre integration** | Planned | Allows MapLibre to be used within the React frontend |
| **2D and 3D map modes** | Decided | Gives users multiple visualization options |
| **Shared map/application state** | Decided | Prevents duplicated map logic and keeps both modes consistent |
| **Exact map style/tile provider** | Undecided | Must be selected based on cost, licensing, performance, and 3D support |
| **Backend: Node.js + Express** | Planned | Existing knowledge and suitable for the project. |
| **Database** | Not required initially | No persistent application data has been defined yet. MongoDB may be introduced later if a concrete requirement for persistent application data emerges. |
| **Geospatial services** | To be decided later | Select services when the relevant feature is implemented. |
| **AI/RAG/agentic AI** | Not part of initial V1 scope | Keep the core application focused. |
