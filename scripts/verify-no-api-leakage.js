#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Vercel Build Verification Script
 * Ensures no API routes are called during build time
 * Run after `next build` completes
 * 
 * Note: This is a Node.js build script that runs outside Next.js,
 * so CommonJS require() is appropriate here.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying build output for API leakage...\n');

const buildDir = path.join(process.cwd(), '.next');
const serverDir = path.join(buildDir, 'server');

// Check if build directory exists
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found!');
  process.exit(1);
}

// Read build manifest
const manifestPath = path.join(buildDir, 'build-manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('❌ Build manifest not found!');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Check for API route execution in static pages
let hasAPILeakage = false;
const staticPages = [];
const dynamicPages = [];

// Scan .next/server/pages and .next/server/app for page types
function scanPages(dir, prefix = '') {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (item === 'api') continue; // Skip API directory
      scanPages(fullPath, `${prefix}/${item}`);
    } else if (item.endsWith('.html') || item.endsWith('.json')) {
      staticPages.push(`${prefix}/${item}`);
    } else if (item.endsWith('.js') && !item.includes('.rsc.')) {
      // Check if it's a dynamic route
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('force-dynamic') || content.includes('getServerSideProps')) {
        dynamicPages.push(`${prefix}/${item}`);
      }
    }
  }
}

// Scan app directory
const appDir = path.join(serverDir, 'app');
if (fs.existsSync(appDir)) {
  scanPages(appDir, '');
}

// Check for suspicious patterns in static pages
for (const page of staticPages) {
  const fullPath = path.join(serverDir, 'app', page);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for API data embedded in HTML/JSON
    if (content.includes('"sourceUrl"') || content.includes('"newsletterData"')) {
      console.error(`❌ CRITICAL: API data found in static page: ${page}`);
      console.error('   This indicates API routes were called during build!');
      hasAPILeakage = true;
    }
  }
}

// Verify API routes are marked as dynamic
const apiManifestPath = path.join(serverDir, 'app', 'api');
if (fs.existsSync(apiManifestPath)) {
  function checkAPIRoutes(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        checkAPIRoutes(fullPath);
      } else if (item === 'route.js') {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (!content.includes('force-dynamic')) {
          console.warn(`⚠️  WARNING: API route missing force-dynamic: ${fullPath}`);
        } else {
          console.log(`✅ API route correctly marked dynamic: ${fullPath.replace(serverDir, '')}`);
        }
      }
    }
  }
  
  checkAPIRoutes(apiManifestPath);
}

console.log('\n📊 Build Analysis:');
console.log(`   Static pages: ${staticPages.length}`);
console.log(`   Dynamic routes: ${dynamicPages.length}`);

if (hasAPILeakage) {
  console.error('\n❌ BUILD VERIFICATION FAILED!');
  console.error('   API data was embedded in static pages during build.');
  console.error('   This will cause JSON parsing errors in production.');
  process.exit(1);
}

console.log('\n✅ Build verification passed! No API leakage detected.\n');
process.exit(0);
