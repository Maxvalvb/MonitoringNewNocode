import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { CONFIG, isDevelopment } from './utils/config';
import { initializeDatabase } from './utils/database';
import { logger } from './utils/logger';

// Импорт маршрутов
import authRoutes from './routes/auth';
import workflowRoutes from './routes/workflows';
import executionRoutes from './routes/executions';
import dashboardRoutes from './routes/dashboard';

const app = express();

// Middleware безопасности
app.use(helmet());

// Сжатие ответов
app.use(compression());

// CORS
app.use(cors({
  origin: CONFIG.CORS_ORIGIN,
  credentials: true
}));

// Логирование запросов
if (isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Парсинг JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Создание папки для загрузок
import fs from 'fs';
import path from 'path';

if (!fs.existsSync(CONFIG.UPLOAD_PATH)) {
  fs.mkdirSync(CONFIG.UPLOAD_PATH, { recursive: true });
}

// Статические файлы для загруженных файлов (опционально)
app.use('/uploads', express.static(CONFIG.UPLOAD_PATH));

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Корневой маршрут
app.get('/', (req, res) => {
  res.json({
    message: 'FinFlow Backend API',
    version: '1.0.0',
    status: 'running',
    environment: CONFIG.NODE_ENV
  });
});

// Маршрут для проверки здоровья
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Обработка 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Маршрут не найден'
  });
});

// Глобальный обработчик ошибок
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });

  // Не показываем стек ошибок в production
  const errorResponse = {
    success: false,
    error: isDevelopment ? error.message : 'Внутренняя ошибка сервера'
  };

  if (isDevelopment && error.stack) {
    (errorResponse as any).stack = error.stack;
  }

  res.status(error.status || 500).json(errorResponse);
});

// Инициализация и запуск сервера
async function startServer() {
  try {
    // Инициализация базы данных
    await initializeDatabase();
    
    // Запуск сервера
    const server = app.listen(CONFIG.PORT, () => {
      logger.info(`🚀 Сервер запущен на порту ${CONFIG.PORT}`);
      logger.info(`📊 Окружение: ${CONFIG.NODE_ENV}`);
      logger.info(`🔗 API доступен по адресу: http://localhost:${CONFIG.PORT}/api`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('Получен сигнал SIGTERM, завершение работы...');
      server.close(() => {
        logger.info('Сервер остановлен');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('Получен сигнал SIGINT, завершение работы...');
      server.close(() => {
        logger.info('Сервер остановлен');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

startServer();