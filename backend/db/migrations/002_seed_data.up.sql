-- Sample categories for demo user (user_demo_123)
INSERT INTO categories (user_id, name, type, is_fixed) VALUES
  ('user_demo_123', 'Salary', 'income', true),
  ('user_demo_123', 'Freelance', 'income', false),
  ('user_demo_123', 'Rent', 'expense', true),
  ('user_demo_123', 'Groceries', 'expense', false),
  ('user_demo_123', 'Utilities', 'expense', true),
  ('user_demo_123', 'Entertainment', 'expense', false),
  ('user_demo_123', 'Transport', 'expense', false),
  ('user_demo_123', 'Healthcare', 'expense', false);

-- Sample transactions across multiple months
INSERT INTO transactions (user_id, type, category_id, amount, description, date) VALUES
  -- January 2024
  ('user_demo_123', 'income', 1, 5000, 'Monthly salary', '2024-01-01'),
  ('user_demo_123', 'expense', 3, 1200, 'January rent', '2024-01-05'),
  ('user_demo_123', 'expense', 4, 450, 'Weekly groceries', '2024-01-10'),
  ('user_demo_123', 'expense', 5, 150, 'Electricity + Water', '2024-01-15'),
  ('user_demo_123', 'expense', 6, 80, 'Movie night', '2024-01-20'),
  
  -- February 2024
  ('user_demo_123', 'income', 1, 5000, 'Monthly salary', '2024-02-01'),
  ('user_demo_123', 'income', 2, 800, 'Website project', '2024-02-10'),
  ('user_demo_123', 'expense', 3, 1200, 'February rent', '2024-02-05'),
  ('user_demo_123', 'expense', 4, 500, 'Groceries', '2024-02-12'),
  ('user_demo_123', 'expense', 7, 120, 'Gas + Bus pass', '2024-02-18'),
  
  -- March 2024
  ('user_demo_123', 'income', 1, 5000, 'Monthly salary', '2024-03-01'),
  ('user_demo_123', 'expense', 3, 1200, 'March rent', '2024-03-05'),
  ('user_demo_123', 'expense', 4, 480, 'Groceries', '2024-03-10'),
  ('user_demo_123', 'expense', 8, 200, 'Doctor visit', '2024-03-15'),
  ('user_demo_123', 'expense', 6, 150, 'Concert tickets', '2024-03-22');

-- Sample debts
INSERT INTO debts (user_id, name, total_amount, paid_amount, date_taken, due_date) VALUES
  ('user_demo_123', 'Car Loan', 15000, 3000, '2023-06-01', '2026-06-01'),
  ('user_demo_123', 'Personal Loan', 5000, 1200, '2023-12-15', '2025-12-15');

-- Sample saving goals
INSERT INTO saving_goals (user_id, name, target_amount, saved_amount, start_date, target_date) VALUES
  ('user_demo_123', 'Emergency Fund', 10000, 2500, '2024-01-01', '2024-12-31'),
  ('user_demo_123', 'Vacation', 3000, 800, '2024-01-01', '2024-07-01');
