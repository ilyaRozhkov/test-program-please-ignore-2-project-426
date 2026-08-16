import express from 'express';
import path from 'path';
import { rollbar } from './lib/rollbar';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import catalogRouter from './routes/catalog';
import ordersRouter from './routes/orders';
import promoRouter from './routes/promo';

const app = express();
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/promo', promoRouter);

const staticPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(staticPath));

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.use(rollbar.errorHandler());

app.use((err: any, req: any, res: any, next: any) => {
  const status = err.status || 500;
  res.status(status).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
});

export default app;