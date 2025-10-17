import express from 'express';
import weatherRoutes from './weather.js';
import userRoutes from './user.js';
import gameRoutes from './game.js';

const app = express();

app.use('/api/weather', weatherRoutes); 
app.use('/api/users', userRoutes);       
app.use('/api/games', gameRoutes);       