// services/api-backend.ts
// Этот файл заменяет api.ts для работы с реальным бэкендом
import {
  type AppNode,
  type AppEdge,
  type WorkflowResult,
  type Report
} from './types.ts';

const API_BASE_URL = 'http://localhost:3001/api';

// Получаем токен из localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Устанавливаем токен
const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Удаляем токен
const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Базовая функция для HTTP запросов
async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Аутентификация
export async function register(email: string, password: string, name: string) {
  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
  
  if (response.success && response.data.tokens) {
    setAuthToken(response.data.tokens.accessToken);
  }
  
  return response;
}

export async function login(email: string, password: string) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (response.success && response.data.tokens) {
    setAuthToken(response.data.tokens.accessToken);
  }
  
  return response;
}

export async function logout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch (error) {
    console.warn('Logout request failed:', error);
  } finally {
    removeAuthToken();
  }
}

export async function getCurrentUser() {
  return apiRequest('/auth/me');
}

// Воркфлоу
export async function getWorkflow(id: string): Promise<{ nodes: AppNode[], edges: AppEdge[] }> {
  const response = await apiRequest(`/workflows/${id}`);
  return {
    nodes: response.data.nodes,
    edges: response.data.edges
  };
}

export async function saveWorkflow(id: string, workflow: { nodes: AppNode[], edges: AppEdge[] }): Promise<{ status: string, savedAt: string }> {
  await apiRequest(`/workflows/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      nodes: workflow.nodes,
      edges: workflow.edges
    }),
  });
  
  return { status: 'success', savedAt: new Date().toISOString() };
}

export async function createWorkflow(name: string, description: string, nodes: AppNode[], edges: AppEdge[]) {
  return apiRequest('/workflows', {
    method: 'POST',
    body: JSON.stringify({ name, description, nodes, edges }),
  });
}

export async function getWorkflows() {
  return apiRequest('/workflows');
}

export async function deleteWorkflow(id: string) {
  return apiRequest(`/workflows/${id}`, { method: 'DELETE' });
}

// Выполнение воркфлоу
export async function executeWorkflow(workflowId: string, documentText: string): Promise<WorkflowResult> {
  const response = await apiRequest(`/executions/${workflowId}/text`, {
    method: 'POST',
    body: JSON.stringify({ documentText }),
  });
  
  return response.data.result;
}

export async function executeWorkflowWithFile(workflowId: string, file: File): Promise<WorkflowResult> {
  const formData = new FormData();
  formData.append('file', file);
  
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/executions/${workflowId}`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  
  const result = await response.json();
  return result.data.result;
}

// Дашборд и отчеты
export async function getDashboardStats() {
  const response = await apiRequest('/dashboard/stats');
  return response.data;
}

export async function getReports(page: number = 1): Promise<Report[]> {
  const response = await apiRequest(`/dashboard/reports?page=${page}&limit=20`);
  return response.data;
}

// Утилиты для проверки аутентификации
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function getStoredToken(): string | null {
  return getAuthToken();
}