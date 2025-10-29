import { Router } from 'express';
import { MongoClient, ObjectId } from 'mongodb';

const router = Router();
const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017';
const dbName = 'game-database';

// GET all sessions (for statistics)
router.get("/", async (req, res) => {
  const client = new MongoClient(mongoUrl);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    
    // Get all sessions
    const sessions = await db.collection('game_sessions').find({}).toArray();
    
    // Get all users and games to populate the data
    const users = await db.collection('users').find({}).toArray();
    const games = await db.collection('games').find({}).toArray();
    
    // Create lookup maps
    const userMap = new Map(users.map(u => [u._id.toString(), u]));
    const gameMap = new Map(games.map(g => [g._id.toString(), g]));
    
    // Populate session data
    const populatedSessions = sessions.map(session => {
      const user = userMap.get(session.userId.toString());
      const game = gameMap.get(session.gameId.toString());
      
      return {
        id: session._id.toString(),
        userId: session.userId.toString(),
        gameId: session.gameId.toString(),
        duration: session.duration,
        createdAt: session.createdAt,
        user: {
          nickname: user?.nickname || 'Unknown',
          firstName: user?.firstName || '',
          lastName: user?.lastName || ''
        },
        game: {
          name: game?.name || 'Unknown Game'
        }
      };
    });

    res.json({
      success: true,
      data: populatedSessions
    });
  } catch (error: any) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch sessions'
    });
  } finally {
    await client.close();
  }
});

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