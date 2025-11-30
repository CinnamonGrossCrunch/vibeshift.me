const fs = require('fs');
const path = require('path');

const files = [
  'lib/scrape.ts',
  'lib/icsUtils.ts',
  'lib/calendar.ts'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix safeLog recursion
  content = content.replace(
    /const safeLog = \(\.\.\.args: unknown\[\]\) => \{\s+if \(process\.env\.NODE_ENV === 'development'\) \{\s+safeLog\(\.\.\.args\);/g,
    `const safeLog = (...args: unknown[]) => {\n  if (process.env.NODE_ENV === 'development') {\n    console.log(...args);`
  );
  
  // Fix safeError recursion
  content = content.replace(
    /const safeError = \(\.\.\.args: unknown\[\]\) => \{\s+if \(typeof process !== 'undefined' && process\.stderr\) \{\s+safeError\(\.\.\.args\);/g,
    `const safeError = (...args: unknown[]) => {\n  if (typeof process !== 'undefined' && process.stderr) {\n    console.error(...args);`
  );
  
  // Fix safeWarn recursion
  content = content.replace(
    /const safeWarn = \(\.\.\.args: unknown\[\]\) => \{\s+if \(process\.env\.NODE_ENV === 'development'\) \{\s+safeWarn\(\.\.\.args\);/g,
    `const safeWarn = (...args: unknown[]) => {\n  if (process.env.NODE_ENV === 'development') {\n    console.warn(...args);`
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed ${file}`);
});

console.log('\n✅ All files fixed! Now restart your dev server.');
