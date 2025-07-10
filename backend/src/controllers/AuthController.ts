import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { CONFIG } from '../utils/config';
import { ApiResponse, LoginRequest, RegisterRequest, AuthTokens } from '../types';
import { logger } from '../utils/logger';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body as RegisterRequest;

      // Проверяем, существует ли пользователь
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Пользователь с таким email уже существует'
        } as ApiResponse);
      }

      // Создаем пользователя
      const user = await UserModel.create({
        email,
        password,
        name,
        role: 'user'
      });

      // Генерируем токены
      const tokens = AuthController.generateTokens(user.id, user.email, user.name, user.role);

      logger.info('User registered', { userId: user.id, email: user.email });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          tokens
        }
      } as ApiResponse);

    } catch (error) {
      logger.error('Registration failed', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка при регистрации'
      } as ApiResponse);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body as LoginRequest;

      // Найти пользователя
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Неверный email или пароль'
        } as ApiResponse);
      }

      // Проверить пароль
      const isPasswordValid = await UserModel.verifyPassword(user, password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Неверный email или пароль'
        } as ApiResponse);
      }

      // Генерируем токены
      const tokens = AuthController.generateTokens(user.id, user.email, user.name, user.role);

      logger.info('User logged in', { userId: user.id, email: user.email });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          tokens
        }
      } as ApiResponse);

    } catch (error) {
      logger.error('Login failed', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка при входе'
      } as ApiResponse);
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не авторизован'
        } as ApiResponse);
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Пользователь не найден'
        } as ApiResponse);
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      } as ApiResponse);

    } catch (error) {
      logger.error('Get user info failed', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения информации о пользователе'
      } as ApiResponse);
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      // В простой реализации просто отвечаем успехом
      // В production можно добавить blacklist токенов
      res.json({
        success: true,
        message: 'Успешный выход'
      } as ApiResponse);

    } catch (error) {
      logger.error('Logout failed', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка при выходе'
      } as ApiResponse);
    }
  }

  private static generateTokens(userId: string, email: string, name: string, role: string): AuthTokens {
    const payload = { userId, email, name, role };
    
    const accessToken = (jwt as any).sign(payload, CONFIG.JWT_SECRET, { 
      expiresIn: CONFIG.JWT_EXPIRES_IN 
    });
    
    const refreshToken = (jwt as any).sign(payload, CONFIG.JWT_SECRET, { 
      expiresIn: '30d' 
    });

    return { accessToken, refreshToken };
  }
}