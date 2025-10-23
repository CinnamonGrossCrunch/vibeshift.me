# Environment Variables Setup

This file documents all required environment variables for the project.

## Required for Production

### CRON_SECRET
**Purpose:** Authorizes Vercel cron jobs to execute API routes  
**Where to set:** Vercel Dashboard → Settings → Environment Variables  
**Value:** Secure random string (minimum 32 characters)

**Generate a secure secret:**
```bash
# macOS/Linux
openssl rand -hex 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Node.js (any platform)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Setup in Vercel:**
1. Go to your project in Vercel Dashboard
2. Settings → Environment Variables
3. Click "Add New"
4. Name: `CRON_SECRET`
5. Value: Paste your generated secret
6. Select environments: ✅ Production, ⬜ Preview, ⬜ Development
7. Click "Save"

### OPENAI_API_KEY
**Purpose:** Required for AI-powered newsletter organization and week summaries  
**Where to set:** Vercel Dashboard → Settings → Environment Variables  
**Value:** Your OpenAI API key (starts with `sk-`)

**Get your API key:**
1. Go to https://platform.openai.com/api-keys
2. Create a new secret key
3. Copy the key (it won't be shown again!)

**Setup in Vercel:**
1. Settings → Environment Variables
2. Add New
3. Name: `OPENAI_API_KEY`
4. Value: `sk-...`
5. Environments: ✅ Production, ✅ Preview, ⬜ Development (or all three)
6. Save

## Optional for Development

### Local Development (.env.local)

Create a `.env.local` file in the project root for local testing:

```bash
# Cron job authorization (for testing cron endpoints locally)
CRON_SECRET=your-test-secret-here

# OpenAI API key (for AI features)
OPENAI_API_KEY=sk-your-key-here

# Optional: Node environment
NODE_ENV=development
```

**Note:** `.env.local` is already in `.gitignore` and will never be committed to Git.

## Testing Cron Jobs Locally

With `CRON_SECRET` set in `.env.local`, you can test cron endpoints:

```bash
# Start dev server
npm run dev

# Test midnight cron (in another terminal)
curl http://localhost:3000/api/cron/refresh-cache \
  -H "Authorization: Bearer your-test-secret-here"

# Test morning cron
curl http://localhost:3000/api/cron/refresh-newsletter \
  -H "Authorization: Bearer your-test-secret-here"
```

## Environment Variables Checklist

Before deploying:
- [ ] `CRON_SECRET` set in Vercel (Production)
- [ ] `OPENAI_API_KEY` set in Vercel (Production & Preview)
- [ ] `.env.local` created for local development (optional)
- [ ] Secrets are secure (32+ characters, random)
- [ ] Never commit secrets to Git

## Verification

After setting environment variables in Vercel:

1. **Check they're set:**
   - Vercel Dashboard → Settings → Environment Variables
   - Should see both `CRON_SECRET` and `OPENAI_API_KEY`

2. **Redeploy if needed:**
   - If you added variables after deployment, redeploy to pick them up
   - Settings → Deployments → Latest → "Redeploy"

3. **Test cron jobs:**
   - After deployment, check Vercel Dashboard → Cron Jobs tab
   - Cron jobs should execute successfully
   - Check execution logs for any authorization errors

## Troubleshooting

**Cron job returns 401 Unauthorized:**
- Verify `CRON_SECRET` is set in Vercel
- Check spelling and capitalization (must be exact)
- Ensure value doesn't have extra spaces or quotes

**OpenAI API errors:**
- Verify `OPENAI_API_KEY` is set correctly
- Check your OpenAI account has credits
- Ensure key starts with `sk-`

**Environment variables not picked up:**
- Redeploy the project after adding variables
- Clear Vercel cache: Settings → Data Cache → Purge

---

**Security Best Practices:**
- ✅ Use strong random secrets (32+ characters)
- ✅ Never commit secrets to Git
- ✅ Rotate secrets periodically
- ✅ Use different secrets for Production vs Preview
- ✅ Limit API key permissions when possible
