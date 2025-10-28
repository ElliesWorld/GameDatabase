import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET all users
router.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// GET user by ID with statistics 
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch user with their game sessions
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

    // Calculate statistics
    const gameStats: { [key: string]: { minutes: number; percentage: number } } = {};
    let totalSeconds = 0;

    // Calculate total seconds and per-game stats
    user.gameSessions.forEach(session => {
      const gameName = session.game.name;
      const seconds = session.duration; // Using 'duration' from your schema
      
      totalSeconds += seconds;
      
      if (!gameStats[gameName]) {
        gameStats[gameName] = { minutes: 0, percentage: 0 };
      }
      gameStats[gameName].minutes += seconds;
    });

    // Convert seconds to minutes (1 second = 1 minute for display)
    const totalMinutes = totalSeconds;
    
    // Calculate percentages
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

// POST create user
router.post("/", async (req, res) => {
  const newUser = await prisma.user.create({
    data: req.body
  });
  res.json(newUser);
});

// PUT update user
router.put("/:id", async (req, res) => {
  const updatedUser = await prisma.user.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(updatedUser);
});

// DELETE user
router.delete("/:id", async (req, res) => {
  await prisma.user.delete({
    where: { id: req.params.id }
  });
  res.json({ message: "User deleted" });
});

export default router;