import { Label } from "@/components/ui/label";
import type { IntakeForm } from "@shared/schema";

interface StepProps {
  intake: IntakeForm;
  updateField: <K extends keyof IntakeForm>(field: K, value: IntakeForm[K]) => void;
}

const treatmentOptions = [
  { value: "nothing", label: "Nothing yet" },
  { value: "basic_cleanser", label: "Basic cleanser" },
  { value: "salicylic_acid", label: "Salicylic acid" },
  { value: "benzoyl_peroxide", label: "Benzoyl peroxide" },
  { value: "antibiotic_cream", label: "Antibiotic cream" },
  { value: "retinoid", label: "Retinoid" },
  { value: "other", label: "Other" },
];

const familyOptions = [
  { value: "none" as const, label: "None" },
  { value: "mild" as const, label: "Mild" },
  { value: "moderate" as const, label: "Moderate" },
  { value: "severe" as const, label: "Severe" },
];

export function StepHistory({ intake, updateField }: StepProps) {
  const toggleTreatment = (val: string) => {
    const current = intake.tried_before;
    if (current.includes(val)) {
      updateField("tried_before", current.filter(t => t !== val));
    } else {
      updateField("tried_before", [...current, val]);
    }
  };

  const showAntibioticQuestion = intake.tried_before.includes("antibiotic_cream");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Your History</h2>
        <p className="text-muted-foreground text-sm">What you've already tried helps us avoid repeats.</p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">What have you tried before?</Label>
        <div className="grid grid-cols-2 gap-2">
          {treatmentOptions.map(t => (
            <button
              key={t.value}
              onClick={() => toggleTreatment(t.value)}
              data-testid={`button-tried-${t.value}`}
              className={`p-3 rounded-md border-2 text-sm font-medium text-left transition-all duration-200 ${
                intake.tried_before.includes(t.value)
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {showAntibioticQuestion && (
        <div className="rounded-md border-2 border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground mb-1">
            Did antibiotic cream NOT help?
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            If antibiotics didn't work, it could point to fungal acne.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => updateField("antibiotic_cream_no_improvement", true)}
              data-testid="button-antibiotic-no-improvement-yes"
              className={`flex-1 py-2 rounded-md text-sm font-semibold border-2 transition-all ${
                intake.antibiotic_cream_no_improvement
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-background text-muted-foreground"
              }`}
            >
              Yes, didn't help
            </button>
            <button
              onClick={() => updateField("antibiotic_cream_no_improvement", false)}
              data-testid="button-antibiotic-no-improvement-no"
              className={`flex-1 py-2 rounded-md text-sm font-semibold border-2 transition-all ${
                !intake.antibiotic_cream_no_improvement
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-background text-muted-foreground"
              }`}
            >
              It helped some
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Label className="text-sm font-medium">Family acne history</Label>
        <div className="grid grid-cols-4 gap-2">
          {familyOptions.map(f => (
            <button
              key={f.value}
              onClick={() => updateField("family_acne_history", f.value)}
              data-testid={`button-family-${f.value}`}
              className={`p-3 rounded-md border-2 text-sm font-medium text-center transition-all duration-200 ${
                intake.family_acne_history === f.value
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
