# Deploy to GitHub and Encore Cloud

## Step-by-Step Guide

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `personal-finance-manager`)
3. **Don't** initialize with README (your project already has files)
4. Click **Create repository**

### Step 2: Initialize Git and Push to GitHub

In your project directory on your laptop:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add -A

# Commit
git commit -m "Initial commit - Personal Finance Manager"

# Add GitHub as remote (replace with your actual GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/personal-finance-manager.git

# Push to GitHub
git push -u origin main
```

**Note:** Replace `YOUR_USERNAME` with your actual GitHub username.

If you get an error about branch name, try:
```bash
git branch -M main
git push -u origin main
```

### Step 3: Connect Encore Cloud to GitHub

1. Go to https://app.encore.dev
2. Click **Create App** (or **New App**)
3. Select **Connect GitHub Repository**
4. Authorize Encore to access your GitHub account
5. Select your repository: `personal-finance-manager`
6. Click **Connect**
7. Encore will automatically deploy from `main` branch

### Step 4: Set Clerk Secret in Encore Cloud

After creating the app:

1. In Encore Dashboard → Your App → **Settings** → **Secrets**
2. Click **Add Secret**
3. Secret name: `ClerkSecretKey`
4. Value: `sk_test_gjljQssAx3Ad1GfFHtD1gCvnf1AxbNHPBY6jzV8k9a`
5. Environment: **Production** (or select all environments)
6. Click **Save**

Encore will automatically redeploy with the secret.

### Step 5: Get Your Production URL

1. In Encore Dashboard, go to your app
2. Click on the latest deployment
3. Copy the **Web URL** (something like `https://personal-finance-manager-xyz.encr.app`)

### Step 6: Update Clerk Dashboard

1. Go to https://dashboard.clerk.com
2. Select your application
3. Go to **Domains** section
4. Add your Encore production URL (e.g., `https://personal-finance-manager-xyz.encr.app`)
5. Save changes

### Step 7: Test Your Deployed App

1. Open your production URL in browser
2. Sign in with Clerk
3. Test creating categories, transactions, etc.

---

## Future Updates

Whenever you make changes:

```bash
git add -A
git commit -m "Description of changes"
git push origin main
```

Encore automatically deploys every push to `main` branch! 🚀

---

## Troubleshooting

### Issue: Authentication fails in production

**Solution:** Make sure you added the production URL to Clerk Dashboard → Domains

### Issue: Secret not found

**Solution:** 
```bash
encore secret set --type production ClerkSecretKey sk_test_gjljQssAx3Ad1GfFHtD1gCvnf1AxbNHPBY6jzV8k9a
```

Or set it in Encore Dashboard → Settings → Secrets

### Issue: Build fails

**Solution:** Check the build logs in Encore Dashboard → Deployments. Common issues:
- Missing dependencies (check package.json)
- TypeScript errors (run `npm run build` locally first)

---

## Using Multiple Environments

Encore supports multiple environments:

- **Development** (local)
- **Preview** (Pull Request previews - Pro plan)
- **Production** (main branch)

You can set different secrets for each environment.

---

## Resources

- **Encore Dashboard**: https://app.encore.dev
- **GitHub Integration Docs**: https://encore.dev/docs/platform/integrations/github
- **Encore Deployment Guide**: https://encore.dev/docs/platform/deploy/deploying
