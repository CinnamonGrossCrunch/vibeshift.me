'use client';

export default function SlackWidget() {
  return (
    <div className="group cursor-pointer">
      <div 
        className="relative p-6 h-56 rounded-4xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-center transition-all duration-300 overflow-hidden group-hover:scale-[1.02]"
        style={{
          backgroundImage: "url('/slack cap.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md rounded-4xl group-hover:bg-black/80 transition-all duration-200"></div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center transition-transform duration-400">
          <div className="text-center">
            <h3 className="text-base font-semibold text-white mb-2 drop-shadow-lg">Slack Updates</h3>
            <p className="text-sm text-white/90 drop-shadow">Coming Soon - Stay tuned for updates</p>
          </div>
        </div>
      </div>
    </div>
  );
}
