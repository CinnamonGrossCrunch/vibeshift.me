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
const VERCEL_URL = process.env.VERCEL_URL; // Auto-set by Vercel

// Only run in production deployments
if (VERCEL_ENV !== 'production') {
  console.log(`⏭️ Skipping cache warming (VERCEL_ENV=${VERCEL_ENV || 'local'})`);
  process.exit(0);
}

if (!CRON_SECRET) {
  console.warn('⚠️ CRON_SECRET not set - skipping cache warming');
  process.exit(0);
}

if (!VERCEL_URL) {
  console.warn('⚠️ VERCEL_URL not set - skipping cache warming');
  process.exit(0);
}

async function warmCache() {
  const url = `https://${VERCEL_URL}/api/cron/refresh-newsletter`;
  
  console.log('🔥 Post-deployment cache warming started...');
  console.log(`📍 Target: ${url}`);
  
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
      console.warn(`⚠️ Cache warming failed: ${response.status} ${response.statusText}`);
      // Don't fail the build - cache will warm on first user visit
    }
  } catch (error) {
    console.error('❌ Cache warming error:', error.message);
    // Don't fail the build - cache will warm on first user visit
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
