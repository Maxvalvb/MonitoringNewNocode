import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import { WorkflowModel } from '../models/Workflow';
import { WorkflowEngine } from '../services/WorkflowEngine';
import { CONFIG } from '../utils/config';
import { ApiResponse } from '../types';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, CONFIG.UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: CONFIG.UPLOAD_MAX_SIZE
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt', '.pdf'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Поддерживаются только .txt и .pdf файлы'));
    }
  }
});

export class ExecutionController {
  static uploadMiddleware = upload.single('file');

  static async executeWorkflow(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { workflowId } = req.params;
      const { documentText } = req.body;
      const file = req.file;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не авторизован'
        } as ApiResponse);
      }

      // Проверяем доступ к воркфлоу
      const hasAccess = await WorkflowModel.canUserAccessWorkflow(workflowId, userId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Доступ к воркфлоу запрещен'
        } as ApiResponse);
      }

      // Получаем воркфлоу
      const workflow = await WorkflowModel.findById(workflowId);
      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Воркфлоу не найден'
        } as ApiResponse);
      }

      if (!workflow.is_active) {
        return res.status(400).json({
          success: false,
          error: 'Воркфлоу неактивен'
        } as ApiResponse);
      }

      let inputText = documentText;

      // Если загружен файл, извлекаем из него текст
      if (file) {
        try {
          inputText = await ExecutionController.extractTextFromFile(file);
        } catch (error) {
          logger.error('File processing failed', { fileName: file.originalname, error });
          
          // Удаляем файл при ошибке
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            logger.error('Failed to delete file after processing error', unlinkError);
          }

          return res.status(400).json({
            success: false,
            error: 'Ошибка обработки файла'
          } as ApiResponse);
        }
      }

      if (!inputText) {
        return res.status(400).json({
          success: false,
          error: 'Не предоставлен текст документа или файл'
        } as ApiResponse);
      }

      // Выполняем воркфлоу
      const startTime = Date.now();
      const engine = new WorkflowEngine(workflow.nodes, workflow.edges);
      const result = await engine.execute(inputText);
      const executionTime = Date.now() - startTime;

      logger.info('Workflow executed', {
        workflowId,
        userId,
        status: result.status,
        executionTime
      });

      // Удаляем временный файл
      if (file) {
        try {
          await fs.unlink(file.path);
        } catch (error) {
          logger.error('Failed to delete temp file', error);
        }
      }

      res.json({
        success: true,
        data: {
          result,
          executionTime
        }
      } as ApiResponse);

    } catch (error) {
      logger.error('Workflow execution failed', error);
      
      // Удаляем файл при ошибке
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          logger.error('Failed to delete file after execution error', unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        error: 'Ошибка выполнения воркфлоу'
      } as ApiResponse);
    }
  }

  static async executeWorkflowWithText(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { workflowId } = req.params;
      const { documentText } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не авторизован'
        } as ApiResponse);
      }

      if (!documentText) {
        return res.status(400).json({
          success: false,
          error: 'Текст документа обязателен'
        } as ApiResponse);
      }

      // Проверяем доступ к воркфлоу
      const hasAccess = await WorkflowModel.canUserAccessWorkflow(workflowId, userId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Доступ к воркфлоу запрещен'
        } as ApiResponse);
      }

      // Получаем воркфлоу
      const workflow = await WorkflowModel.findById(workflowId);
      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Воркфлоу не найден'
        } as ApiResponse);
      }

      if (!workflow.is_active) {
        return res.status(400).json({
          success: false,
          error: 'Воркфлоу неактивен'
        } as ApiResponse);
      }

      // Выполняем воркфлоу
      const startTime = Date.now();
      const engine = new WorkflowEngine(workflow.nodes, workflow.edges);
      const result = await engine.execute(documentText);
      const executionTime = Date.now() - startTime;

      logger.info('Workflow executed with text', {
        workflowId,
        userId,
        status: result.status,
        executionTime
      });

      res.json({
        success: true,
        data: {
          result,
          executionTime
        }
      } as ApiResponse);

    } catch (error) {
      logger.error('Workflow execution with text failed', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка выполнения воркфлоу'
      } as ApiResponse);
    }
  }

  private static async extractTextFromFile(file: Express.Multer.File): Promise<string> {
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    switch (fileExt) {
      case '.txt':
        return await fs.readFile(file.path, 'utf-8');
        
      case '.pdf':
        const pdfBuffer = await fs.readFile(file.path);
        const pdfData = await pdfParse(pdfBuffer);
        return pdfData.text;
        
      default:
        throw new Error(`Неподдерживаемый тип файла: ${fileExt}`);
    }
  }
}