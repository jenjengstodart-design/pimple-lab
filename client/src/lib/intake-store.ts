import { useState, useCallback } from "react";
import type { IntakeForm } from "@shared/schema";

const defaultIntake: IntakeForm = {
  age: 15,
  biological_sex: "prefer_not_to_say",
  concern_zones: [],
  duration_weeks: 4,
  is_itchy: false,
  is_painful: false,
  is_uniform_size: false,
  plays_sport_sweats: false,
  wears_daily_makeup: false,
  stress_level: 2,
  uses_oily_hair_products: false,
  tried_before: [],
  antibiotic_cream_no_improvement: false,
  family_acne_history: "none",
  tracks_cycle: false,
  cycle_stage: null,
  acne_worsens_before_period: null,
  other_changes_this_week: null,
};

export function useIntakeStore() {
  const [intake, setIntake] = useState<IntakeForm>(defaultIntake);
  const [currentStep, setCurrentStep] = useState(0);

  const showCycleStep = intake.biological_sex === "female";
  const totalSteps = showCycleStep ? 6 : 5;

  const updateField = useCallback(<K extends keyof IntakeForm>(field: K, value: IntakeForm[K]) => {
    setIntake(prev => ({ ...prev, [field]: value }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setIntake(defaultIntake);
    setCurrentStep(0);
  }, []);

  return {
    intake,
    setIntake,
    currentStep,
    setCurrentStep,
    totalSteps,
    showCycleStep,
    updateField,
    nextStep,
    prevStep,
    reset,
  };
}
