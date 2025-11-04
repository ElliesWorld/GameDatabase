# 🎮 Game Database

A full-stack web application for tracking game sessions with user statistics.

## Features

- User registration with profile pictures (emoji or image upload)
- 4 games: Snowball Showdown, Bear Panic, Meteor Mayhem, Tarzan Rumble
- Game session time tracking
- Weather API integration with game recommendations
- Statistics and leaderboards
- Winston logger for application logging
- MongoDB database with Prisma ORM

## Tech Stack

**Frontend:**
- React with TypeScript
- Vite (build tool)
- React Router for navigation
- Recharts for data visualization
- Axios for API requests

**Backend:**
- Node.js with Express 
- TypeScript 
- MongoDB with Prisma ORM
- Winston for logging
- Multer for file uploads
- Zod for validation

## Requirements

- Node.js
- MongoDB
- npm

## Installation

### Backend Setup

```bash
# Navigate to backend directory
cd winston-logger

# Install all dependencies at once
npm install

# Or install individually if needed:
npm install express cors dotenv mongodb
npm install @prisma/client
npm install multer zod
npm install winston winston-daily-rotate-file

# Dev dependencies
npm install -D typescript tsx nodemon ts-node
npm install -D @types/node @types/express @types/cors @types/multer
npm install -D prisma
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Set up environment variables
# Create .env file with your MongoDB connection
touch .env
# Add: DATABASE_URL="mongodb://localhost:27017/game-database"

# Generate Prisma client
npx prisma generate

# Seed the database (optional)
npm run seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd visuals

# Install all dependencies
npm install

# Or install individually if needed:
npm install react react-dom react-router-dom
npm install axios recharts
npm install vite @vitejs/plugin-react

# Dev dependencies
npm install -D typescript @types/react @types/react-dom

# Start development server
npm run dev
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL="mongodb://localhost:27017/game-database"
PORT=3000
CORS_ORIGIN="*"
```

## Running the Application

1. **Start MongoDB** (running locally)
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd winston-logger
   npm run dev
   ```
   Server runs on `http://localhost:3000`

3. **Start Frontend Server**
   ```bash
   cd visuals
   npm run dev
   ```
   Application runs on `http://localhost:5173`

## API Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID with statistics |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Games

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/games` | Get all games |
| GET | `/api/games/:id` | Get game by ID |
| POST | `/api/games` | Create new game |

### Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions` | Get all game sessions |
| GET | `/api/sessions/:id` | Get session by ID |
| POST | `/api/sessions` | Create new session |

### Weather

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weather` | Get current weather |

### Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/profile-picture` | Upload profile picture |

## Database Schema

### User
```prisma
model User {
  id              String        @id @default(auto()) @map("_id") @db.ObjectId
  email           String        @unique
  firstName       String
  lastName        String
  nickname        String        @unique
  profilePicture  String?
  gameSessions    GameSession[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}
```

### Game
```prisma
model Game {
  id           String        @id @default(auto()) @map("_id") @db.ObjectId
  name         String        @unique
  imageUrl     String
  gameSessions GameSession[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}
```

### GameSession
```prisma
model GameSession {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  gameId    String   @db.ObjectId
  duration  Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  game      Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
## Logging

Winston logger with daily log rotation:
- Info logs: User actions, API calls
- Error logs: Server errors, validation failures
- Warn logs: 404s, failed validations

Logs stored in `winston-logger/logs/` directory.

## Development

### Available Scripts

**Backend:**
```bash
npm run dev      # Start development server
```

**Frontend:**
```bash
npm run dev      # Start Vite development server
```

### Seed Database
```bash
cd winston-logger
npm run seed
```

<img width="726" height="463" alt="image" src="https://github.com/user-attachments/assets/f38cf4ba-25b1-4589-bca4-1932690d0943" />

<img width="539" height="621" alt="image" src="https://github.com/user-attachments/assets/89d3df00-aa24-44ca-be2c-5eb9cdea2344" />

<img width="994" height="681" alt="image" src="https://github.com/user-attachments/assets/220feb85-a6b7-411d-8b2c-d86330d815b5" />

<img width="545" height="620" alt="image" src="https://github.com/user-attachments/assets/5d3127d4-25d7-43bf-8e2a-6b34f0048aaa" />

<img width="1281" height="688" alt="image" src="https://github.com/user-attachments/assets/1e1718ed-d694-4e7c-b7cc-5a0cdf312704" />


