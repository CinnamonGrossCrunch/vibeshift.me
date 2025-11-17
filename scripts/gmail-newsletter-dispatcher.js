// ============================================================================
// GMAIL TO GITHUB NEWSLETTER DISPATCHER
// ============================================================================
// This Google Apps Script monitors your Gmail inbox for newsletters and
// automatically sends them to your GitHub repository via repository_dispatch.
//
// Setup Instructions:
// 1. Go to https://script.google.com
// 2. Create a new project
// 3. Paste this entire script
// 4. Update GMAIL_SEARCH_QUERY below with your newsletter subject/sender
// 5. Run testDispatch() to verify connection
// 6. Set up a time-based trigger for checkNewsletters() (every 5-10 minutes)
// ============================================================================

// ============================================================================
// CONFIGURATION
// ============================================================================
// ⚠️ SECURITY NOTE: Replace YOUR_GITHUB_PAT with your actual token when pasting into Google Apps Script!
const GITHUB_TOKEN = 'YOUR_GITHUB_PAT'; // Replace this in Google Apps Script!
const REPO_OWNER = 'CinnamonGrossCrunch';
const REPO_NAME = 'vibeshift.me';
const EVENT_TYPE = 'newsletter_received';

// ⚠️ UPDATE THIS: Enter the exact subject line or Gmail search query
// Examples:
// - 'subject:"Haas Weekly Update" is:unread'
// - 'from:newsletter@haas.berkeley.edu is:unread'
// - 'subject:"EWMBA Newsletter" is:unread'
// - 'from:haas.berkeley.edu subject:"weekly" is:unread'
const GMAIL_SEARCH_QUERY = 'subject:"YOUR_NEWSLETTER_SUBJECT" is:unread';

// ============================================================================
// MAIN FUNCTION - Runs on Trigger
// ============================================================================
function checkNewsletters() {
  console.log('🔍 Checking for new newsletters...');
  console.log(`Search query: ${GMAIL_SEARCH_QUERY}`);
  
  const threads = GmailApp.search(GMAIL_SEARCH_QUERY);
  
  if (threads.length === 0) {
    console.log('✅ No unread newsletters found');
    return;
  }
  
  console.log(`📬 Found ${threads.length} newsletter thread(s)`);
  
  threads.forEach(thread => {
    const msgs = thread.getMessages();
    msgs.forEach(msg => {
      if (msg.isUnread()) {
        processNewsletter(msg);
      }
    });
  });
}

// ============================================================================
// PROCESS INDIVIDUAL NEWSLETTER
// ============================================================================
function processNewsletter(msg) {
  const subject = msg.getSubject();
  const body = msg.getBody(); // HTML content
  const date = Utilities.formatDate(msg.getDate(), 'GMT', 'yyyy-MM-dd');
  
  // Create URL-safe slug from subject
  const slug = subject
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  console.log(`📰 Processing: ${subject} (${date})`);
  
  // Prepare payload for GitHub
  const payload = {
    event_type: EVENT_TYPE,
    client_payload: {
      title: subject,
      date: date,
      content: body,
      slug: slug,
      from: msg.getFrom(),
      timestamp: new Date().toISOString()
    }
  };
  
  // Send to GitHub
  const success = dispatchToGitHub(payload);
  
  if (success) {
    msg.markRead(); // Mark as read to prevent reprocessing
    console.log(`✅ Dispatched and marked as read: ${subject}`);
  } else {
    console.error(`❌ Failed to dispatch: ${subject}`);
  }
}

// ============================================================================
// GITHUB API CALL
// ============================================================================
function dispatchToGitHub(payload) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`;
  
  const options = {
    method: 'post',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true // Don't throw on HTTP errors
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    
    if (statusCode === 204) {
      console.log('✅ GitHub dispatch successful');
      return true;
    } else {
      console.error(`❌ GitHub API error: ${statusCode}`);
      console.error(response.getContentText());
      return false;
    }
  } catch (e) {
    console.error(`❌ Exception during dispatch: ${e.message}`);
    return false;
  }
}

// ============================================================================
// TESTING FUNCTION - Run this manually to test
// ============================================================================
function testDispatch() {
  const testPayload = {
    event_type: EVENT_TYPE,
    client_payload: {
      title: 'Test Newsletter',
      date: '2025-11-16',
      content: '<h1>Test Content</h1><p>This is a test newsletter from Gmail dispatcher.</p>',
      slug: 'test-newsletter',
      from: 'test@example.com',
      timestamp: new Date().toISOString()
    }
  };
  
  console.log('🧪 Running test dispatch...');
  console.log(`Target: ${REPO_OWNER}/${REPO_NAME}`);
  
  const success = dispatchToGitHub(testPayload);
  
  if (success) {
    console.log('✅ Test successful! Check your GitHub repository at:');
    console.log(`   https://github.com/${REPO_OWNER}/${REPO_NAME}/actions`);
  } else {
    console.log('❌ Test failed. Check the logs above.');
  }
}

// ============================================================================
// HELPER: Test Gmail Search Query
// ============================================================================
function testGmailSearch() {
  console.log('🔍 Testing Gmail search query...');
  console.log(`Query: ${GMAIL_SEARCH_QUERY}`);
  
  const threads = GmailApp.search(GMAIL_SEARCH_QUERY);
  
  console.log(`Found ${threads.length} thread(s)`);
  
  if (threads.length > 0) {
    console.log('\nFirst 5 matches:');
    threads.slice(0, 5).forEach((thread, idx) => {
      const msg = thread.getMessages()[0];
      console.log(`${idx + 1}. Subject: ${msg.getSubject()}`);
      console.log(`   From: ${msg.getFrom()}`);
      console.log(`   Date: ${msg.getDate()}`);
      console.log(`   Unread: ${msg.isUnread()}`);
    });
  } else {
    console.log('⚠️ No matching emails found. Try updating GMAIL_SEARCH_QUERY.');
  }
}
