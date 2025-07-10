import { Router } from 'express';
import { WorkflowController } from '../controllers/WorkflowController';
import { authMiddleware } from '../middleware/auth';
import { validateCreateWorkflow, validateUpdateWorkflow } from '../middleware/validation';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// GET /api/workflows - Получить воркфлоу пользователя
router.get('/', WorkflowController.getWorkflows);

// POST /api/workflows - Создать новый воркфлоу
router.post('/', validateCreateWorkflow, WorkflowController.createWorkflow);

// GET /api/workflows/:id - Получить конкретный воркфлоу
router.get('/:id', WorkflowController.getWorkflowById);

// PUT /api/workflows/:id - Обновить воркфлоу
router.put('/:id', validateUpdateWorkflow, WorkflowController.updateWorkflow);

// DELETE /api/workflows/:id - Удалить воркфлоу
router.delete('/:id', WorkflowController.deleteWorkflow);

export default router;