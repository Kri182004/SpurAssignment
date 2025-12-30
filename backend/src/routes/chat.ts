import { Router } from 'express';
import { generateReply } from '../services/llm';
import { PrismaClient } from '@prisma/client';
import cacheService from '../utils/cache';
import { invalidateCache } from '../utils/cacheMiddleware';

const prisma = new PrismaClient();
const router = Router();

// SEND MESSAGE + GENERATE AI REPLY
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    // Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty." });
    }

    // Additional validation for very long messages
    if (message.length > 1000) {
      return res.status(400).json({ error: "Message is too long. Please keep it under 1000 characters." });
    }

    let conversationId = sessionId;
    if (!conversationId) {
      const conv = await prisma.conversation.create({ data: {} });
      conversationId = conv.id;
    }

    await prisma.message.create({
      data: {
        conversationId,
        sender: "user",
        text: message
      }
    });

    // Clear the cache for this conversation since we're adding a new message
    await cacheService.delete(`chat:history:${conversationId}`);

    const history = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { timestamp: "asc" }
    });

    let reply;
    try {
      reply = await generateReply(history, message);
    } catch (llmError: any) {
      // If LLM fails, return a helpful error message to the user
      reply = llmError?.message || "I'm currently experiencing technical difficulties. Please try again.";
    }

    await prisma.message.create({
      data: {
        conversationId,
        sender: "ai",
        text: reply
      }
    });

    res.json({ reply, sessionId: conversationId });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// GET FULL CHAT HISTORY
router.get('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Missing sessionId" });

    // Try to get from cache first
    const cacheKey = `chat:history:${id}`;
    let messages = await cacheService.get<any[]>(cacheKey);

    if (!messages) {
      // If not in cache, fetch from database
      messages = await prisma.message.findMany({
        where: { conversationId: id },
        orderBy: { timestamp: "asc" }
      });

      // Cache the result for 5 minutes
      await cacheService.set(cacheKey, messages, { ttl: 300 });
      console.log(`Chat history cached for conversation ${id}`);
    } else {
      console.log(`Chat history served from cache for conversation ${id}`);
    }

    res.json({ messages });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

export default router;
