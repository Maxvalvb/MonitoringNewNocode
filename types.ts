import * as ReactFlowModule from 'reactflow';

export enum NodeType {
  START = 'START',
  UPLOAD = 'UPLOAD',
  EXTRACT_DATA = 'EXTRACT_DATA',
  COMPARE_VALUES = 'COMPARE_VALUES',
  CONDITION = 'CONDITION',
  OUTPUT_SUCCESS = 'OUTPUT_SUCCESS',
  OUTPUT_ERROR = 'OUTPUT_ERROR',
  
  // Data Manipulation
  MATH_OPERATION = 'MATH_OPERATION',
  FORMAT_NUMBER = 'FORMAT_NUMBER',
  FORMAT_DATE = 'FORMAT_DATE',
  TEXT_REPLACE = 'TEXT_REPLACE',
  TEXT_JOIN = 'TEXT_JOIN',
  SET_VARIABLE = 'SET_VARIABLE',
  DATA_MAPPING = 'DATA_MAPPING',
  
  // Logic & Flow Control
  SWITCH = 'SWITCH',
  CHECK_EXISTS = 'CHECK_EXISTS',
  VALIDATE_PATTERN = 'VALIDATE_PATTERN',
  MERGE = 'MERGE',
  LOG_MESSAGE = 'LOG_MESSAGE',

  // Advanced Extraction
  EXTRACT_TABLE = 'EXTRACT_TABLE',
  EXTRACT_MULTIPLE = 'EXTRACT_MULTIPLE',

  // List Operations
  LOOP_FOREACH = 'LOOP_FOREACH',
  LIST_CONTAINS = 'LIST_CONTAINS',
  LIST_GET_ITEM = 'LIST_GET_ITEM',
  LIST_AGGREGATE = 'LIST_AGGREGATE',
}

export type ComparisonOperator = 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';

export interface ExtractDataSettings {
  variableName: string;
  regex: string;
}

export interface CompareValuesSettings {
  value1: string;
  operator: ComparisonOperator;
  value2: string;
}

// === NEW NODE SETTINGS ===

export interface MathOperationSettings {
  variable1: string;
  operation: 'add' | 'subtract' | 'multiply' | 'divide';
  variable2: string;
  outputVariable: string;
}

export interface FormatNumberSettings {
  inputVariable: string;
  outputVariable: string;
  decimalPlaces: number;
}

export interface FormatDateSettings {
  inputVariable: string;
  outputVariable: string;
  inputFormat: string;
  outputFormat: string;
}

export interface TextReplaceSettings {
  inputVariable: string;
  outputVariable: string;
  findText: string;
  replaceWith: string;
}

export interface TextJoinSettings {
  inputs: string[];
  separator: string;
  outputVariable: string;
}

export interface SetVariableSettings {
  variableName: string;
  value: string;
}

export interface DataMappingSettings {
  inputVariable: string;
  outputVariable: string;
  defaultValue: string;
  mappings: { from: string; to: string }[];
}

export interface SwitchSettings {
    inputVariable: string;
}

export interface CheckExistsSettings {
  variableName: string;
}

export interface ValidatePatternSettings {
  inputVariable: string;
  pattern: 'email' | 'url' | 'custom';
  customRegex: string;
}

export interface LogMessageSettings {
  message: string;
}

export interface ExtractMultipleSettings {
    variableName: string;
    regex: string;
}

export interface ListAggregateSettings {
    inputVariable: string;
    operation: 'sum' | 'average' | 'count';
    outputVariable: string;
}


export type NodeSettings = 
  | ExtractDataSettings 
  | CompareValuesSettings 
  | MathOperationSettings
  | FormatNumberSettings
  | FormatDateSettings
  | TextReplaceSettings
  | TextJoinSettings
  | SetVariableSettings
  | DataMappingSettings
  | SwitchSettings
  | CheckExistsSettings
  | ValidatePatternSettings
  | LogMessageSettings
  | ExtractMultipleSettings
  | ListAggregateSettings
  | {};

export interface NodeDataPayload {
  type: NodeType;
  title: string;
  description: string;
  settings: NodeSettings;
}

export type AppNode = ReactFlowModule.Node<NodeDataPayload>;
export type AppEdge = ReactFlowModule.Edge;

export type WorkflowVariables = Record<string, any>;

export interface WorkflowResult {
  status: 'idle' | 'success' | 'error' | 'running';
  message: string;
  variables: WorkflowVariables;
  executedPath: {
    nodes: string[];
    edges: string[];
  }
}

// Тип для навигации по страницам SaaS-приложения
export type Page = 'dashboard' | 'builder' | 'reports';

export type Report = {
    id: string;
    date: string;
    status: 'success' | 'error';
    result: string;
};
