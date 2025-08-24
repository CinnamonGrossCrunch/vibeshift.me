# Newsletter Widget - GitHub Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a Next.js TypeScript project that implements a NewsletterWidget for scraping and displaying Mailchimp newsletter campaigns.

## Project Structure

- `lib/scrape.ts` - Core scraping logic using Cheerio and sanitize-html
- `app/api/newsletter/route.ts` - API endpoint that returns scraped newsletter data
- `app/components/NewsletterWidget.tsx` - React component for displaying newsletter content
- `app/dashboard/page.tsx` - Dashboard page that displays the widget

## Key Features

- Server-side scraping using Node runtime
- Mailchimp campaign archive parsing
- HTML sanitization and link absolutization  
- Collapsible sections with h2/h3 structure parsing
- Tailwind CSS styling

## Dependencies

- cheerio - Server-side jQuery-like HTML parsing
- sanitize-html - HTML sanitization
- node-fetch - HTTP requests (fallback for older Node versions)

## Coding Guidelines

- Use TypeScript with strict typing
- Follow Next.js App Router patterns
- Implement proper error handling with try/catch
- Use server-side rendering for data fetching
- Apply defensive programming practices for web scraping
- Maintain clean, readable code with proper interfaces
