import type { IntakeForm } from "@shared/schema";

interface StepProps {
  intake: IntakeForm;
  updateField: <K extends keyof IntakeForm>(field: K, value: IntakeForm[K]) => void;
}

interface SymptomCardProps {
  question: string;
  description: string;
  value: boolean;
  onChange: (val: boolean) => void;
  testId: string;
}

function SymptomCard({ question, description, value, onChange, testId }: SymptomCardProps) {
  return (
    <div className="rounded-md border-2 border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground mb-1">{question}</p>
      <p className="text-xs text-muted-foreground mb-3">{description}</p>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(true)}
          data-testid={`${testId}-yes`}
          className={`flex-1 py-2 rounded-md text-sm font-semibold border-2 transition-all duration-200 ${
            value
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-background text-muted-foreground hover:border-primary/40"
          }`}
        >
          Yes
        </button>
        <button
          onClick={() => onChange(false)}
          data-testid={`${testId}-no`}
          className={`flex-1 py-2 rounded-md text-sm font-semibold border-2 transition-all duration-200 ${
            !value
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-background text-muted-foreground hover:border-primary/40"
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
}

export function StepSymptoms({ intake, updateField }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Symptoms</h2>
        <p className="text-muted-foreground text-sm">These help us spot patterns like fungal or cystic acne.</p>
      </div>

      <div className="space-y-3">
        <SymptomCard
          question="Are the spots itchy?"
          description="Itchiness can be a sign of fungal acne rather than bacterial."
          value={intake.is_itchy}
          onChange={(v) => updateField("is_itchy", v)}
          testId="symptom-itchy"
        />
        <SymptomCard
          question="Are any spots painful to touch?"
          description="Deep painful spots may indicate nodular or cystic acne."
          value={intake.is_painful}
          onChange={(v) => updateField("is_painful", v)}
          testId="symptom-painful"
        />
        <SymptomCard
          question="Are the bumps all roughly the same size?"
          description="Uniform-sized bumps are a hallmark of fungal folliculitis."
          value={intake.is_uniform_size}
          onChange={(v) => updateField("is_uniform_size", v)}
          testId="symptom-uniform"
        />
      </div>
    </div>
  );
}
