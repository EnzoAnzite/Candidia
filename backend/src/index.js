import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import applicationRoutes from './routes/applications.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);           // ← nouveau
app.use('/api/applications', applicationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Candidia', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`Candidia backend démarré sur http://localhost:${PORT}`);
});