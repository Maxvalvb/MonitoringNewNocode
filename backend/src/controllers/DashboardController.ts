import { Request, Response } from 'express';
import { WorkflowModel } from '../models/Workflow';
import { ApiResponse, Report } from '../types';
import { logger } from '../utils/logger';

export class DashboardController {
  static async getStats(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не авторизован'
        } as ApiResponse);
      }

      // Получаем статистику воркфлоу
      const workflowStats = await WorkflowModel.getWorkflowStats(userId);

      // Заглушка для статистики выполнений (можно расширить)
      const mockStats = {
        totalChecks: "1,284",
        successfulChecks: "1,192", 
        failedChecks: "92",
        workflows: workflowStats
      };

      res.json({
        success: true,
        data: mockStats
      } as ApiResponse);

    } catch (error) {
      logger.error('Get dashboard stats failed', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения статистики'
      } as ApiResponse);
    }
  }

  static async getReports(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не авторизован'
        } as ApiResponse);
      }

      const { page = 1, limit = 20 } = req.query;
      
      // Заглушка для отчетов (можно расширить с реальной таблицей executions)
      const mockReports: Report[] = [
        { id: "CHK-07-3281", date: "2024-07-29 14:55", status: "success", result: "Все проверки пройдены" },
        { id: "CHK-07-3280", date: "2024-07-29 14:52", status: "error", result: "Правило \"Проверка: Сумма > 800?\" не выполнено." },
        { id: "CHK-07-3279", date: "2024-07-29 14:48", status: "success", result: "Все проверки пройдены" },
        { id: "CHK-07-3278", date: "2024-07-29 14:41", status: "success", result: "Все проверки пройдены" },
        { id: "CHK-07-3277", date: "2024-07-29 14:39", status: "error", result: "Правило \"Проверка: Сумма > 800?\" не выполнено." },
        { id: "CHK-07-3276", date: "2024-07-29 14:35", status: "success", result: "Все проверки пройдены" },
      ];

      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedReports = mockReports.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedReports,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: mockReports.length,
          totalPages: Math.ceil(mockReports.length / Number(limit))
        }
      } as ApiResponse);

    } catch (error) {
      logger.error('Get reports failed', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения отчетов'
      } as ApiResponse);
    }
  }
}