import { initializeDatabase } from '../utils/database';
import { UserModel } from '../models/User';
import { WorkflowModel } from '../models/Workflow';
import { logger } from '../utils/logger';
import { NodeType } from '../types';

async function seedDatabase() {
  try {
    logger.info('Начало инициализации базы данных...');
    
    // Инициализируем базу данных
    await initializeDatabase();
    
    // Создаем тестового администратора
    const adminEmail = 'admin@finflow.com';
    const existingAdmin = await UserModel.findByEmail(adminEmail);
    
    if (!existingAdmin) {
      const admin = await UserModel.create({
        email: adminEmail,
        password: 'admin123456',
        name: 'Администратор',
        role: 'admin'
      });
      logger.info(`✅ Создан администратор: ${admin.email}`);
    } else {
      logger.info('⚠️ Администратор уже существует');
    }
    
    // Создаем тестового пользователя
    const userEmail = 'user@finflow.com';
    const existingUser = await UserModel.findByEmail(userEmail);
    
    let testUser;
    if (!existingUser) {
      testUser = await UserModel.create({
        email: userEmail,
        password: 'user123456',
        name: 'Тестовый пользователь',
        role: 'user'
      });
      logger.info(`✅ Создан тестовый пользователь: ${testUser.email}`);
    } else {
      testUser = existingUser;
      logger.info('⚠️ Тестовый пользователь уже существует');
    }
    
    // Создаем пример воркфлоу
    const sampleWorkflow = {
      user_id: testUser.id,
      name: 'Проверка финансовых документов',
      description: 'Базовый воркфлоу для проверки документов с извлечением суммы и валидацией',
      is_active: true,
      nodes: [
        {
          id: 'node-1',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: {
            type: NodeType.START,
            title: 'Начало процесса',
            description: 'Точка запуска для анализа.',
            settings: {},
          },
        },
        {
          id: 'node-2',
          type: 'custom',
          position: { x: 0, y: 150 },
          data: {
            type: NodeType.UPLOAD,
            title: 'Загрузка документа',
            description: 'Получает данные документа.',
            settings: {},
          },
        },
        {
          id: 'node-3',
          type: 'custom',
          position: { x: 0, y: 300 },
          data: {
            type: NodeType.EXTRACT_DATA,
            title: 'Извлечь итоговую сумму',
            description: 'Находит сумму и сохраняет в переменную.',
            settings: {
              variableName: 'total_amount',
              regex: 'Итого:?\\s*([\\d.,]+)',
            },
          },
        },
        {
          id: 'node-4',
          type: 'custom',
          position: { x: 0, y: 450 },
          data: {
            type: NodeType.COMPARE_VALUES,
            title: 'Проверка: Сумма > 800?',
            description: 'Сравнивает извлеченную сумму с порогом.',
            settings: {
              value1: '{{total_amount}}',
              operator: 'gt',
              value2: '800',
            },
          },
        },
        {
          id: 'node-5',
          type: 'custom',
          position: { x: 0, y: 600 },
          data: {
            type: NodeType.CONDITION,
            title: 'Результат сравнения?',
            description: 'Ветвление в зависимости от результата.',
            settings: {},
          },
        },
        {
          id: 'node-6',
          type: 'custom',
          position: { x: -150, y: 750 },
          data: {
            type: NodeType.OUTPUT_SUCCESS,
            title: "Пометить как 'Одобрено'",
            description: 'Документ прошел все проверки.',
            settings: {},
          },
        },
        {
          id: 'node-7',
          type: 'custom',
          position: { x: 150, y: 750 },
          data: {
            type: NodeType.OUTPUT_ERROR,
            title: "Отметить для проверки",
            description: 'Документ не прошел проверку.',
            settings: {},
          },
        },
      ],
      edges: [
        { id: 'e1-2', source: 'node-1', target: 'node-2', animated: false },
        { id: 'e2-3', source: 'node-2', target: 'node-3', animated: false },
        { id: 'e3-4', source: 'node-3', target: 'node-4', animated: false },
        { id: 'e4-5', source: 'node-4', target: 'node-5', animated: false },
        { id: 'e5-6', source: 'node-5', target: 'node-6', sourceHandle: 'yes', animated: false, style: { stroke: '#22c55e' } },
        { id: 'e5-7', source: 'node-5', target: 'node-7', sourceHandle: 'no', animated: false, style: { stroke: '#ef4444' } },
      ]
    };
    
    // Проверяем, существует ли уже такой воркфлоу
    const existingWorkflows = await WorkflowModel.findByUserId(testUser.id);
    const hasExampleWorkflow = existingWorkflows.some(w => w.name === sampleWorkflow.name);
    
    if (!hasExampleWorkflow) {
      const workflow = await WorkflowModel.create(sampleWorkflow);
      logger.info(`✅ Создан пример воркфлоу: ${workflow.name}`);
    } else {
      logger.info('⚠️ Пример воркфлоу уже существует');
    }
    
    logger.info('🎉 Инициализация базы данных завершена успешно!');
    logger.info('📝 Учетные данные для тестирования:');
    logger.info(`   Администратор: ${adminEmail} / admin123456`);
    logger.info(`   Пользователь: ${userEmail} / user123456`);
    
    process.exit(0);
    
  } catch (error) {
    logger.error('❌ Ошибка инициализации базы данных:', error);
    process.exit(1);
  }
}

// Запускаем только если файл вызван напрямую
if (require.main === module) {
  seedDatabase();
}