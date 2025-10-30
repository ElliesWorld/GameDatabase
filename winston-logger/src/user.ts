import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';
import { z } from 'zod';
import logger from './logger.js';

const router = Router();
const prisma = new PrismaClient();

// MongoDB direct connection for writes
const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017';
const dbName = 'game-database';

// Zod validation schemas
const createUserSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .toLowerCase()
    .trim(),
  
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .trim(),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .trim(),
  
  nickname: z.string()
    .min(1, 'Nickname is required')
    .max(30, 'Nickname must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Nickname can only contain letters, numbers, and underscores')
    .trim(),
  
  profilePicture: z.string()
    .min(1, 'Profile picture is required')
    .refine(
      (val) => val.startsWith('/uploads/') || /^[\p{Emoji}]$/u.test(val),
      'Profile picture must be an emoji or uploaded image path'
    )
    .optional()
});

const updateUserSchema = createUserSchema.partial();

// GET all users
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    logger.info(`Fetched ${users.length} users`);
    res.json(users);
  } catch (error: any) {
    logger.error(`Error fetching users: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// GET user by ID with statistics
router.get("/:id", async (req: Request, res: Response) => {
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
      logger.warn(`User not found: ${id}`);
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

    logger.info(`Fetched user profile: ${id}`);
    
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
  } catch (error: any) {
    logger.error(`Error fetching user profile: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user profile' 
    });
  }
});

// POST create user 
router.post("/", async (req: Request, res: Response) => {
  const client = new MongoClient(mongoUrl);
  
  try {
    // Validate request body with Zod
    const validationResult = createUserSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      logger.warn(`Validation failed for user creation: ${JSON.stringify(validationResult.error.errors)}`);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    const { email, firstName, lastName, nickname, profilePicture } = validationResult.data;

    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Check for duplicates
    const existing = await usersCollection.findOne({
      $or: [{ email }, { nickname }]
    });

    if (existing) {
      const message = existing.email === email 
        ? 'Email already exists' 
        : 'Nickname already taken';
      logger.warn(`Duplicate user: ${message}`);
      return res.status(400).json({
        success: false,
        message
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
    
    logger.info(`User created: ${result.insertedId.toString()}`);
    
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
    logger.error(`Error creating user: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create user'
    });
  } finally {
    await client.close();
  }
});

// PUT update user 
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate request body with Zod 
    const validationResult = updateUserSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      logger.warn(`Validation failed for user update: ${JSON.stringify(validationResult.error.errors)}`);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: validationResult.data
    });
    
    logger.info(`User updated: ${id}`);
    
    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error: any) {
    logger.error(`Error updating user: ${error.message}`);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// DELETE user
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.user.delete({
      where: { id }
    });
    
    logger.info(`User deleted: ${id}`);
    
    res.json({ 
      success: true,
      message: "User deleted" 
    });
  } catch (error: any) {
    logger.error(`Error deleting user: ${error.message}`);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

export default router;