import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { usePrefs } from '@/context/PrefsContext';

export default function AppLayout() {
  const { prefs, setPref } = usePrefs();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-page">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink focus:shadow-pop">
        Skip to main content
      </a>
      <Sidebar
        collapsed={prefs.sidebarCollapsed}
        onToggle={() => setPref('sidebarCollapsed', !prefs.sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className={`transition-[padding] duration-200 ${prefs.sidebarCollapsed ? 'lg:pl-[76px]' : 'lg:pl-64'}`}>
        <div className="flex items-center justify-center gap-2 bg-sidebar px-4 py-1.5 text-center text-[11px] font-medium text-white/80">
          <FlaskConical size={12} aria-hidden="true" className="shrink-0" />
          <span>Prototype demonstration. Fictional data stored only in this browser. Not an official AICTE system.</span>
        </div>
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main id="main" className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          <ErrorBoundary key={pathname}>
            <Suspense fallback={<LoadingSkeleton />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
