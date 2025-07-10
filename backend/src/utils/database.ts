import knex from 'knex';
import path from 'path';

const config = {
  client: 'sqlite3',
  connection: {
    filename: process.env.DATABASE_URL || path.join(__dirname, '../../database/finflow.db')
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, '../migrations'),
    extension: 'ts'
  },
  pool: {
    min: 0,
    max: 10,
    afterCreate: (conn: any, done: Function) => {
      // Включаем foreign keys для SQLite
      conn.run('PRAGMA foreign_keys = ON', done);
    }
  }
};

export const db = knex(config);

// Инициализация таблиц
export async function initializeDatabase() {
  try {
    // Создаем таблицы если их нет
    await createTables();
    console.log('✅ База данных инициализирована');
  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error);
    throw error;
  }
}

async function createTables() {
  // Таблица пользователей
  if (!(await db.schema.hasTable('users'))) {
    await db.schema.createTable('users', (table) => {
      table.uuid('id').primary();
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
      table.string('name').notNullable();
      table.enum('role', ['admin', 'user']).defaultTo('user');
      table.timestamps(true, true);
    });
  }

  // Таблица воркфлоу
  if (!(await db.schema.hasTable('workflows'))) {
    await db.schema.createTable('workflows', (table) => {
      table.uuid('id').primary();
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('name').notNullable();
      table.text('description');
      table.json('nodes').notNullable();
      table.json('edges').notNullable();
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // Таблица выполнений воркфлоу
  if (!(await db.schema.hasTable('workflow_executions'))) {
    await db.schema.createTable('workflow_executions', (table) => {
      table.uuid('id').primary();
      table.uuid('workflow_id').references('id').inTable('workflows').onDelete('CASCADE');
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('input_file_name');
      table.string('input_file_path');
      table.text('input_data');
      table.json('result').notNullable();
      table.integer('execution_time_ms').notNullable();
      table.timestamps(true, true);
    });
  }

  // Таблица сессий (для JWT refresh tokens)
  if (!(await db.schema.hasTable('user_sessions'))) {
    await db.schema.createTable('user_sessions', (table) => {
      table.uuid('id').primary();
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('refresh_token').notNullable();
      table.timestamp('expires_at').notNullable();
      table.timestamps(true, true);
    });
  }
}

// Функция для очистки старых сессий
export async function cleanupExpiredSessions() {
  await db('user_sessions')
    .where('expires_at', '<', new Date())
    .del();
}