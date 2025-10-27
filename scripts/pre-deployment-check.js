#!/usr/bin/env node

/**
 * Pre-deployment check script for Vercel
 * Runs TypeScript compilation and basic validation before deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running pre-deployment checks...\n');

let hasErrors = false;

// Check 1: TypeScript compilation
console.log('1️⃣ Checking TypeScript compilation...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript check passed\n');
} catch (error) {
  console.error('❌ TypeScript check failed\n');
  hasErrors = true;
}

// Check 2: Verify critical files exist
console.log('2️⃣ Verifying critical files...');
const criticalFiles = [
  'app/page.tsx',
  'app/api/unified-dashboard/route.ts',
  'app/api/newsletter/route.ts',
  'app/api/cron/refresh-cache/route.ts',
  'app/api/cron/refresh-newsletter/route.ts',
  'vercel.json',
  'next.config.ts',
  'package.json'
];

let missingFiles = [];
for (const file of criticalFiles) {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
    hasErrors = true;
  }
}

if (missingFiles.length > 0) {
  console.error('❌ Missing critical files:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  console.log('');
} else {
  console.log('✅ All critical files present\n');
}

// Check 3: Verify vercel.json configuration
console.log('3️⃣ Verifying Vercel configuration...');
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  
  // Check for cron jobs
  if (!vercelConfig.crons || vercelConfig.crons.length === 0) {
    console.warn('⚠️  Warning: No cron jobs configured');
  } else {
    console.log(`✅ Found ${vercelConfig.crons.length} cron job(s)`);
  }
  
  // Check for function timeouts
  if (!vercelConfig.functions) {
    console.warn('⚠️  Warning: No function timeouts configured');
  } else {
    const functionCount = Object.keys(vercelConfig.functions).length;
    console.log(`✅ Found ${functionCount} function timeout(s)`);
  }
  
  // Check Node version
  if (vercelConfig.build?.env?.NODE_VERSION) {
    console.log(`✅ Node version set to ${vercelConfig.build.env.NODE_VERSION}`);
  } else {
    console.warn('⚠️  Warning: NODE_VERSION not explicitly set');
  }
  
  console.log('');
} catch (error) {
  console.error('❌ Failed to parse vercel.json:', error.message);
  console.log('');
  hasErrors = true;
}

// Check 4: Verify package.json scripts
console.log('4️⃣ Verifying package.json scripts...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['dev', 'build', 'start', 'lint'];
  
  let missingScripts = [];
  for (const script of requiredScripts) {
    if (!packageJson.scripts[script]) {
      missingScripts.push(script);
    }
  }
  
  if (missingScripts.length > 0) {
    console.error('❌ Missing required scripts:');
    missingScripts.forEach(script => console.error(`   - ${script}`));
    console.log('');
    hasErrors = true;
  } else {
    console.log('✅ All required scripts present\n');
  }
} catch (error) {
  console.error('❌ Failed to parse package.json:', error.message);
  console.log('');
  hasErrors = true;
}

// Check 5: Verify environment variable usage
console.log('5️⃣ Checking environment variable patterns...');
try {
  // Check if .env.example exists and has required variables
  if (fs.existsSync('.env.example')) {
    const envExample = fs.readFileSync('.env.example', 'utf8');
    const requiredVars = ['OPENAI_API_KEY', 'CRON_SECRET'];
    
    let missingVars = [];
    for (const variable of requiredVars) {
      if (!envExample.includes(variable)) {
        missingVars.push(variable);
      }
    }
    
    if (missingVars.length > 0) {
      console.warn('⚠️  Warning: .env.example missing variables:');
      missingVars.forEach(v => console.warn(`   - ${v}`));
      console.log('');
    } else {
      console.log('✅ All required environment variables documented\n');
    }
  } else {
    console.warn('⚠️  Warning: .env.example not found\n');
  }
} catch (error) {
  console.warn('⚠️  Warning: Could not check environment variables:', error.message);
  console.log('');
}

// Final summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (hasErrors) {
  console.error('❌ Pre-deployment checks FAILED');
  console.error('Please fix the errors above before deploying.\n');
  process.exit(1);
} else {
  console.log('✅ All pre-deployment checks PASSED');
  console.log('Ready to deploy!\n');
  process.exit(0);
}
