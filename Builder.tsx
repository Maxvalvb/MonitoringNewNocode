
import React, { useState, useCallback, useMemo, FC, useRef, useEffect } from 'react';
import * as ReactFlowModule from 'reactflow';

import { 
  type AppNode,
  type AppEdge,
  NodeType, 
  type WorkflowResult, 
  type ExtractDataSettings, 
  type CompareValuesSettings,
  type SetVariableSettings,
  type CheckExistsSettings,
  type MathOperationSettings,
  type ListAggregateSettings,
  type LogMessageSettings,
  type ValidatePatternSettings,
  type NodeSettings,
  type WorkflowVariables,
  type ComparisonOperator,
  type NodeDataPayload,
} from '../types.ts';
import Sidebar from '../components/Sidebar.tsx';
import CustomNode from '../components/Node.tsx';
import { WrenchScrewdriverIcon, CheckCircleIcon, XCircleIcon, DocumentArrowUpIcon, SparklesIcon } from '../components/Icons.tsx';
import * as api from '../services/api.ts';

declare const pdfjsLib: any;

type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';


const Header = ({ onRun, isRunning, canRun, syncStatus }: { onRun: () => void; isRunning: boolean; canRun: boolean; syncStatus: SyncStatus }) => {
    
    const statusIndicator = useMemo(() => {
        switch(syncStatus) {
            case 'saving':
                return <span className="text-sm text-slate-500 flex items-center gap-1"><svg className="animate-spin h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Сохранение...</span>;
            case 'saved':
                return <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircleIcon className="w-4 h-4" />Сохранено</span>;
            case 'error':
                 return <span className="text-sm text-red-600 flex items-center gap-1"><XCircleIcon className="w-4 h-4" />Ошибка сохранения</span>;
            default:
                 return <span className="text-sm text-slate-500">Изменения синхронизированы</span>;
        }
    }, [syncStatus]);

    return (
      <header className="w-full bg-white/80 backdrop-blur-lg border-b border-slate-200 p-3 flex justify-between items-center sticky top-0 z-20 flex-shrink-0">
        <div className="flex items-center gap-4">
           <div className="p-2 bg-blue-600 rounded-lg">
            <WrenchScrewdriverIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Конструктор правил</h1>
            <div className="h-5 flex items-center">{statusIndicator}</div>
          </div>
        </div>
        <button
          onClick={onRun}
          disabled={isRunning || !canRun}
          className={`px-4 py-2 rounded-lg font-semibold text-white flex items-center gap-2 transition-all duration-200 ${
            isRunning 
              ? 'bg-blue-400 cursor-not-allowed' 
              : !canRun
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          aria-label={!canRun ? "Сначала загрузите документ" : "Запустить проверку"}
          title={!canRun ? "Сначала загрузите документ" : "Запустить проверку"}
        >
          {isRunning ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Проверка...
            </>
          ) : (
            'Запустить проверку'
          )}
        </button>
      </header>
    )
};

const FileUpload = ({ onFileSelect, isProcessing, processedFileName }: { onFileSelect: (file: File) => void; isProcessing: boolean; processedFileName: string | null; }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className="relative p-4 h-full flex flex-col items-center justify-center">
            <div className={`w-full h-full flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl transition-colors duration-200 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'}`}>
                <input ref={inputRef} type="file" className="hidden" accept=".txt,.pdf" onChange={handleChange} />
                <DocumentArrowUpIcon className="w-10 h-10 text-slate-400 mb-2" />
                <h4 className="text-slate-700 font-semibold text-center">Перетащите файл сюда</h4>
                <p className="text-slate-500 text-sm">или</p>
                <button onClick={() => inputRef.current?.click()} className="mt-2 text-sm font-semibold text-blue-600 hover:underline">
                    Выберите файл
                </button>
                <p className="text-xs text-slate-400 mt-3 text-center">Поддерживаются .txt и .pdf файлы</p>
                {isProcessing && <p className="text-sm text-blue-600 font-semibold mt-2 animate-pulse">Обработка...</p>}
                {processedFileName && !isProcessing && <p className="text-sm text-green-600 font-semibold mt-2 truncate max-w-full" title={processedFileName}>Файл: {processedFileName}</p>}
            </div>
        </div>
    );
};


const NODE_TYPE_TITLES: Record<string, string> = {
    [NodeType.EXTRACT_DATA]: "Извлечение данных",
    [NodeType.COMPARE_VALUES]: "Сравнение значений",
    [NodeType.CONDITION]: "Условие",
    [NodeType.OUTPUT_SUCCESS]: "Успешный вывод",
    [NodeType.OUTPUT_ERROR]: "Вывод с ошибкой",
    [NodeType.MATH_OPERATION]: "Математическая операция",
    [NodeType.FORMAT_NUMBER]: "Форматировать число",
    [NodeType.FORMAT_DATE]: "Форматировать дату",
    [NodeType.TEXT_REPLACE]: "Заменить текст",
    [NodeType.TEXT_JOIN]: "Объединить текст",
    [NodeType.SET_VARIABLE]: "Установить переменную",
    [NodeType.DATA_MAPPING]: "Таблица соответствий",
    [NodeType.SWITCH]: "Переключатель (Switch)",
    [NodeType.CHECK_EXISTS]: "Проверить наличие",
    [NodeType.VALIDATE_PATTERN]: "Проверить по шаблону",
    [NodeType.MERGE]: "Объединить потоки",
    [NodeType.LOG_MESSAGE]: "Записать лог",
    [NodeType.EXTRACT_TABLE]: "Извлечь таблицу",
    [NodeType.EXTRACT_MULTIPLE]: "Извлечь все совпадения",
    [NodeType.LOOP_FOREACH]: "Цикл (For Each)",
    [NodeType.LIST_CONTAINS]: "Список содержит",
    [NodeType.LIST_GET_ITEM]: "Получить элемент списка",
    [NodeType.LIST_AGGREGATE]: "Агрегация списка",
};

const nodeTypes = {
    custom: CustomNode,
};

const useDebouncedSave = (nodes: AppNode[], edges: AppEdge[], isWorkflowLoading: boolean) => {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const isFirstRunAfterLoad = useRef(true);

    useEffect(() => {
        // Не делать ничего во время загрузки
        if (isWorkflowLoading) {
            return;
        }

        // Если это первый запуск после загрузки, не запускать сохранение,
        // а просто установить статус на 'idle' и переключить флаг.
        if (isFirstRunAfterLoad.current) {
            setSyncStatus('idle');
            isFirstRunAfterLoad.current = false;
            return;
        }
        
        // Установить статус 'saving' при любых изменениях
        setSyncStatus('saving');

        const handler = setTimeout(async () => {
            try {
                await api.saveWorkflow('main-workflow', { nodes, edges });
                setSyncStatus('saved');
                // Вернуться в 'idle' после отображения статуса 'saved'
                setTimeout(() => setSyncStatus('idle'), 2000);
            } catch (error) {
                console.error("Failed to save workflow:", error);
                setSyncStatus('error');
            }
        }, 1500); // Задержка в 1.5 секунды

        // Очистить таймаут при повторном вызове эффекта или размонтировании
        return () => clearTimeout(handler);

    }, [nodes, edges, isWorkflowLoading]);

    return syncStatus;
};


const BuilderPage: FC = () => {
  const [nodes, setNodes, onNodesChange] = ReactFlowModule.useNodesState([]);
  const [edges, setEdges, onEdgesChange] = ReactFlowModule.useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [documentText, setDocumentText] = useState<string>('');
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  const [isWorkflowLoading, setIsWorkflowLoading] = useState(true);
  const [processedFileName, setProcessedFileName] = useState<string | null>(null);
  
  const [workflowResult, setWorkflowResult] = useState<WorkflowResult>({ status: 'idle', message: '', variables: {}, executedPath: { nodes: [], edges: [] } });
  const reactFlowInstance = ReactFlowModule.useReactFlow();

  const [ruleHelper, setRuleHelper] = useState({
    prefix: '',
    valueType: 'number',
    suffix: '',
  });

  const syncStatus = useDebouncedSave(nodes, edges, isWorkflowLoading);

  // Load workflow from API on mount
  useEffect(() => {
    const loadWorkflow = async () => {
        try {
            const data = await api.getWorkflow('main-workflow');
            setNodes(data.nodes);
            setEdges(data.edges);
        } catch (error) {
            console.error("Failed to load workflow:", error);
            alert("Не удалось загрузить схему процесса.");
        } finally {
            setIsWorkflowLoading(false);
        }
    };
    loadWorkflow();
  }, [setNodes, setEdges]);

  useEffect(() => {
    if (selectedNodeId) {
        setRuleHelper({ prefix: '', valueType: 'number', suffix: '' });
    }
  }, [selectedNodeId]);

  const onConnect = useCallback((params: ReactFlowModule.Connection | ReactFlowModule.Edge) => setEdges((eds) => ReactFlowModule.addEdge(params, eds)), [setEdges]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: AppNode) => {
    setSelectedNodeId(node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);
  
  const updateSelectedNodeData = (dataUpdate: Partial<Pick<NodeDataPayload, 'title' | 'description'>>) => {
    if (!selectedNodeId) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          return { ...node, data: { ...node.data, ...dataUpdate } };
        }
        return node;
      })
    );
  };

  const updateNodeSettings = (id: string, newSettings: Partial<NodeSettings>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, data: { ...n.data, settings: { ...n.data.settings, ...newSettings } } } : n));
  };
  
  const handleAddNode = (type: NodeType) => {
    const position = reactFlowInstance.project({
      x: window.innerWidth / 3,
      y: window.innerHeight / 3,
    });

    const baseNode = {
        id: `node-${Date.now()}`,
        type: 'custom',
        position,
        data: {
            type,
            title: NODE_TYPE_TITLES[type] || 'Новый узел',
            description: 'Новый добавленный блок',
            settings: {}
        }
    };
    
    // Default settings for new nodes
    switch(type) {
        case NodeType.EXTRACT_DATA:
            baseNode.data.settings = { variableName: 'newVar', regex: '(.+)' }; break;
        case NodeType.COMPARE_VALUES:
            baseNode.data.settings = { value1: '', operator: 'eq', value2: '' }; break;
        case NodeType.SET_VARIABLE:
            baseNode.data.settings = { variableName: 'myVar', value: 'Hello' }; break;
    }

    setNodes(prev => [...prev, baseNode]);
    setSelectedNodeId(baseNode.id);
  };
  
  const handleFileSelect = async (file: File) => {
    if (!file) return;

    setWorkflowResult({ status: 'idle', message: '', variables: {}, executedPath: { nodes: [], edges: [] } });
    setDocumentText("");
    setProcessedFileName(file.name);
    setIsFileProcessing(true);

    try {
        let text = '';
        if (file.type === 'application/pdf') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const textParts = await Promise.all(Array.from({ length: pdf.numPages }, async (_, i) => {
                const page = await pdf.getPage(i + 1);
                const textContent = await page.getTextContent();
                return textContent.items.map((item: any) => item.str).join(' ');
            }));
            text = textParts.join('\n\n');
        } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            text = await file.text();
        } else {
            alert('Неподдерживаемый тип файла. Пожалуйста, выберите .txt или .pdf файл.');
            setProcessedFileName(null);
        }
        setDocumentText(text);
    } catch (error) {
        console.error("Ошибка при чтении файла:", error);
        alert("Не удалось прочитать или обработать файл.");
        setProcessedFileName(null);
    } finally {
        setIsFileProcessing(false);
    }
  };


  const runWorkflow = useCallback(async () => {
    if (!documentText) {
        alert("Нет данных документа для проверки. Пожалуйста, загрузите файл.");
        return;
    }
    setWorkflowResult({ status: 'running', message: 'Отправка на сервер...', variables: {}, executedPath: { nodes: [], edges: [] } });

    // Reset styles
    setNodes(nds => nds.map(n => ({ ...n, style: {} })));
    setEdges(eds => eds.map(e => ({ ...e, animated: false, style: { ...e.style, stroke: '#b1b1b7' } })));

    try {
      const result = await api.executeWorkflow('main-workflow', documentText);
      setWorkflowResult({ ...result, status: 'running', message: 'Обработка результата...' });
      
      // Highlight executed path
      setNodes(nds =>
        nds.map(n => ({
          ...n,
          style: result.executedPath.nodes.includes(n.id) ? { boxShadow: '0 0 20px #3b82f6' } : {}
        }))
      );
      setEdges(eds =>
        eds.map(e => ({
          ...e,
          animated: result.executedPath.edges.includes(e.id),
          style: { stroke: result.executedPath.edges.includes(e.id) ? (result.status === 'success' ? '#22c55e' : '#ef4444') : '#b1b1b7' }
        }))
      );
      setWorkflowResult(result);

    } catch (error) {
      console.error("Workflow execution failed", error);
      setWorkflowResult({ status: 'error', message: 'Ошибка выполнения на сервере.', variables: {}, executedPath: { nodes: [], edges: [] } });
    }
  }, [documentText, setNodes, setEdges]);
  
  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);

  const handleGenerateRegex = () => {
    if (!selectedNodeId) return;
    const escapeRegex = (str: string) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    let valuePattern = '(.+)';
    if (ruleHelper.valueType === 'number') valuePattern = '([\\d.,]+)';
    if (ruleHelper.valueType === 'word') valuePattern = '(\\S+)';
    
    const prefixPart = ruleHelper.prefix ? `${escapeRegex(ruleHelper.prefix)}\\s*` : '';
    const suffixPart = ruleHelper.suffix ? `\\s*${escapeRegex(ruleHelper.suffix)}` : '';
    const finalRegex = `${prefixPart}${valuePattern}${suffixPart}`;
    updateNodeSettings(selectedNodeId, { regex: finalRegex });
  };

  const renderPropertiesPanel = () => {
    if (!selectedNode) {
      return <div className="text-center text-slate-500 p-8"><p>Выберите узел, чтобы увидеть его свойства.</p></div>;
    }
    
    const settings = selectedNode.data.settings as NodeSettings;
    const hasSettings = Object.keys(settings).length > 0;

    return (
      <div className='flex flex-col gap-4'>
        <div>
          <label htmlFor="node-title" className="block text-sm font-medium text-slate-600 mb-1">Заголовок</label>
          <input id="node-title" type="text" value={selectedNode.data.title} onChange={(e) => updateSelectedNodeData({ title: e.target.value })} className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="node-desc" className="block text-sm font-medium text-slate-600 mb-1">Описание</label>
          <textarea id="node-desc" value={selectedNode.data.description} onChange={(e) => updateSelectedNodeData({ description: e.target.value })} rows={3} className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>

        {hasSettings && <hr className="border-slate-200" />}
        
        {selectedNode.data.type === NodeType.EXTRACT_DATA && (
          <>
            <div>
              <label htmlFor="var-name" className="block text-sm font-medium text-slate-600 mb-1">Имя переменной</label>
              <input id="var-name" type="text" value={(settings as ExtractDataSettings).variableName || ''} onChange={(e) => updateNodeSettings(selectedNode.id, { variableName: e.target.value })} placeholder="например, total_amount" className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
            </div>
            <div>
              <label htmlFor="regex" className="block text-sm font-medium text-slate-600 mb-1">Регулярное выражение (RegEx)</label>
              <textarea id="regex" value={(settings as ExtractDataSettings).regex || ''} onChange={(e) => updateNodeSettings(selectedNode.id, { regex: e.target.value })} placeholder="например, Итого: ([\\d.]+)" className="w-full h-24 p-2 border border-slate-300 rounded-md text-sm font-mono bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
              <p className="text-xs text-slate-500 mt-1">Создайте группу с помощью скобок (), чтобы указать, какую часть текста нужно извлечь.</p>
            </div>
            <div className="mt-3 p-4 border border-dashed border-blue-300 bg-blue-50/50 rounded-lg space-y-3">
              <div className="flex items-center gap-2"> <SparklesIcon className="w-5 h-5 text-blue-600" /> <h5 className="font-semibold text-blue-800">Помощник создания правил</h5></div>
              <div>
                  <label htmlFor="rule-prefix" className="block text-xs font-medium text-slate-600 mb-1">Текст ПЕРЕД значением</label>
                  <input id="rule-prefix" type="text" placeholder='напр., "Итого: "' value={ruleHelper.prefix} onChange={(e) => setRuleHelper(prev => ({...prev, prefix: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                  <label htmlFor="rule-value-type" className="block text-xs font-medium text-slate-600 mb-1">Тип значения</label>
                  <select id="rule-value-type" value={ruleHelper.valueType} onChange={(e) => setRuleHelper(prev => ({...prev, valueType: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none" >
                      <option value="number">Число (123.45)</option><option value="word">Одно слово</option><option value="text_line">Текст (до конца строки)</option>
                  </select>
              </div>
              <div>
                  <label htmlFor="rule-suffix" className="block text-xs font-medium text-slate-600 mb-1">Текст ПОСЛЕ значения</label>
                  <input id="rule-suffix" type="text" placeholder='напр., "руб."' value={ruleHelper.suffix} onChange={(e) => setRuleHelper(prev => ({...prev, suffix: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <button onClick={handleGenerateRegex} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <SparklesIcon className="w-4 h-4" /> Сгенерировать и применить
              </button>
            </div>
          </>
        )}
        {selectedNode.data.type === NodeType.COMPARE_VALUES && (
          <>
            <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-2'>
              <input type="text" value={(settings as CompareValuesSettings).value1 || ''} onChange={(e) => updateNodeSettings(selectedNode.id, { value1: e.target.value })} placeholder="{{переменная}}" className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
              <select value={(settings as CompareValuesSettings).operator || 'eq'} onChange={(e) => updateNodeSettings(selectedNode.id, { operator: e.target.value as ComparisonOperator })} className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="eq">==</option><option value="neq">!=</option><option value="gt">&gt;</option><option value="lt">&lt;</option><option value="gte">&gt;=</option><option value="lte">&lt;=</option><option value="contains">содержит</option>
              </select>
               <input type="text" value={(settings as CompareValuesSettings).value2 || ''} onChange={(e) => updateNodeSettings(selectedNode.id, { value2: e.target.value })} placeholder="значение" className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
            </div>
            <p className="text-xs text-slate-400 mt-1">{'Используйте `{{имя}}` для подстановки переменных. Сравнения `>` и `<` работают с числами.'}</p>
          </>
        )}
      </div>
    );
  };
  
  if (isWorkflowLoading) {
      return <div className="h-full w-full flex items-center justify-center bg-slate-50"><p className="text-slate-500 animate-pulse">Загрузка конструктора...</p></div>;
  }

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col font-sans">
      <Header onRun={runWorkflow} isRunning={workflowResult.status === 'running'} canRun={!!documentText && !isFileProcessing} syncStatus={syncStatus} />
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <Sidebar onAddNode={handleAddNode} />
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-1 relative">
            <ReactFlowModule.ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              onPaneClick={handlePaneClick}
              nodeTypes={nodeTypes}
              fitView
            >
              <ReactFlowModule.Controls />
              <ReactFlowModule.Background />
            </ReactFlowModule.ReactFlow>
          </div>

          <div className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col flex-shrink-0">
            <div className='p-4 border-b border-slate-200 flex-shrink-0' style={{height: "240px"}}>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Входные данные</h3>
                 <FileUpload onFileSelect={handleFileSelect} isProcessing={isFileProcessing} processedFileName={processedFileName} />
            </div>
            <div className="p-4 border-b border-slate-200 flex-grow-0">
              <h3 className="text-lg font-bold text-slate-800 mb-3">Результат проверки</h3>
              {workflowResult.status !== 'idle' ? (
                <div className={`p-4 rounded-lg flex gap-4 ${workflowResult.status === 'success' ? 'bg-green-50 border-green-200' : workflowResult.status === 'error' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'} border`}>
                    <div className='flex-shrink-0'>
                        {workflowResult.status === 'success' && <CheckCircleIcon className='w-6 h-6 text-green-500' />}
                        {workflowResult.status === 'error' && <XCircleIcon className='w-6 h-6 text-red-500' />}
                        {workflowResult.status === 'running' && <WrenchScrewdriverIcon className='w-6 h-6 text-blue-500 animate-pulse' />}
                    </div>
                    <div><p className={`font-semibold ${workflowResult.status === 'success' ? 'text-green-800' : workflowResult.status === 'error' ? 'text-red-800' : 'text-blue-800'}`}>{workflowResult.message}</p></div>
                </div>
              ) : ( <div className="text-center text-slate-400 p-4 bg-slate-50 rounded-lg"><p>Нажмите "Запустить проверку", чтобы начать.</p></div> )}
               {Object.keys(workflowResult.variables).length > 0 && (
                  <div className='mt-3'>
                      <h4 className='text-sm font-semibold text-slate-600 mb-1'>Извлеченные переменные:</h4>
                      <div className='p-2 bg-slate-50 rounded-md text-xs font-mono text-slate-700 space-y-1 max-h-40 overflow-y-auto'>
                        {Object.entries(workflowResult.variables).map(([key, value]) => (<p key={key}><span className='font-bold'>{key}</span>: <span className='text-blue-600'>"{JSON.stringify(value)}"</span></p>))}
                      </div>
                  </div>
              )}
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="text-lg font-bold text-slate-800 mb-3">Свойства узла</h3>
              {renderPropertiesPanel()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BuilderPage;
