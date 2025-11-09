# My Week Widget - Complete Data Flow Analysis

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 1: DATA COLLECTION (lib/icsUtils.ts)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  getCohortEvents(150, 150)                                              │
│    ├─ Reads 5 ICS files per cohort from /public:                       │
│    │   Blue: ewmba201a_micro_blue, leadingpeople_blue, etc.            │
│    │   Gold: ewmba201a_micro_gold, leadingpeople_gold, etc.            │
│    ├─ Parses with node-ical library                                    │
│    └─ Returns: CohortEvents {                                          │
│         blue: CalendarEvent[]    // ~50+ events                        │
│         gold: CalendarEvent[]    // ~50+ events                        │
│         original: CalendarEvent[] // calendar.ics for context          │
│         launch: CalendarEvent[]   // UC Launch events                  │
│         calBears: CalendarEvent[] // Sports events                     │
│       }                                                                 │
│                                                                         │
│  Each CalendarEvent has:                                               │
│    - uid, title, start, end (ISO dates)                                │
│    - location, url, description                                        │
│    - cohort: 'blue' | 'gold'                                           │
│    - source: filename (for categorization)                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 2: NEWSLETTER DATA (lib/scrape.ts + lib/openai-organizer.ts)      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Newsletter Processing (separate flow):                                │
│    1. getLatestNewsletterUrl() - fetches URL from Canvas               │
│    2. scrapeNewsletter() - extracts HTML content                       │
│    3. organizeNewsletterWithAI() - AI structures into sections         │
│                                                                         │
│  Returns: OrganizedNewsletter {                                        │
│    sourceUrl: string                                                   │
│    title: string                                                       │
│    sections: NewsletterSection[] {                                     │
│      sectionTitle: string                                              │
│      items: NewsletterItem[] {                                         │
│        title: string                                                   │
│        html: string                                                    │
│        timeSensitive?: {                                               │
│          dates: string[]        // AI-extracted dates                 │
│          deadline?: string                                             │
│          eventType: 'deadline' | 'event' | ...                         │
│          priority: 'high' | 'medium' | 'low'                           │
│        }                                                               │
│      }                                                                 │
│    }                                                                   │
│  }                                                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 3: AI ANALYSIS (lib/my-week-analyzer.ts)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  analyzeCohortMyWeekWithAI(cohortEvents, newsletterData)               │
│                                                                         │
│  3A. Filter Events for "This Week"                                     │
│      ├─ getThisWeekRange() - Today through next Sunday (8 days)       │
│      ├─ Filter blue events in range                                   │
│      ├─ Filter gold events in range                                   │
│      └─ Results: ~5-15 events per cohort                              │
│                                                                         │
│  3B. Categorize Each Event                                             │
│      categorizeEvent(title, description, source)                       │
│      ├─ Patterns: "due", "deadline" → assignment/high                 │
│      ├─ "exam", "test" → exam/high                                    │
│      ├─ "class", "lecture" → class/medium                             │
│      ├─ "registration", "form" → administrative/medium                │
│      └─ teams@haas files → social/low                                 │
│                                                                         │
│  3C. Extract Newsletter Events                                         │
│      extractNewsletterEvents(newsletterData)                           │
│      ├─ Looks for timeSensitive items with dates                      │
│      ├─ Parses dates in various formats                               │
│      ├─ Creates WeeklyEvent objects                                   │
│      └─ Categorizes as 'newsletter' type                              │
│                                                                         │
│  3D. Merge & Sort                                                      │
│      ├─ Combine calendar + newsletter events                          │
│      ├─ Sort by date, then priority (high → medium → low)             │
│      └─ Format to WeeklyEvent[] structure                             │
│                                                                         │
│  3E. AI Summary Generation                                             │
│      ├─ Build prompt with all week events                             │
│      ├─ Call OpenAI GPT-4o-mini (~5-10s)                              │
│      ├─ Cache result for 24 hours (by date + cohort)                  │
│      └─ Generate cohort-specific summaries                            │
│                                                                         │
│  Returns: CohortMyWeekAnalysis {                                       │
│    weekStart: ISO string                                               │
│    weekEnd: ISO string                                                 │
│    blueEvents: WeeklyEvent[] {                                         │
│      date: "2025-01-15"                                                │
│      time: "18:00"                                                     │
│      title: "Microeconomics - Session 3"                               │
│      type: "class"                                                     │
│      priority: "medium"                                                │
│      description?: string                                              │
│      location?: string                                                 │
│      url?: string                                                      │
│    }                                                                   │
│    goldEvents: WeeklyEvent[]  // Same structure                        │
│    blueSummary: "AI-generated narrative..."                            │
│    goldSummary: "AI-generated narrative..."                            │
│    processingTime: milliseconds                                        │
│    aiMeta?: { model, modelsTried, ms }                                 │
│  }                                                                     │
│                                                                         │
│  ⏱️ Timing: ~10-15 seconds (AI call ~5-10s + processing)               │
│  💾 Caching: 24-hour cache per cohort, keyed by date                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 4: API ORCHESTRATION (app/api/unified-dashboard/route.ts)         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  GET /api/unified-dashboard                                             │
│                                                                         │
│  Parallel Execution (Promise.allSettled):                              │
│    ┌─ Newsletter fetch + AI organize (180s timeout) ─┐                │
│    │                                                  │                │
│    └─ getCohortEvents(150, 150) (10s timeout) ───────┤                │
│                                                       ↓                │
│  Sequential Execution:                                                 │
│    └─ analyzeCohortMyWeekWithAI() (15s timeout)                        │
│         ├─ Uses newsletter result (or fallback)                        │
│         ├─ Uses calendar result (or fallback)                          │
│         └─ Returns CohortMyWeekAnalysis                                │
│                                                                         │
│  Fallback Handling:                                                    │
│    If My Week times out → Return empty events with message            │
│    If Newsletter times out → Use fallback structure                   │
│    If Calendar times out → Use empty cohort events                    │
│                                                                         │
│  Returns: UnifiedDashboardData {                                       │
│    newsletterData: OrganizedNewsletter                                 │
│    myWeekData: CohortMyWeekAnalysis  ← THIS IS WHAT WIDGET GETS       │
│    cohortEvents: CohortEvents                                          │
│    processingInfo: { totalTime, newsletterTime, ... }                  │
│  }                                                                     │
│                                                                         │
│  ⏱️ Total Time: ~75-90 seconds (dominated by newsletter AI)            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 5: CLIENT DASHBOARD (app/components/ClientDashboard.tsx)          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  useEffect(() => {                                                      │
│    fetch('/api/unified-dashboard')                                      │
│      .then(res => res.json())                                           │
│      .then(data => {                                                    │
│        setDashboardData(data);  // Stores UnifiedDashboardData         │
│        setLoading(false);                                               │
│      })                                                                 │
│  }, []);                                                                │
│                                                                         │
│  Passes to child components:                                           │
│    <MainDashboardTabs                                                   │
│      cohortEvents={data.cohortEvents}                                   │
│      selectedCohort={selectedCohort}                                    │
│      dashboardData={data}  ← Full unified data                         │
│    />                                                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 6: MY WEEK WIDGET RENDERING (app/components/MyWeekWidget.tsx)     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Props received:                                                        │
│    data?: MyWeekData  ← dashboardData.myWeekData                       │
│    selectedCohort: 'blue' | 'gold'                                     │
│                                                                         │
│  Data structure (MyWeekData):                                          │
│    {                                                                    │
│      weekStart: "2025-10-28T00:00:00.000Z"                             │
│      weekEnd: "2025-11-03T23:59:59.999Z"                               │
│      blueEvents: [                                                     │
│        { date, time, title, type, priority, ... },                     │
│        { date, time, title, type, priority, ... }                      │
│      ],                                                                │
│      goldEvents: [...],                                                │
│      blueSummary: "This week blue cohort has...",                      │
│      goldSummary: "This week gold cohort has..."                       │
│    }                                                                   │
│                                                                         │
│  Rendering Logic:                                                       │
│    1. Filter events by selectedCohort                                  │
│       const events = selectedCohort === 'blue'                         │
│                      ? data.blueEvents                                 │
│                      : data.goldEvents;                                │
│                                                                         │
│    2. Group events by day of week                                      │
│       groupEventsByDay(events)                                         │
│       ├─ Today → "Today" section                                       │
│       ├─ Tomorrow → "Tomorrow" section                                 │
│       └─ Other days → "Wednesday", "Thursday", etc.                    │
│                                                                         │
│    3. Render each event with:                                          │
│       ├─ Priority indicator (color dot)                                │
│       ├─ Type icon (📚 class, 📝 assignment, etc.)                     │
│       ├─ Time badge if present                                         │
│       ├─ Clickable → triggers calendar glow effect                     │
│       └─ Description/location in hover/expand                          │
│                                                                         │
│    4. Display AI summary                                               │
│       Shows cohort-specific narrative summary at top                   │
│                                                                         │
│  Event Click Interaction:                                              │
│    handleEventClick(event, eventTitle)                                 │
│    ├─ Dispatches 'triggerCalendarGlow' custom event                   │
│    ├─ Scrolls to calendar list view                                   │
│    └─ Highlights matching event in calendar                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 🔍 Key Data Transformations

### CalendarEvent → WeeklyEvent
```typescript
// Input (from ICS)
{
  uid: "abc123",
  title: "EWMBA 201A - Microeconomics - Session 3",
  start: "2025-10-30T18:00:00.000Z",  // ISO timestamp
  end: "2025-10-30T21:00:00.000Z",
  location: "Haas F320",
  description: "Synchronous session...",
  cohort: "blue",
  source: "ewmba201a_micro_blue_fall2025.ics"
}

// Output (for widget)
{
  date: "2025-10-30",              // Extracted date
  time: "18:00",                   // Extracted time
  title: "Microeconomics - Session 3",  // Cleaned title
  type: "class",                   // Categorized
  priority: "medium",              // Assigned priority
  description: "Synchronous session...",
  location: "Haas F320",
  url: undefined
}
```

### Newsletter Item → WeeklyEvent
```typescript
// Input (from AI-organized newsletter)
{
  title: "Problem Set 2 Due",
  html: "<p>Submit PS2 by Friday 11:59 PM</p>",
  timeSensitive: {
    dates: ["2025-10-31"],
    deadline: "2025-10-31T23:59:00",
    eventType: "deadline",
    priority: "high"
  }
}

// Output (for widget)
{
  date: "2025-10-31",
  time: "23:59",
  title: "Problem Set 2 Due",
  type: "newsletter",
  priority: "high",
  description: "Submit PS2 by Friday 11:59 PM"
}
```

## ⚡ Performance & Caching

### Caching Strategy
- **Newsletter AI**: 24-hour cache, keyed by `sourceUrl`
- **My Week AI**: 24-hour cache, keyed by `date-cohort` (e.g., "2025-10-28-blue")
- **Calendar ICS**: No cache (always fresh from files)

### Timing Breakdown (Typical)
```
Total: ~75-90 seconds
├─ Newsletter scrape + AI: 70-75s (parallel)
├─ Calendar ICS parsing: 2-3s (parallel)
└─ My Week AI analysis: 10-15s (sequential, after above)
```

### Timeouts Configured
- Newsletter: 180s (3 minutes)
- Calendar: 10s
- My Week: 15s
- **Total unified-dashboard**: 200s (maxDuration)

## 🐛 Common Issues & Symptoms

### Issue 1: Empty Events Array
**Symptom**: `blueEvents: []` or `goldEvents: []`
**Possible Causes**:
- No calendar events in "this week" date range
- Date range calculation error (timezone issues)
- ICS file parsing failures
- Events filtered out during categorization

### Issue 2: Missing Summary
**Symptom**: `blueSummary` or `goldSummary` is empty/generic
**Possible Causes**:
- AI API call failed (timeout/error)
- Cache returned stale data
- Fallback data triggered by timeout

### Issue 3: Wrong Cohort Events Showing
**Symptom**: Blue cohort sees gold events or vice versa
**Possible Causes**:
- `selectedCohort` prop not passed correctly
- Widget filtering logic error
- ICS files have wrong cohort tags

### Issue 4: Newsletter Events Not Included
**Symptom**: Only calendar events show, no newsletter items
**Possible Causes**:
- Newsletter `timeSensitive` data missing
- Date parsing failed for newsletter items
- Newsletter not in "this week" range
- `extractNewsletterEvents()` function error

## 🔧 Debug Points

### To diagnose your issue, check these console logs:

1. **Calendar Data**: `getCohortEvents()` in icsUtils.ts
   - How many events per cohort?
   - Are dates in correct format?

2. **Week Range**: `getThisWeekRange()` in my-week-analyzer.ts
   - What's the start/end date?
   - Is timezone correct?

3. **Event Filtering**: `analyzeCohortMyWeekWithAI()` 
   - How many events before/after filtering?
   - Are events in date range?

4. **Widget Rendering**: `MyWeekWidget.tsx` useEffect
   - What data is received?
   - Are events present for selected cohort?

### Quick Debug Commands
```typescript
// In browser console
console.log('Raw data:', dashboardData.myWeekData);
console.log('Blue events:', dashboardData.myWeekData.blueEvents);
console.log('Gold events:', dashboardData.myWeekData.goldEvents);
console.log('Selected cohort:', selectedCohort);
```

## 📝 What's Your Specific Issue?

Now that you understand the data flow, what issue are you seeing with My Week Widget?
- Empty events?
- Wrong cohort data?
- Missing summaries?
- Events not displaying correctly?
