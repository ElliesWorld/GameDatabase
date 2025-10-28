import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';

const router = Router();
const prisma = new PrismaClient();

// MongoDB direct connection for writes
const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017';
const dbName = 'game-database';

// GET all users - USES PRISMA ✅
router.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// GET user by ID with statistics - USES PRISMA ✅
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        gameSessions: {
          include: {
            game: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const gameStats: { [key: string]: { minutes: number; percentage: number } } = {};
    let totalSeconds = 0;

    user.gameSessions.forEach(session => {
      const gameName = session.game.name;
      const seconds = session.duration;
      
      totalSeconds += seconds;
      
      if (!gameStats[gameName]) {
        gameStats[gameName] = { minutes: 0, percentage: 0 };
      }
      gameStats[gameName].minutes += seconds;
    });

    const totalMinutes = totalSeconds;
    
    Object.keys(gameStats).forEach(gameName => {
      const minutes = gameStats[gameName].minutes;
      gameStats[gameName].percentage = totalSeconds > 0 
        ? Math.round((minutes / totalSeconds) * 100) 
        : 0;
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        nickname: user.nickname,
        profilePicture: user.profilePicture,
        statistics: {
          gameStats,
          totalMinutes,
          totalSessions: user.gameSessions.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user profile' 
    });
  }
});

// POST create user - Uses MongoDB client directly (no replica set needed)
router.post("/", async (req, res) => {
  const client = new MongoClient(mongoUrl);
  
  try {
    const { email, firstName, lastName, nickname, profilePicture } = req.body;

    if (!email || !firstName || !lastName || !nickname) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Check for duplicates
    const existing = await usersCollection.findOne({
      $or: [{ email }, { nickname }]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: existing.email === email 
          ? 'Email already exists' 
          : 'Nickname already taken'
      });
    }

    // Insert user
    const result = await usersCollection.insertOne({
      email,
      firstName,
      lastName,
      nickname,
      profilePicture: profilePicture || null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId.toString(),
        email,
        firstName,
        lastName,
        nickname,
        profilePicture,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create user'
    });
  } finally {
    await client.close();
  }
});

// PUT update user - USES PRISMA ✅
router.put("/:id", async (req, res) => {
  const updatedUser = await prisma.user.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(updatedUser);
});

// DELETE user - USES PRISMA ✅
router.delete("/:id", async (req, res) => {
  await prisma.user.delete({
    where: { id: req.params.id }
  });
  res.json({ message: "User deleted" });
});

export default router;