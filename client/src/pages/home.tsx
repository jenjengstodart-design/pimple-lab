import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useIntakeStore } from "@/lib/intake-store";
import { IntakeFormWizard } from "@/components/intake-form";
import { PhotoCapture } from "@/components/photo-capture";
import { LoadingScreen } from "@/components/loading-screen";
import { ResultCardDisplay } from "@/components/result-card";
import { LandingHero } from "@/components/landing-hero";
import type { ResultCard } from "@shared/schema";

type AppPhase = "landing" | "intake" | "photo" | "analysing" | "result";

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("landing");
  const [result, setResult] = useState<ResultCard | null>(null);
  const { toast } = useToast();

  const {
    intake,
    currentStep,
    totalSteps,
    showCycleStep,
    updateField,
    nextStep,
    prevStep,
    reset: resetIntake,
    setCurrentStep,
  } = useIntakeStore();

  const analyseMutation = useMutation({
    mutationFn: async (photo: File) => {
      const formData = new FormData();
      formData.append("photo", photo);
      formData.append("intake", JSON.stringify(intake));

      const res = await fetch("/api/analyse", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errorMsg = "Analysis failed";
        try {
          const errData = await res.json();
          errorMsg = errData.message || errorMsg;
        } catch {
          errorMsg = await res.text() || errorMsg;
        }
        throw new Error(errorMsg);
      }
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data.card);
      setPhase("result");
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setPhase("photo");
    },
  });

  const handleStart = useCallback(() => {
    setPhase("intake");
  }, []);

  const handleIntakeComplete = useCallback(() => {
    setPhase("photo");
  }, []);

  const handlePhotoSelected = useCallback((file: File) => {
    setPhase("analysing");
    analyseMutation.mutate(file);
  }, [analyseMutation]);

  const handleBackToIntake = useCallback(() => {
    setPhase("intake");
  }, []);

  const handleStartOver = useCallback(() => {
    resetIntake();
    setResult(null);
    setPhase("landing");
  }, [resetIntake]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <button
            onClick={handleStartOver}
            className="flex items-center gap-2"
            data-testid="button-logo"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">PL</span>
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">Pimple Lab</span>
          </button>
          {phase !== "landing" && phase !== "analysing" && (
            <span className="text-xs text-muted-foreground font-medium">
              {phase === "intake" ? "Intake" : phase === "photo" ? "Photo" : "Results"}
            </span>
          )}
        </div>
      </header>

      <main className="py-8">
        <AnimatePresence mode="wait">
          {phase === "landing" && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LandingHero onStart={handleStart} />
            </motion.div>
          )}

          {phase === "intake" && (
            <motion.div key="intake" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <IntakeFormWizard
                intake={intake}
                updateField={updateField}
                currentStep={currentStep}
                totalSteps={totalSteps}
                showCycleStep={showCycleStep}
                onNext={nextStep}
                onPrev={prevStep}
                onComplete={handleIntakeComplete}
              />
            </motion.div>
          )}

          {phase === "photo" && (
            <motion.div key="photo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PhotoCapture
                onPhotoSelected={handlePhotoSelected}
                onBack={handleBackToIntake}
              />
            </motion.div>
          )}

          {phase === "analysing" && (
            <motion.div key="analysing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingScreen />
            </motion.div>
          )}

          {phase === "result" && result && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResultCardDisplay result={result} onStartOver={handleStartOver} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
