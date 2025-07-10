import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Ошибки валидации',
      details: errors.array()
    });
  }
  next();
}

// Валидация для регистрации
export const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Некорректный email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен содержать минимум 6 символов'),
  body('name')
    .isLength({ min: 2 })
    .withMessage('Имя должно содержать минимум 2 символа')
    .trim(),
  handleValidationErrors
];

// Валидация для входа
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Некорректный email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Пароль обязателен'),
  handleValidationErrors
];

// Валидация для создания воркфлоу
export const validateCreateWorkflow = [
  body('name')
    .isLength({ min: 3, max: 100 })
    .withMessage('Название должно содержать от 3 до 100 символов')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Описание не должно превышать 500 символов')
    .trim(),
  body('nodes')
    .isArray()
    .withMessage('Nodes должен быть массивом'),
  body('edges')
    .isArray()
    .withMessage('Edges должен быть массивом'),
  handleValidationErrors
];

// Валидация для обновления воркфлоу
export const validateUpdateWorkflow = [
  body('name')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Название должно содержать от 3 до 100 символов')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Описание не должно превышать 500 символов')
    .trim(),
  body('nodes')
    .optional()
    .isArray()
    .withMessage('Nodes должен быть массивом'),
  body('edges')
    .optional()
    .isArray()
    .withMessage('Edges должен быть массивом'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active должен быть boolean'),
  handleValidationErrors
];