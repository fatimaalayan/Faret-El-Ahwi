import React, { useState, useEffect } from 'react';
import { MuteToggle } from '../MuteToggle/MuteToggle';

export interface LayoutProps {
  children: React.ReactNode;
  dir?: 'rtl' | 'ltr';
  className?: string;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  dir = 'rtl',
  className = '',
  isDarkMode: externalDarkMode,
  onToggleDarkMode,
}) => {
  const [internalDark, setInternalDark] = useState(false);
  const isDark = externalDarkMode !== undefined ? externalDarkMode : internalDark;

  const toggleTheme = () => {
    if (onToggleDarkMode) {
      onToggleDarkMode();
    } else {
      setInternalDark((prev) => !prev);
    }
  };

  useEffect(() => {
    // Reflect dark class on document element as well for consistent theming
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div
      id="zaka-layout-shell"
      dir={dir}
      className={`min-h-screen w-full transition-colors duration-200 ${isDark ? 'dark bg-[#140f0c] text-[#fbf8f3]' : 'bg-[#fbf8f3] text-[#261610]'}`}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      {/* Mobile-first centered shell with safe-area spacing and generous touch padding */}
      <div className="min-h-screen w-full flex flex-col justify-between">
        {/* Top bar for orientation & theme toggle */}
        <header
          id="layout-header"
          className="w-full max-w-xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between border-b border-app-border/40"
        >
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-leb-red inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-leb-green inline-block"></span>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-app-text">
              تحدي زكا • ZAKA FUN
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <MuteToggle />

            <button
              type="button"
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-xs font-semibold bg-app-surface border border-app-border text-app-text shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              aria-label="تبديل المظهر / Toggle theme"
            >
              {isDark ? '☀️ فاتح' : '🌙 داكن'}
            </button>
          </div>
        </header>

        {/* Main Content Area with large touch-target spacing and mobile containment */}
        <main
          id="layout-main"
          className={`w-full max-w-xl mx-auto flex-1 flex flex-col p-4 sm:p-6 gap-6 ${className}`}
        >
          {children}
        </main>

        {/* Safe-area bottom spacer */}
        <footer
          id="layout-footer"
          className="w-full max-w-xl mx-auto px-4 py-3 text-center text-xs text-app-muted border-t border-app-border/30"
        >
          <span>ZAKA FUN Challenge • Party Game System</span>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
