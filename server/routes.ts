import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import sharp from "sharp";
import { callMedGemma, parseMedGemmaResponse } from "./medgemma";
import { generateExperiment, calculateConfidenceScore, formatResultCard } from "./experiment-engine";
import { intakeFormSchema } from "@shared/schema";
import { randomUUID } from "crypto";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/analyse", upload.single("photo"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No photo provided" });
      }

      let intake;
      try {
        const rawIntake = JSON.parse(req.body.intake);
        intake = intakeFormSchema.parse(rawIntake);
      } catch (e: any) {
        return res.status(400).json({ message: "Invalid intake data: " + e.message });
      }

      const imageBuffer = await sharp(req.file.buffer)
        .resize(256, 256, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 65 })
        .toBuffer();

      const base64Image = imageBuffer.toString("base64");

      if (!process.env.HF_API_TOKEN) {
        return res.status(503).json({ message: "AI analysis service is not configured. Please set HF_API_TOKEN." });
      }

      const { rawText } = await callMedGemma(base64Image, intake);

      const { data: medgemma, method: parseMethod } = parseMedGemmaResponse(rawText);

      const experiment = generateExperiment(medgemma, intake);

      const confidenceScore = calculateConfidenceScore(medgemma, intake, parseMethod);

      const card = formatResultCard(medgemma, experiment, confidenceScore);

      const sessionId = req.body.sessionId || randomUUID();

      const scan = await storage.createScan({
        sessionId,
        scanType: "initial",
        intake,
        medgemmaRaw: medgemma,
        experiment,
        confidence: confidenceScore,
        resultCard: card,
        parseMethod,
      });

      res.json({ success: true, card, scan_id: scan.id });

    } catch (err: any) {
      console.error("Analysis error:", err);
      if (err.message?.includes("GPU_MEMORY_EXCEEDED")) {
        return res.status(503).json({ message: "Our AI model ran out of GPU memory processing your photo. This is a server-side limitation — your photo is fine. Please wait a minute and try again." });
      }
      if (err.message && (err.message.includes("MedGemma API error") || err.message.includes("fetch"))) {
        return res.status(503).json({ message: "The AI analysis service is temporarily unavailable. Please try again later." });
      }
      res.status(500).json({ message: "Analysis failed. Please try again." });
    }
  });

  app.get("/api/scans/:id", async (req, res) => {
    try {
      const scan = await storage.getScan(req.params.id);
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }
      res.json(scan);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  return httpServer;
}
