import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { IntakeForm } from "@shared/schema";

interface StepProps {
  intake: IntakeForm;
  updateField: <K extends keyof IntakeForm>(field: K, value: IntakeForm[K]) => void;
}

const sexOptions = [
  { value: "male" as const, label: "Male", icon: "M" },
  { value: "female" as const, label: "Female", icon: "F" },
  { value: "prefer_not_to_say" as const, label: "Prefer not to say", icon: "?" },
];

export function StepAboutYou({ intake, updateField }: StepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">About You</h2>
        <p className="text-muted-foreground text-sm">Quick basics so we can tailor your analysis.</p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">How old are you?</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[intake.age]}
            onValueChange={(v) => updateField("age", v[0])}
            min={12}
            max={19}
            step={1}
            className="flex-1"
            data-testid="slider-age"
          />
          <span className="text-2xl font-bold text-primary min-w-[3ch] text-center" data-testid="text-age">
            {intake.age}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">Age helps us understand hormonal factors.</p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Biological sex</Label>
        <div className="grid grid-cols-3 gap-3">
          {sexOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => updateField("biological_sex", opt.value)}
              data-testid={`button-sex-${opt.value}`}
              className={`
                relative flex flex-col items-center justify-center p-4 rounded-md border-2 transition-all duration-200
                ${intake.biological_sex === opt.value
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
                }
              `}
            >
              <span className="text-lg font-bold mb-1">{opt.icon}</span>
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          This unlocks cycle-related questions if relevant.
        </p>
      </div>
    </div>
  );
}
