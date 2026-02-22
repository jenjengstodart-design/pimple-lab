import { motion } from "framer-motion";
import { Microscope } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="w-full max-w-lg mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
        >
          <Microscope className="w-10 h-10 text-primary" />
        </motion.div>

        <h2 className="text-2xl font-bold text-foreground mb-2">
          Running your skin science...
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Usually about 30 seconds. Hang tight.
        </p>

        <div className="w-48 mx-auto">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 35, ease: "linear" }}
            />
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <AnimatedTip delay={0} text="Analysing your photo..." />
          <AnimatedTip delay={5} text="Checking patterns against your symptoms..." />
          <AnimatedTip delay={12} text="Building your experiment plan..." />
          <AnimatedTip delay={20} text="Almost there..." />
        </div>
      </motion.div>
    </div>
  );
}

function AnimatedTip({ delay, text }: { delay: number; text: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="text-xs text-muted-foreground"
    >
      {text}
    </motion.p>
  );
}
