# VibeShift — Landing Page

The cognitive operating system for deep work. Built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Vercel

### Option A: One-Click Deploy

1. Push this repository to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Vercel auto-detects Next.js — no configuration needed
5. Click **Deploy**

### Option B: Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Custom Domain (vibeshift.me)

1. In your Vercel project dashboard, go to **Settings > Domains**
2. Add `vibeshift.me`
3. Configure your domain registrar's DNS:
   - **A Record**: `76.76.21.21`
   - **CNAME**: `cname.vercel-dns.com` (for `www` subdomain)
4. Vercel handles SSL automatically

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles, Tailwind directives, custom utilities
│   ├── layout.tsx           # Root layout with Inter font, metadata, OG tags
│   └── page.tsx             # Main page composing all sections
├── components/
│   ├── Navbar.tsx           # Floating glassmorphism navigation bar
│   ├── Hero.tsx             # Full-screen hero with CTAs and floating cards
│   ├── NeuralCanvas.tsx     # Canvas-based particle/neural network animation
│   ├── TrustStrip.tsx       # Horizontal trust/positioning indicators
│   ├── Problem.tsx          # Problem statement section
│   ├── Solution.tsx         # Solution presentation with pillar cards
│   ├── HowItWorks.tsx       # 4-step process (Sense, Interpret, Orchestrate, Adapt)
│   ├── Features.tsx         # 8 feature capability cards
│   ├── ProductMockups.tsx   # Fake product UI (dashboard, charts, controls)
│   ├── Vision.tsx           # Manifesto-style vision section
│   ├── Waitlist.tsx         # Email signup / CTA section
│   ├── Footer.tsx           # Footer with links and branding
│   └── SectionReveal.tsx    # Reusable scroll-triggered animation wrapper
├── public/                  # Static assets (favicons, OG images)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
└── postcss.config.mjs
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4
- **Animation**: Framer Motion 11
- **Icons**: Lucide React
- **Deployment**: Vercel

## Replacing the Waitlist Placeholder

The waitlist form in `components/Waitlist.tsx` currently logs email submissions to the console. To connect it to a real backend:

### Option 1: Vercel + API Route

Create `app/api/waitlist/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  // Store in your database (e.g., Supabase, PlanetScale, Airtable)
  // await db.insert({ email, createdAt: new Date() });

  return NextResponse.json({ success: true });
}
```

Then update the `handleSubmit` in `Waitlist.tsx`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email) return;

  const res = await fetch("/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (res.ok) setSubmitted(true);
};
```

### Option 2: Third-Party Services

- **Mailchimp**: Use their API to add subscribers to a list
- **ConvertKit**: Use their form API endpoint
- **Airtable**: POST directly to an Airtable base via their API
- **Google Sheets**: Use the Google Sheets API or a service like SheetDB
- **Resend**: For transactional welcome emails alongside storage

### Option 3: Supabase (Recommended for Speed)

```bash
npm install @supabase/supabase-js
```

Create a `waitlist` table in Supabase, then:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// In handleSubmit:
await supabase.from("waitlist").insert({ email });
```

## Brand Assets

When replacing placeholder assets, add to `public/`:

- `favicon.ico` — 32x32 favicon
- `apple-touch-icon.png` — 180x180 Apple touch icon
- `og-image.png` — 1200x630 Open Graph image

## Brand Story

VibeShift was founded on a simple observation: the most important variable in knowledge work isn't the tools — it's the person using them. Human cognition isn't constant. It rises and falls with biology, environment, behavior, and time. Yet every productivity tool on the market treats attention as unlimited and interchangeable. VibeShift is the first system designed to close that gap — combining multimodal sensing, adaptive AI, and real-time environmental orchestration to help people work at their cognitive best, not just their hardest.

## Headline & Copy Options

### Headlines
1. **"The Operating System for Deep Work"** (primary)
2. "Focus Is Not a Trait. It's a System."
3. "Your Best Cognitive State, On Demand"
4. "Software That Adapts to How You Think"

### Subheadlines
1. "Multimodal intelligence that senses your cognitive state, understands your patterns, and actively shapes the conditions for peak performance." (primary)
2. "From wearable signals to real-time interventions — a living system that learns how you focus best."
3. "The first platform that treats attention as something you engineer, not something you hope for."

### CTA Lines
1. "Join the Waitlist" (primary)
2. "Get Founding Access"
3. "Be First to Shift"
4. "Request Early Access"
5. "Enter the Founding Cohort"

## License

Proprietary. All rights reserved.
