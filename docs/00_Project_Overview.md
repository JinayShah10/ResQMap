# Project Overview: ResQMap

## What is ResQMap?
ResQMap is an Emergency Facility Discovery and Navigation Platform. It is planned as a full-stack web application designed to help users locate nearby emergency facilities (such as hospitals, pharmacies, and fire stations) and get navigation routes to them based on their current location.

## Problem Statement
In emergency situations, finding the nearest open emergency facility and navigating to it quickly is critical. Standard maps can contain distracting information, require complex search terms, or fail to prioritize emergency-specific services clearly. ResQMap aims to address this by providing a clean, focused, and intuitive interface designed specifically for rapid discovery and navigation to emergency care.

## Planned V1 Objective
The objective of Version 1 (V1) is to build a functional, reliable core workflow that allows a user to:
1. Provide/detect their location.
2. Select a target emergency facility category.
3. View nearby matching facilities on an interactive map.
4. Select a facility to view its details.
5. Get directions and route visualization to the chosen facility.

## Intended User
The primary users of ResQMap are individuals looking for immediate, nearby emergency services. This includes residents, travelers, and anyone requiring quick access to essential facilities in critical times. The interface must remain clean, accessible, and fast under varying network conditions.

## Planned Core User Workflow
The planned sequence of user actions for the core V1 experience:
1. **User Location:** The application detects the user's location via GPS/Geolocation API or allows manual entry.
2. **Category Selection:** The user chooses from emergency categories (e.g., Hospital, Pharmacy, Fire Station).
3. **Discovery:** The application queries nearby facilities matching the category within a reasonable radius.
4. **Map Display:** The user views their location and nearby facility markers on an interactive map.
5. **Facility Selection:** The user taps/clicks a facility marker or list item.
6. **Facility Info:** The user views detailed information (e.g., name, address, contact details, open/closed status).
7. **Directions:** The user views a clear route from their location to the selected facility.

## Planned Technology Stack
* **Frontend:** React, Vite, Tailwind CSS
* **Mapping Library:** Leaflet, React Leaflet, OpenStreetMap
* **Backend:** Node.js, Express
* **Database:** No database initially. MongoDB may be introduced later only if a concrete requirement for persistent application data emerges.
* **Geospatial services:** Exact services for nearby facility discovery, geocoding, and routing will be selected and documented when those features are implemented. Specific external APIs are not finalized or integrated during Phase 0.
* **Future AI direction:** LangChain, RAG, and agentic AI are not part of the initial V1 implementation. They must not be implemented or configured during Phase 0.

## Principle of Incremental Development
To maintain a high standard of code quality and avoid scope creep, ResQMap follows a strict incremental development philosophy:
* Features must only be developed in their designated phases.
* No placeholder dependencies or unapproved packages are to be installed.
* Each increment must be fully verified and documented before proceeding.
