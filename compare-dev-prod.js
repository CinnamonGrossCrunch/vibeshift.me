#!/usr/bin/env node

// HTML Comparison Tool: Dev vs Prod
const https = require('https');
const http = require('http');
const { JSDOM } = require('jsdom');
const { diffLines } = require('diff');

const DEV_URL = 'http://localhost:3000';
const PROD_URL = 'https://oski.app';

async function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    console.log(`📥 Fetching: ${url}`);
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ Fetched ${data.length} chars from ${url}`);
        resolve(data);
      });
    });
    
    req.on('error', (err) => {
      console.error(`❌ Error fetching ${url}:`, err.message);
      reject(err);
    });
    
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

function normalizeHTML(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // Remove dynamic content
  const selectorsToRemove = [
    'script[src*="/_next/static"]',
    'link[href*="/_next/static"]',
    'meta[name="next-head-count"]',
    'script[id="__NEXT_DATA__"]'
  ];
  
  selectorsToRemove.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => el.remove());
  });
  
  return document.documentElement.outerHTML
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/data-reactroot="[^"]*"/g, '')
    .trim();
}

function analyzeStructure(html, label) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  return {
    label,
    structure: {
      totalElements: document.querySelectorAll('*').length,
      divs: document.querySelectorAll('div').length,
      scripts: document.querySelectorAll('script').length,
      styles: document.querySelectorAll('style, link[rel="stylesheet"]').length,
      images: document.querySelectorAll('img').length,
      links: document.querySelectorAll('a').length,
    },
    content: {
      title: document.title || 'No title',
      headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        tag: h.tagName.toLowerCase(),
        text: h.textContent.trim().substring(0, 80)
      })),
      newsletterSections: document.querySelectorAll('[class*="newsletter"], [class*="section"]').length,
      calendarWidgets: document.querySelectorAll('[class*="calendar"], [class*="widget"]').length,
    }
  };
}

async function compareVersions() {
  console.log('🚀 DEV vs PROD COMPARISON');
  console.log('=========================\n');
  
  try {
    // Step 1: Fetch HTML
    console.log('📥 Step 1: Fetching HTML from both versions...');
    const [devHTML, prodHTML] = await Promise.all([
      fetchHTML(DEV_URL),
      fetchHTML(PROD_URL)
    ]);
    
    // Step 2: Analyze structures
    console.log('\n🔍 Step 2: Analyzing DOM structures...');
    const devAnalysis = analyzeStructure(devHTML, 'DEV');
    const prodAnalysis = analyzeStructure(prodHTML, 'PROD');
    
    // Step 3: Compare and report
    console.log('\n📊 STRUCTURAL COMPARISON:');
    console.log('========================');
    
    Object.keys(devAnalysis.structure).forEach(key => {
      const devVal = devAnalysis.structure[key];
      const prodVal = prodAnalysis.structure[key];
      const diff = devVal - prodVal;
      const status = diff === 0 ? '✅' : diff > 0 ? '📈' : '📉';
      console.log(`${status} ${key}: DEV=${devVal}, PROD=${prodVal} (${diff > 0 ? '+' : ''}${diff})`);
    });
    
    console.log('\n📝 CONTENT COMPARISON:');
    console.log('=====================');
    console.log(`Title: ${devAnalysis.content.title === prodAnalysis.content.title ? '✅ Same' : '🔄 Different'}`);
    console.log(`Newsletter sections: DEV=${devAnalysis.content.newsletterSections}, PROD=${prodAnalysis.content.newsletterSections}`);
    console.log(`Calendar widgets: DEV=${devAnalysis.content.calendarWidgets}, PROD=${prodAnalysis.content.calendarWidgets}`);
    
    console.log('\n📖 HEADINGS COMPARISON:');
    console.log('=======================');
    const maxHeadings = Math.max(devAnalysis.content.headings.length, prodAnalysis.content.headings.length);
    for (let i = 0; i < Math.min(maxHeadings, 10); i++) {
      const devH = devAnalysis.content.headings[i];
      const prodH = prodAnalysis.content.headings[i];
      
      if (devH && prodH) {
        const same = devH.text === prodH.text;
        console.log(`${same ? '✅' : '🔄'} ${i+1}. ${devH.tag}: "${devH.text}"`);
        if (!same) console.log(`     PROD: ${prodH.tag}: "${prodH.text}"`);
      } else if (devH) {
        console.log(`📈 ${i+1}. [DEV ONLY] ${devH.tag}: "${devH.text}"`);
      } else if (prodH) {
        console.log(`📉 ${i+1}. [PROD ONLY] ${prodH.tag}: "${prodH.text}"`);
      }
    }
    
    // HTML diff analysis
    console.log('\n🔄 HTML DIFFERENCES:');
    console.log('===================');
    
    const devNormalized = normalizeHTML(devHTML);
    const prodNormalized = normalizeHTML(prodHTML);
    
    if (devNormalized === prodNormalized) {
      console.log('✅ No significant differences found');
    } else {
      const diff = diffLines(prodNormalized, devNormalized);
      let added = 0, removed = 0, unchanged = 0;
      
      diff.forEach(part => {
        if (part.added) added += part.count;
        else if (part.removed) removed += part.count;
        else unchanged += part.count;
      });
      
      const total = added + removed + unchanged;
      const similarity = ((unchanged / total) * 100).toFixed(1);
      
      console.log(`📈 Added lines: ${added}`);
      console.log(`📉 Removed lines: ${removed}`);
      console.log(`🎯 Similarity: ${similarity}%`);
      
      // Show sample changes
      console.log('\n🔍 SAMPLE CHANGES:');
      let changeCount = 0;
      diff.forEach(part => {
        if ((part.added || part.removed) && changeCount < 3) {
          const prefix = part.added ? '+ ' : '- ';
          const preview = part.value.substring(0, 150).replace(/\n/g, ' ').trim();
          if (preview) {
            console.log(`${prefix}${preview}...`);
            changeCount++;
          }
        }
      });
    }
    
    console.log('\n✅ Comparison complete!');
    console.log(`🔗 DEV:  ${DEV_URL}`);
    console.log(`🌍 PROD: ${PROD_URL}`);
    
  } catch (error) {
    console.error('❌ Comparison failed:', error.message);
    process.exit(1);
  }
}

// Run the comparison
compareVersions();
