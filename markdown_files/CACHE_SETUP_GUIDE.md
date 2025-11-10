# Hybrid Cache Setup Guide (Option C)

## ✅ Implementation Complete

The hybrid caching system has been implemented with:
- **Upstash Redis KV** for instantaneous loads (~50-200ms)
- **Static JSON fallback** for resilience when KV is unavailable
- **Automatic cron job cache warming** at midnight and 8:10 AM

---

## 🔧 What You Need to Set Up Externally

### 1. Create Upstash Redis Database

#### Step 1: Sign up for Upstash (Free)
1. Go to https://upstash.com
2. Sign up for free account (Google/GitHub SSO available)
3. Free tier includes: 10,000 commands/day (plenty for this app)

#### Step 2: Create Redis Database
1. Click **"Create Database"**
2. Choose **"Global"** for best worldwide performance (or select region closest to your users)
3. Name it something like `ewmba-hub-cache`
4. Click **"Create"**

#### Step 3: Get Your Credentials
1. In the database dashboard, click **"REST API"** tab
2. You'll see two values:
   - **UPSTASH_REDIS_REST_URL** (e.g., `https://us1-ruling-firefly-12345.upstash.io`)
   - **UPSTASH_REDIS_REST_TOKEN** (long string starting with `AXX...`)
3. Copy these values

#### Step 4: Add to Vercel Environment Variables
1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add two new variables:
   ```
   UPSTASH_REDIS_REST_URL = https://us1-ruling-firefly-12345.upstash.io
   UPSTASH_REDIS_REST_TOKEN = AXX...your-token-here
   ```
4. Select **Production**, **Preview**, and **Development** checkboxes
5. Click **"Save"**

#### Step 5: Redeploy
1. Go to **Deployments** tab
2. Click **"Redeploy"** on your latest deployment
3. OR push a new commit to trigger deployment

---

### 2. Update Local `.env.local` (for local development)

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Then add your Upstash credentials to `.env.local`:
```env
UPSTASH_REDIS_REST_URL=https://us1-ruling-firefly-12345.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXX...your-token-here
```

---

## 📊 How It Works

### Cache Flow Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                    CRON JOBS (Background)                   │
├─────────────────────────────────────────────────────────────┤
│  🌙 Midnight (7:00 AM UTC)                                 │
│     ├─ Fetch calendar events                                │
│     ├─ Generate My Week AI summaries                        │
│     └─ Write to: KV cache + static JSON                     │
│                                                              │
│  📰 Morning (3:10 PM UTC / 8:10 AM Pacific)                │
│     ├─ Scrape latest newsletter (~5-10s)                    │
│     ├─ Process with AI (~72s)                               │
│     ├─ Fetch calendar events (~2-5s)                        │
│     ├─ Generate My Week AI summaries (~15s)                 │
│     └─ Write to: KV cache + static JSON                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   USER REQUEST (Frontend)                    │
├─────────────────────────────────────────────────────────────┤
│  1. Browser calls /api/unified-dashboard                     │
│  2. API checks KV cache first                                │
│     ├─ ✅ KV HIT → Return in ~50-200ms (INSTANT!)           │
│     ├─ ⚠️ KV MISS → Try static JSON fallback (~500ms)      │
│     └─ ❌ Both fail → Generate fresh (~8-20s)              │
└─────────────────────────────────────────────────────────────┘
```

### Performance Comparison

| Scenario | Load Time | User Experience |
|----------|-----------|-----------------|
| **With KV Cache** (Option C) | **~100-300ms** | ⚡⚡⚡ Instantaneous |
| **Static Fallback Only** | ~500-1000ms | ⚡⚡ Fast |
| **No Cache** (Current) | 8-20 seconds | 🐌 Slow |

---

## 🧪 Testing the Cache

### Test Cache Locally
```bash
# Run the app locally
npm run dev

# In another terminal, trigger the cron job manually
curl http://localhost:3000/api/cron/refresh-newsletter \
  -H "Authorization: Bearer your-cron-secret"

# Then visit the dashboard - should load instantly!
open http://localhost:3000
```

### Test Cache in Production
```bash
# Check cache status in Vercel logs
# Go to: Vercel Dashboard → Functions → /api/unified-dashboard
# Look for log messages:
# ✅ "CACHE HIT from kv" = Success!
# ✅ "CACHE HIT from static" = Fallback working
# ⚠️ "Cache miss" = Cache empty (first load or cron failed)
```

### Verify Upstash Dashboard
1. Go to Upstash dashboard
2. Click on your database
3. Click **"Data Browser"** tab
4. You should see keys like:
   - `dashboard-data`
   - `newsletter-data`
   - `cohort-events`
   - `myweek-data`

---

## 🚨 Troubleshooting

### "Cache miss" logs in production
- **Cause**: Cron jobs haven't run yet OR Upstash credentials missing
- **Fix**: 
  1. Check Vercel env vars have `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
  2. Wait for next cron job (8:10 AM Pacific)
  3. OR manually trigger: `curl https://your-app.vercel.app/api/cron/refresh-newsletter -H "Authorization: Bearer YOUR_CRON_SECRET"`

### "Unauthorized" when triggering cron manually
- **Cause**: Missing or wrong `CRON_SECRET`
- **Fix**: Check Vercel env var `CRON_SECRET` matches your local `.env.local`

### Static fallback always used (never KV)
- **Cause**: Upstash credentials not set correctly
- **Fix**: 
  1. Verify env vars in Vercel (Settings → Environment Variables)
  2. Redeploy after adding vars
  3. Check Vercel function logs for KV connection errors

---

## 💰 Cost Estimate

### Free Tier (Recommended for Most Users)
- **Upstash Free**: 10,000 commands/day
- **Your app usage**: ~500-1000 commands/day (assuming 100 users/day)
- **Cost**: $0/month ✅

### Paid Tier (If You Exceed Free Limits)
- **Upstash Pro**: $0.20 per 100K commands
- **Estimated cost**: $3-10/month for 1000+ daily users
- **Still way cheaper than**: Longer Vercel function execution times (~$20-50/month saved)

---

## 📈 Next Steps

1. **Set up Upstash** (5 minutes - see above)
2. **Add env vars to Vercel** (2 minutes)
3. **Redeploy** (1 minute)
4. **Wait for cron job** (runs at 8:10 AM Pacific daily)
5. **Test cache**: Visit your app - should load instantly!

---

## 🎯 Success Metrics

After implementation, you should see:
- ✅ Dashboard loads in **<300ms** (instead of 8-20s)
- ✅ Vercel function execution time: **50-200ms** (instead of 200s)
- ✅ Vercel function invocations: **90% faster**
- ✅ OpenAI costs: **Reduced by 95%** (AI only runs 2x/day instead of every page load)

---

## 📝 Files Modified

```
✅ lib/cache.ts (NEW) - Hybrid cache system
✅ app/api/cron/refresh-cache/route.ts (UPDATED) - Write to cache
✅ app/api/cron/refresh-newsletter/route.ts (UPDATED) - Write to cache
✅ app/api/unified-dashboard/route.ts (UPDATED) - Read from cache
✅ public/cache/ (NEW) - Static fallback directory
✅ .env.example (UPDATED) - Added Upstash vars
✅ package.json (UPDATED) - Added @upstash/redis
```
