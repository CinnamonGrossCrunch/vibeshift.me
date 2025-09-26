#!/usr/bin/env node

// HTML Comparison Tool: Dev vs Prod
const https = require('https');
const http = require('http');
const { JSDOM } = require('jsdom');
const { diffLines, diffWords } = require('diff');

const DEV_URL = 'https://calm-pig-0.loca.lt';
  const PROD_URL = 'https://oski.app';

  console.log('🔍 Fetching HTML from Dev and Prod...\n');

  try {
    // Step 1: Fetch HTML from both environments
    console.log(`📥 Fetching Dev: ${DEV_URL}`);
    const devResponse = await fetch(DEV_URL);
    const devHtml = await devResponse.text();
    
    console.log(`📥 Fetching Prod: ${PROD_URL}`);
    const prodResponse = await fetch(PROD_URL);
    const prodHtml = await prodResponse.text();

    // Step 2: Parse and normalize DOM trees
    console.log('\n🔧 Parsing and normalizing DOM trees...');
    const devDom = new JSDOM(devHtml);
    const prodDom = new JSDOM(prodHtml);

    // Extract key elements for comparison
    const devDoc = devDom.window.document;
    const prodDoc = prodDom.window.document;

    // Step 3: Analyze differences
    console.log('\n📊 Analyzing differences...\n');

    // Structure Analysis
    console.log('=== STRUCTURE ANALYSIS ===');
    
    // Compare title
    const devTitle = devDoc.title;
    const prodTitle = prodDoc.title;
    console.log(`Title - Dev: "${devTitle}"`);
    console.log(`Title - Prod: "${prodTitle}"`);
    console.log(`Title Match: ${devTitle === prodTitle ? '✅' : '❌'}\n`);

    // Compare meta tags
    const devMetas = Array.from(devDoc.querySelectorAll('meta')).map(m => ({
      name: m.getAttribute('name'),
      content: m.getAttribute('content'),
      property: m.getAttribute('property')
    }));
    const prodMetas = Array.from(prodDoc.querySelectorAll('meta')).map(m => ({
      name: m.getAttribute('name'),
      content: m.getAttribute('content'),
      property: m.getAttribute('property')
    }));
    console.log(`Meta tags - Dev: ${devMetas.length}, Prod: ${prodMetas.length}`);

    // Compare main content sections
    const devSections = devDoc.querySelectorAll('section, article, main, div[class*="section"]');
    const prodSections = prodDoc.querySelectorAll('section, article, main, div[class*="section"]');
    console.log(`Content sections - Dev: ${devSections.length}, Prod: ${prodSections.length}`);

    // Newsletter widget specific analysis
    const devNewsletter = devDoc.querySelector('[class*="newsletter"]') || devDoc.querySelector('[id*="newsletter"]');
    const prodNewsletter = prodDoc.querySelector('[class*="newsletter"]') || prodDoc.querySelector('[id*="newsletter"]');
    console.log(`Newsletter widget - Dev: ${devNewsletter ? '✅ Found' : '❌ Missing'}, Prod: ${prodNewsletter ? '✅ Found' : '❌ Missing'}`);

    // Styling Analysis
    console.log('\n=== STYLING ANALYSIS ===');
    
    // Compare stylesheets
    const devStyles = Array.from(devDoc.querySelectorAll('link[rel="stylesheet"], style')).map(s => 
      s.tagName === 'LINK' ? s.href : 'inline-style'
    );
    const prodStyles = Array.from(prodDoc.querySelectorAll('link[rel="stylesheet"], style')).map(s => 
      s.tagName === 'LINK' ? s.href : 'inline-style'
    );
    console.log(`Stylesheets - Dev: ${devStyles.length}, Prod: ${prodStyles.length}`);
    
    // Find unique styles
    const devUniqueStyles = devStyles.filter(s => !prodStyles.includes(s));
    const prodUniqueStyles = prodStyles.filter(s => !devStyles.includes(s));
    
    if (devUniqueStyles.length > 0) {
      console.log('🆕 Dev-only styles:', devUniqueStyles);
    }
    if (prodUniqueStyles.length > 0) {
      console.log('🏭 Prod-only styles:', prodUniqueStyles);
    }

    // Script Analysis
    console.log('\n=== SCRIPT ANALYSIS ===');
    
    // Compare scripts
    const devScripts = Array.from(devDoc.querySelectorAll('script[src]')).map(s => s.src);
    const prodScripts = Array.from(prodDoc.querySelectorAll('script[src]')).map(s => s.src);
    console.log(`External scripts - Dev: ${devScripts.length}, Prod: ${prodScripts.length}`);

    // Find unique scripts
    const devUniqueScripts = devScripts.filter(s => !prodScripts.includes(s));
    const prodUniqueScripts = prodScripts.filter(s => !devScripts.includes(s));
    
    if (devUniqueScripts.length > 0) {
      console.log('🆕 Dev-only scripts:', devUniqueScripts);
    }
    if (prodUniqueScripts.length > 0) {
      console.log('🏭 Prod-only scripts:', prodUniqueScripts);
    }

    // Content Analysis
    console.log('\n=== CONTENT ANALYSIS ===');
    
    // Compare text content length
    const devTextLength = devDoc.body ? devDoc.body.textContent.length : 0;
    const prodTextLength = prodDoc.body ? prodDoc.body.textContent.length : 0;
    console.log(`Text content length - Dev: ${devTextLength}, Prod: ${prodTextLength}`);
    
    const contentDiff = Math.abs(devTextLength - prodTextLength);
    const contentDiffPercent = prodTextLength > 0 ? ((contentDiff / prodTextLength) * 100).toFixed(1) : 0;
    console.log(`Content difference: ${contentDiff} characters (${contentDiffPercent}%)`);

    // Next.js specific analysis
    console.log('\n=== NEXT.JS ANALYSIS ===');
    
    // Check for Next.js hydration data
    const devNextData = devDoc.querySelector('#__NEXT_DATA__');
    const prodNextData = prodDoc.querySelector('#__NEXT_DATA__');
    console.log(`Next.js data - Dev: ${devNextData ? '✅ Found' : '❌ Missing'}, Prod: ${prodNextData ? '✅ Found' : '❌ Missing'}`);

    // Compare build IDs if available
    if (devNextData && prodNextData) {
      try {
        const devData = JSON.parse(devNextData.textContent);
        const prodData = JSON.parse(prodNextData.textContent);
        console.log(`Build ID - Dev: ${devData.buildId}, Prod: ${prodData.buildId}`);
        console.log(`Build Match: ${devData.buildId === prodData.buildId ? '✅' : '❌'}`);
      } catch (e) {
        console.log('⚠️ Could not parse Next.js data');
      }
    }

    // Summary
    console.log('\n=== SUMMARY ===');
    console.log(`🔗 Dev URL: ${DEV_URL}`);
    console.log(`🌍 Prod URL: ${PROD_URL}`);
    console.log(`📊 Structure differences: ${Math.abs(devSections.length - prodSections.length)} sections`);
    console.log(`🎨 Style differences: ${devUniqueStyles.length + prodUniqueStyles.length} unique stylesheets`);
    console.log(`📜 Script differences: ${devUniqueScripts.length + prodUniqueScripts.length} unique scripts`);
    console.log(`📝 Content difference: ${contentDiffPercent}%`);

    // Save detailed reports
    const reportDir = './comparison-reports';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir);
    }

    fs.writeFileSync(path.join(reportDir, 'dev.html'), devHtml);
    fs.writeFileSync(path.join(reportDir, 'prod.html'), prodHtml);
    
    console.log('\n📁 Full HTML saved to ./comparison-reports/');
    console.log('✅ Comparison complete!');

  } catch (error) {
    console.error('❌ Error during comparison:', error.message);
    
    if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\n💡 Tip: Make sure both URLs are accessible:');
      console.log(`   - Dev: ${DEV_URL} (LocalTunnel active?)`);
      console.log(`   - Prod: ${PROD_URL} (Production deployment live?)`);
    }
  }
})();
