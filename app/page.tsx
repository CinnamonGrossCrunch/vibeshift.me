import ClientDashboard from "./components/ClientDashboard";
import type { UnifiedDashboardData } from '@/app/api/unified-dashboard/route';

// Force dynamic rendering to ensure fresh data on every request
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

async function getUnifiedDashboardData(): Promise<UnifiedDashboardData> {
  // Use absolute URL for server-side fetch
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/unified-dashboard`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard data: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Server-side data fetch error:', error);
    // Return fallback data structure
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    return {
      newsletterData: {
        sourceUrl: '',
        title: 'Newsletter Unavailable',
        sections: [{
          sectionTitle: 'System Message',
          items: [{
            title: 'Error Loading Newsletter',
            html: '<p>Unable to load newsletter data. Please try refreshing the page.</p>'
          }]
        }],
        aiDebugInfo: {
          reasoning: 'error',
          sectionDecisions: [],
          edgeCasesHandled: [],
          totalSections: 0,
          processingTime: 0
        }
      },
      myWeekData: {
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        blueEvents: [],
        goldEvents: [],
        blueSummary: 'Unable to load My Week data',
        goldSummary: 'Unable to load My Week data',
        processingTime: 0
      },
      cohortEvents: {
        blue: [],
        gold: [],
        original: [],
        launch: [],
        calBears: [],
        campusGroups: []
      },
      processingInfo: {
        totalTime: 0,
        newsletterTime: 0,
        calendarTime: 0,
        myWeekTime: 0,
        timestamp: new Date().toISOString()
      }
    };
  }
}

export default async function Home() {
  // Fetch data server-side
  const initialData = await getUnifiedDashboardData();
  
  // Pass data to client component
  return <ClientDashboard initialData={initialData} />;
}
