// Quick test to see API response
fetch('http://localhost:3001/api/unified-dashboard')
  .then(response => response.json())
  .then(data => {
    console.log('🔍 API Response Structure:');
    console.log('myWeekData keys:', Object.keys(data.myWeekData || {}));
    console.log('blueEvents count:', data.myWeekData?.blueEvents?.length || 0);
    console.log('goldEvents count:', data.myWeekData?.goldEvents?.length || 0);
    console.log('blueSummary:', data.myWeekData?.blueSummary ? 'Present' : 'Missing');
    console.log('goldSummary:', data.myWeekData?.goldSummary ? 'Present' : 'Missing');
    
    if (data.myWeekData?.blueEvents) {
      console.log('📘 Blue Events:', data.myWeekData.blueEvents);
    }
    if (data.myWeekData?.goldEvents) {
      console.log('📙 Gold Events:', data.myWeekData.goldEvents);
    }
  })
  .catch(error => {
    console.error('❌ API Error:', error);
  });
