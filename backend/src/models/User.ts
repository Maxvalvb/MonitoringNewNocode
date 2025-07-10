import { db } from '../utils/database';
import { User as UserType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export class UserModel {
  static async create(userData: Omit<UserType, 'id' | 'created_at' | 'updated_at'>): Promise<UserType> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const user = {
      id: uuidv4(),
      ...userData,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date()
    };

    await db('users').insert(user);
    
    return user;
  }

  static async findById(id: string): Promise<UserType | null> {
    const user = await db('users').where({ id }).first();
    return user || null;
  }

  static async findByEmail(email: string): Promise<UserType | null> {
    const user = await db('users').where({ email }).first();
    return user || null;
  }

  static async updateById(id: string, updates: Partial<UserType>): Promise<boolean> {
    const result = await db('users')
      .where({ id })
      .update({ 
        ...updates, 
        updated_at: new Date() 
      });
    
    return result > 0;
  }

  static async deleteById(id: string): Promise<boolean> {
    const result = await db('users').where({ id }).del();
    return result > 0;
  }

  static async verifyPassword(user: UserType, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  static async changePassword(id: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const result = await db('users')
      .where({ id })
      .update({ 
        password: hashedPassword,
        updated_at: new Date() 
      });
    
    return result > 0;
  }

  static async getAllUsers(limit = 50, offset = 0): Promise<UserType[]> {
    return await db('users')
      .select('id', 'email', 'name', 'role', 'created_at', 'updated_at')
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');
  }

  static async getUserCount(): Promise<number> {
    const result = await db('users').count('id as count').first();
    return Number(result?.count) || 0;
  }
}