# Personal Finance Manager

A full-stack personal finance management application built with Encore.ts and React.

## Setup

### 1. Set Clerk Secret Key

This application uses Clerk for authentication. Set the secret key:

```bash
encore secret set ClerkSecretKey sk_test_gjljQssAx3Ad1GfFHtD1gCvnf1AxbNHPBY6jzV8k9a
```

### 2. Verify Configuration

The Clerk publishable key is configured in `frontend/config.ts`:
```ts
export const clerkPublishableKey = "pk_test_c2luY2VyZS1tdXNrcmF0LTI2LmNsZXJrLmFjY291bnRzLmRldiQ";
```

### 3. Run Locally

The app runs automatically in Leap. Access it at the URL shown in your Leap environment.

## Features

- **Dashboard**: Overview of income, expenses, debts, and savings
- **Income & Expense Tracking**: Categorize and track all transactions
- **Debt Management**: Track debts and payment history
- **Savings Goals**: Set and monitor savings targets with progress tracking
- **Monthly Archives**: Close months and export historical data
- **Audit Logs**: Track all changes to financial data
- **Receipt Upload**: Attach receipts to transactions
- **Category Management**: Create custom income/expense categories

## Architecture

### Backend (Encore.ts)
- `auth/` - Clerk authentication handler
- `categories/` - Income/expense category management
- `transactions/` - Transaction CRUD and summary endpoints
- `debts/` - Debt tracking and payment recording
- `savings/` - Savings goals and contributions
- `archive/` - Monthly closing and data export
- `audit/` - Audit log tracking
- `storage/` - Object storage for receipts
- `db/` - PostgreSQL database and migrations

### Frontend (React + Tailwind)
- `pages/` - Main application pages
- `components/` - Reusable UI components
- `hooks/` - Custom hooks including `useBackend` for authenticated API calls
- `contexts/` - Theme context for dark/light mode

## Key Technologies

- **Backend**: Encore.ts, PostgreSQL, Clerk Auth
- **Frontend**: React, TypeScript, Tailwind CSS v4, shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Storage**: Encore Object Storage for receipts

## Database Schema

- `categories` - Income/expense categories
- `transactions` - All financial transactions
- `debts` - Debt tracking
- `debt_payments` - Debt payment history
- `saving_goals` - Savings targets
- `saving_transactions` - Savings contributions
- `monthly_archives` - Closed month summaries
- `audit_logs` - Change tracking

## Authentication Flow

1. Frontend uses Clerk for sign-in/sign-up
2. `useBackend` hook attaches JWT token to API requests
3. Backend verifies token using Clerk's `verifyToken`
4. User data stored in `AuthData` with userID and email
