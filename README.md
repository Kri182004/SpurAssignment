# Spur Assignment

A chat application with AI integration and Redis caching.

## Features
- AI-powered chat using OpenAI
- Redis caching for improved performance
- Real-time chat interface with auto-scroll functionality
- Local SQLite database for conversation storage

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Redis server (for caching)

### Backend Setup
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd SpurAssignment/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with your configuration (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL="file:./dev.db"
   REDIS_URL=redis://localhost:6379
   ```

4. Run the backend:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd SpurAssignment/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (if needed):
   ```bash
   echo "VITE_API_URL=http://localhost:3001" > .env
   ```

4. Run the frontend:
   ```bash
   npm run dev
   ```

### Running Redis
For development, you can run Redis using Docker:
```bash
docker run -d -p 6379:6379 --name redis-cache redis:alpine
```

## Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key (get it from platform.openai.com)
- `DATABASE_URL`: Database connection string
- `REDIS_URL`: Redis server URL

## Project Structure
- `/backend` - Express.js server with Redis caching
- `/frontend` - SvelteKit chat interface
- Redis caching implemented for chat history endpoints
- Auto-scroll functionality in chat interface

## How Redis Caching Works
- Chat histories are cached for 5 minutes
- Cache is invalidated when new messages are added
- Subsequent requests for the same conversation are served from Redis
- Significantly improves response times for repeated requests

## Deployment
### Backend (to Render)
1. Create a new Web Service on Render
2. Connect to your GitHub repository
3. Set the build command to `npm install && npm run build`
4. Set the start command to `npm start`
5. Add environment variables in Render dashboard

### Frontend (to Vercel/Netlify)
1. For Vercel: Connect to your GitHub repository and deploy
2. For Netlify: Connect to your GitHub repository and deploy
3. Set environment variables in the deployment dashboard