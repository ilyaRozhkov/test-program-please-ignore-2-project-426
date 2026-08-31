import { Router } from 'express';
import { registerUser, loginUser, getUserById, revokeToken, AuthError } from '../services/auth.service';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Email and password required' } });
    }
    const user = await registerUser(email, password);
    res.status(201).json(user);
  } catch (err) {
    if (err instanceof AuthError) {
      const status = err.code === 'CONFLICT' ? 409 : 400;
      return res.status(status).json({ error: { code: err.code, message: err.message } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Registration failed' } });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Email and password required' } });
    }
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    if (err instanceof AuthError && err.code === 'UNAUTHORIZED') {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: err.message } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Login failed' } });
  }
});

router.post('/logout', authenticate, async (req: AuthRequest, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) await revokeToken(token);
    res.json({ message: 'Logged out' });
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Logout failed' } });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await getUserById(req.user!.userId);
    res.json(user);
  } catch (err) {
    if (err instanceof AuthError && err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: err.message } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch user' } });
  }
});

export default router;