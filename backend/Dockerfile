# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Собираем TypeScript
RUN npm run build

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Создаем необходимые директории и устанавливаем права
RUN mkdir -p /app/database /app/uploads
RUN chown -R nextjs:nodejs /app

# Переключаемся на пользователя
USER nextjs

# Открываем порт
EXPOSE 3001

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=3001

# Команда запуска
CMD ["npm", "start"]