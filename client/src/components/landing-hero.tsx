import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Microscope, Camera, ClipboardList, Sparkles, Shield, Clock } from "lucide-react";

interface LandingHeroProps {
  onStart: () => void;
}

export function LandingHero({ onStart }: LandingHeroProps) {
  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-5">
          <Microscope className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold text-foreground mb-3 tracking-tight leading-tight">
          Your skin, your science experiment
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
          Snap a photo. Get a hypothesis. Run a skincare experiment backed by actual science. Built for teens who want answers, not guesswork.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="space-y-3 mb-8"
      >
        <StepPreview
          number={1}
          icon={<ClipboardList className="w-5 h-5 text-primary" />}
          title="Tell us about your skin"
          description="Quick questionnaire about your skin, lifestyle, and what you've tried."
        />
        <StepPreview
          number={2}
          icon={<Camera className="w-5 h-5 text-primary" />}
          title="Take a photo"
          description="One clear photo of your skin. We'll guide you on lighting and angle."
        />
        <StepPreview
          number={3}
          icon={<Sparkles className="w-5 h-5 text-primary" />}
          title="Get your experiment plan"
          description="AI-powered analysis with a personalised skincare routine to test."
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="mb-8"
      >
        <Button
          onClick={onStart}
          size="lg"
          className="w-full text-base py-6"
          data-testid="button-start"
        >
          Start Your Skin Scan
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-6 text-xs text-muted-foreground"
      >
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Not a diagnosis
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          ~2 min
        </span>
        <span className="flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5" />
          1 photo needed
        </span>
      </motion.div>
    </div>
  );
}

function StepPreview({
  number,
  icon,
  title,
  description,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold text-primary">Step {number}</span>
          </div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
    </Card>
  );
}
