import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-surface-2 font-livvic">
      <nav className="bg-surface border-b border-slate-200 py-4 px-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <span className="text-xl font-bold text-brand-blue">SWS AI</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group">
              {/* Notification icon will go here */}
              <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error border-2 border-surface rounded-full"></span>
              </button>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300"></div>
          </div>
        </div>
      </nav>

      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
