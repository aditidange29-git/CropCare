import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';

// Routers
import authRouter from './modules/auth/auth.router.js';
import usersRouter from './modules/users/users.router.js';
import dealersRouter from './modules/dealers/dealers.router.js';
import diseaseLibraryRouter from './modules/disease-library/disease-library.router.js';
import diagnosesRouter from './modules/diagnoses/diagnoses.router.js';
import recommendationsRouter from './modules/recommendations/recommendations.router.js';
import productsRouter from './modules/products/products.router.js';
import chatsRouter from './modules/chats/chats.router.js';
import adminRouter from './modules/admin/admin.router.js';

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check — keeps Render free tier warm
app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', app: 'CropCare API', version: '0.1.0' }, error: null });
});

// API routes — base path /api/v1
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/dealers', dealersRouter);
app.use('/api/v1/disease-library', diseaseLibraryRouter);
app.use('/api/v1/diagnoses', diagnosesRouter);
app.use('/api/v1/recommendations', recommendationsRouter);
app.use('/api/v1/dealer', productsRouter);
app.use('/api/v1/chats', chatsRouter);
app.use('/api/v1/admin', adminRouter);

// Global error handler — returns standard response envelope
app.use((err: Error & { statusCode?: number; code?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[CropCare API Error]', err.message);
  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_ERROR';
  const message = config.nodeEnv === 'development' ? err.message : 'An unexpected error occurred';
  res.status(statusCode).json({ success: false, data: null, error: { code, message } });
});

app.listen(config.port, () => {
  console.log(`CropCare API running on port ${config.port} [${config.nodeEnv}]`);
  console.log(`Health: http://localhost:${config.port}/health`);
});

export default app;
