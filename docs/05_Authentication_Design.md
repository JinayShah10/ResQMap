# Authentication Design: ResQMap

This document outlines the planned authentication mechanism for ResQMap. No authentication is implemented in this phase.

## 1. User Signup Flow
The signup process registers new users into the system:
1. **Request Payload:** The frontend submits a POST request to `/api/auth/signup` containing fields: `name`, `email`, and `password`.
2. **Validation:** The backend validates formatting (e.g., strong password, valid email syntax) and checks for email uniqueness in MongoDB.
3. **Password Hashing:** Passwords will be salted and hashed using `bcrypt` (recommended salt rounds: 10) before database persistence.
4. **User Creation:** A new document is saved in the database with the hashed password.
5. **Token Issuance:** A JSON Web Token (JWT) is generated containing the user's ID as the payload and sent back in the response.

## 2. User Login Flow
The login process authenticates existing users:
1. **Request Payload:** The frontend submits a POST request to `/api/auth/login` containing `email` and `password`.
2. **Database Lookup:** The backend fetches the user record matching the provided email.
3. **Password Verification:** The backend compares the incoming plain text password against the stored bcrypt hash using `bcrypt.compare()`.
4. **Token Issuance:** If passwords match, a JWT is signed with the server's private secret and returned to the client.

## 3. Password Hashing (bcrypt)
* **Goal:** Avoid storing plaintext credentials in the database to prevent credential compromise.
* **Mechanism:** Use `bcrypt` which implements key stretching and salt generation to protect against brute-force and rainbow table attacks.
* **Storage:** Only the resulting hash string is saved to the `password` field of the User model.

## 4. JWT Authentication
* **Structure:** Tokens will follow the standard `Header.Payload.Signature` layout.
* **Payload:** Contains identity claims such as the unique `userId`.
* **Signing:** The token is signed using an environment-specific secret variable (`JWT_SECRET`).
* **Session Management:** Stateless tokens will be stored client-side (e.g., `localStorage` or HttpOnly cookies) and sent in the HTTP `Authorization: Bearer <token>` header on request headers.

## 5. Protected Routes
Endpoints requiring authorization will be guarded by a middleware hook:
1. **Middleware Check:** The middleware extracts the token from the request's Authorization header.
2. **Verification:** Validates the signature against the server's `JWT_SECRET` and checks for expiration.
3. **Context Injection:** Once verified, the user information (`req.user`) is injected into the request object, letting downstream controllers access the authenticated context.
4. **Denial:** Invalid or missing tokens result in an immediate `401 Unauthorized` response.
