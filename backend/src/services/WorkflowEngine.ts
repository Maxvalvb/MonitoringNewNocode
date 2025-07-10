import { 
  AppNode, 
  AppEdge, 
  WorkflowResult, 
  WorkflowVariables, 
  NodeType,
  ExtractDataSettings,
  CompareValuesSettings,
  MathOperationSettings,
  FormatNumberSettings,
  FormatDateSettings,
  TextReplaceSettings,
  TextJoinSettings,
  SetVariableSettings,
  ValidatePatternSettings,
  LogMessageSettings,
  ComparisonOperator
} from '../types';
import { logger } from '../utils/logger';

export class WorkflowEngine {
  private nodes: AppNode[];
  private edges: AppEdge[];
  private variables: WorkflowVariables = {};
  private executedNodes: string[] = [];
  private executedEdges: string[] = [];
  private logs: string[] = [];

  constructor(nodes: AppNode[], edges: AppEdge[]) {
    this.nodes = nodes;
    this.edges = edges;
  }

  async execute(documentText: string): Promise<WorkflowResult> {
    const startTime = Date.now();
    
    try {
      this.reset();
      
      // Найти стартовый узел
      const startNode = this.nodes.find(node => node.data.type === NodeType.START);
      if (!startNode) {
        throw new Error('Стартовый узел не найден');
      }

      let currentNode: AppNode | undefined = startNode;
      let lastComparisonResult = true;
      let errorMessage = '';

      while (currentNode && !errorMessage) {
        this.executedNodes.push(currentNode.id);
        this.log(`Выполнение узла: ${currentNode.data.title}`);

        try {
          const result = await this.executeNode(currentNode, documentText);
          
          if (result !== undefined) {
            lastComparisonResult = result;
          }
        } catch (error) {
          errorMessage = `Ошибка в узле "${currentNode.data.title}": ${error.message}`;
          break;
        }

        // Найти следующий узел
        const nextNode = this.getNextNode(currentNode, lastComparisonResult);
        if (nextNode.edge) {
          this.executedEdges.push(nextNode.edge.id);
        }
        currentNode = nextNode.node;
      }

      const executionTime = Date.now() - startTime;
      
      const result: WorkflowResult = {
        status: errorMessage ? 'error' : 'success',
        message: errorMessage || 'Workflow выполнен успешно',
        variables: this.variables,
        executedPath: {
          nodes: this.executedNodes,
          edges: this.executedEdges
        }
      };

      this.log(`Workflow завершен. Время выполнения: ${executionTime}мс`);
      logger.info('Workflow executed', { 
        status: result.status, 
        executionTime,
        nodesExecuted: this.executedNodes.length 
      });

      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Workflow execution failed', { error: error.message, executionTime });
      
      return {
        status: 'error',
        message: `Критическая ошибка выполнения: ${error.message}`,
        variables: this.variables,
        executedPath: {
          nodes: this.executedNodes,
          edges: this.executedEdges
        }
      };
    }
  }

  private reset(): void {
    this.variables = {};
    this.executedNodes = [];
    this.executedEdges = [];
    this.logs = [];
  }

  private log(message: string): void {
    this.logs.push(`[${new Date().toISOString()}] ${message}`);
  }

  private async executeNode(node: AppNode, documentText: string): Promise<boolean | undefined> {
    const { type, settings } = node.data;

    switch (type) {
      case NodeType.START:
      case NodeType.UPLOAD:
        // Служебные узлы - ничего не делают
        return undefined;

      case NodeType.EXTRACT_DATA:
        return this.executeExtractData(settings as ExtractDataSettings, documentText);

      case NodeType.COMPARE_VALUES:
        return this.executeCompareValues(settings as CompareValuesSettings);

      case NodeType.MATH_OPERATION:
        return this.executeMathOperation(settings as MathOperationSettings);

      case NodeType.FORMAT_NUMBER:
        return this.executeFormatNumber(settings as FormatNumberSettings);

      case NodeType.FORMAT_DATE:
        return this.executeFormatDate(settings as FormatDateSettings);

      case NodeType.TEXT_REPLACE:
        return this.executeTextReplace(settings as TextReplaceSettings);

      case NodeType.TEXT_JOIN:
        return this.executeTextJoin(settings as TextJoinSettings);

      case NodeType.SET_VARIABLE:
        return this.executeSetVariable(settings as SetVariableSettings);

      case NodeType.VALIDATE_PATTERN:
        return this.executeValidatePattern(settings as ValidatePatternSettings);

      case NodeType.LOG_MESSAGE:
        return this.executeLogMessage(settings as LogMessageSettings);

      case NodeType.CONDITION:
      case NodeType.OUTPUT_SUCCESS:
      case NodeType.OUTPUT_ERROR:
        // Управляющие узлы - возвращают последний результат сравнения
        return undefined;

      default:
        throw new Error(`Неподдерживаемый тип узла: ${type}`);
    }
  }

  private executeExtractData(settings: ExtractDataSettings, documentText: string): boolean {
    try {
      const regex = new RegExp(settings.regex, 's');
      const match = regex.exec(documentText);
      
      if (match && match[1]) {
        this.variables[settings.variableName] = match[1].trim();
        this.log(`Извлечено: ${settings.variableName} = "${match[1].trim()}"`);
        return true;
      } else {
        this.variables[settings.variableName] = "НЕ НАЙДЕНО";
        this.log(`Не удалось извлечь: ${settings.variableName}`);
        return false;
      }
    } catch (error) {
      throw new Error(`Некорректное регулярное выражение: ${settings.regex}`);
    }
  }

  private executeCompareValues(settings: CompareValuesSettings): boolean {
    const val1 = this.resolveValue(settings.value1);
    const val2 = this.resolveValue(settings.value2);
    
    const result = this.compare(val1, val2, settings.operator);
    this.log(`Сравнение: ${val1} ${settings.operator} ${val2} = ${result}`);
    
    return result;
  }

  private executeMathOperation(settings: MathOperationSettings): boolean {
    const val1 = parseFloat(this.resolveValue(settings.variable1));
    const val2 = parseFloat(this.resolveValue(settings.variable2));
    
    if (isNaN(val1) || isNaN(val2)) {
      throw new Error('Математическая операция требует числовые значения');
    }

    let result: number;
    switch (settings.operation) {
      case 'add':
        result = val1 + val2;
        break;
      case 'subtract':
        result = val1 - val2;
        break;
      case 'multiply':
        result = val1 * val2;
        break;
      case 'divide':
        if (val2 === 0) throw new Error('Деление на ноль');
        result = val1 / val2;
        break;
      default:
        throw new Error(`Неподдерживаемая операция: ${settings.operation}`);
    }

    this.variables[settings.outputVariable] = result;
    this.log(`Математическая операция: ${val1} ${settings.operation} ${val2} = ${result}`);
    
    return true;
  }

  private executeFormatNumber(settings: FormatNumberSettings): boolean {
    const value = parseFloat(this.resolveValue(settings.inputVariable));
    
    if (isNaN(value)) {
      throw new Error('Форматирование числа требует числовое значение');
    }

    const formatted = value.toFixed(settings.decimalPlaces);
    this.variables[settings.outputVariable] = formatted;
    this.log(`Форматирование числа: ${value} -> ${formatted}`);
    
    return true;
  }

  private executeFormatDate(settings: FormatDateSettings): boolean {
    // Простая реализация форматирования даты
    const value = this.resolveValue(settings.inputVariable);
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      throw new Error('Некорректная дата');
    }

    // Базовое форматирование - можно расширить
    let formatted: string;
    switch (settings.outputFormat) {
      case 'dd.mm.yyyy':
        formatted = date.toLocaleDateString('ru-RU');
        break;
      case 'yyyy-mm-dd':
        formatted = date.toISOString().split('T')[0];
        break;
      default:
        formatted = date.toISOString();
    }

    this.variables[settings.outputVariable] = formatted;
    this.log(`Форматирование даты: ${value} -> ${formatted}`);
    
    return true;
  }

  private executeTextReplace(settings: TextReplaceSettings): boolean {
    const value = this.resolveValue(settings.inputVariable);
    const result = String(value).replace(new RegExp(settings.findText, 'g'), settings.replaceWith);
    
    this.variables[settings.outputVariable] = result;
    this.log(`Замена текста: "${value}" -> "${result}"`);
    
    return true;
  }

  private executeTextJoin(settings: TextJoinSettings): boolean {
    const values = settings.inputs.map(input => this.resolveValue(input));
    const result = values.join(settings.separator);
    
    this.variables[settings.outputVariable] = result;
    this.log(`Объединение текста: [${values.join(', ')}] -> "${result}"`);
    
    return true;
  }

  private executeSetVariable(settings: SetVariableSettings): boolean {
    const value = this.resolveValue(settings.value);
    this.variables[settings.variableName] = value;
    this.log(`Установка переменной: ${settings.variableName} = "${value}"`);
    
    return true;
  }

  private executeValidatePattern(settings: ValidatePatternSettings): boolean {
    const value = this.resolveValue(settings.inputVariable);
    let pattern: RegExp;

    switch (settings.pattern) {
      case 'email':
        pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        break;
      case 'url':
        pattern = /^https?:\/\/.+/;
        break;
      case 'custom':
        pattern = new RegExp(settings.customRegex);
        break;
      default:
        throw new Error(`Неподдерживаемый шаблон: ${settings.pattern}`);
    }

    const result = pattern.test(String(value));
    this.log(`Валидация по шаблону: "${value}" соответствует ${settings.pattern} = ${result}`);
    
    return result;
  }

  private executeLogMessage(settings: LogMessageSettings): boolean {
    const message = this.resolveValue(settings.message);
    this.log(`Лог: ${message}`);
    logger.info('Workflow log', { message });
    
    return true;
  }

  private resolveValue(value: string): any {
    const varMatch = String(value).match(/^{{(.+)}}$/);
    if (varMatch && varMatch[1] && this.variables[varMatch[1].trim()] !== undefined) {
      return this.variables[varMatch[1].trim()];
    }
    return value;
  }

  private compare(val1: any, val2: any, operator: ComparisonOperator): boolean {
    const num1 = parseFloat(val1);
    const num2 = parseFloat(val2);

    switch (operator) {
      case 'eq':
        return val1 == val2;
      case 'neq':
        return val1 != val2;
      case 'gt':
        return !isNaN(num1) && !isNaN(num2) && num1 > num2;
      case 'lt':
        return !isNaN(num1) && !isNaN(num2) && num1 < num2;
      case 'gte':
        return !isNaN(num1) && !isNaN(num2) && num1 >= num2;
      case 'lte':
        return !isNaN(num1) && !isNaN(num2) && num1 <= num2;
      case 'contains':
        return String(val1).includes(String(val2));
      default:
        return false;
    }
  }

  private getNextNode(currentNode: AppNode, lastComparisonResult: boolean): { node?: AppNode; edge?: AppEdge } {
    const outgoingEdges = this.edges.filter(edge => edge.source === currentNode.id);
    
    if (outgoingEdges.length === 0) {
      return { node: undefined, edge: undefined };
    }

    let nextEdge: AppEdge | undefined;

    if (currentNode.data.type === NodeType.CONDITION) {
      nextEdge = outgoingEdges.find(edge => 
        edge.sourceHandle === (lastComparisonResult ? 'yes' : 'no')
      );
    } else {
      nextEdge = outgoingEdges[0];
    }

    if (!nextEdge) {
      return { node: undefined, edge: undefined };
    }

    const nextNode = this.nodes.find(node => node.id === nextEdge.target);
    return { node: nextNode, edge: nextEdge };
  }
}