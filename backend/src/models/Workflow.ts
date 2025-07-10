import { db } from '../utils/database';
import { Workflow as WorkflowType, AppNode, AppEdge } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class WorkflowModel {
  static async create(workflowData: Omit<WorkflowType, 'id' | 'created_at' | 'updated_at'>): Promise<WorkflowType> {
    const workflow = {
      id: uuidv4(),
      ...workflowData,
      nodes: JSON.stringify(workflowData.nodes),
      edges: JSON.stringify(workflowData.edges),
      created_at: new Date(),
      updated_at: new Date()
    };

    await db('workflows').insert(workflow);
    
    return {
      ...workflow,
      nodes: workflowData.nodes,
      edges: workflowData.edges
    };
  }

  static async findById(id: string): Promise<WorkflowType | null> {
    const workflow = await db('workflows').where({ id }).first();
    
    if (!workflow) return null;
    
    return {
      ...workflow,
      nodes: JSON.parse(workflow.nodes),
      edges: JSON.parse(workflow.edges)
    };
  }

  static async findByUserId(userId: string, limit = 50, offset = 0): Promise<WorkflowType[]> {
    const workflows = await db('workflows')
      .where({ user_id: userId })
      .limit(limit)
      .offset(offset)
      .orderBy('updated_at', 'desc');
    
    return workflows.map(workflow => ({
      ...workflow,
      nodes: JSON.parse(workflow.nodes),
      edges: JSON.parse(workflow.edges)
    }));
  }

  static async updateById(id: string, updates: Partial<Omit<WorkflowType, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    const updateData: any = { 
      ...updates, 
      updated_at: new Date() 
    };

    // Сериализуем nodes и edges если они переданы
    if (updates.nodes) {
      updateData.nodes = JSON.stringify(updates.nodes);
    }
    if (updates.edges) {
      updateData.edges = JSON.stringify(updates.edges);
    }

    const result = await db('workflows')
      .where({ id })
      .update(updateData);
    
    return result > 0;
  }

  static async deleteById(id: string): Promise<boolean> {
    const result = await db('workflows').where({ id }).del();
    return result > 0;
  }

  static async getActiveWorkflows(userId?: string): Promise<WorkflowType[]> {
    let query = db('workflows').where({ is_active: true });
    
    if (userId) {
      query = query.where({ user_id: userId });
    }
    
    const workflows = await query.orderBy('updated_at', 'desc');
    
    return workflows.map(workflow => ({
      ...workflow,
      nodes: JSON.parse(workflow.nodes),
      edges: JSON.parse(workflow.edges)
    }));
  }

  static async getWorkflowStats(userId?: string): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    let query = db('workflows');
    
    if (userId) {
      query = query.where({ user_id: userId });
    }

    const [totalResult, activeResult] = await Promise.all([
      query.clone().count('id as count').first(),
      query.clone().where({ is_active: true }).count('id as count').first()
    ]);

    const total = Number(totalResult?.count) || 0;
    const active = Number(activeResult?.count) || 0;

    return {
      total,
      active,
      inactive: total - active
    };
  }

  static async canUserAccessWorkflow(workflowId: string, userId: string): Promise<boolean> {
    const workflow = await db('workflows')
      .where({ id: workflowId, user_id: userId })
      .first();
    
    return !!workflow;
  }
}