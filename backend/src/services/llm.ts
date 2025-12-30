import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateReply(history: any[], userMessage: string) {
  // Add basic input validation and sanitization
  if (!userMessage || typeof userMessage !== 'string') {
    throw new Error('Invalid user message provided');
  }

  // Limit message length to prevent prompt injection and excessive token usage
  const sanitizedUserMessage = userMessage.substring(0, 1000);

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    {
      role: "system",
      content: `You are a helpful support agent for the Y2K fashion store "Y2K Dreamline".
Shipping: Worldwide in 5-9 business days, free domestic shipping above ₹2,000 or $30 international.
Returns: 7-day window, refunds in 3-5 days after approval.
Support Hours: 9AM-7PM IST Mon-Sat.
Answer concisely and clearly.`
    }
  ];

  // Add conversation history, but limit to last 10 messages to control token usage
  const recentHistory = history.slice(-10);
  for (const m of recentHistory) {
    messages.push({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text
    });
  }

  messages.push({
    role: "user",
    content: sanitizedUserMessage
  });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 500, // Limit response length for cost control
      temperature: 0.7 // Balance creativity and consistency
    });

    // Safe return of response text
    return completion.choices?.[0]?.message?.content || "I'm here to help you.";
  } catch (error) {
    console.error('Error calling OpenAI API:', error);

    // Handle specific API errors
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error('Invalid API key. Please check your OpenAI API key configuration.');
      } else if (error.message.includes('429')) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (error.message.includes('400')) {
        throw new Error('Invalid request. Please try rephrasing your question.');
      }
    }

    throw new Error('Failed to generate response. Please try again.');
  }
}
