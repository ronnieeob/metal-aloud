import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { router } from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP to allow external resources
}));

app.use(cors({
  origin: ['https://srv685290.hstgr.cloud', 'http://localhost:3000'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// API routes
app.use('/api', router);

// Serve static files from dist directory
app.use(express.static(join(__dirname, '../../')));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, '../../index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Signal to PM2 that the app is ready
  if (process.send) {
    process.send('ready');
  }
});

// Handle graceful shutdown
const shutdown = () => {
  console.log('Received shutdown signal. Closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  
  // Force close after 10s
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);