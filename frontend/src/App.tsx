import React, { useState } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Shell } from "./components/layout/Shell";
import { Onboarding } from "./features/onboarding/Onboarding";
import { Vote, LogIn, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

// Lazy feature components
const Chat = React.lazy(() => import("./features/chat/Chat").then(m => ({ default: m.Chat })));
const Journey = React.lazy(() => import("./features/journey/Journey").then(m => ({ default: m.Journey })));
const Timeline = React.lazy(() => import("./features/timeline/Timeline").then(m => ({ default: m.Timeline })));
const Location = React.lazy(() => import("./features/location/Location").then(m => ({ default: m.Location })));

function WelcomeScreen() {
  const { signIn } = useAuth();
  
  return (
    <div className="min-h-screen bg-white selection:bg-brand/10">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 text-brand px-4 py-2 rounded-full font-semibold text-sm mb-6">
              <Vote className="w-4 h-4" />
              <span>Real-time Election Navigator</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-display font-bold leading-[0.9] tracking-tight mb-8">
              Casting your <span className="text-brand">first vote</span> shouldn't be confusing.
            </h1>
            <p className="text-xl text-slate-500 mb-10 max-w-lg leading-relaxed">
              VoteX is your personal navigator for the election process. From registration to the polling booth, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={signIn}
                className="flex items-center gap-3 bg-white text-slate-800 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all shadow-xl shadow-slate-200/50 border border-slate-200 active:scale-95 justify-center"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square bg-blue-100 rounded-[3rem] overflow-hidden rotate-3 shadow-2xl relative">
              <img 
                src="https://images.unsplash.com/photo-1540910419892-f7ef7167fcf2?auto=format&fit=crop&q=80&w=2000" 
                className="w-full h-full object-cover -rotate-3 scale-110"
                alt="Civic awareness"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand/20 to-transparent" />
            </div>
            
            {/* Feature Floaties */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -top-10 -right-10 glass p-6 rounded-2xl shadow-xl border-slate-100/50 hidden md:block"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-500" />
                <div>
                  <p className="font-bold">Verified Data</p>
                  <p className="text-xs text-slate-500">Official ECI Sources</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Trust Quote */}
      <div className="bg-slate-50 py-24 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <blockquote className="text-3xl font-display font-medium text-slate-700 leading-tight">
            "An informed citizen is the bedrock of democracy. Our mission is to ensure no one is left behind due to complexity."
          </blockquote>
          <div className="mt-8 flex justify-center items-center gap-4">
             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-brand shadow-sm">VX</div>
             <p className="font-bold text-slate-900">Debjit Chowdhury</p>
             <p className="text-slate-500">Founder, VoteX</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("journey");

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <WelcomeScreen />;
  }

  // Check if onboarding needed (e.g. age or status not set)
  if (profile && (profile.registrationStatus === "unknown" && !profile.age)) {
    return <Onboarding />;
  }

  return (
    <Shell activeTab={activeTab} setActiveTab={setActiveTab}>
      <React.Suspense fallback={<div className="p-8 text-slate-400">Loading feature...</div>}>
        {activeTab === "journey" && <Journey />}
        {activeTab === "chat" && <Chat />}
        {activeTab === "timeline" && <Timeline />}
        {activeTab === "location" && <Location />}
      </React.Suspense>
    </Shell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
