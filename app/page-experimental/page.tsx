import Link from "next/link";
import Image from "next/image";
import { getLatestNewsletterUrl, scrapeNewsletter } from '@/lib/scrape';
import DashboardTabs from "../components/DashboardTabs";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

async function getNewsletterData() {
  try {
    console.log('Experimental: Starting direct newsletter data fetch');
    const latest = await getLatestNewsletterUrl();
    console.log('Experimental: Latest URL found:', latest);
    const data = await scrapeNewsletter(latest);
    console.log('Experimental: Newsletter data scraped successfully');
    return data;
  } catch (error) {
    console.error('Experimental: Error fetching newsletter data:', error);
    // Fallback to API route if direct method fails
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
        || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      
      const response = await fetch(`${baseUrl}/api/newsletter`, {
        next: { revalidate: 3600 }, // Cache for 1 hour like the API route
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch newsletter data from API');
      }
      
      return await response.json();
    } catch (apiError) {
      console.error('Experimental: API fallback also failed:', apiError);
      return null;
    }
  }
}

export default async function HomeExperimental() {
  const newsletterData = await getNewsletterData();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
        style={{ backgroundImage: "url('/haas bkg.jpg')" }}
      ></div>
      
      {/* Content Overlay */}
      <div className="relative z-10">
        {/* Header */}
        <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                  <Image 
                    src="/OskiHub logo.png" 
                    alt="OskiHub Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl font-semibold text-slate-900 dark:text-white">OskiHub (Experimental)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
          {/* Dashboard Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              HAAS MBA Dashboard - Experimental
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your centralized hub for MBA resources and updates (experimental version)
            </p>
          </div>

          {/* Tabbed Interface */}
          <DashboardTabs newsletterData={newsletterData} />
        </main>
      </div>
    </div>
  );
}
