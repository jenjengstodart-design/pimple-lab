import { Label } from "@/components/ui/label";
import type { IntakeForm } from "@shared/schema";

interface StepProps {
  intake: IntakeForm;
  updateField: <K extends keyof IntakeForm>(field: K, value: IntakeForm[K]) => void;
}

const cycleStages = [
  { value: "period" as const, label: "On my period" },
  { value: "week2" as const, label: "Week after period" },
  { value: "premenstrual" as const, label: "Before my period" },
  { value: "unsure" as const, label: "Not sure" },
];

export function StepCycle({ intake, updateField }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Your Cycle</h2>
        <p className="text-muted-foreground text-sm">
          Hormones play a huge role in breakouts. This helps us spot patterns.
        </p>
      </div>

      <div className="rounded-md border-2 border-border bg-card p-4">
        <p className="text-sm font-semibold text-foreground mb-3">
          Do you track your menstrual cycle?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => updateField("tracks_cycle", true)}
            data-testid="button-tracks-cycle-yes"
            className={`flex-1 py-2 rounded-md text-sm font-semibold border-2 transition-all ${
              intake.tracks_cycle
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-background text-muted-foreground"
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => {
              updateField("tracks_cycle", false);
              updateField("cycle_stage", null);
              updateField("acne_worsens_before_period", null);
            }}
            data-testid="button-tracks-cycle-no"
            className={`flex-1 py-2 rounded-md text-sm font-semibold border-2 transition-all ${
              !intake.tracks_cycle
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-background text-muted-foreground"
            }`}
          >
            No
          </button>
        </div>
      </div>

      {intake.tracks_cycle && (
        <>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Where are you in your cycle right now?</Label>
            <div className="grid grid-cols-2 gap-2">
              {cycleStages.map(s => (
                <button
                  key={s.value}
                  onClick={() => updateField("cycle_stage", s.value)}
                  data-testid={`button-cycle-${s.value}`}
                  className={`p-3 rounded-md border-2 text-sm font-medium text-center transition-all duration-200 ${
                    intake.cycle_stage === s.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-md border-2 border-border bg-card p-4">
            <p className="text-sm font-semibold text-foreground mb-3">
              Does your acne get worse before your period?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => updateField("acne_worsens_before_period", true)}
                data-testid="button-worsens-yes"
                className={`flex-1 py-2 rounded-md text-sm font-semibold border-2 transition-all ${
                  intake.acne_worsens_before_period === true
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => updateField("acne_worsens_before_period", false)}
                data-testid="button-worsens-no"
                className={`flex-1 py-2 rounded-md text-sm font-semibold border-2 transition-all ${
                  intake.acne_worsens_before_period === false
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                No / Not sure
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
