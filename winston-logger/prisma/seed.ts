import { MongoClient, ObjectId } from 'mongodb';

const url = 'mongodb://localhost:27017';
const dbName = 'game-database';

async function seed() {
  const client = new MongoClient(url);
  
  try {
    await client.connect();
    
    const db = client.db(dbName);
    
    // Clear existing data
    await db.collection('game_sessions').deleteMany({});
    await db.collection('games').deleteMany({});
    await db.collection('users').deleteMany({});
    
    // Insert games
    const gamesResult = await db.collection('games').insertMany([
      { name: 'Snowball Showdown', imageUrl: '/images/games/snowball.png', createdAt: new Date() },
      { name: 'Bear Panic', imageUrl: '/images/games/bear.png', createdAt: new Date() },
      { name: 'Meteor Mayhem', imageUrl: '/images/games/meteor.png', createdAt: new Date() },
      { name: 'Tarzan Rumble', imageUrl: '/images/games/tarzan.png', createdAt: new Date() }
    ]);
    
    console.log('Created 4 games');
    
    // Insert users WITH EMOJI AVATARS
    const usersResult = await db.collection('users').insertMany([
      {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        nickname: 'johndoe',
        profilePicture: '👤',  // ← Emoji instead of path
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        nickname: 'janesmith',
        profilePicture: '🦊',  // ← Emoji
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'test.test@example.com',
        firstName: 'test',
        lastName: 'test',
        nickname: 'testtest',
        profilePicture: '🐻',  // ← Emoji
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'user.name@example.com',
        firstName: 'name',
        lastName: 'lastname',
        nickname: 'namelastname',
        profilePicture: '🦁',  // ← Emoji
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    
    // Get inserted IDs
    const gameIds = Object.values(gamesResult.insertedIds);
    const userIds = Object.values(usersResult.insertedIds);
    
    // Insert game sessions
    await db.collection('game_sessions').insertMany([
      { userId: userIds[0], gameId: gameIds[0], duration: 2400, createdAt: new Date() },
      { userId: userIds[0], gameId: gameIds[1], duration: 3180, createdAt: new Date() },
      { userId: userIds[0], gameId: gameIds[2], duration: 1560, createdAt: new Date() },
      { userId: userIds[1], gameId: gameIds[0], duration: 1800, createdAt: new Date() },
      { userId: userIds[1], gameId: gameIds[3], duration: 2700, createdAt: new Date() },
      { userId: userIds[2], gameId: gameIds[2], duration: 3600, createdAt: new Date() },
      { userId: userIds[2], gameId: gameIds[1], duration: 1200, createdAt: new Date() },
      { userId: userIds[3], gameId: gameIds[3], duration: 2100, createdAt: new Date() },
      { userId: userIds[3], gameId: gameIds[0], duration: 1500, createdAt: new Date() }
    ]);
    
    console.log('\n========================================');
    console.log('Seeding completed successfully!');
    console.log('========================================');
    console.log('Summary:');
    console.log('   - Games: 4');
    console.log('   - Users: 4');
    console.log('   - Game Sessions: 9');
    console.log('========================================\n');
    
  } finally {
    await client.close();
  }
}

seed().catch(console.error);