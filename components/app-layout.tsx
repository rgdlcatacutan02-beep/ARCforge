"use client";

import { AppSidebar } from '@/components/app-sidebar';
import { useDashboardStore } from '@/store/useDashboardStore';
import { Menu, Settings, LogIn, LogOut, Radio } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [systemTime, setSystemTime] = useState<string>('');
  const store = useDashboardStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Ticking clock with UTC & Local date display
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0];
      setSystemTime(`${dateStr} ${timeStr}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const state = useDashboardStore.getState();
      state.setKey('user', user);
      state.setKey('authInitialized', true);
      if (user) {
        state.setKey('role', 'admin'); 
      } else {
        state.setKey('role', 'viewer');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (pathname === '/login') {
    return <div className="h-screen w-full bg-[#0A0A0B] flex flex-col">{children}</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden w-full bg-[#0A0A0B]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar with dynamic transform for mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <AppSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col relative min-w-0 overflow-hidden w-full">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-[#0F0F12]/80 backdrop-blur-md shrink-0 w-full">
          <div className="flex items-center gap-4 md:gap-8">
            <button 
              className="md:hidden p-2 -ml-2 text-white/50 hover:text-white transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 hidden lg:flex">
              <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">System Time:</span>
              <span className="text-xs font-mono text-cyan-400 font-semibold">{systemTime || 'Synchronizing...'}</span>
            </div>
            <div className="flex items-center gap-2 hidden lg:flex">
              <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">Gateway:</span>
              <span className="text-xs font-mono text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                ONLINE (98ms)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {store.role === 'admin' && (
              <Link href="/settings" className="p-2 text-white/50 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10 hidden sm:block">
                <Settings size={20} />
              </Link>
            )}
            
            <div className="text-right hidden sm:block cursor-pointer group">
              <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors uppercase">{store.role === 'admin' ? 'Admin Root' : 'Viewer'}</div>
              <div className="text-[10px] text-white/40">{store.role === 'admin' ? 'Full Access' : 'Read Only'}</div>
            </div>
            
            <div className="flex items-center gap-2">
              {store.user ? (
                <button 
                  onClick={handleLogout}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 border-2 border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                  title="Login as Admin"
                >
                  <LogIn size={16} />
                </button>
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 auto-rows-max max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
