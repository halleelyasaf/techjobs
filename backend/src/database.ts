import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'techjobs.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db: DatabaseType = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
  -- Users table for OAuth
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    google_id TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    picture TEXT,
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL
  );

  -- Saved jobs with user association
  CREATE TABLE IF NOT EXISTS saved_jobs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    category TEXT,
    city TEXT,
    url TEXT NOT NULL,
    level TEXT,
    size TEXT,
    job_category TEXT,
    applied INTEGER DEFAULT 0,
    applied_date TEXT,
    comments TEXT,
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, url)
  );

  -- Companies metadata
  CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    founded_year TEXT,
    headquarters TEXT,
    growth_summary TEXT,
    similar_companies TEXT,
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL
  );

  -- Sessions table for express-session
  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expire INTEGER NOT NULL
  );

  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
  CREATE INDEX IF NOT EXISTS idx_saved_jobs_url ON saved_jobs(url);
  CREATE INDEX IF NOT EXISTS idx_saved_jobs_company ON saved_jobs(company);
  CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
  CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);
`);

export default db;
