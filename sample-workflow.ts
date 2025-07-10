// config/sample-workflow.ts
import { type AppNode, type AppEdge, NodeType } from '../types.ts';

/**
 * Эта конфигурация используется для эмуляции данных,
 * которые бэкенд возвращал бы при первом запросе.
 */
export const SAMPLE_WORKFLOW: { nodes: AppNode[], edges: AppEdge[] } = {
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
          regex: 'Итого: ([\\d.]+)',
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
