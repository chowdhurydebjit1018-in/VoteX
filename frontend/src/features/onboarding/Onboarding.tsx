import React, { useState } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { Vote, ArrowRight, UserCheck, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export function Onboarding() {
  const { profile, updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    age: profile?.age || 18,
    registrationStatus: profile?.registrationStatus || "unknown",
    location: profile?.location || "",
  });

  const handleComplete = async () => {
    await updateProfile({
      ...data,
      registrationStatus: data.registrationStatus as "unregistered" | "registered" | "unknown",
    });
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Vote className="text-brand w-8 h-8" />
          </div>
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-display font-bold mb-2">Welcome to CivicGuide</h2>
            <p className="text-slate-500 mb-8">To give you the best advice, we need a few details about your voting status.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Age</label>
                <input
                  type="number"
                  min="18"
                  value={data.age}
                  onChange={(e) => setData({ ...data, age: parseInt(e.target.value) })}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
                />
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-brand text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-brand/20 mt-4"
              >
                Next <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-display font-bold mb-2">Are you registered?</h2>
            <p className="text-slate-500 mb-6">Have you already registered for your Epic Card (Voter ID)?</p>
            
            <div className="grid grid-cols-1 gap-3 mb-8">
              {[
                { id: "registered", label: "Yes, I am registered", icon: UserCheck, color: "text-green-600 bg-green-50" },
                { id: "unregistered", label: "No, not yet", icon: AlertCircle, color: "text-red-600 bg-red-50" },
                { id: "unknown", label: "I am not sure", icon: AlertCircle, color: "text-slate-400 bg-slate-50" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setData({ ...data, registrationStatus: option.id as any })}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                    data.registrationStatus === option.id
                      ? "border-brand bg-blue-50/50"
                      : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", option.color)}>
                    <option.icon className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">{option.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-slate-200 py-4 rounded-2xl font-bold hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                className="flex-[2] bg-brand text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-brand/20"
              >
                Complete Profile
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
