import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle, CheckCircle, ShieldAlert, Beaker, ShoppingBag,
  ArrowRight, RotateCcw, Clock, Ban, Lightbulb, Stethoscope, Camera
} from "lucide-react";
import type { ResultCard as ResultCardType } from "@shared/schema";

interface ResultCardProps {
  result: ResultCardType;
  onStartOver: () => void;
}

export function ResultCardDisplay({ result, onStartOver }: ResultCardProps) {
  const isUrgent = result.see_doctor;
  const confidenceColor = result.confidence_percent >= 70
    ? "text-green-600 dark:text-green-400"
    : result.confidence_percent >= 45
    ? "text-yellow-600 dark:text-yellow-400"
    : "text-red-500 dark:text-red-400";

  return (
    <div className="w-full max-w-lg mx-auto px-4 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, staggerChildren: 0.1 }}
        className="space-y-4"
      >
        {isUrgent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-5 border-destructive/40 bg-destructive/5">
              <div className="flex items-start gap-3">
                <Stethoscope className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-destructive mb-1" data-testid="text-doctor-warning">
                    See a Doctor
                  </h3>
                  <p className="text-sm text-foreground" data-testid="text-doctor-message">
                    {result.doctor_message}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="p-5">
            <h2 className="text-xl font-bold text-foreground mb-3" data-testid="text-result-title">
              {result.title}
            </h2>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
                <Progress value={result.confidence_percent} className="h-2.5" />
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold ${confidenceColor}`} data-testid="text-confidence">
                  {result.confidence_percent}%
                </span>
              </div>
            </div>
            <p className={`text-xs font-medium ${confidenceColor} mb-4`} data-testid="text-confidence-label">
              {result.confidence_label}
            </p>

            <div className="rounded-md bg-muted/50 p-4 mb-4">
              <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <Beaker className="w-4 h-4 text-primary" />
                What we see
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-what-we-see">
                {result.what_we_see}
              </p>
            </div>

            {result.explanation && (
              <div className="rounded-md bg-primary/5 border border-primary/10 p-4 mb-4">
                <h3 className="text-sm font-semibold text-foreground mb-1">Why we think this</h3>
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-explanation">
                  {result.explanation}
                </p>
              </div>
            )}

            {result.image_warning && (
              <div className="flex items-start gap-3 p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20 mb-4">
                <Camera className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-foreground" data-testid="text-image-warning">{result.image_warning}</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground italic" data-testid="text-disclaimer">
              {result.disclaimer}
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground" data-testid="text-hypothesis">
                  {result.hypothesis}
                </h3>
                {result.experiment_question && (
                  <p className="text-sm text-muted-foreground mt-1" data-testid="text-experiment-question">
                    {result.experiment_question}
                  </p>
                )}
              </div>
            </div>

            {result.duration_days && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-primary/5 border border-primary/15 mb-4">
                <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{result.duration_days} days</span>
                  {result.check_in_date && (
                    <span className="text-muted-foreground"> — check in by {result.check_in_date}</span>
                  )}
                </p>
              </div>
            )}

            {result.purge_warning && (
              <div className="flex items-start gap-3 p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20 mb-4">
                <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-foreground" data-testid="text-purge-warning">{result.purge_warning}</p>
              </div>
            )}
          </Card>
        </motion.div>

        {result.products && result.products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="p-5">
              <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" />
                Your Routine
              </h3>
              <div className="space-y-4">
                {result.products.map((product, i) => (
                  <div key={i} className="border-b border-border last:border-0 pb-4 last:pb-0" data-testid={`product-${i}`}>
                    <Badge variant="secondary" className="mb-2 text-xs">{product.step}</Badge>
                    <p className="text-sm font-semibold text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{product.instruction}</p>
                    <p className="text-xs text-primary font-medium mt-1">{product.budget}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {result.avoid && result.avoid.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
          >
            <Card className="p-5">
              <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <Ban className="w-4 h-4 text-destructive" />
                Avoid
              </h3>
              <ul className="space-y-2">
                {result.avoid.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-destructive font-bold flex-shrink-0 mt-0.5">-</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        )}

        {result.tips && result.tips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-5">
              <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                Tips
              </h3>
              <ul className="space-y-2">
                {result.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold flex-shrink-0 mt-0.5">+</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        )}

        {result.skin_tone_note && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55 }}
          >
            <Card className="p-4 bg-accent/30">
              <p className="text-sm text-foreground" data-testid="text-skin-tone-note">{result.skin_tone_note}</p>
            </Card>
          </motion.div>
        )}

        {result.check_in_prompt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-5 border-primary/20 bg-primary/5">
              <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                At Your Check-in
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="text-check-in-prompt">
                {result.check_in_prompt}
              </p>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="pt-4"
        >
          <Button
            variant="outline"
            onClick={onStartOver}
            className="w-full"
            size="lg"
            data-testid="button-start-over"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Start a New Scan
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
