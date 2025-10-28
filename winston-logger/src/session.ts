import { Router } from 'express';
import { MongoClient, ObjectId } from 'mongodb';

const router = Router();
const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017';
const dbName = 'game-database';

// POST /api/sessions - Create a game session
router.post("/", async (req, res) => {
  const client = new MongoClient(mongoUrl);
  
  try {
    const { userId, gameId, duration } = req.body;

    if (!userId || !gameId || !duration) {
      return res.status(400).json({
        success: false,
        message: 'userId, gameId, and duration are required'
      });
    }

    await client.connect();
    const db = client.db(dbName);
    const sessionsCollection = db.collection('game_sessions');

    const session = {
      userId: new ObjectId(userId),
      gameId: new ObjectId(gameId),
      duration: parseInt(duration),
      createdAt: new Date()
    };

    const result = await sessionsCollection.insertOne(session);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId.toString(),
        ...session
      }
    });
  } catch (error: any) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create session'
    });
  } finally {
    await client.close();
  }
});

export default router;