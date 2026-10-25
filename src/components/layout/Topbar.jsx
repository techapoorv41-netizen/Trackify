import { useState } from 'react';
import { HelpCircle, Menu, Search, X } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import GlobalSearch from '@/components/layout/GlobalSearch';
import RoleSwitcher from '@/components/layout/RoleSwitcher';
import ProfileMenu from '@/components/layout/ProfileMenu';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import HelpDrawer from '@/components/layout/HelpDrawer';

export default function Topbar({ onOpenMobile }) {
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-card">
        <div className="flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-6">
          <button type="button" onClick={onOpenMobile} aria-label="Open navigation menu" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-soft hover:text-ink lg:hidden">
            <Menu size={20} />
          </button>
          <div className="min-w-0 flex-1 md:flex-none md:basis-56 lg:basis-72">
            <Breadcrumbs />
          </div>
          <div className="mx-auto hidden w-full max-w-xl md:block">
            <GlobalSearch />
          </div>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button type="button" onClick={() => setMobileSearch((s) => !s)} aria-label={mobileSearch ? 'Close search' : 'Open search'} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-soft hover:text-ink md:hidden">
              {mobileSearch ? <X size={19} /> : <Search size={19} />}
            </button>
            <RoleSwitcher />
            <button type="button" onClick={() => setHelpOpen(true)} aria-label="Help and demo guide" className="hidden h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-soft hover:text-ink sm:flex">
              <HelpCircle size={19} />
            </button>
            <NotificationDropdown />
            <ProfileMenu />
          </div>
        </div>
        {mobileSearch && (
          <div className="border-t border-line p-3 md:hidden">
            <GlobalSearch autoFocus onDone={() => setMobileSearch(false)} />
          </div>
        )}
      </header>
      <HelpDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
