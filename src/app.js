import express from 'express';
import ingatlanRoutes from './routes/ingatlan.js';
import errorHandler from './middleware/errorHandler.js';
import ingatlanRoutes from './routes/ingatlan.js';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/ingatlan', ingatlanRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Ingatlan API - Express Backend' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler middleware
app.use(errorHandler);

export default app;
