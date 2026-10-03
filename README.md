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
