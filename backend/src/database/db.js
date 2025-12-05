import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Na Vercel, usar /tmp (único diretório writable)
// Em desenvolvimento local, usar diretório do projeto
const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel 
  ? '/tmp/database.sqlite'
  : path.join(__dirname, '../../database.sqlite');

const db = new Database(dbPath);

// Criar tabela batches
db.exec(`
  CREATE TABLE IF NOT EXISTS batches (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    total_leads INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'error')),
    sucessos INTEGER DEFAULT 0,
    erros TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Criar tabela leads
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id TEXT NOT NULL,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    empresa TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'error')),
    error_message TEXT,
    sent_at DATETIME,
    FOREIGN KEY (batch_id) REFERENCES batches(id)
  )
`);

// Criar índices para melhor performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_leads_batch_id ON leads(batch_id);
  CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
  CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
`);

export default db;

