import { Label } from "@/components/ui/label";
import type { IntakeForm } from "@shared/schema";

interface StepProps {
  intake: IntakeForm;
  updateField: <K extends keyof IntakeForm>(field: K, value: IntakeForm[K]) => void;
}

const stressLevels = [
  { value: 1, label: "Low", emoji: ":-)" },
  { value: 2, label: "Medium", emoji: ":-|" },
  { value: 3, label: "High", emoji: ":-(" },
];

interface ToggleCardProps {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
  testId: string;
}

function ToggleCard({ label, hint, value, onChange, testId }: ToggleCardProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      data-testid={testId}
      className={`w-full flex items-center justify-between p-4 rounded-md border-2 transition-all duration-200 text-left ${
        value
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <div className="flex-1 mr-3">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
      </div>
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
        value ? "border-primary bg-primary" : "border-muted-foreground/40"
      }`}>
        {value && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </button>
  );
}

export function StepLifestyle({ intake, updateField }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Your Life</h2>
        <p className="text-muted-foreground text-sm">Lifestyle factors that affect your skin.</p>
      </div>

      <div className="space-y-3">
        <ToggleCard
          label="Play sport / sweat regularly?"
          hint="Sweat + friction = acne mechanica risk"
          value={intake.plays_sport_sweats}
          onChange={(v) => updateField("plays_sport_sweats", v)}
          testId="toggle-sport"
        />
        <ToggleCard
          label="Wear makeup daily?"
          hint="Some products block pores (comedogenic)"
          value={intake.wears_daily_makeup}
          onChange={(v) => updateField("wears_daily_makeup", v)}
          testId="toggle-makeup"
        />
        <ToggleCard
          label="Use oily hair products?"
          hint="These can trigger forehead breakouts"
          value={intake.uses_oily_hair_products}
          onChange={(v) => updateField("uses_oily_hair_products", v)}
          testId="toggle-hair-products"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Stress level right now</Label>
        <div className="grid grid-cols-3 gap-3">
          {stressLevels.map(s => (
            <button
              key={s.value}
              onClick={() => updateField("stress_level", s.value as 1 | 2 | 3)}
              data-testid={`button-stress-${s.value}`}
              className={`flex flex-col items-center p-4 rounded-md border-2 transition-all duration-200 ${
                intake.stress_level === s.value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <span className="text-2xl mb-1 font-mono">{s.emoji}</span>
              <span className="text-xs font-semibold text-foreground">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
