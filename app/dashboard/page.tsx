import NewsletterWidget from '../components/NewsletterWidget';

type NewsletterData = {
  sourceUrl: string;
  title?: string;
  sections: Array<{
    sectionTitle: string;
    items: Array<{ title: string; html: string }>;
  }>;
};

async function loadData(): Promise<NewsletterData> {
  // For server-side rendering, use the appropriate base URL
  let baseUrl = '';
  
  if (process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`;
  } else if (process.env.NODE_ENV === 'development') {
    baseUrl = 'http://localhost:3000';
  } else {
    baseUrl = 'http://localhost:3000';
  }
  
  const res = await fetch(`${baseUrl}/api/newsletter`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    throw new Error(`Failed to load newsletter: ${res.status}`);
  }
  return res.json();
}

export default async function DashboardPage() {
  let data: NewsletterData | null = null;
  try {
    data = await loadData();
  } catch {
    // Fallback UI
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-amber-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">NW</span>
                </div>
                <span className="text-xl font-semibold text-slate-900 dark:text-white">OskiBoard</span>
              </div>
            </div>
          </div>
        </div>
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Unable to Load Newsletter</h1>
            <p className="text-red-600 dark:text-red-400 mb-6">Failed to load the latest newsletter data.</p>
            <a 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-800 text-white font-semibold rounded-xl hover:from-blue-800 hover:to-blue-700 transition-all duration-200"
            >
              ← Back to Home
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NW</span>
              </div>
              <span className="text-xl font-semibold text-slate-900 dark:text-white">Newsletter Dashboard</span>
            </div>
            <a 
              href="/" 
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          
        </div>
        
        <NewsletterWidget data={data} />
      </main>
    </div>
  );
}
