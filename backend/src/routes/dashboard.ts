import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// GET /api/dashboard/stats - Получить статистику для дашборда
router.get('/stats', DashboardController.getStats);

// GET /api/dashboard/reports - Получить отчеты
router.get('/reports', DashboardController.getReports);

export default router;