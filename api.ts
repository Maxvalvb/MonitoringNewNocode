// services/api.ts
// Этот файл эмулирует API бэкенда.
// Замените содержимое этих функций на реальные вызовы fetch к вашему API.

import {
  type AppNode,
  type AppEdge,
  type WorkflowResult,
  type Page,
  NodeType,
  type Report
} from '../types.ts';
import { SAMPLE_WORKFLOW } from '../config/sample-workflow.ts';

const FAKE_API_LATENCY = 500; // мс

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Эмуляция базы данных на стороне клиента ---
let storedWorkflow = { ...SAMPLE_WORKFLOW };
let lastSavedState: string | null = JSON.stringify(storedWorkflow);

/**
 * Получает текущую схему процесса.
 */
export async function getWorkflow(id: string): Promise<{ nodes: AppNode[], edges: AppEdge[] }> {
  console.log(`[API] Загрузка схемы: ${id}`);
  await sleep(FAKE_API_LATENCY);
  // В реальном приложении здесь будет GET /api/workflows/{id}
  return Promise.resolve(storedWorkflow);
}

/**
 * Сохраняет схему процесса.
 */
export async function saveWorkflow(id: string, workflow: { nodes: AppNode[], edges: AppEdge[] }): Promise<{ status: 'success', savedAt: string }> {
  const currentState = JSON.stringify(workflow);
  if (currentState === lastSavedState) {
    // console.log('[API] Нет изменений для сохранения.');
    return Promise.resolve({ status: 'success', savedAt: new Date().toISOString() });
  }
  
  console.log(`[API] Сохранение схемы: ${id}`, workflow);
  await sleep(FAKE_API_LATENCY);
  // В реальном приложении здесь будет PUT /api/workflows/{id}
  storedWorkflow = { ...workflow };
  lastSavedState = currentState;
  return { status: 'success', savedAt: new Date().toISOString() };
}

/**
 * Выполняет схему на "бэкенде".
 */
export async function executeWorkflow(id: string, documentText: string): Promise<WorkflowResult> {
  console.log(`[API] Выполнение схемы ${id} с документом.`);
  await sleep(FAKE_API_LATENCY * 2);

  // --- НАЧАЛО ЭМУЛЯЦИИ БЭКЕНДА ---
  // Эта логика полностью имитирует то, что должен делать ваш сервер.
  const { nodes, edges } = storedWorkflow;
  let variables: Record<string, any> = {};
  let lastComparisonResult = true;
  let errorMessage = '';
  let executedNodes: string[] = [];
  let executedEdges: string[] = [];
  let currentNode = nodes.find(n => n.data.type === NodeType.START);

  const resolveValue = (val: string) => {
    const varMatch = String(val).match(/^{{(.+)}}/);
    if (varMatch && varMatch[1] && variables[varMatch[1].trim()] !== undefined) {
      return variables[varMatch[1].trim()];
    }
    return val;
  };
  
  if (!currentNode) {
    return { status: 'error', message: 'Ошибка: не найден начальный узел.', variables: {}, executedPath: { nodes: [], edges: [] } };
  }

  while(currentNode) {
    executedNodes.push(currentNode.id);
    switch(currentNode.data.type) {
      case NodeType.EXTRACT_DATA: {
        const settings = currentNode.data.settings as any;
        try {
            const regex = new RegExp(settings.regex, 's');
            const match = regex.exec(documentText);
            variables[settings.variableName] = (match && match[1]) ? match[1].trim() : "НЕ НАЙДЕНО";
        } catch (e) {
            lastComparisonResult = false;
            errorMessage = `Некорректное регулярное выражение в узле "${currentNode.data.title}"`;
        }
        break;
      }
      case NodeType.COMPARE_VALUES: {
        const settings = currentNode.data.settings as any;
        const val1 = resolveValue(settings.value1);
        const val2 = resolveValue(settings.value2);
        const num1 = parseFloat(val1);
        const num2 = parseFloat(val2);

        switch(settings.operator) {
            case 'eq': lastComparisonResult = val1 == val2; break;
            case 'neq': lastComparisonResult = val1 != val2; break;
            case 'gt': lastComparisonResult = !isNaN(num1) && !isNaN(num2) && num1 > num2; break;
            case 'lt': lastComparisonResult = !isNaN(num1) && !isNaN(num2) && num1 < num2; break;
            case 'gte': lastComparisonResult = !isNaN(num1) && !isNaN(num2) && num1 >= num2; break;
            case 'lte': lastComparisonResult = !isNaN(num1) && !isNaN(num2) && num1 <= num2; break;
            case 'contains': lastComparisonResult = String(val1).includes(String(val2)); break;
            default: lastComparisonResult = false;
        }
        if(!lastComparisonResult) {
            errorMessage = `Правило "${currentNode.data.title}" не выполнено.`;
        }
        break;
      }
      // Добавьте логику для других узлов здесь...
    }
    
    if (errorMessage) break;

    const outgoingEdges = edges.filter(e => e.source === currentNode?.id);
    if (outgoingEdges.length === 0) break;

    let nextEdge;
    if (currentNode.data.type === NodeType.CONDITION) {
      nextEdge = outgoingEdges.find(e => e.sourceHandle === (lastComparisonResult ? 'yes' : 'no'));
    } else {
      nextEdge = outgoingEdges[0];
    }
    
    if (!nextEdge) break;

    executedEdges.push(nextEdge.id);
    currentNode = nodes.find(n => n.id === nextEdge?.target);
  }

  const finalStatus = errorMessage ? 'error' : 'success';
  const finalMessage = errorMessage || 'Все проверки пройдены успешно.';
  // --- КОНЕЦ ЭМУЛЯЦИИ БЭКЕНДА ---

  return {
    status: finalStatus,
    message: finalMessage,
    variables,
    executedPath: { nodes: executedNodes, edges: executedEdges }
  };
}

/**
 * Получает статистику для дашборда.
 */
export async function getDashboardStats() {
    console.log("[API] Загрузка статистики для дашборда");
    await sleep(FAKE_API_LATENCY);
    return {
        totalChecks: "1,284",
        successfulChecks: "1,192",
        failedChecks: "92",
    };
}

/**
 * Получает список отчетов.
 */
export async function getReports(page: number = 1): Promise<Report[]> {
    console.log(`[API] Загрузка отчетов, страница ${page}`);
    await sleep(FAKE_API_LATENCY);
    // Это просто образец данных. Бэкенд должен реализовать реальную пагинацию.
    return [
        { id: "CHK-07-3281", date: "2024-07-29 14:55", status: "success", result: "Все проверки пройдены" },
        { id: "CHK-07-3280", date: "2024-07-29 14:52", status: "error", result: "Правило \"Проверка: Сумма > 800?\" не выполнено." },
        { id: "CHK-07-3279", date: "2024-07-29 14:48", status: "success", result: "Все проверки пройдены" },
        { id: "CHK-07-3278", date: "2024-07-29 14:41", status: "success", result: "Все проверки пройдены" },
        { id: "CHK-07-3277", date: "2024-07-29 14:39", status: "error", result: "Правило \"Проверка: Сумма > 800?\" не выполнено." },
        { id: "CHK-07-3276", date: "2024-07-29 14:35", status: "success", result: "Все проверки пройдены" },
    ];
}