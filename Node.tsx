import React, { memo } from 'react';
import * as ReactFlowModule from 'reactflow';
import { type NodeDataPayload, NodeType } from '../types.ts';
import {
  PlayIcon, UploadIcon, DocumentMagnifyingGlassIcon, ScaleIcon, BranchIcon, CheckCircleIcon, XCircleIcon,
  CalculatorIcon, HashtagIcon, CalendarDaysIcon, ArrowsRightLeftIcon, LinkIcon, VariableIcon, TableCellsIcon,
  AdjustmentsHorizontalIcon, ClipboardDocumentCheckIcon, ShieldCheckIcon, ChevronDoubleRightIcon, ChatBubbleLeftRightIcon,
  DocumentDuplicateIcon, ArrowPathRoundedSquareIcon, ListBulletIcon, AtSymbolIcon, CodeBracketIcon, BeakerIcon
} from './Icons.tsx';

const ICONS: Record<NodeType, React.ReactNode> = {
  [NodeType.START]: <PlayIcon className="w-5 h-5" />,
  [NodeType.UPLOAD]: <UploadIcon className="w-5 h-5" />,
  [NodeType.EXTRACT_DATA]: <DocumentMagnifyingGlassIcon className="w-5 h-5" />,
  [NodeType.COMPARE_VALUES]: <ScaleIcon className="w-5 h-5" />,
  [NodeType.CONDITION]: <BranchIcon className="w-5 h-5" />,
  [NodeType.OUTPUT_SUCCESS]: <CheckCircleIcon className="w-5 h-5" />,
  [NodeType.OUTPUT_ERROR]: <XCircleIcon className="w-5 h-5" />,

  // Data Manipulation
  [NodeType.MATH_OPERATION]: <CalculatorIcon className="w-5 h-5" />,
  [NodeType.FORMAT_NUMBER]: <HashtagIcon className="w-5 h-5" />,
  [NodeType.FORMAT_DATE]: <CalendarDaysIcon className="w-5 h-5" />,
  [NodeType.TEXT_REPLACE]: <ArrowsRightLeftIcon className="w-5 h-5" />,
  [NodeType.TEXT_JOIN]: <LinkIcon className="w-5 h-5" />,
  [NodeType.SET_VARIABLE]: <VariableIcon className="w-5 h-5" />,
  [NodeType.DATA_MAPPING]: <TableCellsIcon className="w-5 h-5" />,

  // Logic & Flow Control
  [NodeType.SWITCH]: <AdjustmentsHorizontalIcon className="w-5 h-5" />,
  [NodeType.CHECK_EXISTS]: <ClipboardDocumentCheckIcon className="w-5 h-5" />,
  [NodeType.VALIDATE_PATTERN]: <ShieldCheckIcon className="w-5 h-5" />,
  [NodeType.MERGE]: <ChevronDoubleRightIcon className="w-5 h-5" />,
  [NodeType.LOG_MESSAGE]: <ChatBubbleLeftRightIcon className="w-5 h-5" />,

  // Advanced Extraction
  [NodeType.EXTRACT_MULTIPLE]: <DocumentDuplicateIcon className="w-5 h-5" />,
  [NodeType.EXTRACT_TABLE]: <BeakerIcon className="w-5 h-5" />,

  // List Operations
  [NodeType.LOOP_FOREACH]: <ArrowPathRoundedSquareIcon className="w-5 h-5" />,
  [NodeType.LIST_CONTAINS]: <ListBulletIcon className="w-5 h-5" />,
  [NodeType.LIST_GET_ITEM]: <AtSymbolIcon className="w-5 h-5" />,
  [NodeType.LIST_AGGREGATE]: <CodeBracketIcon className="w-5 h-5" />,
};

const BORDER_COLORS: Record<NodeType, string> = {
    [NodeType.START]: 'border-slate-400',
    [NodeType.UPLOAD]: 'border-slate-400',
    [NodeType.EXTRACT_DATA]: 'border-blue-500',
    [NodeType.COMPARE_VALUES]: 'border-blue-500',
    [NodeType.CONDITION]: 'border-purple-500',
    [NodeType.OUTPUT_SUCCESS]: 'border-green-500',
    [NodeType.OUTPUT_ERROR]: 'border-red-500',
    
    // Data Manipulation
    [NodeType.MATH_OPERATION]: 'border-amber-500',
    [NodeType.FORMAT_NUMBER]: 'border-amber-500',
    [NodeType.FORMAT_DATE]: 'border-amber-500',
    [NodeType.TEXT_REPLACE]: 'border-amber-500',
    [NodeType.TEXT_JOIN]: 'border-amber-500',
    [NodeType.SET_VARIABLE]: 'border-amber-500',
    [NodeType.DATA_MAPPING]: 'border-amber-500',
    
    // Logic & Flow Control
    [NodeType.SWITCH]: 'border-indigo-500',
    [NodeType.CHECK_EXISTS]: 'border-indigo-500',
    [NodeType.VALIDATE_PATTERN]: 'border-indigo-500',
    [NodeType.MERGE]: 'border-indigo-500',
    [NodeType.LOG_MESSAGE]: 'border-indigo-500',

    // Advanced Extraction & List Operations
    [NodeType.EXTRACT_TABLE]: 'border-teal-500',
    [NodeType.EXTRACT_MULTIPLE]: 'border-teal-500',
    [NodeType.LOOP_FOREACH]: 'border-teal-500',
    [NodeType.LIST_CONTAINS]: 'border-teal-500',
    [NodeType.LIST_GET_ITEM]: 'border-teal-500',
    [NodeType.LIST_AGGREGATE]: 'border-teal-500',
};

const ICON_BG_COLORS: Record<NodeType, string> = {
    [NodeType.START]: 'bg-slate-100 text-slate-600',
    [NodeType.UPLOAD]: 'bg-slate-100 text-slate-600',
    [NodeType.EXTRACT_DATA]: 'bg-blue-100 text-blue-600',
    [NodeType.COMPARE_VALUES]: 'bg-blue-100 text-blue-600',
    [NodeType.CONDITION]: 'bg-purple-100 text-purple-600',
    [NodeType.OUTPUT_SUCCESS]: 'bg-green-100 text-green-600',
    [NodeType.OUTPUT_ERROR]: 'bg-red-100 text-red-600',
    
    // Data Manipulation
    [NodeType.MATH_OPERATION]: 'bg-amber-100 text-amber-600',
    [NodeType.FORMAT_NUMBER]: 'bg-amber-100 text-amber-600',
    [NodeType.FORMAT_DATE]: 'bg-amber-100 text-amber-600',
    [NodeType.TEXT_REPLACE]: 'bg-amber-100 text-amber-600',
    [NodeType.TEXT_JOIN]: 'bg-amber-100 text-amber-600',
    [NodeType.SET_VARIABLE]: 'bg-amber-100 text-amber-600',
    [NodeType.DATA_MAPPING]: 'bg-amber-100 text-amber-600',

    // Logic & Flow Control
    [NodeType.SWITCH]: 'bg-indigo-100 text-indigo-600',
    [NodeType.CHECK_EXISTS]: 'bg-indigo-100 text-indigo-600',
    [NodeType.VALIDATE_PATTERN]: 'bg-indigo-100 text-indigo-600',
    [NodeType.MERGE]: 'bg-indigo-100 text-indigo-600',
    [NodeType.LOG_MESSAGE]: 'bg-indigo-100 text-indigo-600',

    // Advanced Extraction & List Operations
    [NodeType.EXTRACT_TABLE]: 'bg-teal-100 text-teal-600',
    [NodeType.EXTRACT_MULTIPLE]: 'bg-teal-100 text-teal-600',
    [NodeType.LOOP_FOREACH]: 'bg-teal-100 text-teal-600',
    [NodeType.LIST_CONTAINS]: 'bg-teal-100 text-teal-600',
    [NodeType.LIST_GET_ITEM]: 'bg-teal-100 text-teal-600',
    [NodeType.LIST_AGGREGATE]: 'bg-teal-100 text-teal-600',
};

const CustomNode: React.FC<ReactFlowModule.NodeProps<NodeDataPayload>> = ({ data, selected, isConnectable }) => {
  const borderStyle = selected ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2' : BORDER_COLORS[data.type];
  
  const showSourceHandle = ![NodeType.OUTPUT_SUCCESS, NodeType.OUTPUT_ERROR].includes(data.type);
  const showTargetHandle = data.type !== NodeType.START;

  return (
    <div
      className={`relative w-72 bg-white rounded-xl shadow-md border-2 p-4 transition-all duration-200 ${borderStyle}`}
    >
      {showTargetHandle && (
        <ReactFlowModule.Handle
          type="target"
          position={ReactFlowModule.Position.Top}
          isConnectable={isConnectable}
          className="!w-3 !h-3 !bg-slate-400"
        />
      )}
      
        <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${ICON_BG_COLORS[data.type]}`}>
                {ICONS[data.type]}
            </div>
            <div className="flex-grow">
                <h3 className="font-bold text-slate-800">{data.title}</h3>
                <p className="text-sm text-slate-500">{data.description}</p>
            </div>
        </div>

      {showSourceHandle && ![NodeType.CONDITION, NodeType.SWITCH].includes(data.type) && (
         <ReactFlowModule.Handle
          type="source"
          position={ReactFlowModule.Position.Bottom}
          isConnectable={isConnectable}
          className="!w-3 !h-3 !bg-slate-400"
        />
      )}
      
      {data.type === NodeType.CONDITION && (
          <>
            <ReactFlowModule.Handle
                type="source"
                position={ReactFlowModule.Position.Bottom}
                id="yes"
                style={{ left: '33%' }}
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-green-500"
            />
            <div className="absolute -bottom-5 left-0 right-2/3 text-center text-xs text-green-600 font-semibold">Да</div>
            
            <ReactFlowModule.Handle
                type="source"
                position={ReactFlowModule.Position.Bottom}
                id="no"
                style={{ left: '66%' }}
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-red-500"
            />
            <div className="absolute -bottom-5 left-1/3 right-0 text-center text-xs text-red-600 font-semibold">Нет</div>
          </>
      )}

      {data.type === NodeType.SWITCH && (
          <>
            <ReactFlowModule.Handle
                type="source"
                position={ReactFlowModule.Position.Bottom}
                id="case1"
                style={{ left: '25%' }}
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-sky-500"
            />
            <ReactFlowModule.Handle
                type="source"
                position={ReactFlowModule.Position.Bottom}
                id="case2"
                style={{ left: '50%' }}
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-sky-500"
            />
             <ReactFlowModule.Handle
                type="source"
                position={ReactFlowModule.Position.Bottom}
                id="default"
                style={{ left: '75%' }}
                isConnectable={isConnectable}
                className="!w-3 !h-3 !bg-slate-500"
            />
          </>
      )}
    </div>
  );
};

export default memo(CustomNode);