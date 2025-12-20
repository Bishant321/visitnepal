import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Compass, Map, User, Bell, ShoppingBag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import LanguageSwitcher, { useLanguage } from "../components/LanguageSwitcher";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { t } = useLanguage();
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const navItems = [
    { name: t('discover'), key: "discover", url: createPageUrl("Home"), icon: Compass },
    { name: t('experiences'), key: "experiences", url: createPageUrl("Experiences"), icon: ShoppingBag },
    { name: t('maps'), key: "maps", url: createPageUrl("Maps"), icon: Map },
    { name: t('alerts'), key: "alerts", url: createPageUrl("AlertsDashboard"), icon: Bell },
    { name: t('myPlans'), key: "myPlans", url: createPageUrl("MyPlans"), icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-red-50/20">
      <style>{`
        :root {
          --primary: 127 29 29;
          --primary-dark: 87 13 13;
          --accent: 217 119 6;
          --gold: 180 83 9;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Top Header */}
      <header className="bg-gradient-to-r from-red-900 via-red-800 to-amber-900 text-white sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to={createPageUrl("Home")} className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/50 float-animation overflow-hidden">
                  <svg viewBox="0 0 60 50" className="w-full h-full">
                    <path d="M0,0 L30,50 L0,40 Z" fill="#DC143C" stroke="#003893" strokeWidth="2"/>
                    <path d="M30,50 L60,0 L30,10 Z" fill="#DC143C" stroke="#003893" strokeWidth="2"/>
                    <circle cx="15" cy="20" r="6" fill="white"/>
                    <path d="M15,14 L15,26 M9,20 L21,20" stroke="#003893" strokeWidth="1"/>
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-ping" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Nepal for Visit 🇳🇵</h1>
                <p className="text-xs text-amber-200">Naturally Nepal, Once is Not Enough</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.url}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    location.pathname === item.url
                      ? "bg-white/20 text-white font-medium backdrop-blur-sm shadow-lg"
                      : "text-amber-100 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
              <LanguageSwitcher />
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-amber-100">{user?.full_name || "Explorer"}</p>
                <p className="text-xs text-amber-200">🔐 {t('secureLogin')}</p>
              </div>
              <button
                onClick={() => window.location.href = createPageUrl("Profile")}
                className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition-shadow"
              >
                {user?.full_name?.[0] || "N"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-red-900 via-red-800 to-amber-900 border-t border-red-700/50 z-50 backdrop-blur-xl">
        <div className="flex justify-around items-center h-20 px-2">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.url}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${
                location.pathname === item.url
                  ? "text-amber-300 transform scale-110"
                  : "text-amber-100/70"
              }`}
            >
              <item.icon className={`w-5 h-5 ${location.pathname === item.url ? 'drop-shadow-glow' : ''}`} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}