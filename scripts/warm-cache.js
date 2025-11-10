#!/usr/bin/env node

/**
 * Post-Deployment Cache Warmer
 * 
 * This script runs AFTER successful Vercel deployment to pre-warm the cache.
 * Add this to package.json scripts: "postbuild": "node scripts/warm-cache.js"
 * 
 * IMPORTANT: Only runs in production builds, not preview/dev
 */

const CRON_SECRET = process.env.CRON_SECRET;
const VERCEL_ENV = process.env.VERCEL_ENV; // 'production', 'preview', or undefined (local)
const VERCEL_URL = process.env.VERCEL_URL; // Auto-set by Vercel (preview URL)
const VERCEL_PRODUCTION_URL = process.env.VERCEL_PRODUCTION_URL; // Production URL

// Only run in production deployments
if (VERCEL_ENV !== 'production') {
  console.log(`⏭️ Skipping cache warming (VERCEL_ENV=${VERCEL_ENV || 'local'})`);
  process.exit(0);
}

if (!CRON_SECRET) {
  console.warn('⚠️ CRON_SECRET not set - skipping cache warming');
  process.exit(0);
}

// Use production URL if available, otherwise use VERCEL_URL
const targetUrl = VERCEL_PRODUCTION_URL || VERCEL_URL;

if (!targetUrl) {
  console.warn('⚠️ No deployment URL found - skipping cache warming');
  process.exit(0);
}

async function warmCache() {
  const url = `https://${targetUrl}/api/cron/refresh-newsletter`;
  
  console.log('🔥 Post-deployment cache warming started...');
  console.log(`📍 Target: ${url}`);
  console.log(`🔑 Using CRON_SECRET: ${CRON_SECRET.substring(0, 8)}...`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Cache warmed successfully!');
      console.log(`📊 Response:`, data);
    } else {
      const errorText = await response.text();
      console.warn(`⚠️ Cache warming failed: ${response.status} ${response.statusText}`);
      console.warn(`Response: ${errorText}`);
      // Don't fail the build - cache will warm on first user visit or via GitHub Action
    }
  } catch (error) {
    console.error('❌ Cache warming error:', error.message);
    // Don't fail the build - cache will warm on first user visit or via GitHub Action
  }
}

// Run with timeout (don't block deployment forever)
const TIMEOUT = 120000; // 2 minutes max

Promise.race([
  warmCache(),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Cache warming timeout')), TIMEOUT)
  )
]).catch(err => {
  console.warn('⚠️ Cache warming did not complete:', err.message);
}).finally(() => {
  console.log('🏁 Post-deployment cache warming finished');
});
