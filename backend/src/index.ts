import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import doctorRoutes from './routes/doctor';
import patientRoutes from './routes/patient';
import graphRoutes from './routes/graphs';
import documentRoutes from './routes/documents';

const app = express();

// --- Middleware ---
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3030')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Static file serving for uploads ---
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    name: 'MotherNest API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/graphs', graphRoutes);
app.use('/api/documents', documentRoutes);

// --- Error Handler ---
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// --- Start ---
const PORT = Number(process.env.PORT) || 5030;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏥 MotherNest API running on port ${PORT}`);
  console.log(`📊 Health check: /api/health`);
});

export default app;
