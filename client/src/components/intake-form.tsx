import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { IntakeForm } from "@shared/schema";
import { StepAboutYou } from "./steps/step-about-you";
import { StepSkinNow } from "./steps/step-skin-now";
import { StepSymptoms } from "./steps/step-symptoms";
import { StepLifestyle } from "./steps/step-lifestyle";
import { StepHistory } from "./steps/step-history";
import { StepCycle } from "./steps/step-cycle";

interface IntakeFormProps {
  intake: IntakeForm;
  updateField: <K extends keyof IntakeForm>(field: K, value: IntakeForm[K]) => void;
  currentStep: number;
  totalSteps: number;
  showCycleStep: boolean;
  onNext: () => void;
  onPrev: () => void;
  onComplete: () => void;
}

export function IntakeFormWizard({
  intake, updateField, currentStep, totalSteps, showCycleStep, onNext, onPrev, onComplete
}: IntakeFormProps) {
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  const steps = [
    { label: "About You", component: <StepAboutYou intake={intake} updateField={updateField} /> },
    { label: "Your Skin", component: <StepSkinNow intake={intake} updateField={updateField} /> },
    { label: "Symptoms", component: <StepSymptoms intake={intake} updateField={updateField} /> },
    { label: "Your Life", component: <StepLifestyle intake={intake} updateField={updateField} /> },
    { label: "History", component: <StepHistory intake={intake} updateField={updateField} /> },
  ];

  if (showCycleStep) {
    steps.push({ label: "Cycle", component: <StepCycle intake={intake} updateField={updateField} /> });
  }

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: return intake.age >= 12 && intake.age <= 19;
      case 1: return intake.concern_zones.length > 0;
      default: return true;
    }
  };

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {steps[currentStep]?.label}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" data-testid="progress-bar" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {steps[currentStep]?.component}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3 mt-8">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={currentStep === 0}
          data-testid="button-prev"
          size="lg"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        {isLastStep ? (
          <Button
            onClick={onComplete}
            disabled={!canProceed()}
            data-testid="button-complete-intake"
            size="lg"
          >
            <Check className="w-4 h-4 mr-1" />
            Done -- Take Photo
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!canProceed()}
            data-testid="button-next"
            size="lg"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
