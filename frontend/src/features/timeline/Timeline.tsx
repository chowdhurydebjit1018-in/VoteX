import React from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { Calendar, Bell, ChevronRight, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { cn, formatDate } from "@/src/lib/utils";

export function Timeline() {
  const [activeNotifications, setActiveNotifications] = React.useState<string[]>([]);
  
  const deadlines = [
    {
      title: "Voter List Revision",
      date: "2026-05-15",
      type: "Deadline",
      description: "Last date to check and update your name in the draft electoral roll.",
      urgency: "high"
    },
    {
      title: "New Registration Window",
      date: "2026-06-01",
      type: "Opening",
      description: "Submitting Form 6 for new voter registration.",
      urgency: "medium"
    },
    {
      title: "Constinuency Announcement",
      date: "2026-07-10",
      type: "Information",
      description: "Final notification of redrawn constituency boundaries.",
      urgency: "low"
    },
    {
      title: "National Voter Day",
      date: "2027-01-25",
      type: "Event",
      description: "Celebration and awareness drives across all polling stations.",
      urgency: "low"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-display font-bold mb-2">Important Deadlines</h1>
        <p className="text-slate-500">Stay ahead of the election cycle events</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: "Urgent", count: 1, color: "bg-red-500" },
          { label: "Upcoming", count: 2, color: "bg-amber-500" },
          { label: "Completed", count: 0, color: "bg-slate-300" },
          { label: "Total", count: 4, color: "bg-brand" }
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-display font-bold">{stat.count}</span>
              <div className={cn("w-2 h-2 rounded-full animate-pulse", stat.color)} />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {deadlines.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group flex gap-6 bg-white p-6 rounded-3xl border border-slate-100 hover:border-brand/20 transition-all shadow-sm hover:shadow-md"
          >
            <div className="hidden sm:flex flex-col items-center justify-center w-20 flex-shrink-0">
               <span className="text-2xl font-display font-bold leading-none">{new Date(item.date).getDate()}</span>
               <span className="text-xs font-bold uppercase text-slate-400">{new Date(item.date).toLocaleString('default', { month: 'short' })}</span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {item.urgency === "high" && <AlertTriangle className="w-4 h-4 text-red-500" />}
                <span className={cn(
                  "text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full",
                  item.urgency === "high" ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"
                )}>
                  {item.type}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-1 group-hover:text-brand transition-colors">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
            </div>

            <button 
              onClick={() => {
                const isNotified = activeNotifications.includes(item.title);
                if (isNotified) {
                  setActiveNotifications(prev => prev.filter(t => t !== item.title));
                } else {
                  setActiveNotifications(prev => [...prev, item.title]);
                  alert(`Notification set for: ${item.title}`);
                }
              }}
              className={cn(
                "self-center p-3 rounded-full transition-all",
                activeNotifications.includes(item.title)
                  ? "bg-brand text-white shadow-md shadow-brand/20"
                  : "bg-slate-50 text-slate-400 group-hover:bg-brand group-hover:text-white"
              )}
            >
              <Bell className="w-5 h-5" fill={activeNotifications.includes(item.title) ? "currentColor" : "none"} />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-brand rounded-[2rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-brand/20">
         <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">Registration Drive is Live!</h3>
            <p className="text-brand-foreground opacity-80 max-w-md">The Election Commission is conducting a special summary revision. Update your details before the next deadline.</p>
         </div>
         <a 
           href="https://voters.eci.gov.in/" 
           target="_blank" 
           rel="noreferrer"
           className="bg-white text-brand px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-100 transition-colors whitespace-nowrap"
          >
           Visit Voter Portal <ChevronRight className="w-5 h-5" />
         </a>
      </div>
    </div>
  );
}
