import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, RotateCcw, Check, Upload, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PhotoCaptureProps {
  onPhotoSelected: (file: File) => void;
  onBack: () => void;
}

const photoTips = [
  { icon: "check", text: "Face a window or bright lamp (natural light is best)" },
  { icon: "check", text: "No makeup on the area you want to check" },
  { icon: "check", text: "Hold your phone about 30cm from your face" },
  { icon: "check", text: "Centre your face / affected area in the frame" },
  { icon: "check", text: "Stay still - blurry photos get worse results" },
  { icon: "check", text: "Take up to 3 photos and pick the sharpest one" },
];

const photoAvoid = [
  "Flash, dim lighting, dark backgrounds, filters",
  "If checking chest or back, get someone to help angle the camera",
];

export function PhotoCapture({ onPhotoSelected, onBack }: PhotoCaptureProps) {
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showTips, setShowTips] = useState(true);
  const [darkWarning, setDarkWarning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxAttempts = 3;
  const attemptsLeft = maxAttempts - photos.length;

  const checkBrightness = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = 100;
        canvas.height = 100;
        ctx?.drawImage(img, 0, 0, 100, 100);
        const imageData = ctx?.getImageData(0, 0, 100, 100);
        if (!imageData) { resolve(false); return; }
        let totalBrightness = 0;
        for (let i = 0; i < imageData.data.length; i += 4) {
          totalBrightness += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        }
        const avgBrightness = totalBrightness / (imageData.data.length / 4);
        resolve(avgBrightness < 60);
      };
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || photos.length >= maxAttempts) return;

    const isDark = await checkBrightness(file);
    setDarkWarning(isDark);

    const url = URL.createObjectURL(file);
    setPhotos(prev => [...prev, { file, url }]);
    setSelectedIndex(photos.length);
    setShowTips(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [photos.length, checkBrightness]);

  const handleUsePhoto = useCallback(() => {
    if (selectedIndex !== null && photos[selectedIndex]) {
      onPhotoSelected(photos[selectedIndex].file);
    }
  }, [selectedIndex, photos, onPhotoSelected]);

  const handleRetake = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  if (showTips) {
    return (
      <div className="w-full max-w-lg mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Getting a good photo
            </h2>
            <p className="text-muted-foreground text-sm">
              A clear photo makes a big difference in our analysis.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {photoTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-primary/5 border border-primary/20">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{tip.text}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-8">
            {photoAvoid.map((avoid, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-destructive/5 border border-destructive/20">
                <span className="text-destructive text-sm font-bold flex-shrink-0">X</span>
                <span className="text-sm text-foreground">{avoid}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} data-testid="button-back-to-form" size="lg">
              Back
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
              size="lg"
              data-testid="button-take-photo"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take or Upload Photo
            </Button>
          </div>
        </motion.div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="input-photo"
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground mb-1">Review Your Photo</h2>
          <p className="text-muted-foreground text-sm">
            {attemptsLeft > 0
              ? `Pick your best one. ${attemptsLeft} retake${attemptsLeft > 1 ? "s" : ""} left.`
              : "No retakes left. Please select a photo to use."
            }
          </p>
        </div>

        {darkWarning && (
          <div className="flex items-start gap-3 p-3 rounded-md bg-yellow-500/10 border border-yellow-500/30 mb-4">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-foreground">
              This photo looks a bit dark. Try facing a brighter light if you can.
            </span>
          </div>
        )}

        <div className="grid gap-3 mb-4">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              data-testid={`button-select-photo-${i}`}
              className={`relative rounded-md border-2 overflow-visible transition-all ${
                selectedIndex === i
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <img
                src={photo.url}
                alt={`Photo attempt ${i + 1}`}
                className="w-full h-48 object-cover rounded-md"
              />
              {selectedIndex === i && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                Photo {i + 1}
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          {attemptsLeft > 0 ? (
            <Button variant="outline" onClick={handleRetake} data-testid="button-retake" size="lg">
              <RotateCcw className="w-4 h-4 mr-1" />
              Retake
            </Button>
          ) : null}
          <Button
            onClick={handleUsePhoto}
            disabled={selectedIndex === null}
            className="flex-1"
            data-testid="button-use-photo"
            size="lg"
          >
            <Check className="w-4 h-4 mr-1" />
            Use This Photo
          </Button>
        </div>
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
