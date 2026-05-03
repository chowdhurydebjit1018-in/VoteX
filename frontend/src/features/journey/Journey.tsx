import React, { useState, useEffect } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { ai, MODELS } from "@/src/lib/gemini";
import { db, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { collection, doc, getDocs, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";
import { VotingJourney, JourneyStep } from "@/src/types";
import { CheckCircle2, Circle, Clock, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

export function Journey() {
  const { user, profile } = useAuth();
  const [journey, setJourney] = useState<VotingJourney | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "journeys"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setJourney({ id: doc.id, ...doc.data() } as VotingJourney);
      } else {
        setJourney(null);
      }
    });
  }, [user]);

  const generateJourney = async () => {
    if (!user || !profile) return;
    setIsGenerating(true);

    try {
      const prompt = `Based on the following user profile, generate a personalized 5-step voting journey for a citizen of India.
      
      User Profile:
      - Age: ${profile.age}
      - Registration Status: ${profile.registrationStatus}
      - Location: ${profile.location || "India"}
      
      The steps should be specific, clear, and actionable. 
      For example, if unregistered, step 1 should be about the VOTER PORTAL registration.
      If already registered, step 1 might be about VERIFYING name in the electoral roll.
      `;

      const response = await ai.models.generateContent({
        model: MODELS.flash,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                order: { type: "integer" }
              },
              required: ["title", "description", "order"]
            }
          } as any
        }
      });

      const stepsData = JSON.parse(response.text || "[]");
      const steps: JourneyStep[] = stepsData.map((s: any, idx: number) => ({
        ...s,
        id: `step-${idx}`,
        completed: false
      }));

      await addDoc(collection(db, "users", user.uid, "journeys"), {
        userId: user.uid,
        steps,
        createdAt: serverTimestamp()
      });

    } catch (error) {
      console.error("Error generating journey:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleStep = async (stepId: string) => {
    if (!journey || !user) return;
    const newSteps = journey.steps.map(s => 
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );
    const journeyRef = doc(db, "users", user.uid, "journeys", journey.id);
    try {
      await updateDoc(journeyRef, { steps: newSteps });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/journeys/${journey.id}`);
    }
  };

  const completedCount = journey?.steps.filter(s => s.completed).length || 0;
  const totalCount = journey?.steps.length || 1;
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-display font-bold mb-2">My Voting Journey</h1>
        <p className="text-slate-500">Your personalized path to the polling booth</p>
      </div>

      {!journey && !isGenerating && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-[2rem] border border-slate-200 text-center shadow-sm"
        >
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="text-brand w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Let's build your plan</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
            We'll use AI to create a unique step-by-step guide based on your age and registration status.
          </p>
          <button
            onClick={generateJourney}
            className="bg-brand text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-brand/20 flex items-center gap-2 mx-auto"
          >
            Generate My Journey <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-brand animate-spin mb-4" />
          <p className="text-slate-500 animate-pulse font-medium">Curating your personalized plan...</p>
        </div>
      )}

      {journey && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {journey.steps.map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => toggleStep(step.id)}
                className={cn(
                  "group p-6 rounded-2xl border-2 cursor-pointer transition-all flex border-slate-100",
                  step.completed ? "bg-green-50/50 border-green-100" : "bg-white hover:border-brand/40 shadow-sm"
                )}
              >
                <div className="mr-6 mt-1">
                  {step.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-300 group-hover:text-brand" />
                  )}
                </div>
                <div>
                  <h3 className={cn(
                    "text-lg font-bold mb-1",
                    step.completed ? "text-slate-400 line-through" : "text-slate-900"
                  )}>
                    {step.title}
                  </h3>
                  <p className={cn(
                    "text-sm leading-relaxed",
                    step.completed ? "text-slate-400" : "text-slate-500"
                  )}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-8">
              <h4 className="font-bold mb-4">Overall Progress</h4>
              <div className="w-full bg-slate-100 h-3 rounded-full mb-2 overflow-hidden">
                <motion.div 
                  className="bg-brand h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm font-bold text-slate-900 mb-6">{progress}% Complete</p>
              
              <div className="p-4 bg-blue-50 rounded-xl text-sm border border-blue-100">
                <div className="flex gap-2 text-brand font-bold mb-1">
                  <Sparkles className="w-4 h-4" />
                  Next Action
                </div>
                <p className="text-slate-600">
                  {journey.steps.find(s => !s.completed)?.title || "You're all set to vote!"}
                </p>
              </div>

              <button 
                onClick={generateJourney}
                className="w-full mt-6 text-slate-400 text-xs font-medium hover:text-brand transition-colors text-center"
              >
                Regenerate Journey
              </button>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl">
              <Clock className="w-8 h-8 text-blue-400 mb-4" />
              <h4 className="font-bold mb-2">Voting Day Alert</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                The general elections are usually held between April and June. Keep your EPIC card ready.
              </p>
              <div className="text-xs font-mono text-slate-500 bg-black/30 p-2 rounded">
                 ECI STATUS: ACTIVE
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
