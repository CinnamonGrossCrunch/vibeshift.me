// Quick debug script to test current date and what the AI sees
const today = new Date();
console.log('Today is:', today.toDateString());
console.log('Day of week:', today.getDay()); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

// Test the date range calculation
const dayOfWeek = today.getDay();
const start = new Date(today);
start.setHours(0, 0, 0, 0);

let daysUntilSunday;
if (dayOfWeek === 0) {
  daysUntilSunday = 7;
} else {
  daysUntilSunday = 7 - dayOfWeek;
}

const end = new Date(today);
end.setDate(today.getDate() + daysUntilSunday);
end.setHours(23, 59, 59, 999);

console.log('Week range:', start.toDateString(), 'to', end.toDateString());

// Test specific dates we know about
const problemSet3Date = new Date('2025-09-21T23:59:59.000Z');
const goldClass7Date = new Date('2025-09-18T00:00:00.000Z');

console.log('Problem Set 3 date:', problemSet3Date.toDateString());
console.log('Gold Class 7 date:', goldClass7Date.toDateString());

// Test formatDate function equivalent - OLD VERSION
const formatDateOld = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Test formatDate function equivalent - NEW VERSION (FIX)
const formatDateNew = (dateString) => {
  const date = new Date(dateString + 'T12:00:00'); // Add noon to avoid timezone edge cases
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

console.log('\n--- OLD formatDate (broken) ---');
console.log('Problem Set 3 formatted:', formatDateOld('2025-09-21'));
console.log('Gold Class 7 formatted:', formatDateOld('2025-09-18'));

console.log('\n--- NEW formatDate (fixed) ---');
console.log('Problem Set 3 formatted:', formatDateNew('2025-09-21'));
console.log('Gold Class 7 formatted:', formatDateNew('2025-09-18'));
