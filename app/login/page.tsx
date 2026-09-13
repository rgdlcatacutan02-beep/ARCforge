"use client";

import { useDashboardStore } from "@/store/useDashboardStore";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

export default function LoginPage() {
  const store = useDashboardStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (store.user) {
      router.push("/");
    }
  }, [store.user, router]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (error) {
      console.error("Login failed", error);
      setLoading(false);
    }
  };

  const handleContinueAsViewer = () => {
    router.push("/");
  };

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-[#0A0A0B]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 bg-[#15151A] rounded-2xl border border-white/10 shadow-2xl overflow-hidden shadow-black">
        {/* Animated grid background inside the card */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_10%,transparent_100%)] pointer-events-none"></div>
        
        <div className="flex flex-col items-center text-center relative z-10">
          <motion.div 
            className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] bg-gradient-to-br from-cyan-900/60 to-blue-900/60 border border-cyan-500/30 overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {store.projectLogoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={store.projectLogoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">{store.projectIcon || '💧'}</span>
            )}
          </motion.div>
          
          <motion.h1 
            className="text-2xl font-bold tracking-tight text-white mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            {store.projectName || 'AquaForge AI'}
          </motion.h1>
          
          <motion.p 
            className="text-sm text-white/50 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            Authentication gateway for administration<br/>and system controls.
          </motion.p>
          
          <motion.div 
            className="w-full space-y-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold rounded-lg px-4 py-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              {loading ? 'Authenticating...' : 'Sign in with Google'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#15151A] px-2 text-white/40">OR</span>
              </div>
            </div>

            <button
              onClick={handleContinueAsViewer}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              Continue as Viewer
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
