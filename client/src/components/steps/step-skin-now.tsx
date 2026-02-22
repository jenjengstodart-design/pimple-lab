import { Label } from "@/components/ui/label";
import type { IntakeForm } from "@shared/schema";

interface StepProps {
  intake: IntakeForm;
  updateField: <K extends keyof IntakeForm>(field: K, value: IntakeForm[K]) => void;
}

const zoneOptions = [
  { value: "forehead", label: "Forehead" },
  { value: "left_cheek", label: "Left Cheek" },
  { value: "right_cheek", label: "Right Cheek" },
  { value: "chin", label: "Chin" },
  { value: "nose", label: "Nose / T-zone" },
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
];

const durationOptions = [
  { value: 1, label: "~1 week" },
  { value: 2, label: "~2 weeks" },
  { value: 4, label: "~1 month" },
  { value: 8, label: "~2 months" },
  { value: 12, label: "~3 months" },
  { value: 24, label: "6+ months" },
];

export function StepSkinNow({ intake, updateField }: StepProps) {
  const toggleZone = (zone: string) => {
    const current = intake.concern_zones;
    if (current.includes(zone)) {
      updateField("concern_zones", current.filter(z => z !== zone));
    } else {
      updateField("concern_zones", [...current, zone]);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Your Skin Right Now</h2>
        <p className="text-muted-foreground text-sm">Where are you seeing the most issues?</p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Problem areas (select all that apply)</Label>
        <div className="grid grid-cols-2 gap-2">
          {zoneOptions.map(zone => (
            <button
              key={zone.value}
              onClick={() => toggleZone(zone.value)}
              data-testid={`button-zone-${zone.value}`}
              className={`
                flex items-center gap-2 p-3 rounded-md border-2 text-left text-sm font-medium transition-all duration-200
                ${intake.concern_zones.includes(zone.value)
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
                }
              `}
            >
              <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-colors ${
                intake.concern_zones.includes(zone.value) ? "bg-primary border-primary" : "border-muted-foreground/40"
              }`} />
              {zone.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">How long has this been going on?</Label>
        <div className="grid grid-cols-3 gap-2">
          {durationOptions.map(d => (
            <button
              key={d.value}
              onClick={() => updateField("duration_weeks", d.value)}
              data-testid={`button-duration-${d.value}`}
              className={`
                p-3 rounded-md border-2 text-sm font-medium text-center transition-all duration-200
                ${intake.duration_weeks === d.value
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
                }
              `}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
