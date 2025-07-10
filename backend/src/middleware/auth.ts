import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../utils/config';
import { UserSession } from '../types';

// Расширяем тип Request для user
declare global {
  namespace Express {
    interface Request {
      user?: UserSession;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Токен авторизации не предоставлен'
      });
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as UserSession;
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Недействительный токен авторизации'
    });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as UserSession;
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Игнорируем ошибки в необязательной аутентификации
    next();
  }
}

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Требуются права администратора'
    });
  }
  next();
}