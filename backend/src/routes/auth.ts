import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/auth';
import { validateRegister, validateLogin } from '../middleware/validation';

const router = Router();

// POST /api/auth/register - Регистрация
router.post('/register', validateRegister, AuthController.register);

// POST /api/auth/login - Вход
router.post('/login', validateLogin, AuthController.login);

// GET /api/auth/me - Получить информацию о текущем пользователе
router.get('/me', authMiddleware, AuthController.me);

// POST /api/auth/logout - Выход
router.post('/logout', authMiddleware, AuthController.logout);

export default router;