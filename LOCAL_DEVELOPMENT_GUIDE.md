# Local Development Guide - Personal Finance Manager

This guide provides complete instructions for setting up and running the Personal Finance Manager application on your local laptop.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Running the Application](#running-the-application)
4. [Project Structure](#project-structure)
5. [Environment Configuration](#environment-configuration)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Development Workflow](#development-workflow)
8. [Testing](#testing)
9. [Deployment](#deployment)

---

## Prerequisites

Before you begin, ensure you have the following installed on your laptop:

### Required Software

1. **Node.js** (v20.0.0 or higher)
   - Download: https://nodejs.org/
   - Verify installation:
     ```bash
     node --version
     # Should show: v20.x.x or higher
     ```

2. **npm** (comes with Node.js)
   - Verify installation:
     ```bash
     npm --version
     # Should show: 10.x.x or higher
     ```

3. **Git**
   - Download: https://git-scm.com/downloads
   - Verify installation:
     ```bash
     git --version
     # Should show: git version 2.x.x
     ```

4. **Encore CLI**
   - Installation instructions below

### Optional (but recommended)

5. **Bun** (faster package manager - optional)
   - Download: https://bun.sh/
   - Verify installation:
     ```bash
     bun --version
     # Should show: 1.x.x
     ```

6. **VS Code** (recommended code editor)
   - Download: https://code.visualstudio.com/

---

## Installation Steps

### Step 1: Install Encore CLI

Encore CLI is required to run the backend locally.

**On macOS/Linux:**
```bash
curl -L https://encore.dev/install.sh | bash
```

**On Windows (PowerShell as Administrator):**
```powershell
iwr https://encore.dev/install.ps1 | iex
```

**Verify installation:**
```bash
encore version
# Should show: encore version v1.50.4 or higher
```

### Step 2: Clone the Repository

Clone the project from GitHub to your local machine:

```bash
# Clone the repository
git clone https://github.com/husseinoday1/Myfi3.git

# Navigate into the project directory
cd Myfi3
```

### Step 3: Install Dependencies

Install all required packages for both backend and frontend:

**Using npm:**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

**Using Bun (faster alternative):**
```bash
# Install root dependencies
bun install

# Install backend dependencies
cd backend
bun install

# Install frontend dependencies
cd ../frontend
bun install

# Return to root directory
cd ..
```

### Step 4: Link the Encore Application

Link your local project to the Encore Platform (required for secrets management):

```bash
# Navigate to backend directory
cd backend

# Link the app
encore app link

# Follow the prompts:
# 1. Select "Link to existing app" if asked
# 2. Choose your app from the list (or create new)
# 3. Confirm the link
```

You should see:
```
✓ Successfully linked app to encore-app-id
```

### Step 5: Set Up Clerk Authentication

You need to configure Clerk for authentication:

#### Option A: Development Mode (Quick Start)
Encore provides development Clerk keys automatically. Skip to Step 6.

#### Option B: Your Own Clerk Account (Recommended for Production)

1. **Create Clerk Account**:
   - Go to https://clerk.com/
   - Sign up for a free account
   - Create a new application

2. **Get Clerk Secret Key**:
   - In Clerk Dashboard, go to "API Keys"
   - Copy the "Secret Key" (starts with `sk_`)

3. **Set the Secret in Encore**:
   ```bash
   # In the backend directory
   encore secret set --type local ClerkSecretKey
   
   # Paste your Clerk secret key when prompted
   ```

4. **Get Clerk Publishable Key**:
   - In Clerk Dashboard, copy the "Publishable Key" (starts with `pk_`)
   
5. **Update Frontend Config**:
   - Open `frontend/config.ts`
   - Replace the `clerkPublishableKey` value with your key

### Step 6: Initialize the Database

Encore automatically creates and migrates the database when you first run the app. The migrations are in:
- `backend/db/migrations/001_create_tables.up.sql`
- `backend/db/migrations/002_seed_data.up.sql`

No manual database setup is required!

---

## Running the Application

### Start the Development Server

From the **backend** directory, run:

```bash
cd backend
encore run
```

**What happens:**
1. Encore CLI starts the backend server
2. Database is created and migrated (first time only)
3. Backend API is available at `http://localhost:4000`
4. Frontend is built and served
5. Encore Local Development Dashboard opens automatically

**You should see:**
```
✓ Building Encore application graph
✓ Installing node_modules
✓ Analyzing service structure
✓ Compiling application
✓ Starting application

API Server running on http://localhost:4000
Encore Local Dev Dashboard: http://localhost:9400
```

### Access the Application

Once running, you can access:

- **Frontend Application**: http://localhost:4000
- **API Endpoints**: http://localhost:4000/api/*
- **Local Dev Dashboard**: http://localhost:9400
  - View API endpoints
  - Test API calls
  - Monitor database
  - View traces and logs

---

## Project Structure

```
Myfi3/
├── backend/                    # Backend (Encore.ts)
│   ├── archive/                # Monthly archive service
│   │   ├── encore.service.ts   # Service definition
│   │   ├── auto_close.ts       # Automatic monthly archiving cron
│   │   ├── close_month.ts      # Manual close month endpoint
│   │   ├── delete.ts           # Delete archive endpoint
│   │   ├── regenerate.ts       # Regenerate archive endpoint
│   │   ├── list.ts             # List archives endpoint
│   │   ├── export.ts           # Export archive endpoint
│   │   └── types.ts            # TypeScript types
│   ├── audit/                  # Audit logging service
│   │   ├── encore.service.ts
│   │   ├── log.ts              # Log audit events
│   │   ├── list.ts             # List audit logs
│   │   └── types.ts
│   ├── auth/                   # Authentication service
│   │   ├── encore.service.ts
│   │   └── auth.ts             # Clerk auth middleware
│   ├── categories/             # Category management service
│   │   ├── encore.service.ts
│   │   ├── create.ts
│   │   ├── list.ts
│   │   ├── update.ts
│   │   ├── delete.ts
│   │   └── types.ts
│   ├── db/                     # Database
│   │   ├── index.ts            # Database connection
│   │   └── migrations/
│   │       ├── 001_create_tables.up.sql
│   │       └── 002_seed_data.up.sql
│   ├── debts/                  # Debt tracking service
│   │   ├── encore.service.ts
│   │   ├── create.ts
│   │   ├── list.ts
│   │   ├── update.ts
│   │   ├── delete.ts
│   │   ├── add_payment.ts
│   │   ├── list_payments.ts
│   │   └── types.ts
│   ├── frontend/               # Frontend service (serves React app)
│   │   └── encore.service.ts
│   ├── savings/                # Savings goals service
│   │   ├── encore.service.ts
│   │   ├── create.ts
│   │   ├── list.ts
│   │   ├── update.ts
│   │   ├── delete.ts
│   │   ├── add_contribution.ts
│   │   ├── withdraw.ts
│   │   └── types.ts
│   ├── storage/                # Object storage for receipts
│   │   └── index.ts
│   ├── transactions/           # Transaction service
│   │   ├── encore.service.ts
│   │   ├── create.ts
│   │   ├── list.ts
│   │   ├── update.ts
│   │   ├── delete.ts
│   │   ├── summary.ts
│   │   ├── upload_receipt.ts
│   │   └── types.ts
│   ├── encore.app              # Encore app configuration
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Frontend (React)
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── Layout.tsx
│   │   ├── TransactionList.tsx
│   │   ├── DebtList.tsx
│   │   └── ... (other components)
│   ├── pages/                  # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Income.tsx
│   │   ├── Expenses.tsx
│   │   ├── Debts.tsx
│   │   ├── Savings.tsx
│   │   ├── Archive.tsx
│   │   └── Settings.tsx
│   ├── hooks/
│   │   └── useBackend.ts       # Backend API hooks
│   ├── contexts/
│   │   └── ThemeContext.tsx    # Theme management
│   ├── App.tsx                 # Main app component
│   ├── AppInner.tsx            # App inner component
│   ├── config.ts               # Configuration
│   ├── client.ts               # API client
│   ├── index.css               # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── APP_DOCUMENTATION.md        # Complete app documentation
├── LOCAL_DEVELOPMENT_GUIDE.md  # This file
├── README.md                   # Project readme
└── package.json                # Root package.json
```

---

## Environment Configuration

### Backend Configuration

Backend configuration is managed through Encore:

**Secrets** (sensitive values):
```bash
# Set local secrets
encore secret set --type local ClerkSecretKey

# Set production secrets
encore secret set --type production ClerkSecretKey
```

**Database**:
- Automatically managed by Encore
- No manual configuration needed
- Migrations run automatically

**Object Storage**:
- Automatically managed by Encore
- Files stored in `.encore/storage/` locally

### Frontend Configuration

Frontend configuration is in `frontend/config.ts`:

```typescript
export const config = {
  // Clerk publishable key for authentication
  clerkPublishableKey: "pk_test_...",
  
  // API base URL (automatically set by Encore)
  apiBaseUrl: import.meta.env.VITE_API_URL || "http://localhost:4000",
};
```

**Environment Variables** (optional):
Create `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:4000
```

---

## Common Issues & Solutions

### Issue 1: "encore: command not found"

**Problem**: Encore CLI not installed or not in PATH

**Solution**:
```bash
# Re-install Encore CLI
# macOS/Linux:
curl -L https://encore.dev/install.sh | bash

# Windows:
iwr https://encore.dev/install.ps1 | iex

# Restart your terminal
```

### Issue 2: "installing node_modules failed"

**Problem**: Package manager not found or failed

**Solution**:
```bash
# Navigate to backend directory
cd backend

# Manually install dependencies
npm install

# If using Bun, ensure it's in PATH
# On Windows, add Bun to PATH environment variable
```

### Issue 3: "app is not linked with the Encore Platform"

**Problem**: App not linked to Encore

**Solution**:
```bash
cd backend
encore app link
# Follow the prompts to link your app
```

### Issue 4: "Failed to connect to database"

**Problem**: Database not initialized or port conflict

**Solution**:
```bash
# Stop any existing Encore processes
encore daemon stop

# Clear Encore cache
rm -rf .encore/

# Restart Encore
encore run
```

### Issue 5: "Clerk authentication error"

**Problem**: Clerk secret not set or invalid

**Solution**:
```bash
# Check if secret is set
encore secret list

# Set or update the secret
encore secret set --type local ClerkSecretKey

# For development, you can use Clerk's development keys
# (shown in warning when starting the app)
```

### Issue 6: Port 4000 already in use

**Problem**: Another application using port 4000

**Solution**:
```bash
# On macOS/Linux:
lsof -ti:4000 | xargs kill -9

# On Windows (PowerShell):
Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process

# Or change the port in encore.app (not recommended)
```

### Issue 7: Build errors in frontend

**Problem**: Frontend dependencies missing or incompatible

**Solution**:
```bash
cd frontend

# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Or with Bun
rm -rf node_modules
bun install
```

---

## Development Workflow

### Making Changes

1. **Backend Changes**:
   - Edit files in `backend/` directory
   - Encore hot-reloads automatically
   - Check Local Dev Dashboard for errors

2. **Frontend Changes**:
   - Edit files in `frontend/` directory
   - Vite hot-reloads automatically
   - Changes appear immediately in browser

3. **Database Changes**:
   - Create new migration file in `backend/db/migrations/`
   - Name format: `003_description.up.sql`
   - Encore applies migration on next run

### Adding a New API Endpoint

**Example: Add a new endpoint to list transactions by category**

1. Create new file `backend/transactions/list_by_category.ts`:

```typescript
import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { Transaction } from "./types";

export interface ListByCategoryRequest {
  categoryId: number;
}

export interface ListByCategoryResponse {
  transactions: Transaction[];
}

// Retrieves transactions for a specific category.
export const listByCategory = api<ListByCategoryRequest, ListByCategoryResponse>(
  { auth: true, expose: true, method: "GET", path: "/transactions/category/:categoryId" },
  async (req) => {
    const auth = getAuthData()!;
    
    const rows = await db.queryAll`
      SELECT * FROM transactions
      WHERE user_id = ${auth.userID}
        AND category_id = ${req.categoryId}
      ORDER BY date DESC
    `;
    
    return { transactions: rows };
  }
);
```

2. The endpoint is automatically available at:
   - Backend: `http://localhost:4000/transactions/category/:categoryId`
   - Frontend can call it via `backend.transactions.listByCategory({ categoryId: 1 })`

3. TypeScript types are automatically generated and available in frontend

### Using the Local Dev Dashboard

Access at http://localhost:9400

**Features**:
- **API Explorer**: Test all endpoints with request/response examples
- **Service Map**: Visualize service dependencies
- **Database Browser**: Query database directly
- **Trace Explorer**: Debug API calls with detailed traces
- **Logs**: View all application logs in real-time

**Testing an Endpoint**:
1. Open Local Dev Dashboard
2. Click "API Explorer"
3. Select an endpoint
4. Fill in request parameters
5. Click "Send Request"
6. View response and trace details

---

## Testing

### Manual Testing

1. **Start the application**:
   ```bash
   cd backend
   encore run
   ```

2. **Test in browser**:
   - Navigate to http://localhost:4000
   - Sign up / Log in with Clerk
   - Test all features manually

3. **Test with Local Dev Dashboard**:
   - Open http://localhost:9400
   - Use API Explorer to test endpoints
   - Check database state

### Automated Testing (Future)

To add tests using Vitest:

```bash
# Install vitest
npm install -D vitest

# Add test script to package.json
"scripts": {
  "test": "vitest"
}

# Run tests
npm test
```

---

## Deployment

### Deploy to Production

Encore makes deployment simple:

1. **Prepare for Production**:
   ```bash
   # Set production Clerk secret
   encore secret set --type production ClerkSecretKey
   
   # Commit your changes
   git add .
   git commit -m "Ready for production"
   git push
   ```

2. **Deploy via Encore Cloud**:
   ```bash
   # Deploy from command line
   encore deploy production
   ```

   Or use Encore's GitHub integration for automatic deployments on push.

3. **Access Production**:
   - Backend API: `https://your-app-id.api.encoreapi.com`
   - Frontend: `https://your-app-id.encoreapp.com`

### Deploy to Your Own Cloud (AWS, GCP, Azure)

Encore can deploy to any cloud provider:

1. **Connect Cloud Provider**:
   - Go to Encore Dashboard
   - Navigate to "Infrastructure"
   - Connect your cloud account (AWS/GCP/Azure)

2. **Deploy**:
   ```bash
   encore deploy production --cloud=aws
   ```

Encore will provision all infrastructure automatically.

---

## Additional Resources

### Documentation
- **Encore.ts Docs**: https://encore.dev/docs
- **React Docs**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Clerk Docs**: https://clerk.com/docs

### Support
- **Encore Discord**: https://encore.dev/discord
- **GitHub Issues**: https://github.com/husseinoday1/Myfi3/issues
- **Encore Support**: support@encore.dev

### Useful Commands

```bash
# Start development server
encore run

# View logs
encore logs

# Access database
encore db shell

# Run migrations
encore db migrate

# Generate API client
encore gen client

# Stop Encore daemon
encore daemon stop

# Update Encore CLI
encore update

# View app info
encore app info

# List secrets
encore secret list

# View traces
encore trace list
```

---

## Getting Help

If you encounter any issues not covered in this guide:

1. **Check Encore Logs**:
   ```bash
   encore logs
   ```

2. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for JavaScript errors

3. **Check Local Dev Dashboard**:
   - View traces for failed API calls
   - Check database state

4. **Ask for Help**:
   - Encore Discord: https://encore.dev/discord
   - Stack Overflow: Tag questions with `encore`
   - GitHub Issues: https://github.com/husseinoday1/Myfi3/issues

---

## Summary

**To run the app locally:**

```bash
# 1. Install prerequisites (Node.js, Encore CLI)
# 2. Clone repository
git clone https://github.com/husseinoday1/Myfi3.git
cd Myfi3

# 3. Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# 4. Link app
cd backend
encore app link

# 5. Set Clerk secret (optional for dev)
encore secret set --type local ClerkSecretKey

# 6. Run the app
encore run

# 7. Open browser
# Frontend: http://localhost:4000
# Dev Dashboard: http://localhost:9400
```

**That's it! You're ready to develop.**

---

**Happy Coding! 🚀**
