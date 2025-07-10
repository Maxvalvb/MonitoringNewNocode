import React, { useState } from 'react';
import { NodeType } from '../types.ts';
import {
  DocumentMagnifyingGlassIcon, ScaleIcon, BranchIcon, CheckCircleIcon, XCircleIcon, PlusIcon, ChevronDownIcon,
  CalculatorIcon, HashtagIcon, CalendarDaysIcon, ArrowsRightLeftIcon, LinkIcon, VariableIcon, TableCellsIcon,
  AdjustmentsHorizontalIcon, ClipboardDocumentCheckIcon, ShieldCheckIcon, ChevronDoubleRightIcon, ChatBubbleLeftRightIcon,
  DocumentDuplicateIcon, ArrowPathRoundedSquareIcon, ListBulletIcon, AtSymbolIcon, CodeBracketIcon, BeakerIcon
} from './Icons.tsx';

interface ToolDefinition {
  type: NodeType;
  title: string;
  icon: React.ReactNode;
  description: string;
}

const TOOL_SECTIONS: { title: string; tools: ToolDefinition[] }[] = [
  {
    title: 'Основные блоки',
    tools: [
      { type: NodeType.EXTRACT_DATA, title: 'Извлечение данных', icon: <DocumentMagnifyingGlassIcon className="w-5 h-5 text-blue-500" />, description: "Найти данные по шаблону" },
      { type: NodeType.COMPARE_VALUES, title: 'Сравнение значений', icon: <ScaleIcon className="w-5 h-5 text-blue-500" />, description: "Сравнить переменные" },
      { type: NodeType.CONDITION, title: 'Условие', icon: <BranchIcon className="w-5 h-5 text-purple-500" />, description: "Создать ветвление" },
    ]
  },
  {
    title: 'Работа с данными',
    tools: [
      { type: NodeType.MATH_OPERATION, title: 'Математика', icon: <CalculatorIcon className="w-5 h-5 text-amber-500" />, description: 'Выполнить расчеты' },
      { type: NodeType.FORMAT_NUMBER, title: 'Формат числа', icon: <HashtagIcon className="w-5 h-5 text-amber-500" />, description: 'Изменить вид числа' },
      { type: NodeType.FORMAT_DATE, title: 'Формат даты', icon: <CalendarDaysIcon className="w-5 h-5 text-amber-500" />, description: 'Изменить вид даты' },
      { type: NodeType.TEXT_REPLACE, title: 'Заменить текст', icon: <ArrowsRightLeftIcon className="w-5 h-5 text-amber-500" />, description: 'Найти и заменить в строке' },
      { type: NodeType.TEXT_JOIN, title: 'Объединить текст', icon: <LinkIcon className="w-5 h-5 text-amber-500" />, description: 'Соединить несколько строк' },
      { type: NodeType.SET_VARIABLE, title: 'Установить переменную', icon: <VariableIcon className="w-5 h-5 text-amber-500" />, description: 'Задать значение вручную' },
      { type: NodeType.DATA_MAPPING, title: 'Таблица соответствий', icon: <TableCellsIcon className="w-5 h-5 text-amber-500" />, description: 'Заменить одно на другое' },
    ]
  },
  {
    title: 'Логика и управление',
    tools: [
        { type: NodeType.SWITCH, title: 'Переключатель (Switch)', icon: <AdjustmentsHorizontalIcon className="w-5 h-5 text-indigo-500" />, description: 'Ветвление по значению' },
        { type: NodeType.CHECK_EXISTS, title: 'Проверить наличие', icon: <ClipboardDocumentCheckIcon className="w-5 h-5 text-indigo-500" />, description: 'Убедиться, что данные есть' },
        { type: NodeType.VALIDATE_PATTERN, title: 'Проверить по шаблону', icon: <ShieldCheckIcon className="w-5 h-5 text-indigo-500" />, description: 'Валидация email, URL и др.' },
        { type: NodeType.MERGE, title: 'Объединить потоки', icon: <ChevronDoubleRightIcon className="w-5 h-5 text-indigo-500" />, description: 'Соединить ветки в одну' },
        { type: NodeType.LOG_MESSAGE, title: 'Записать лог', icon: <ChatBubbleLeftRightIcon className="w-5 h-5 text-indigo-500" />, description: 'Отладочное сообщение' },
    ]
  },
  {
    title: 'Извлечение и списки',
    tools: [
        { type: NodeType.EXTRACT_MULTIPLE, title: 'Извлечь все совпадения', icon: <DocumentDuplicateIcon className="w-5 h-5 text-teal-500" />, description: 'Найти все вхождения по Regex' },
        { type: NodeType.EXTRACT_TABLE, title: 'Извлечь таблицу', icon: <BeakerIcon className="w-5 h-5 text-teal-500" />, description: 'Извлечь табличные данные' },
        { type: NodeType.LOOP_FOREACH, title: 'Цикл (For Each)', icon: <ArrowPathRoundedSquareIcon className="w-5 h-5 text-teal-500" />, description: 'Пройтись по элементам списка' },
        { type: NodeType.LIST_CONTAINS, title: 'Список содержит', icon: <ListBulletIcon className="w-5 h-5 text-teal-500" />, description: 'Проверить наличие в списке' },
        { type: NodeType.LIST_GET_ITEM, title: 'Получить элемент списка', icon: <AtSymbolIcon className="w-5 h-5 text-teal-500" />, description: 'Взять элемент по индексу' },
        { type: NodeType.LIST_AGGREGATE, title: 'Агрегация списка', icon: <CodeBracketIcon className="w-5 h-5 text-teal-500" />, description: 'Сумма, среднее, кол-во' },
    ]
  },
  {
    title: 'Вывод',
    tools: [
      { type: NodeType.OUTPUT_SUCCESS, title: 'Успешный вывод', icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />, description: "Определить точку успеха" },
      { type: NodeType.OUTPUT_ERROR, title: 'Вывод с ошибкой', icon: <XCircleIcon className="w-5 h-5 text-red-500" />, description: "Определить точку ошибки" },
    ]
  }
];

interface SidebarProps {
  onAddNode: (type: NodeType) => void;
}

const SidebarSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-100"
      >
        <h3 className="font-bold text-slate-600 text-sm uppercase tracking-wide">{title}</h3>
        <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-3 flex flex-col gap-2">
          {children}
        </div>
      )}
    </div>
  );
};

const ToolButton: React.FC<{ tool: ToolDefinition; onClick: () => void }> = ({ tool, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-3 p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full"
    >
        <div className="flex-shrink-0 bg-slate-50 rounded-md p-2">
            {tool.icon}
        </div>
        <div className="flex-1">
            <h4 className="font-semibold text-sm text-slate-700">{tool.title}</h4>
            <p className="text-xs text-slate-500">{tool.description}</p>
        </div>
        <div className="ml-auto">
            <PlusIcon className="w-5 h-5 text-slate-400"/>
        </div>
    </button>
);


const Sidebar: React.FC<SidebarProps> = ({ onAddNode }) => {
  return (
    <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-10 overflow-y-auto">
        <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800">Инструменты</h2>
            <p className="text-sm text-slate-500">Нажмите, чтобы добавить блоки в процесс.</p>
        </div>
        <div className="flex-grow">
            {TOOL_SECTIONS.map(section => (
                <SidebarSection key={section.title} title={section.title}>
                    {section.tools.map(tool => (
                        <ToolButton
                            key={tool.type}
                            tool={tool}
                            onClick={() => onAddNode(tool.type)}
                        />
                    ))}
                </SidebarSection>
            ))}
        </div>
    </aside>
  );
};

export default Sidebar;