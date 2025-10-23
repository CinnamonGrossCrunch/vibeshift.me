// Quick test of timezone functions
const { toZonedTime } = require('date-fns-tz');

const BERKELEY_TZ = 'America/Los_Angeles';

function getConsistentToday() {
  const nowUTC = new Date();
  const nowBerkeley = toZonedTime(nowUTC, BERKELEY_TZ);
  const normalized = new Date(nowBerkeley.getFullYear(), nowBerkeley.getMonth(), nowBerkeley.getDate());
  
  console.log('UTC Now:', nowUTC.toISOString());
  console.log('Berkeley Now:', nowBerkeley.toString());
  console.log('Normalized Today:', normalized.toString());
  console.log('Day of week:', normalized.getDay(), '(0=Sunday, 3=Wednesday)');
  
  return normalized;
}

function getConsistentWeekRange() {
  const today = getConsistentToday();
  const dayOfWeek = today.getDay();
  
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek, 0, 0, 0, 0);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7, 0, 0, 0, 0);
  
  console.log('\nWeek Range:');
  console.log('Start (Sunday):', start.toDateString());
  console.log('End (next Sunday):', end.toDateString());
  console.log('Expected: Oct 20 - Oct 27');
  
  return { start, end };
}

getConsistentWeekRange();
