-- Users are managed by Clerk auth, so we only store user_id references

CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  is_fixed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name, type)
);

CREATE INDEX idx_categories_user_id ON categories(user_id);

CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'carryover')),
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  amount DOUBLE PRECISION NOT NULL CHECK (amount > 0),
  description TEXT,
  date DATE NOT NULL,
  receipt_file TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);

CREATE TABLE debts (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  total_amount DOUBLE PRECISION NOT NULL CHECK (total_amount > 0),
  paid_amount DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid', 'cancelled')),
  date_taken DATE NOT NULL,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_debts_user_id ON debts(user_id);

CREATE TABLE debt_payments (
  id BIGSERIAL PRIMARY KEY,
  debt_id BIGINT NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  transaction_id BIGINT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  amount DOUBLE PRECISION NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_debt_payments_debt_id ON debt_payments(debt_id);

CREATE TABLE saving_goals (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  target_amount DOUBLE PRECISION NOT NULL CHECK (target_amount > 0),
  saved_amount DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (saved_amount >= 0),
  start_date DATE NOT NULL,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saving_goals_user_id ON saving_goals(user_id);

CREATE TABLE saving_transactions (
  id BIGSERIAL PRIMARY KEY,
  saving_id BIGINT NOT NULL REFERENCES saving_goals(id) ON DELETE CASCADE,
  transaction_id BIGINT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  amount DOUBLE PRECISION NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saving_transactions_saving_id ON saving_transactions(saving_id);

CREATE TABLE monthly_archives (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2000),
  total_income DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_expenses DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_savings DOUBLE PRECISION NOT NULL DEFAULT 0,
  debts_remaining DOUBLE PRECISION NOT NULL DEFAULT 0,
  carryover_in DOUBLE PRECISION NOT NULL DEFAULT 0,
  carryover_out DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

CREATE INDEX idx_monthly_archives_user_id ON monthly_archives(user_id);

CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id BIGINT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  payload_before JSONB,
  payload_after JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
