#!/usr/bin/env node

/**
 * Cache Performance Test Script
 * 
 * Tests cache hit/miss behavior for your API routes after the fix.
 * Run this script after deploying to verify cache is working correctly.
 * 
 * Usage:
 *   node scripts/test-cache-performance.mjs https://your-app.vercel.app
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(color, symbol, message) {
  console.log(`${color}${symbol}${colors.reset} ${message}`);
}

async function testEndpoint(endpoint, name) {
  log(colors.cyan, '🧪', `Testing ${name}...`);
  
  const url = `${BASE_URL}${endpoint}`;
  const startTime = Date.now();
  
  try {
    const response = await fetch(url);
    const duration = Date.now() - startTime;
    
    const cacheSource = response.headers.get('X-Cache-Source');
    const responseTime = response.headers.get('X-Response-Time');
    
    if (!response.ok) {
      log(colors.red, '❌', `${name} failed with status ${response.status}`);
      return null;
    }
    
    const result = {
      endpoint: name,
      duration,
      cacheSource: cacheSource || 'unknown',
      serverTime: responseTime || 'unknown',
      status: response.status
    };
    
    // Determine if this is a good result
    if (cacheSource === 'kv' && duration < 1000) {
      log(colors.green, '✅', `${name}: CACHE HIT (${duration}ms) - Excellent!`);
    } else if (cacheSource === 'static' && duration < 2000) {
      log(colors.green, '✅', `${name}: Static fallback (${duration}ms) - Good!`);
    } else if (cacheSource === 'fresh-computed') {
      log(colors.yellow, '⚠️', `${name}: Cache miss - fresh computation (${duration}ms)`);
      log(colors.gray, '  ℹ️', '  Next request should be instant (cached)');
    } else {
      log(colors.yellow, '⚠️', `${name}: No cache headers (${duration}ms)`);
    }
    
    return result;
  } catch (error) {
    log(colors.red, '❌', `${name} error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  log(colors.cyan, '🚀', `Starting cache performance tests for ${BASE_URL}`);
  console.log('');
  
  const results = [];
  
  // Test 1: Newsletter endpoint
  const newsletterResult = await testEndpoint('/api/newsletter', 'Newsletter API');
  if (newsletterResult) results.push(newsletterResult);
  
  console.log('');
  
  // Test 2: Unified dashboard endpoint
  const dashboardResult = await testEndpoint('/api/unified-dashboard', 'Unified Dashboard API');
  if (dashboardResult) results.push(dashboardResult);
  
  console.log('');
  console.log('═'.repeat(60));
  console.log('');
  
  // Summary
  log(colors.cyan, '📊', 'Performance Summary:');
  console.log('');
  
  results.forEach(r => {
    const status = r.cacheSource === 'kv' ? '✅ Cached (KV)' : 
                   r.cacheSource === 'static' ? '✅ Cached (Static)' :
                   r.cacheSource === 'fresh-computed' ? '⚠️ Computed' : 
                   '❓ Unknown';
    console.log(`  ${r.endpoint.padEnd(25)} ${status.padEnd(20)} ${r.duration}ms`);
  });
  
  console.log('');
  
  // Recommendations
  const hasCacheMiss = results.some(r => r.cacheSource === 'fresh-computed' || r.cacheSource === 'unknown');
  const hasSlowResponse = results.some(r => r.duration > 5000);
  
  if (!hasCacheMiss && !hasSlowResponse) {
    log(colors.green, '🎉', 'All endpoints are cached and fast! Your fix is working perfectly.');
  } else if (hasCacheMiss) {
    log(colors.yellow, '💡', 'Some endpoints had cache misses. This is expected on first request.');
    log(colors.gray, '  ℹ️', '  Run this script again to verify caching is working.');
    log(colors.gray, '  ℹ️', '  Or trigger cron job: curl -H "Authorization: Bearer $CRON_SECRET" ' + BASE_URL + '/api/cron/refresh-newsletter');
  } else if (hasSlowResponse) {
    log(colors.red, '⚠️', 'Some endpoints are still slow. Check:');
    log(colors.gray, '  ℹ️', '  1. Is Upstash KV configured? (UPSTASH_REDIS_REST_URL)');
    log(colors.gray, '  ℹ️', '  2. Is cron job running? (Check Vercel Dashboard)');
    log(colors.gray, '  ℹ️', '  3. Check server logs for cache errors');
  }
  
  console.log('');
}

// Run tests
runTests().catch(error => {
  log(colors.red, '💥', `Test script failed: ${error.message}`);
  process.exit(1);
});
