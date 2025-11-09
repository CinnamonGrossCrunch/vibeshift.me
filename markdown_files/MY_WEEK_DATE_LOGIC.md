# My Week Widget - Date Determination Logic

## 🗓️ How Dates Are Determined for Each Event

### Overview
The My Week Widget determines event dates through a **multi-step process** involving timezone conversion, week range calculation, and AI processing. All dates are normalized to **Berkeley timezone (America/Los_Angeles)** to avoid SSR/CSR hydration mismatches.

---

## 📅 Step-by-Step Date Processing

### STEP 1: Define "This Week" Range
**File**: `lib/date-utils.ts` → `getConsistentWeekRange()`

```typescript
// Process:
1. Get current date in Berkeley timezone (getConsistentToday())
   - Server runs in UTC, converts to PST/PDT
   - Example: Server UTC = "2025-10-28T08:00:00Z" → Berkeley = "2025-10-28T01:00:00"

2. Calculate week boundaries:
   - Find current day of week (0 = Sunday, 6 = Saturday)
   - Week START = Most recent Sunday at 00:00:00
   - Week END = Next Sunday at 00:00:00 (8 days later)
   
3. Result: 8-day range (Sunday to Sunday inclusive)
   - Example today = Tuesday, Oct 28, 2025:
     * weekStart = Sunday, Oct 26, 2025 00:00:00
     * weekEnd = Sunday, Nov 3, 2025 00:00:00
```

**Key Function**:
```typescript
export function getConsistentWeekRange(): { start: Date; end: Date } {
  const today = getConsistentToday(); // Berkeley timezone
  const dayOfWeek = today.getDay(); // 0-6
  
  // Start = most recent Sunday
  const start = new Date(
    today.getFullYear(), 
    today.getMonth(), 
    today.getDate() - dayOfWeek,  // Go back to Sunday
    0, 0, 0, 0
  );
  
  // End = 8 days later (next Sunday)
  const end = new Date(
    start.getFullYear(), 
    start.getMonth(), 
    start.getDate() + 8,  // Sunday → next Sunday
    0, 0, 0, 0
  );
  
  return { start, end };
}
```

---

### STEP 2: Extract Calendar Event Dates
**File**: `lib/icsUtils.ts` → `getCohortEvents()`

**Source**: ICS files in `/public`
- Blue cohort: `ewmba201a_micro_blue_fall2025.ics`, etc.
- Gold cohort: `ewmba201a_micro_gold_fall2025.ics`, etc.

**ICS Date Format**: ISO 8601 strings (UTC)
```
DTSTART:20251030T180000Z  →  "2025-10-30T18:00:00.000Z"
DTEND:20251030T210000Z    →  "2025-10-30T21:00:00.000Z"
```

**Parsing Process**:
1. `node-ical` library parses `.ics` files
2. Extracts `start` field as ISO string
3. Result: `event.start = "2025-10-30T18:00:00.000Z"`

---

### STEP 3: Filter Events by Week Range
**File**: `lib/my-week-analyzer.ts` → `filterCalendarEventsForWeek()`

**Process**:
```typescript
// 1. Parse ICS date with timezone awareness
const eventDate = parseICSDate(event.start);
// "2025-10-30T18:00:00.000Z" → Berkeley date object

// 2. Check if in range
const isInRange = isDateInWeekRange(event.start, weekStart, weekEnd);

// 3. Only include events where: weekStart <= eventDate < weekEnd
if (isInRange) {
  // Include event
}
```

**Critical Function**: `parseICSDate()`
```typescript
export function parseICSDate(isoString: string): Date {
  // 1. Parse UTC timestamp
  const utcDate = new Date(isoString);
  // "2025-10-30T18:00:00.000Z" → UTC Date object
  
  // 2. Convert to Berkeley timezone
  const berkeleyDate = toZonedTime(utcDate, 'America/Los_Angeles');
  // Handles PST/PDT conversion automatically
  
  // 3. Extract just date portion (no time)
  return new Date(Date.UTC(
    berkeleyDate.getFullYear(), 
    berkeleyDate.getMonth(), 
    berkeleyDate.getDate()
  ));
  // Returns: 2025-10-30 as Date object
}
```

**Why This Matters**:
- ICS dates are in UTC but represent local Berkeley times
- A class at "6:00 PM Pacific" = "18:00:00" local
- Stored in ICS as UTC: "2025-10-30T18:00:00.000Z" (next day at 2am UTC if PST)
- `parseICSDate()` correctly extracts the **local Berkeley date**: Oct 30

---

### STEP 4: Extract Newsletter Event Dates
**File**: `lib/my-week-analyzer.ts` → `extractNewsletterEventsForWeek()`

**Newsletter data arrives pre-processed** by AI with `timeSensitive` tags:

```typescript
// Newsletter item structure:
{
  title: "Problem Set 2 Due",
  html: "<p>Submit by Friday 11:59 PM</p>",
  timeSensitive: {
    dates: ["2025-10-31"],  // ← AI extracted this date
    deadline: "2025-10-31T23:59:00",
    eventType: "deadline",
    priority: "high"
  }
}
```

**Extraction Process**:
```typescript
// 1. Check if item has timeSensitive data
if (item.timeSensitive && item.timeSensitive.dates) {
  
  // 2. Filter dates that fall in week range
  const relevantDates = item.timeSensitive.dates.filter(dateStr => {
    const itemDate = new Date(dateStr);  // "2025-10-31" → Date
    return itemDate >= weekStart && itemDate <= weekEnd;
  });
  
  // 3. If any dates match, include event
  if (relevantDates.length > 0) {
    events.push({
      title: item.title,
      relevantDates: relevantDates,  // ← These are the event dates
      priority: item.timeSensitive.priority,
      eventType: item.timeSensitive.eventType
    });
  }
}
```

**Fallback Date Extraction** (if no `timeSensitive` tag):
```typescript
// Look for date patterns in HTML content
const dateMatches = content.match(
  /\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s+
   (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+
   \d{1,2}(?:,?\s+\d{4})?\b/gi
);

// Example matches: "Friday, October 31" or "Fri, Oct 31, 2025"

// Parse and filter by week range
dateMatches.forEach(dateMatch => {
  const eventDate = new Date(dateMatch);
  if (eventDate >= weekStart && eventDate <= weekEnd) {
    relevantDates.push(eventDate.toISOString().split('T')[0]);
  }
});
```

---

### STEP 5: AI Processes and Formats Dates
**File**: `lib/my-week-analyzer.ts` → `generateCohortSpecificAnalysis()`

**AI receives** both calendar and newsletter events, then:

1. **Formats dates for AI prompt**:
```typescript
// Calendar events formatted as:
Date: Oct 30, 2025 (2025-10-30)
Time: 6:00 PM
Title: Microeconomics - Session 3
Location: Haas F320

// Newsletter events formatted as:
Title: Problem Set 2 Due
Relevant Dates: 2025-10-31
Priority: high
Event Type: deadline
```

2. **AI returns structured JSON**:
```json
{
  "events": [
    {
      "date": "2025-10-30",  // ← AI maintains YYYY-MM-DD format
      "time": "6:00 PM",     // ← AI extracts/formats time
      "title": "Microeconomics - Session 3",
      "type": "class",
      "priority": "medium"
    }
  ]
}
```

3. **AI normalizes dates**:
   - Converts all date formats to `YYYY-MM-DD`
   - Extracts times in `HH:MM AM/PM` format
   - Ensures consistency across calendar + newsletter events

---

### STEP 6: Widget Receives Final Dates
**File**: `app/components/MyWeekWidget.tsx`

**Data structure received**:
```typescript
{
  weekStart: "2025-10-26T00:00:00.000Z",
  weekEnd: "2025-11-03T00:00:00.000Z",
  blueEvents: [
    {
      date: "2025-10-30",     // ← Final date string (YYYY-MM-DD)
      time: "6:00 PM",        // ← Formatted time
      title: "Microeconomics - Session 3",
      type: "class",
      priority: "medium"
    }
  ]
}
```

**Widget groups by day**:
```typescript
// Group events by date
const groupedEvents = events.reduce((groups, event) => {
  const eventDate = new Date(event.date);  // Parse "2025-10-30"
  const dayLabel = getDayLabel(eventDate); // "Today", "Tomorrow", "Wednesday"
  
  if (!groups[dayLabel]) groups[dayLabel] = [];
  groups[dayLabel].push(event);
  
  return groups;
}, {});

// Render:
// Today
//   ├─ Event 1
//   └─ Event 2
// Tomorrow
//   └─ Event 3
// Friday
//   ├─ Event 4
//   └─ Event 5
```

---

## 🎯 Date Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│ SOURCE                  │ DATE FORMAT            │ EXAMPLE       │
├─────────────────────────────────────────────────────────────────┤
│ 1. ICS File (UTC)       │ ISO 8601              │ 2025-10-30T18:00:00.000Z │
│    ↓ parseICSDate()                                              │
│ 2. Berkeley Date        │ Date object           │ Oct 30, 2025  │
│    ↓ isDateInWeekRange()                                         │
│ 3. Filtered Events      │ Date object           │ Oct 30, 2025  │
│    ↓ AI Processing                                               │
│ 4. AI Output            │ YYYY-MM-DD string     │ "2025-10-30"  │
│    ↓ Widget Receives                                             │
│ 5. Widget Display       │ "Today", "Friday"     │ Today 6:00 PM │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Key Timezone Considerations

### Why Timezone Handling Is Critical

**Problem**: Vercel serverless functions run in **UTC**
- Server thinks: "It's 2am Oct 30 UTC" 
- Berkeley reality: "It's 6pm Oct 29 PDT"
- Without conversion: Events appear **one day ahead**

**Solution**: Always convert to Berkeley timezone first
```typescript
const nowUTC = new Date();                    // Server UTC
const nowBerkeley = toZonedTime(nowUTC, TZ);  // Convert to PST/PDT
```

### Week Calculation Example

**Scenario**: Today is Tuesday, October 28, 2025

```typescript
// Server (UTC): 2025-10-28T15:00:00.000Z (3pm UTC)
// Berkeley: 2025-10-28T08:00:00-07:00 (8am PDT)

// Calculate week range:
const today = getConsistentToday();  
// → Oct 28, 2025 (Berkeley date, not UTC)

const dayOfWeek = today.getDay();  
// → 2 (Tuesday)

const weekStart = today - 2 days;  
// → Oct 26, 2025 00:00:00 (Sunday)

const weekEnd = weekStart + 8 days;  
// → Nov 3, 2025 00:00:00 (next Sunday)
```

**Result**: Week includes Oct 26 (Sun) through Nov 2 (Sat)

---

## 🐛 Common Date Issues & Solutions

### Issue 1: Events Show Wrong Day
**Symptom**: Event scheduled for Oct 30 shows up as Oct 31
**Cause**: UTC date not converted to Berkeley time
**Solution**: Use `parseICSDate()` instead of `new Date()`

### Issue 2: Week Range Off by One Day
**Symptom**: This week's events don't appear
**Cause**: Server calculates week in UTC, not Berkeley time
**Solution**: Use `getConsistentToday()` before week calculation

### Issue 3: Newsletter Dates Missing
**Symptom**: Newsletter events don't appear
**Cause**: 
- AI didn't extract `timeSensitive.dates`
- Dates extracted but not in current week
- Date parsing failed (invalid format)
**Solution**: Check AI output for `timeSensitive` tags and date formats

### Issue 4: Events Outside Week Range
**Symptom**: Events from next week appear in "This Week"
**Cause**: Week range too broad (> 8 days) or end date calculation wrong
**Solution**: Ensure `weekEnd = weekStart + 8 days` (Sunday to Sunday)

---

## 📊 Date Format Reference

| Context | Format | Example | Notes |
|---------|--------|---------|-------|
| ICS File | ISO 8601 UTC | `2025-10-30T18:00:00.000Z` | Stored in calendar files |
| parseICSDate() | Date object | `Oct 30, 2025` | Berkeley timezone date |
| Week Range | Date object | `Oct 26 - Nov 3` | Sunday to Sunday |
| AI Input | Human readable | `Oct 30, 2025 (2025-10-30)` | For context |
| AI Output | YYYY-MM-DD | `"2025-10-30"` | Standardized string |
| Widget Display | Relative | "Today", "Tomorrow", "Friday" | User-friendly |
| Time Format | 12-hour | `"6:00 PM"` | Consistent across all events |

---

## 🎯 Summary: How My Week Determines Dates

1. **Calculate Week Range** → `getConsistentWeekRange()`
   - Today through next Sunday (8 days)
   - Always in Berkeley timezone

2. **Parse Calendar Dates** → `parseICSDate()`
   - ICS UTC timestamps → Berkeley date objects
   - Handles PST/PDT automatically

3. **Filter by Range** → `isDateInWeekRange()`
   - Only events within `weekStart ≤ date < weekEnd`

4. **Extract Newsletter Dates** → `extractNewsletterEventsForWeek()`
   - AI pre-extracted dates from `timeSensitive` tags
   - Fallback regex for date patterns in content

5. **AI Normalizes** → `generateCohortSpecificAnalysis()`
   - Converts all dates to `YYYY-MM-DD` strings
   - Extracts times to `HH:MM AM/PM` format

6. **Widget Groups** → `MyWeekWidget.tsx`
   - Groups by day: "Today", "Tomorrow", day names
   - Sorts by time within each day

**Result**: Events appear on the correct day with proper times! 🎉
