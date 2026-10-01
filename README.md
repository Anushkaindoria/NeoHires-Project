# NeoHires

NeoHires is a full-stack platform to track internships and hackathons.

## Features
- Internship tracking (month-wise)
- Hackathon listings
- Backend APIs using Node.js & Express
- MongoDB Atlas integration

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB Atlas

## Setup

### 1. Install backend dependencies
```bash
cd backend
npm install
```

### 2. Create environment file
Create a `.env` file inside the `backend` folder:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

### 3. Start the backend
```bash
cd backend
node server.js
```

### 4. Seed sample data
```bash
cd backend
node seed.js
```

### 5. Open the app
Visit:
```text
http://localhost:5000
```

## Day 3 backend APIs
The Day 3 backend work includes authentication and dashboard APIs for personal tracking.

### Authentication
- `POST /api/auth/signup` — create a new user account
- `POST /api/auth/login` — authenticate an existing user and return a JWT
- requests to protected routes must include `Authorization: Bearer <token>`

### Dashboard and tracking
- `GET /api/dashboard` — return the current user profile, saved listings, application records, and summary counts
- `GET /api/saved` — fetch saved internship and hackathon listings for the logged-in user
- `POST /api/saved` — save a listing for the current user
- `DELETE /api/saved/:id` — remove a saved listing
- `GET /api/applications` — fetch the user’s application status records
- `POST /api/applications` — create or update an application status entry
- `DELETE /api/applications/:id` — remove a tracking record

## Project structure
```text
NeoHires-Project/
├── index.html
├── script.js
├── style.css
├── backend/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── seed.js
│   └── package.json
```

## Notes
- `.env` is local-only and should not be committed
- MongoDB Atlas connection is required for the backend to run
