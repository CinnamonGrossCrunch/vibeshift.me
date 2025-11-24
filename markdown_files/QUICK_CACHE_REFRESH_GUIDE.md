# 🔄 Quick Cache Refresh Guide

## Problem
Dashboard showing **last week's newsletter** (Nov 16-18 events) instead of current week.

## Why This Happens
- Cache is designed to serve fast (50-200ms) by storing processed data
- Cron job runs at 8:10 AM Pacific to refresh daily
- If cron hasn't run or failed, cache shows old data

## ✅ Quick Fix (2 Options)

### Option 1: Admin UI (Easiest) ⭐
1. Go to: **https://www.oski.app/admin/cache-refresh**
2. Click: **"🔄 Refresh Cache Now"**
3. Wait: 8-20 seconds
4. Done! Refresh your dashboard

### Option 2: Direct URL
Just visit this URL in your browser:
```
https://www.oski.app/api/unified-dashboard?refresh=true
```

## How It Works
- Fetches latest newsletter from Mailchimp
- Processes with AI (gpt-4o-mini)
- Extracts time-sensitive events for My Week
- Updates cache (both KV and static files)
- Next page load is instant (<200ms)

## When to Use
- ✅ New newsletter just published (usually Sunday evenings)
- ✅ Dashboard showing old events
- ✅ My Week widget is empty or outdated
- ✅ After 8:10 AM if cron failed

## Automatic Updates
- Cron job runs **daily at 8:10 AM Pacific**
- Usually catches new newsletters automatically
- Manual refresh is backup when cron fails

## Troubleshooting
**Still seeing old data after refresh?**
- Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache
- Try in incognito/private window

**Refresh taking too long (>30s)?**
- Check Vercel status page
- Try again in 5 minutes
- OpenAI API might be slow

## Technical Details
See `markdown_files/CACHE_REFRESH_FIX.md` for full documentation.

---

**Last Updated:** November 24, 2025  
**Status:** ✅ Deployed and ready to use
