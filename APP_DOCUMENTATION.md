# Personal Finance Manager - Complete Application Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Technical Stack](#technical-stack)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Structure](#frontend-structure)
8. [Design System](#design-system)
9. [How It Was Built](#how-it-was-built)

---

## Overview

**Personal Finance Manager** is a full-stack web application designed to help users track and manage their personal finances. The application provides comprehensive tools for:

- **Income & Expense Tracking**: Record and categorize all financial transactions
- **Debt Management**: Track multiple debts with payment schedules and progress
- **Savings Goals**: Set and monitor progress toward financial goals
- **Monthly Archives**: Automatic monthly summaries with carryover balances
- **Audit Logging**: Complete history of all changes for transparency
- **Receipt Storage**: Upload and store transaction receipts

The application is built with **Encore.ts** on the backend and **React + TypeScript** on the frontend, providing a modern, type-safe, and scalable solution.

---

## Architecture

### Backend (Encore.ts)
- **Framework**: Encore.ts v1.50.4
- **Language**: TypeScript
- **Database**: PostgreSQL (managed by Encore)
- **Object Storage**: Encore's built-in object storage for receipts
- **Authentication**: Clerk authentication
- **Deployment**: Automatic deployment with Encore Platform

### Frontend (React)
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Component Library**: shadcn/ui
- **Icons**: Lucide React
- **Data Fetching**: Auto-generated type-safe client from backend

### Key Architectural Decisions

1. **Type-Safe API Communication**: Encore.ts automatically generates TypeScript types from backend APIs, ensuring frontend-backend type safety
2. **Service-Oriented Architecture**: Backend is organized into modular services (transactions, debts, savings, etc.)
3. **Database Transactions**: All critical operations use database transactions for data consistency
4. **Audit Trail**: Every data modification is logged for accountability
5. **Automatic Archiving**: Cron job runs monthly to archive financial data

---

## Features

### 1. Authentication & Authorization
- **Provider**: Clerk
- **Features**:
  - Secure user signup/login
  - Session management
  - Protected API endpoints
  - User-scoped data access

### 2. Dashboard
The main overview page displays:
- Total income for current month
- Total expenses for current month
- Net balance (income - expenses)
- Active debts summary
- Savings goals progress
- Recent transactions
- Category breakdown sidebar

### 3. Income Management
**Capabilities**:
- Create income transactions with amount, source, date, category
- Upload receipts (stored in object storage)
- List/filter income by date range, category
- Edit existing income records
- Delete income transactions
- View monthly income summaries

**Transaction Types**:
- Salary
- Freelance income
- Investment returns
- Gifts
- Other income
- Carryover from previous month (automatic)

### 4. Expense Management
**Capabilities**:
- Create expense transactions with detailed information
- Categorize expenses (housing, food, utilities, etc.)
- Upload multiple receipts per transaction
- Filter and search expenses
- Edit/delete expenses
- Monthly expense summaries

**Expense Categories** (default):
- Housing, Transportation, Food & Dining
- Utilities, Healthcare, Entertainment
- Shopping, Education, Insurance
- Debt Payments, Savings, Other

### 5. Category Management
**Features**:
- Create custom categories
- Assign categories to income/expenses
- Edit category names
- Delete unused categories
- Category-based financial analysis
- Visual category breakdown in sidebar

**Category Types**:
- Income categories
- Expense categories

### 6. Debt Tracking
**Debt Information Tracked**:
- Creditor name
- Original amount
- Current balance
- Interest rate
- Minimum payment
- Due date
- Payment history
- Status (active/paid off)

**Debt Management**:
- Add new debts
- Record payments (auto-updates balance)
- View payment history
- Track payoff progress
- Calculate remaining balance
- Update debt details
- Delete debts

### 7. Savings Goals
**Goal Features**:
- Set target amount and date
- Track current amount
- Add contributions
- Make withdrawals
- View contribution history
- Progress visualization
- Priority levels

**Goal Operations**:
- Create savings goal
- Add contribution
- Withdraw from goal
- Update goal details
- Delete goal
- View all goals

### 8. Monthly Archives
**Automatic Archiving**:
- Cron job runs on 1st of each month at 00:01
- Archives previous month's data
- Calculates monthly totals
- Creates carryover transaction for next month

**Archive Contents**:
- Total income
- Total expenses
- Total savings contributions
- Remaining debt balances
- Carryover in (from previous month)
- Carryover out (to next month)
- Net balance

**Archive Operations**:
- View all archives (sorted by date)
- Delete archive (removes carryover transaction)
- Regenerate archive (recalculates with current data)
- Export archive data
- Manual archive creation

### 9. Audit Log
**Logged Events**:
- Transaction creation/update/delete
- Category changes
- Debt modifications
- Savings goal changes
- Payment records
- Archive operations

**Audit Information**:
- User ID
- Entity type (transaction, debt, saving, etc.)
- Entity ID
- Action (create, update, delete)
- Changes (before/after values in JSON)
- Timestamp

**Audit Features**:
- View complete audit trail
- Filter by date, entity type, action
- Search audit logs
- Export audit data

### 10. Receipt Management
**Storage**:
- Encore.ts Object Storage
- Secure file upload
- Image files (PNG, JPG, etc.)

**Operations**:
- Upload receipt for transaction
- View uploaded receipts
- Download receipt files
- Link multiple receipts to one transaction

---

## Technical Stack

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Encore.ts | 1.50.4 | Backend framework |
| TypeScript | 5.8.3 | Programming language |
| PostgreSQL | Latest | Database |
| Clerk | Latest | Authentication |
| Node.js | 22.20.0 | Runtime environment |

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Programming language |
| Vite | Latest | Build tool |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | Latest | Component library |
| Lucide React | Latest | Icons |
| React Query | Latest | Data fetching |

### Development Tools
- **Package Manager**: npm (or Bun)
- **Version Control**: Git
- **Code Editor**: Any (VS Code recommended)
- **API Testing**: Built-in Encore Local Development Dashboard

---

## Database Schema

### Tables

#### 1. **users** (managed by Clerk)
- Clerk handles user authentication
- User data synced via Clerk webhooks

#### 2. **categories**
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'income' or 'expense'
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. **transactions**
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'income', 'expense', 'carryover'
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. **receipts**
```sql
CREATE TABLE receipts (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. **debts**
```sql
CREATE TABLE debts (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  creditor TEXT NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  interest_rate DECIMAL(5, 2),
  minimum_payment DECIMAL(12, 2),
  due_date INTEGER, -- day of month
  status TEXT DEFAULT 'active', -- 'active' or 'paid'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 6. **debt_payments**
```sql
CREATE TABLE debt_payments (
  id SERIAL PRIMARY KEY,
  debt_id INTEGER REFERENCES debts(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  payment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 7. **saving_goals**
```sql
CREATE TABLE saving_goals (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) DEFAULT 0,
  target_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 8. **saving_transactions**
```sql
CREATE TABLE saving_transactions (
  id SERIAL PRIMARY KEY,
  saving_id INTEGER REFERENCES saving_goals(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  type TEXT NOT NULL, -- 'contribution' or 'withdrawal'
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 9. **monthly_archives**
```sql
CREATE TABLE monthly_archives (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_income DECIMAL(12, 2) NOT NULL,
  total_expenses DECIMAL(12, 2) NOT NULL,
  total_savings DECIMAL(12, 2) NOT NULL,
  debts_remaining DECIMAL(12, 2) NOT NULL,
  carryover_in DECIMAL(12, 2) DEFAULT 0,
  carryover_out DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);
```

#### 10. **audit_logs**
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### Authentication Service (`/auth`)
All endpoints require Clerk authentication token in headers.

### Transactions Service (`/transactions`)
- `POST /transactions` - Create transaction
- `GET /transactions` - List transactions (with filters)
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction
- `GET /transactions/summary` - Monthly summary
- `POST /transactions/:id/upload-receipt` - Upload receipt

### Categories Service (`/categories`)
- `GET /categories` - List all categories
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Debts Service (`/debts`)
- `GET /debts` - List all debts
- `POST /debts` - Create debt
- `PUT /debts/:id` - Update debt
- `DELETE /debts/:id` - Delete debt
- `POST /debts/:id/payments` - Add payment
- `GET /debts/:id/payments` - List payments

### Savings Service (`/savings`)
- `GET /savings` - List all savings goals
- `POST /savings` - Create goal
- `PUT /savings/:id` - Update goal
- `DELETE /savings/:id` - Delete goal
- `POST /savings/:id/contribute` - Add contribution
- `POST /savings/:id/withdraw` - Withdraw funds

### Archive Service (`/archives`)
- `GET /archives` - List all archives
- `POST /archives/close` - Manually close month
- `DELETE /archives/:id` - Delete archive
- `POST /archives/:id/regenerate` - Regenerate archive
- `GET /archives/:id/export` - Export archive data

### Audit Service (`/audit`)
- `GET /audit/list` - View audit logs
- `POST /audit/log` - Internal logging endpoint

---

## Frontend Structure

### Pages
```
frontend/pages/
├── Dashboard.tsx       # Main overview
├── Income.tsx          # Income transactions
├── Expenses.tsx        # Expense transactions
├── Debts.tsx           # Debt tracking
├── Savings.tsx         # Savings goals
├── Archive.tsx         # Monthly archives
└── Settings.tsx        # User settings
```

### Components
```
frontend/components/
├── Layout.tsx                    # Main app layout
├── CategorySidebar.tsx           # Category breakdown
├── TransactionList.tsx           # Reusable transaction table
├── TransactionDialog.tsx         # Add/edit transaction
├── DebtList.tsx                  # Debt cards
├── DebtDialog.tsx                # Add/edit debt
├── DebtPaymentDialog.tsx         # Record payment
├── SavingGoalList.tsx            # Goals display
├── SavingGoalDialog.tsx          # Add/edit goal
├── SavingContributionDialog.tsx  # Add contribution
├── CategoryManagement.tsx        # Category CRUD
├── CategoryDialog.tsx            # Add/edit category
├── CloseMonthDialog.tsx          # Month closing
├── ArchiveList.tsx               # Archive display
├── AuditLog.tsx                  # Audit log viewer
└── ui/                           # shadcn/ui components
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── select.tsx
    ├── table.tsx
    └── ... (other UI components)
```

### Hooks
```
frontend/hooks/
└── useBackend.ts      # Backend API wrapper with error handling
```

### Contexts
```
frontend/contexts/
└── ThemeContext.tsx   # Theme management (dark/light mode)
```

---

## Design System

### Color Palette (Dark Mode)
```css
--background: #0a0a0a;
--foreground: #fafafa;
--card: #18181b;
--card-foreground: #fafafa;
--primary: #3b82f6;
--primary-foreground: #ffffff;
--secondary: #27272a;
--secondary-foreground: #fafafa;
--muted: #3f3f46;
--muted-foreground: #a1a1aa;
--accent: #6366f1;
--destructive: #ef4444;
--destructive-foreground: #fafafa;
--border: #27272a;
--ring: #3b82f6;
```

### Typography
- **Font Family**: System font stack (sans-serif)
- **Headings**: Bold weight, larger sizes
- **Body**: Normal weight, base size
- **Labels**: Medium weight, small size

### Spacing
- **Page Padding**: 24-32px
- **Card Padding**: 16-24px
- **Component Gaps**: 8-16px
- **Section Gaps**: 24-32px

### Components

#### Buttons
- **Primary**: Blue background, white text
- **Secondary**: Outlined, transparent background
- **Destructive**: Red background
- **Ghost**: Transparent with hover
- **Sizes**: Small, default, large

#### Cards
- **Background**: Surface color (`bg-card`)
- **Border**: Subtle border
- **Radius**: 8px (rounded-lg)
- **Shadow**: Subtle elevation

#### Forms
- **Inputs**: Border with focus ring, 40px height
- **Selects**: Custom styled dropdown
- **Labels**: Above inputs, medium weight
- **Validation**: Red error messages below fields

#### Tables
- **Header**: Bold text, border bottom
- **Rows**: Hover state, alternating colors (optional)
- **Actions**: Icon buttons in last column

#### Dialogs/Modals
- **Overlay**: Semi-transparent backdrop
- **Content**: Centered card, max-width
- **Header**: Title + close button
- **Footer**: Action buttons (Cancel + Confirm)

### Animations
- **Page Transitions**: 150-200ms fade
- **Dialog Open/Close**: 200ms scale + fade
- **Hover Effects**: 100ms color change
- **Loading**: Pulse/spin animations

---

## How It Was Built

### Development Process

#### Phase 1: Planning & Architecture
1. **Requirements Gathering**
   - Identified core features (transactions, debts, savings)
   - Defined user workflows
   - Sketched UI mockups

2. **Technology Selection**
   - Chose Encore.ts for type-safe backend with built-in infrastructure
   - Selected React + TypeScript for frontend
   - Decided on Clerk for authentication
   - Picked Tailwind CSS + shadcn/ui for modern UI

3. **Database Design**
   - Designed normalized schema
   - Defined relationships between entities
   - Planned for audit logging and archiving

#### Phase 2: Backend Development

1. **Project Setup**
   - Created Encore.ts project
   - Set up PostgreSQL database
   - Configured Clerk authentication

2. **Database Migrations**
   - Created initial schema migration (`001_create_tables.up.sql`)
   - Added seed data migration (`002_seed_data.up.sql`)
   - Defined all tables and relationships

3. **Service Implementation**
   - **Transactions Service**: CRUD operations, summary calculations, receipt uploads
   - **Categories Service**: Category management with user scope
   - **Debts Service**: Debt tracking with payment history
   - **Savings Service**: Goals with contributions/withdrawals
   - **Archive Service**: Monthly closing with carryover, automatic archiving cron job
   - **Audit Service**: Logging all data changes

4. **Key Backend Features**
   - Database transactions for data consistency
   - Type-safe API definitions with Encore.ts
   - Error handling with appropriate HTTP status codes
   - User authentication on all endpoints
   - Object storage for receipt files
   - Cron job for automatic monthly archiving

#### Phase 3: Frontend Development

1. **Project Setup**
   - Created Vite + React + TypeScript project
   - Installed Tailwind CSS v4
   - Set up shadcn/ui components
   - Configured auto-generated backend client

2. **Layout & Navigation**
   - Built main layout with sidebar navigation
   - Created theme context for dark/light mode
   - Implemented responsive design

3. **Page Implementation**
   - **Dashboard**: Summary cards, recent transactions, category breakdown
   - **Income/Expenses**: Transaction lists with filters, add/edit dialogs
   - **Debts**: Debt cards, payment recording, history
   - **Savings**: Goal cards with progress bars, contributions
   - **Archive**: Archive list, close month dialog, export
   - **Settings**: User preferences, category management

4. **Component Development**
   - Reusable dialog components for CRUD operations
   - Transaction list component with sorting/filtering
   - Category sidebar for visual breakdown
   - Form components with validation
   - Loading states and error handling

5. **State Management**
   - Used React Query for server state
   - Local state for UI interactions
   - Context for theme management

#### Phase 4: Integration

1. **Type-Safe API Calls**
   - Imported auto-generated backend client
   - Connected all frontend components to backend APIs
   - Ensured type safety across frontend-backend boundary

2. **Error Handling**
   - Toast notifications for user feedback
   - Error messages for failed operations
   - Loading indicators during async operations

3. **Receipt Upload**
   - File input component
   - Upload to object storage
   - Display uploaded receipts

#### Phase 5: Enhancements

1. **Automatic Archiving**
   - Created cron job to run monthly
   - Archives previous month automatically
   - Creates carryover transactions

2. **Archive Management**
   - Delete archive functionality
   - Regenerate archive with current data
   - Export archive data

3. **Audit Trail**
   - Implemented comprehensive logging
   - Created audit log viewer
   - Filtered audit queries

4. **UI Polish**
   - Refined animations and transitions
   - Improved responsive design
   - Enhanced accessibility

#### Phase 6: Testing & Deployment

1. **Local Testing**
   - Tested all CRUD operations
   - Verified database transactions
   - Checked authentication flows
   - Tested cron job execution

2. **Deployment**
   - Deployed backend to Encore Cloud
   - Frontend automatically built and deployed
   - Set production Clerk keys
   - Verified production functionality

### Key Development Decisions

1. **Why Encore.ts?**
   - Built-in infrastructure (database, object storage, cron)
   - Type-safe API with automatic client generation
   - Simplified deployment and scaling
   - Great developer experience

2. **Why React + TypeScript?**
   - Strong typing for reliability
   - Large ecosystem and community
   - Excellent tooling and IDE support
   - Component reusability

3. **Why Tailwind CSS + shadcn/ui?**
   - Rapid UI development
   - Consistent design system
   - Customizable components
   - No CSS file management

4. **Why Clerk?**
   - Easy authentication setup
   - Secure user management
   - Great developer experience
   - Built-in UI components

### Challenges Overcome

1. **Database Transactions**: Ensured data consistency with proper transaction handling
2. **Carryover Logic**: Implemented automatic carryover between months with proper cleanup
3. **Type Safety**: Maintained type safety across frontend-backend boundary
4. **Audit Logging**: Captured all data changes without performance impact
5. **Cron Job**: Scheduled automatic archiving for all users

### Future Improvements

1. **Data Visualization**: Add charts and graphs for spending trends
2. **Budgeting**: Set monthly budgets per category with alerts
3. **Recurring Transactions**: Automate recurring income/expenses
4. **Reports**: Generate detailed financial reports (PDF)
5. **Mobile App**: Native iOS/Android apps
6. **Notifications**: Email/push notifications for due dates
7. **Multi-Currency**: Support multiple currencies
8. **Data Export**: Export to CSV, Excel, QuickBooks
9. **Bank Integration**: Connect to bank accounts via Plaid
10. **AI Insights**: ML-powered spending insights and recommendations

---

## Conclusion

This Personal Finance Manager application demonstrates a modern, full-stack TypeScript application built with Encore.ts and React. The application provides comprehensive financial management features with a clean, intuitive UI and robust backend infrastructure.

The use of Encore.ts significantly simplified backend development by providing built-in infrastructure, type-safe APIs, and automatic deployment. Combined with React and Tailwind CSS on the frontend, the development process was efficient and the result is a maintainable, scalable application.

**Author**: Built by Leap AI Assistant  
**Created**: January 2025  
**License**: MIT
