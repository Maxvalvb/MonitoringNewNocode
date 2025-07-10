# FinFlow - No-Code платформа для автоматизации документооборота

🚀 **Полноценная no-code платформа** для создания автоматизированных workflow по обработке и валидации документов.

## 📖 Обзор

FinFlow позволяет пользователям создавать сложные процессы обработки документов без программирования, используя визуальный редактор и мощный движок выполнения.

### ✨ Ключевые возможности

- 🎨 **Визуальный редактор** - Создавайте workflow перетаскиванием узлов
- 📄 **Обработка документов** - Поддержка PDF и TXT файлов
- 🔍 **Извлечение данных** - Регулярные выражения и AI-помощник
- ⚡ **Логика и условия** - Ветвления, циклы, валидация
- 📊 **Дашборд и отчеты** - Статистика и история выполнений
- 🔐 **Аутентификация** - Безопасный доступ с JWT
- 🐳 **Docker Ready** - Простое развертывание

## 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React +      │◄──►│   (Node.js +    │◄──►│   (SQLite)      │
│   TypeScript)   │    │   Express)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend (React + TypeScript)
- **React Flow** - Визуальный редактор
- **Vite** - Сборщик и dev сервер
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация

### Backend (Node.js + Express)
- **Express.js** - REST API
- **TypeScript** - Типизация
- **SQLite + Knex** - База данных
- **JWT** - Аутентификация
- **Multer** - Загрузка файлов
- **Workflow Engine** - Движок выполнения

## 🚀 Быстрый старт

### Вариант 1: Docker (рекомендуется)

```bash
# Клонируем репозиторий
git clone <repository-url>
cd finflow

# Запускаем весь стек
docker-compose up --build

# Приложение будет доступно:
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

### Вариант 2: Локальная разработка

**Бэкенд:**
```bash
cd backend
npm install
cp .env.example .env
npm run db:seed
npm run dev
```

**Фронтенд:**
```bash
npm install
npm run dev
```

## 🧪 Тестовые данные

После инициализации базы данных:

| Роль | Email | Пароль |
|------|-------|---------|
| Администратор | admin@finflow.com | admin123456 |
| Пользователь | user@finflow.com | user123456 |

## 🔧 Типы узлов Workflow

### 📥 Входные данные
- **START** - Начальная точка процесса
- **UPLOAD** - Загрузка документа

### 🔍 Извлечение данных
- **EXTRACT_DATA** - Извлечение по регулярному выражению
- **EXTRACT_TABLE** - Извлечение табличных данных
- **EXTRACT_MULTIPLE** - Все совпадения шаблона

### 🧮 Обработка данных
- **MATH_OPERATION** - Математические операции (+, -, *, /)
- **FORMAT_NUMBER** - Форматирование чисел
- **FORMAT_DATE** - Форматирование дат
- **TEXT_REPLACE** - Замена текста
- **TEXT_JOIN** - Объединение строк
- **SET_VARIABLE** - Установка переменной

### 🔀 Логика и контроль
- **COMPARE_VALUES** - Сравнение значений (>, <, ==, содержит)
- **CONDITION** - Условное ветвление (Да/Нет)
- **SWITCH** - Множественный выбор
- **CHECK_EXISTS** - Проверка существования переменной
- **VALIDATE_PATTERN** - Валидация (email, URL, регекс)

### 📋 Списки и циклы
- **LOOP_FOREACH** - Итерация по списку
- **LIST_CONTAINS** - Проверка содержимого
- **LIST_GET_ITEM** - Получение элемента
- **LIST_AGGREGATE** - Агрегация (сумма, среднее, количество)

### 📤 Вывод результата
- **OUTPUT_SUCCESS** - Успешное завершение
- **OUTPUT_ERROR** - Завершение с ошибкой
- **LOG_MESSAGE** - Запись в лог

## 🎯 Примеры использования

### 📄 Валидация финансовых документов
1. Загрузка PDF документа
2. Извлечение суммы регулярным выражением
3. Проверка суммы на лимиты
4. Условное ветвление (одобрение/отклонение)

### 📊 Обработка накладных
1. Извлечение данных клиента
2. Проверка формата email
3. Расчет НДС и итоговой суммы
4. Валидация по бизнес-правилам

### ✅ Проверка соответствия
1. Извлечение ключевых полей
2. Сопоставление с базой данных
3. Проверка на дубликаты
4. Генерация отчета

## 📋 API Документация

### Аутентификация
```
POST /api/auth/register   # Регистрация
POST /api/auth/login      # Вход
GET  /api/auth/me         # Профиль
POST /api/auth/logout     # Выход
```

### Управление workflow
```
GET    /api/workflows           # Список
POST   /api/workflows           # Создание
GET    /api/workflows/:id       # Получение
PUT    /api/workflows/:id       # Обновление  
DELETE /api/workflows/:id       # Удаление
```

### Выполнение
```
POST /api/executions/:id        # С файлом
POST /api/executions/:id/text   # С текстом
```

### Дашборд
```
GET /api/dashboard/stats        # Статистика
GET /api/dashboard/reports      # Отчеты
```

## 🛠️ Разработка

### Структура проекта
```
finflow/
├── README.md                   # Основная документация
├── docker-compose.yml          # Docker конфигурация
├── package.json               # Frontend зависимости
├── vite.config.ts             # Vite конфигурация
├── src/                       # Frontend исходники
│   ├── components/            # React компоненты
│   ├── services/              # API вызовы
│   └── types.ts               # TypeScript типы
└── backend/                   # Backend
    ├── src/                   # Исходники
    │   ├── controllers/       # HTTP контроллеры
    │   ├── models/           # Модели БД
    │   ├── routes/           # Маршруты API
    │   ├── services/         # Бизнес-логика
    │   └── utils/            # Утилиты
    ├── database/             # База данных
    └── uploads/              # Загруженные файлы
```

### Добавление новых узлов

1. **Определите тип в enum:**
```typescript
// types.ts
export enum NodeType {
  // ... existing types
  NEW_NODE_TYPE = 'NEW_NODE_TYPE',
}
```

2. **Создайте интерфейс настроек:**
```typescript
export interface NewNodeSettings {
  inputVariable: string;
  outputVariable: string;
  someParameter: string;
}
```

3. **Реализуйте логику выполнения:**
```typescript
// WorkflowEngine.ts
case NodeType.NEW_NODE_TYPE:
  return this.executeNewNode(settings as NewNodeSettings);
```

4. **Добавьте в UI:**
```typescript
// Sidebar.tsx - добавьте в список узлов
```

### Расширение API

1. Создайте новый контроллер в `backend/src/controllers/`
2. Добавьте маршруты в `backend/src/routes/`
3. Обновите типы в `backend/src/types/`
4. Добавьте валидацию в `middleware/validation.ts`

## 🔐 Безопасность

- **JWT токены** - Аутентификация и авторизация
- **Helmet** - Защита HTTP заголовков  
- **CORS** - Контроль доступа между доменами
- **Rate Limiting** - Защита от DDoS
- **Валидация** - Проверка всех входных данных
- **Хеширование** - Безопасное хранение паролей

## 🚀 Развертывание

### Production с Docker

```bash
# Создайте .env файлы с production настройками
cp backend/.env.example backend/.env

# Обновите переменные окружения
nano backend/.env

# Запустите
docker-compose -f docker-compose.prod.yml up -d
```

### Основные переменные окружения

```bash
# Backend
NODE_ENV=production
JWT_SECRET=your-super-secret-key
DATABASE_URL=./database/finflow.db
CORS_ORIGIN=https://your-domain.com

# Frontend  
VITE_API_URL=https://api.your-domain.com
```

## 📈 Мониторинг

### Логирование
Система поддерживает различные уровни логирования:
- `error` - Критические ошибки
- `warn` - Предупреждения
- `info` - Информационные сообщения
- `debug` - Отладочная информация

### Метрики
- Количество выполненных workflow
- Время выполнения
- Статистика ошибок
- Использование ресурсов

### Health Check
```bash
curl http://localhost:3001/health
```

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте ветку для фичи (`git checkout -b feature/AmazingFeature`)
3. Внесите изменения (`git commit -m 'Add some AmazingFeature'`)
4. Запушьте ветку (`git push origin feature/AmazingFeature`)
5. Создайте Pull Request

### Coding Style

- **TypeScript** - строгая типизация
- **ESLint** - линтер кода
- **Prettier** - форматирование
- **Комментарии** - на русском языке
- **Commits** - следуйте Conventional Commits

## 📚 Дополнительные ресурсы

- [React Flow Documentation](https://reactflow.dev/)
- [Express.js Guide](https://expressjs.com/)
- [SQLite Documentation](https://sqlite.org/docs.html)
- [Docker Documentation](https://docs.docker.com/)

## 🆘 Поддержка

При возникновении проблем:

1. Проверьте [Issues](https://github.com/your-repo/finflow/issues)
2. Создайте новый Issue с подробным описанием
3. Приложите логи и скриншоты
4. Укажите версии ОС и Node.js

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. [LICENSE](LICENSE) файл для деталей.

---

**FinFlow** - Делаем автоматизацию документооборота простой и доступной! 🚀