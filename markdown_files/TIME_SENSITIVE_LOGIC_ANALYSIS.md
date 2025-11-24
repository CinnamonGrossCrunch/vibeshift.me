# Time-Sensitive Event Extraction Logic Analysis

## Overview
The system uses a **two-stage hybrid approach** to extract time-sensitive events from newsletters:
1. **AI-powered extraction** (primary, gpt-4o-mini)
2. **Regex fallback** (secondary, pattern matching)

---

## Stage 1: AI-Powered Extraction (`extractTimeSensitiveData`)

### Location
`lib/openai-organizer-fixed.ts` - lines 59-243

### Process Flow

1. **Input**: Already-organized newsletter with sections/items
2. **Preparation**: Flatten all items with first 500 chars of content
3. **AI Prompt**: Send to `gpt-4o-mini` with strict extraction rules
4. **Output**: JSON array of time-sensitive items with metadata

### AI Prompt Rules

**CRITICAL EXTRACTION RULES:**
```typescript
1. ONLY include items with EXPLICIT dates mentioned in text
2. DO NOT infer or guess dates - skip if no date mentioned
3. Match day names carefully (e.g., "Monday, Nov 4" = 2025-11-04)
4. Skip weekly digests without specific dates ("Saturday Scoop")
5. Skip multi-date advisories without specifics (parking for "all games")
6. Extract ALL explicitly mentioned dates from text
7. Validate day name matches calendar (warn on mismatch)
8. Convert all formats to YYYY-MM-DD
```

**Current Context (hardcoded in prompt):**
```
- Today is Sunday, November 3, 2025
- Reference dates: Mon Nov 4, Tue Nov 5, Wed Nov 6, Thu Nov 7, Fri Nov 8, Sat Nov 9, Sun Nov 10
```

**Event Type Classification:**
- `deadline`: Submission deadlines, registration closes
- `event`: Scheduled meetings, speaker series, clinics with time/location
- `announcement`: General info without specific action date
- `reminder`: Ongoing opportunities without single deadline

**Priority Levels:**
- `high`: Urgent/today items
- `medium`: This week items
- `low`: General announcements

### Examples (from prompt)

✅ **Extracted:**
```json
"Coffee Chat Thursday, Nov 6, 9-10 AM" 
→ {"dates": ["2025-11-06"], "eventType": "event", "priority": "high"}

"Flu Shot Clinic Tuesday, Nov 4, 12-4PM" 
→ {"dates": ["2025-11-04"], "eventType": "event", "priority": "high"}
```

❌ **Skipped:**
```
"FTMBA Electives for Spring 2026" (no date mentioned)
"Saturday Scoop" (just newsletter name)
"Parking Advisory for all basketball games" (vague multiple dates)
```

### Date Validation

After AI extraction, the system validates:

```typescript
// Check day name matches extracted date
const getDayName = (dateStr: string): string => {
  const date = new Date(dateStr + 'T12:00:00'); // Noon avoids timezone issues
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

// Warn on mismatches
if (mentionedDay && mentionedDay !== dayName.toLowerCase()) {
  console.warn(`⚠️ Day mismatch for "${item.title}": text mentions "${mentionedDay}" but date ${dateStr} is ${dayName}`);
}
```

### Output Structure

Each newsletter item gets enriched with:

```typescript
timeSensitive?: {
  dates: string[];           // ["2025-11-04", "2025-11-05"]
  deadline?: string;         // Optional main deadline
  eventType: 'deadline' | 'event' | 'announcement' | 'reminder';
  priority: 'high' | 'medium' | 'low';
}
```

---

## Stage 2: Regex Fallback (`extractNewsletterEventsForWeek`)

### Location
`lib/my-week-analyzer.ts` - lines 263-410

### When Used
For items **without** `timeSensitive` metadata from AI extraction.

### Date Pattern Matching

```typescript
const datePatterns = [
  // Pattern 1: Day name + Month + Date
  // Matches: "Sunday, Nov 16", "Friday Nov 21"
  /\b(?:Mon|Tues?|Wed(?:nes)?|Thu(?:rs)?|Fri|Sat(?:ur)?|Sun)(?:day)?s?,?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(?:,?\s+\d{4})?\b/gi,
  
  // Pattern 2: Month + Date
  // Matches: "Nov 15", "Dec 1", "May 23, 2026"
  /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:,?\s+\d{4})?\b/gi
];
```

### Year Handling

```typescript
const currentYear = new Date().getFullYear();
const newsletterYear = currentYear; // Could extract from newsletterData.title

// Strip day-of-week to avoid JS parsing bugs
const cleanDateStr = dateMatch.replace(/^\w+,?\s+/, '');

// Check if year is included
const hasYear = /\d{4}/.test(cleanDateStr);

if (hasYear) {
  eventDate = new Date(cleanDateStr);
} else {
  // Add newsletter year
  eventDate = new Date(cleanDateStr + ', ' + newsletterYear);
}
```

### Week Filtering

```typescript
if (eventDate >= weekStart && eventDate <= weekEnd) {
  relevantDates.push(eventDate.toISOString().split('T')[0]);
}
```

### Fallback Output

```typescript
{
  title: item.title,
  html: item.html,
  section: section.sectionTitle,
  relevantDates: uniqueDates,
  priority: 'low',              // Always low for fallback
  eventType: 'announcement',    // Always announcement
  fallbackParsing: true,        // Flag indicates regex extraction
  sourceMetadata: { ... }
}
```

---

## Integration with My Week Widget

### Data Flow

```
Newsletter Item
    ↓
AI Extraction (gpt-4o-mini)
    ↓
timeSensitive: { dates, eventType, priority }
    ↓
Filter by Week Range
    ↓
generateCohortSpecificAnalysis (AI)
    ↓
Final Events with type: 'newsletter'
    ↓
MyWeekWidget Display
```

### Event Structure in My Week

```typescript
{
  date: "2025-11-04",
  time: undefined,                    // Newsletters typically don't have times
  title: "Coffee Chat",
  type: "newsletter",                 // Always 'newsletter' type
  priority: "high",                   // From timeSensitive
  description: "...",
  sourceType: "newsletter",
  newsletterSource: {
    sectionTitle: "Events This Week",
    sectionIndex: 2,
    itemTitle: "Coffee Chat",
    itemIndex: 0
  }
}
```

---

## Current Issues & Limitations

### 1. **Hardcoded Reference Dates in Prompt**
```typescript
CURRENT CONTEXT:
- Today is Sunday, November 3, 2025
- Reference dates: Mon Nov 4, Tue Nov 5, ...
```

**Problem**: These dates are static in the prompt and don't update with actual current date.

**Impact**: AI may extract dates based on old reference week.

**Solution**: Dynamically generate current week dates in prompt:
```typescript
const today = new Date();
const weekDays = Array.from({length: 7}, (_, i) => {
  const date = new Date(today);
  date.setDate(today.getDate() + i);
  return `${date.toLocaleDateString('en-US', {weekday: 'short'})} ${date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}`;
});

const prompt = `CURRENT CONTEXT:
- Today is ${today.toLocaleDateString('en-US', {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})}
- Reference dates: ${weekDays.join(', ')}
...`;
```

### 2. **Year Inference**
```typescript
const newsletterYear = currentYear; // Could extract from newsletterData.title if needed
```

**Problem**: Assumes current year for all dates without explicit year.

**Impact**: December events in November newsletter might be assigned wrong year.

**Solution**: Extract year from newsletter title or first date mention.

### 3. **No Time Extraction**
Newsletter events appear in My Week without time information, even when mentioned in text.

**Example**: "Coffee Chat Thursday, Nov 6, **9-10 AM**" → time not captured

**Solution**: Extend AI prompt to extract times:
```json
{
  "dates": ["2025-11-06"],
  "time": "9:00 AM",
  "eventType": "event"
}
```

### 4. **Day Name Validation Only Warns**
```typescript
if (mentionedDay && mentionedDay !== dayName.toLowerCase()) {
  console.warn(`⚠️ Day mismatch ...`);
}
return true; // Keep all dates anyway
```

**Problem**: Mismatched dates are kept and logged as warnings, not corrected.

**Impact**: Wrong dates may appear in My Week if AI extracts incorrectly.

**Solution**: Use the mentioned day name to correct the date:
```typescript
if (mentionedDay && mentionedDay !== dayName.toLowerCase()) {
  // Find the correct date for the mentioned day
  const correctDate = findDateForDayName(mentionedDay, monthStr, yearStr);
  return correctDate;
}
```

### 5. **Limited Date Format Support**
Current regex patterns may miss:
- ISO format: "2025-11-04"
- Numeric: "11/4/2025"
- Range: "Nov 4-6"
- Relative: "this Thursday"

### 6. **No Multi-Day Event Support**
"Nov 4-6 Workshop" would be extracted as single date or skipped entirely.

**Solution**: Detect ranges and create multiple date entries:
```typescript
{
  "dates": ["2025-11-04", "2025-11-05", "2025-11-06"],
  "isRange": true
}
```

---

## Performance Characteristics

### AI Extraction
- **Model**: gpt-4o-mini (fast)
- **Timeout**: 300 seconds (5 minutes)
- **Token limit**: 2000 max_tokens
- **Temperature**: 0.1 (deterministic)
- **Typical duration**: ~500-2000ms depending on newsletter size

### Regex Fallback
- **Performance**: Instant (<10ms)
- **Accuracy**: Lower (pattern matching only)
- **Scope**: Only runs on items without AI extraction

---

## Recommendations for Improvement

### 1. **Dynamic Date Context**
Replace hardcoded dates in prompt with current week.

### 2. **Time Extraction**
Add time field to timeSensitive structure.

### 3. **Date Validation & Correction**
Fix mismatched day names instead of just warning.

### 4. **Multi-Day Event Support**
Handle date ranges properly.

### 5. **Better Year Inference**
Extract year from newsletter context or title.

### 6. **Expanded Date Formats**
Add regex patterns for ISO dates, numeric formats, ranges.

### 7. **Logging Improvements**
Add structured logging to track:
- How many items had AI extraction
- How many fell back to regex
- Success rate of week filtering
- Common parsing failures

### 8. **Testing**
Create test suite with sample newsletter items:
```typescript
testCases = [
  { input: "Coffee Chat Thursday, Nov 6, 9-10 AM", expected: {...} },
  { input: "Deadline: Nov 15 at 11:59 PM", expected: {...} },
  { input: "Workshop Nov 4-6", expected: {...} }
];
```

---

## Summary

**Strengths:**
✅ Two-stage approach provides good coverage  
✅ AI handles complex date formats and context  
✅ Regex fallback catches stragglers  
✅ Week filtering prevents irrelevant events  
✅ Source tracking enables click-to-navigate  

**Weaknesses:**
❌ Hardcoded reference dates in AI prompt  
❌ No time extraction from event text  
❌ Year inference assumptions  
❌ Day mismatch warnings not acted upon  
❌ Limited multi-day event support  
❌ Missing some date formats  

**Next Steps:**
1. Fix dynamic date context in AI prompt (highest priority)
2. Add time extraction
3. Improve date validation and correction
4. Create comprehensive test suite
