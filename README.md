# EchoGPT Backend API

Production-oriented backend for the **EchoGPT Chrome Extension**, built with **NestJS**, **PostgreSQL**, **Prisma ORM**, **JWT authentication**, and **Swagger/OpenAPI**.

## Features

### Authentication
- User registration
- User login
- JWT access tokens
- Refresh token support
- Secure logout with session invalidation
- Password hashing with bcrypt
- Protected routes
- Role-based authorization (`ADMIN` / `USER`)

### User Management
- Get user profile
- Update profile
- Change password
- Delete account
- Admin/User roles with normalized `Role` table

### Subscription Management
- FREE and PREMIUM plans
- Subscription status API
- Upgrade / downgrade subscription
- Request limits
- Usage tracking
- Remaining requests

### AI Provider Management
Supports provider records for:
- OpenAI
- Anthropic Claude
- Google Gemini

Features:
- Add provider
- Edit provider
- Delete provider
- Enable / disable provider
- Default provider selection
- AES-256-GCM encrypted API-key storage
- Provider health-check endpoint
- Admin-only provider management

### Chat API
- Send prompt
- Receive AI response
- Provider selection
- Conversation history
- Subscription usage tracking
- Live Gemini integration

> OpenAI and Claude provider management and health-check support are implemented. Gemini is used for live end-to-end AI response testing.

### Web Search API
- Search query
- Search history
- Recent searches
- Search suggestions
- Search-result caching
- Wikipedia search API used as the external search source

### Admin APIs
- Dashboard statistics
- User list
- Subscription overview
- AI provider overview
- Usage analytics
- Request logs
- System health
- PostgreSQL connectivity check
- Request duration and HTTP status logging

## Bonus Features

- Search Result Caching: **Implemented**
- Email Verification: **Not implemented**
- Streaming AI Response: **Not implemented**

The implementation prioritizes the required end-to-end functionality, authentication, authorization, database normalization, provider integration, security, logging, and Swagger documentation.

---

## Tech Stack

- **NestJS**
- **TypeScript**
- **PostgreSQL**
- **Prisma ORM**
- **JWT**
- **bcrypt**
- **Swagger / OpenAPI**
- **Google Gemini API**
- **Neon PostgreSQL** during development

---

## Project Structure

```text
src/
├── admin/
├── ai-providers/
├── auth/
├── chat/
├── common/
├── prisma/
├── subscriptions/
├── users/
├── web-search/
├── app.module.ts
└── main.ts

prisma/
├── migrations/
└── schema.prisma
```

---

## Database Models

The PostgreSQL schema includes:

- `User`
- `Role`
- `Session`
- `Subscription`
- `AiProvider`
- `ChatHistory`
- `WebSearch`
- `ApiUsageLog`

Prisma migration files are included in:

```text
prisma/migrations/
```

---

## Prerequisites

Install:

- Node.js
- npm
- PostgreSQL database, or a hosted PostgreSQL service such as Neon

---

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/echogpt-backend.git
cd echogpt-backend
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the project root.

Use `.env.example` as a template:

```env
DATABASE_URL="postgresql://username:password@host/database"

JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

ENCRYPTION_KEY="your-encryption-secret"

PORT=3000
```

Do not commit the real `.env` file.

AI provider API keys are added through the provider API and stored encrypted in the database.

---

## Prisma Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Apply migrations:

```bash
npx prisma migrate dev
```

To inspect the database:

```bash
npx prisma studio
```

---

## Running the Application

Development mode:

```bash
npm run start:dev
```

Production build:

```bash
npm run build
npm run start:prod
```

Default server:

```text
http://localhost:3000
```

---

## Swagger API Documentation

After starting the server, open:

```text
http://localhost:3000/api/docs
```

Swagger includes:

- Endpoint groups
- Request-body schemas
- Example request values
- Bearer authentication
- Common error responses
- Protected-route indicators

For protected routes:

1. Login using `/auth/login`
2. Copy the returned `accessToken`
3. Click **Authorize** in Swagger
4. Paste the JWT token

---

## Main API Endpoints

### Authentication

```text
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/me
```

### Users

```text
GET    /users/profile
PATCH  /users/profile
PATCH  /users/password
DELETE /users/account
GET    /users/admin-test
```

### Subscriptions

```text
GET  /subscriptions/status
POST /subscriptions/upgrade
POST /subscriptions/downgrade
POST /subscriptions/use-request
```

### AI Providers

```text
POST   /ai-providers
GET    /ai-providers
GET    /ai-providers/:id
PATCH  /ai-providers/:id
DELETE /ai-providers/:id

PATCH /ai-providers/:id/enable
PATCH /ai-providers/:id/disable
PATCH /ai-providers/:id/default
GET   /ai-providers/:id/health
```

AI provider management routes require the `ADMIN` role.

### Chat

```text
POST /chat
GET  /chat/history
```

### Web Search

```text
POST /web-search
GET  /web-search/history
GET  /web-search/recent
GET  /web-search/suggestions?q=Nest
```

### Admin

```text
GET /admin/dashboard
GET /admin/users
GET /admin/subscriptions
GET /admin/providers
GET /admin/analytics
GET /admin/logs
GET /admin/health
```

Admin routes require the `ADMIN` role.

---

## Authentication Flow

```text
Register
   ↓
Login
   ↓
Access Token + Refresh Token
   ↓
Protected API Request
   ↓
Refresh Access Token when required
   ↓
Logout
   ↓
Stored session is invalidated
```

Refresh tokens are hashed before being stored in the database.

---

## Security

Implemented security measures include:

- bcrypt password hashing
- JWT access authentication
- Refresh-token sessions
- Hashed refresh tokens
- Role-based authorization
- AES-256-GCM encryption for AI provider API keys
- Input validation with `class-validator`
- Global validation pipe
- Admin-only provider and admin APIs
- API keys excluded from normal provider responses
- Request and status logging

Never commit:

```text
.env
node_modules/
dist/
```

---

## AI Provider Health Checks

Provider health endpoints make a remote request to the configured provider where supported.

Example:

```text
GET /ai-providers/:id/health
```

Possible statuses include:

```text
HEALTHY
UNHEALTHY
DISABLED
UNREACHABLE
UNSUPPORTED_PROVIDER
INVALID_CREDENTIAL_STORAGE
```

A provider with an invalid API key can correctly return an unhealthy/unauthorized status without affecting the rest of the application.

---

## Search Result Caching

Web-search results are cached in PostgreSQL for a short period.

Example behavior:

```text
First search:
cached: false

Same query within cache duration:
cached: true
```

This reduces repeated calls to the external search source.

---

## Request Logging

A global request-logging interceptor stores request metadata including:

- HTTP method
- path
- authenticated user
- status
- HTTP status code
- request duration
- timestamp

Logs can be viewed through:

```text
GET /admin/logs
```

---

## Testing Notes

The main flows were tested manually using PowerShell and Swagger:

- Registration
- Login
- JWT authentication
- Refresh tokens
- Logout
- Role authorization
- Profile management
- Subscription usage
- Provider CRUD
- Provider enable/disable
- Provider default selection
- Provider health checks
- Gemini AI response
- Conversation history
- Web search
- Search caching
- Search history/recent/suggestions
- Admin dashboard
- Request logs
- System health

Example PowerShell login:

```powershell
$body = @{
    email = "test@example.com"
    password = "your-password"
} | ConvertTo-Json

$login = Invoke-RestMethod `
  -Uri "http://localhost:3000/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$token = $login.accessToken
```

---

## Known Limitations / Future Improvements

The following items were intentionally left as future improvements:

- Email verification
- Streaming AI responses
- Full live inference testing for every commercial AI provider
- Docker deployment
- Automated integration / end-to-end test suite
- Postman collection

The architecture allows these features to be added without redesigning the core modules.

---

## Submission Notes

This project includes:

- Source code
- Prisma schema
- Prisma migrations
- Swagger API documentation
- `.env.example`
- Role-based authorization
- Request logging
- Search caching
- Secure AI provider key storage

Optional Postman collection is not included because Swagger provides interactive API testing.

---

## Defense / Design Explanation

This was a time-boxed implementation, so the development priority was the required end-to-end functionality, security, database normalization, authentication and authorization, provider integration, request logging, and API documentation.

The provider architecture supports OpenAI, Claude, and Gemini for provider management, encrypted credential storage, enable/disable behavior, default selection, and health checking. Gemini was used for live end-to-end AI inference testing because it provided a suitable development/testing path without requiring paid OpenAI or Claude usage. i avoided paid APIs for having limitaions. I believe implementing gemini and the fake APIs would help your team see my Potential of becoming the best fit for this internship.

Email verification and streaming responses were left because my target was to showcase the complex features first. but Search-result caching was implemented. 

---

## License

This project was developed as a backend internship assignment for educational and evaluation purposes. Even if i didnt get the internship, i learnt alot through this assignment. i really appreciate for giving me the opportunity <3
