import { MongoClient, ObjectId } from 'mongodb';
import logger from '../src/logger';

const url = 'mongodb://localhost:27017';
const dbName = 'game-database';

async function seed() {
  const client = new MongoClient(url);
  
  try {
    await client.connect();
    logger.info('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Clear existing data
    await db.collection('game_sessions').deleteMany({});
    await db.collection('games').deleteMany({});
    await db.collection('users').deleteMany({});
    logger.info('Cleared existing data');
    
    // Insert games
    const gamesResult = await db.collection('games').insertMany([
      { name: 'Snowball Showdown', imageUrl: '/images/games/snowball.png', createdAt: new Date() },
      { name: 'Bear Panic', imageUrl: '/images/games/bear.png', createdAt: new Date() },
      { name: 'Meteor Mayhem', imageUrl: '/images/games/meteor.png', createdAt: new Date() },
      { name: 'Tarzan Rumble', imageUrl: '/images/games/tarzan.png', createdAt: new Date() }
    ]);
    
    logger.info('Created 4 games');
    
    // Insert users WITH COOL CHARACTER NAMES AND EMOJI AVATARS
    const usersResult = await db.collection('users').insertMany([
      {
        email: 'mickey.mouse@disney.com',
        firstName: 'Mickey',
        lastName: 'Mouse',
        nickname: 'Mickey',
        profilePicture: '🐭',  // Mouse emoji for Mickey
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'donald.duck@disney.com',
        firstName: 'Donald',
        lastName: 'Duck',
        nickname: 'Donny',
        profilePicture: '🦆',  // Duck emoji for Donald
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'scooby.doo@mystery.com',
        firstName: 'Scooby',
        lastName: 'Doo',
        nickname: 'Scooby',
        profilePicture: '🐕',  // Dog emoji for Scooby
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'winnie.pooh@hundredacre.com',
        firstName: 'Winnie',
        lastName: 'Pooh',
        nickname: 'Pooh',
        profilePicture: '🐻',  // Bear emoji for Winnie the Pooh
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    
    logger.info('Created 4 users: Mickey Mouse, Donald Duck, Scooby Doo, Winnie the Pooh');
    
    // Get the inserted IDs
    const gameIds = Object.values(gamesResult.insertedIds) as ObjectId[];
    const userIds = Object.values(usersResult.insertedIds) as ObjectId[];
    
    // Insert game sessions
    const sessionsResult = await db.collection('game_sessions').insertMany([
      // Mickey Mouse sessions
      {
        userId: userIds[0],
        gameId: gameIds[2], // Meteor Mayhem
        duration: 20,
        createdAt: new Date('2025-10-29T10:00:00Z'),
        updatedAt: new Date('2025-10-29T10:00:00Z')
      },
      
      // Donald Duck (Donny) sessions
      {
        userId: userIds[1],
        gameId: gameIds[0], // Snowball Showdown
        duration: 3,
        createdAt: new Date('2025-10-29T11:00:00Z'),
        updatedAt: new Date('2025-10-29T11:00:00Z')
      },
      
      // Scooby Doo sessions
      {
        userId: userIds[2],
        gameId: gameIds[0], // Snowball Showdown
        duration: 2,
        createdAt: new Date('2025-10-29T12:00:00Z'),
        updatedAt: new Date('2025-10-29T12:00:00Z')
      },
      
      // Winnie the Pooh sessions
      {
        userId: userIds[3],
        gameId: gameIds[1], // Bear Panic
        duration: 5,
        createdAt: new Date('2025-10-29T13:00:00Z'),
        updatedAt: new Date('2025-10-29T13:00:00Z')
      },
      {
        userId: userIds[3],
        gameId: gameIds[2], // Meteor Mayhem
        duration: 4,
        createdAt: new Date('2025-10-29T14:00:00Z'),
        updatedAt: new Date('2025-10-29T14:00:00Z')
      }
    ]);
    
    logger.info('Created 5 game sessions');
    
    logger.info('========================================');
    logger.info('Seeding completed successfully!');
    logger.info('========================================');
    logger.info('Summary:');
    logger.info('   - Games: 4');
    logger.info('   - Users: 4 (Mickey Mouse, Donald Duck, Scooby Doo, Winnie the Pooh)');
    logger.info('   - Game Sessions: 5');
    logger.info('========================================');
    
  } catch (error) {
    logger.error('Error during seeding:', error);
    throw error;
  } finally {
    await client.close();
    logger.info('MongoDB connection closed');
  }
}

seed().catch((error) => {
  logger.error('Seed script failed:', error);
  process.exit(1);
});