import { Router } from 'express';
import { ExecutionController } from '../controllers/ExecutionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// POST /api/executions/:workflowId - Выполнить воркфлоу с файлом или текстом
router.post('/:workflowId', 
  ExecutionController.uploadMiddleware, 
  ExecutionController.executeWorkflow
);

// POST /api/executions/:workflowId/text - Выполнить воркфлоу только с текстом
router.post('/:workflowId/text', ExecutionController.executeWorkflowWithText);

export default router;