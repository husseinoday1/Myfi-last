# Running Locally on Your Laptop

## Prerequisites

1. **Install Encore CLI:**
   - **macOS:** `brew install encoredev/tap/encore`
   - **Linux:** `curl -L https://encore.dev/install.sh | bash`
   - **Windows:** `iwr https://encore.dev/install.ps1 | iex`

2. **Install Bun:**
   ```bash
   npm install -g bun
   ```

## Setup Steps

### 1. Clone/Download the Project
Download the project to your laptop.

### 2. Set Clerk Secret
In the project root, run:
```bash
encore secret set --type local ClerkSecretKey sk_test_gjljQssAx3Ad1GfFHtD1gCvnf1AxbNHPBY6jzV8k9a
```

### 3. Update Clerk Authorized Domain
In Clerk Dashboard (https://dashboard.clerk.com):
- Go to your application → **Domains**
- Add `http://localhost:5173` to allowed origins

### 4. Start Backend
```bash
cd backend
encore run
```

Backend runs at `http://localhost:4000`

### 5. Generate Frontend Client
In a new terminal, from the `backend` directory:
```bash
encore gen client --target leap
```

### 6. Start Frontend
In a new terminal:
```bash
cd frontend
npm install
npx vite dev
```

Frontend runs at `http://localhost:5173`

### 7. Access the App
Open browser: `http://localhost:5173`

---

# Deploying to Internet (Encore Cloud)

## Option 1: Direct Git Push to Encore

### 1. Login to Encore
```bash
encore auth login
```

### 2. Create Encore App
```bash
encore app create personal-finance-manager
```

### 3. Set Production Secret
```bash
encore secret set --type production ClerkSecretKey sk_test_gjljQssAx3Ad1GfFHtD1gCvnf1AxbNHPBY6jzV8k9a
```

### 4. Update Clerk for Production Domain
After first deploy, Encore gives you a URL like `https://your-app.encr.app`

Add this to Clerk Dashboard → **Domains**

Also update `backend/auth/auth.ts` if needed (currently works without `authorizedParties`)

### 5. Deploy
```bash
git add -A
git commit -m "Initial deployment"
git remote add encore encore://personal-finance-manager
git push encore
```

View deployment: https://app.encore.dev

---

## Option 2: Deploy via GitHub (Recommended)

### 1. Push to GitHub
```bash
git init
git add -A
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/personal-finance-manager.git
git push -u origin main
```

### 2. Connect Encore to GitHub
1. Go to https://app.encore.dev
2. Click **Create App** → **Connect GitHub Repository**
3. Select your repo
4. Encore auto-deploys on every push to `main`

### 3. Set Production Secret
In Encore Dashboard → Your App → Settings → Secrets:
- Create secret: `ClerkSecretKey` = `sk_test_gjljQssAx3Ad1GfFHtD1gCvnf1AxbNHPBY6jzV8k9a`

### 4. Update Clerk Domain
After deployment, get your production URL from Encore Dashboard.

Add to Clerk Dashboard → **Domains**

---

## Accessing from Internet

Once deployed to Encore Cloud:
- Your app is live at `https://your-app-name.encr.app`
- Backend API at `https://your-app-name-api.encr.app`
- Anyone with the URL can access it
- Clerk handles authentication/sign-up

---

## Using Custom Domain (Optional)

In Encore Dashboard → Your App → Settings → Custom Domains:
1. Add your domain (e.g., `finance.yourdomain.com`)
2. Update DNS records as shown
3. Update Clerk Dashboard with new domain

---

## Resources

- **Encore Docs**: https://encore.dev/docs
- **Encore Dashboard**: https://app.encore.dev
- **Clerk Dashboard**: https://dashboard.clerk.com
- **GitHub Integration**: https://encore.dev/docs/platform/integrations/github
