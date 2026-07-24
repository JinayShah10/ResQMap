# Backend Architecture: ResQMap

This document details the backend architectural design and foundation for ResQMap.

## 1. Backend Purpose
The ResQMap backend serves as the core business logic, data persistence, and API integration layer. Its key roles include:
* Facilitating secure access to database collections (e.g., facilities, users).
* Acting as a proxy to third-party routing and geolocation APIs to protect API credentials and manage rate limits.
* Standardizing data payloads and responses for consumption by the React frontend.

## 2. Backend Folder Structure
The backend codebase is organized inside the `backend/` directory under a standard MVC-inspired directory structure to ensure separation of concerns:

```
backend/
├── src/
│   ├── config/       # Configuration files (e.g., database connection setups)
│   ├── controllers/  # Request handlers and business logic processing
│   ├── middleware/   # Custom Express middlewares (e.g., auth guards, error handlers)
│   ├── models/       # Database schemas and models (Mongoose)
│   ├── routes/       # API route definitions
│   └── server.js     # Server entry point and setup
├── .env.example      # Template for environment variables
└── package.json      # Node.js project configuration and dependencies
```

## 3. Express Server Responsibility
The [server.js](file:///Users/jinay/Desktop/Workspace/MERN Full Stack/ResQMap/backend/src/server.js) file serves as the main entry point:
* Loads environment variables using `dotenv`.
* Initializes and configures the Express application.
* Standardizes request-response pipeline via global middleware:
  * CORS handling (`cors`) to support cross-origin requests from the React frontend.
  * JSON request body parsing (`express.json()`).
* Hosts basic server diagnostics (health checks).
* Configures port listening.

## 4. Planned API Layer
Future routes will be mapped under the `/api` namespace:
* `/api/health`: Check server availability and diagnostic health status.
* `/api/auth`: Handles user onboarding (signup) and session initiation (login). *(Future Phase 3)*
* `/api/facilities`: Serves query endpoints for looking up emergency facilities, filtering categories, and performing distance-based queries. *(Future Phase 3)*

## 5. Planned Database Layer (Future Phase 3)
* **Technology:** MongoDB with Mongoose ODM.
* **Mongoose Models:** Define structured schemas for resources like users and facilities, complete with validation rules.
* **Geospatial Queries:** Utilize MongoDB's native 2dsphere indexing for geolocation-based nearest-facility lookups.

## 6. Planned Authentication Layer (Future Phase 3)
* **Hashing:** Implement `bcrypt` for secure, one-way password hashing prior to database storage.
* **Tokens:** Issue JSON Web Tokens (JWT) upon successful login or signup.
* **Middleware Guards:** Create authentication middleware to verify JWT headers and protect access to private API endpoints.
