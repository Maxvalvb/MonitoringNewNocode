import { Request, Response } from 'express';
import { WorkflowModel } from '../models/Workflow';
import { CreateWorkflowRequest, UpdateWorkflowRequest, ApiResponse, PaginationQuery } from '../types';
import { logger } from '../utils/logger';

export class WorkflowController {
  static async createWorkflow(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не авторизован'
        } as ApiResponse);
      }

      const { name, description, nodes, edges } = req.body as CreateWorkflowRequest;

      const workflow = await WorkflowModel.create({
        user_id: userId,
        name,
        description,
        nodes,
        edges,
        is_active: true
      });

      logger.info('Workflow created', { workflowId: workflow.id, userId });

      res.status(201).json({
        success: true,
        data: workflow
      } as ApiResponse);

    } catch (error) {
      logger.error('Create workflow failed', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка при создании воркфлоу'
      } as ApiResponse);
    }
  }

  static async getWorkflows(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не авторизован'
        } as ApiResponse);
      }

      const { page = 1, limit = 20 } = req.query as PaginationQuery;
      const offset = (page - 1) * limit;

      const workflows = await WorkflowModel.findByUserId(userId, limit, offset);

      res.json({
        success: true,
        data: workflows
      } as ApiResponse);

    } catch (error) {
      logger.error('Get workflows failed', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка при получении воркфлоу'
      } as ApiResponse);
    }
  }

  static async getWorkflowById(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не авторизован'
        } as ApiResponse);
      }

      // Проверяем доступ пользователя к воркфлоу
      const hasAccess = await WorkflowModel.canUserAccessWorkflow(id, userId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Доступ к воркфлоу запрещен'
        } as ApiResponse);
      }

      const workflow = await WorkflowModel.findById(id);
      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Воркфлоу не найден'
        } as ApiResponse);
      }

      res.json({
        success: true,
        data: workflow
      } as ApiResponse);

    } catch (error) {
      logger.error('Get workflow failed', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка при получении воркфлоу'
      } as ApiResponse);
    }
  }

  static async updateWorkflow(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не авторизован'
        } as ApiResponse);
      }

      // Проверяем доступ пользователя к воркфлоу
      const hasAccess = await WorkflowModel.canUserAccessWorkflow(id, userId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Доступ к воркфлоу запрещен'
        } as ApiResponse);
      }

      const updates = req.body as UpdateWorkflowRequest;
      const success = await WorkflowModel.updateById(id, updates);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Воркфлоу не найден'
        } as ApiResponse);
      }

      logger.info('Workflow updated', { workflowId: id, userId });

      res.json({
        success: true,
        message: 'Воркфлоу обновлен'
      } as ApiResponse);

    } catch (error) {
      logger.error('Update workflow failed', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка при обновлении воркфлоу'
      } as ApiResponse);
    }
  }

  static async deleteWorkflow(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не авторизован'
        } as ApiResponse);
      }

      // Проверяем доступ пользователя к воркфлоу
      const hasAccess = await WorkflowModel.canUserAccessWorkflow(id, userId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Доступ к воркфлоу запрещен'
        } as ApiResponse);
      }

      const success = await WorkflowModel.deleteById(id);
      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Воркфлоу не найден'
        } as ApiResponse);
      }

      logger.info('Workflow deleted', { workflowId: id, userId });

      res.json({
        success: true,
        message: 'Воркфлоу удален'
      } as ApiResponse);

    } catch (error) {
      logger.error('Delete workflow failed', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка при удалении воркфлоу'
      } as ApiResponse);
    }
  }
}