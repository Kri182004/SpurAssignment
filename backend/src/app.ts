import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRouter from './routes/chat';
import { initializeRedis } from './utils/redis';

dotenv.config();

const app = express();

// Initialize Redis connection
initializeRedis();

app.use(cors());
app.use(express.json());
app.use('/chat', chatRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Backend running on port ${port}`));
