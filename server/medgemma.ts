import type { IntakeForm, MedGemmaResponse } from "@shared/schema";

const SYSTEM_PROMPT = `You are a skin pattern analysis assistant for Pimple Lab, a teen skincare science app.

Your task: Look at the skin photo provided and identify what type of skin pattern is visible. You are NOT making a medical diagnosis. You are helping a teenager understand their skin so they can design a careful, evidence-based skincare experiment.

CRITICAL OUTPUT RULES — follow these exactly:
1. Output ONLY a valid JSON object. No prose, no explanation, no markdown.
2. Your first character must be {
3. Your last character must be }
4. Keep "message" under 50 words
5. Keep "hypothesis" under 20 words
6. If you cannot see clearly, still output JSON — set confidence to "low" and add "poor_image_quality" to flags

EXACT JSON STRUCTURE (output all fields, in this order):
{
  "skin_tone": "light" or "medium" or "dark",
  "pattern": "clear" or "comedonal" or "papular" or "pustular" or "nodular" or "cystic" or "mixed",
  "severity": "clear" or "mild" or "moderate" or "severe" or "urgent",
  "zones": [array from: "forehead","left_cheek","right_cheek","chin","nose","t_zone","chest","back"],
  "confidence": "low" or "medium" or "high",
  "flags": [array — include any relevant: "possible_fungal","hormonal_pattern","scarring_risk","pih_present","poor_image_quality"],
  "message": "2-3 sentences, warm and teen-friendly, framed as a hypothesis not a fact — start with what you can see",
  "hypothesis": "If this is [X], then [Y] should [Z] in [timeframe]",
  "see_doctor": true or false
}

PATTERN DEFINITIONS:
- clear: no active lesions visible
- comedonal: blackheads (dark open pores) or closed bumps under skin — no redness
- papular: small solid red raised bumps — no pus visible
- pustular: red spots with white or yellow pus visible at the centre
- nodular: large deep firm bumps (>5mm), no pus, skin looks raised and tense
- cystic: large soft fluid-filled deep sacs, very inflamed, >5mm
- mixed: clearly more than one of the above types present

SEVERITY RULES:
- clear: nothing visible
- mild: a few scattered lesions, minimal redness
- moderate: several lesions across one or more zones, visible inflammation
- severe: many lesions, widespread redness, early marks visible
- urgent: nodular or cystic pattern present, or >5 large deep lesions — set see_doctor true

CONFIDENCE RULES:
- high: image is well-lit, multiple lesions clearly visible and classifiable
- medium: lesions visible but some ambiguity (lighting, angle, or mixed types)
- low: image too dark/blurry/close/far, or only 1-2 spots with no clear type

SKIN TONE:
- light: pale, fair, or light beige skin
- medium: golden, tan, olive, or medium brown
- dark: deep brown, dark brown, or very dark skin
Note: In darker skin tones, inflammation may show less redness and more dark marks (PIH). Flag "pih_present" if you see dark flat marks that appear to be healed spots.

FUNGAL FLAG — add "possible_fungal" if the user context states ANY of these:
- itchy spots
- antibiotic cream didn't help
- uniform small bumps (all same size)
- plays sport regularly AND uses oily hair products

URGENCY — set see_doctor true AND severity "urgent" if:
- nodular or cystic pattern is the dominant type
- more than 5 large deep lesions visible

EXAMPLE OUTPUT — follow this format exactly, do not copy these values:
{
  "skin_tone": "medium",
  "pattern": "pustular",
  "severity": "moderate",
  "zones": ["forehead", "chin"],
  "confidence": "medium",
  "flags": ["possible_fungal"],
  "message": "We can see quite a few inflamed spots with white centres on your forehead and chin. Given what you mentioned about itchiness and antibiotic cream not helping, there's a real chance this could be fungal rather than bacterial acne.",
  "hypothesis": "If fungal acne, antifungal cleanser should show improvement in 2 weeks",
  "see_doctor": false
}`;

function buildInitialUserMessage(intake: IntakeForm): string {
  const symptoms: string[] = [];
  if (intake.is_itchy) symptoms.push("itchy");
  if (intake.is_painful) symptoms.push("painful");
  if (intake.is_uniform_size) symptoms.push("all the same size");

  const lifestyle: string[] = [];
  if (intake.plays_sport_sweats) lifestyle.push("plays sport and sweats regularly");
  if (intake.wears_daily_makeup) lifestyle.push("wears makeup daily");
  if (intake.uses_oily_hair_products) lifestyle.push("uses oily hair products");
  if (intake.stress_level === 3) lifestyle.push("high stress level");

  const tried = intake.tried_before?.length > 0
    ? intake.tried_before.join(", ")
    : "nothing yet";

  return `Analyse the skin visible in this photo for a Pimple Lab teen skincare experiment.

USER PROFILE:
- Age: ${intake.age} | Sex: ${intake.biological_sex}
- Concern zones (self-reported): ${intake.concern_zones?.join(", ") || "not specified"}
- Duration: ${intake.duration_weeks} weeks
- Symptoms: ${symptoms.length > 0 ? symptoms.join(", ") : "none reported"}
- Lifestyle: ${lifestyle.length > 0 ? lifestyle.join(", ") : "none flagged"}
- Stress: ${["low", "medium", "high"][intake.stress_level - 1] || "medium"}
- Tried before: ${tried}
- Antibiotic cream used with NO improvement: ${intake.antibiotic_cream_no_improvement ? "YES — important signal" : "no"}
- Family acne history: ${intake.family_acne_history}
${intake.biological_sex === "female" ? `- Cycle stage: ${intake.cycle_stage || "not tracked"} | Acne worsens before period: ${intake.acne_worsens_before_period ?? "unknown"}` : ""}

Use the profile above — especially the antibiotic cream signal, itchiness, and lifestyle — when deciding on flags.

Output ONLY the JSON. Start immediately with {`.trim();
}

const HF_ROUTER_BASE = "https://router.huggingface.co/v1";
const VISION_MODEL = "Qwen/Qwen2.5-VL-7B-Instruct";

export async function callMedGemma(base64Image: string, intake: IntakeForm): Promise<{ rawText: string }> {
  const userMessage = buildInitialUserMessage(intake);
  const apiToken = process.env.HF_API_TOKEN!;

  const endpointUrl = process.env.HF_ENDPOINT_URL;
  if (!endpointUrl || endpointUrl.trim() === "") {
    throw new Error("MedGemma endpoint URL is not configured. Please set HF_ENDPOINT_URL.");
  }

  return callDedicatedEndpoint(endpointUrl, apiToken, base64Image, userMessage);
}

async function callDedicatedEndpoint(endpointUrl: string, apiToken: string, base64Image: string, userMessage: string): Promise<{ rawText: string }> {
  const prompt = `![](data:image/jpeg;base64,${base64Image})\n\n${SYSTEM_PROMPT}\n\n${userMessage}`;

  console.log(`[MedGemma] Sending request to dedicated endpoint, prompt length: ${prompt.length} chars`);

  const response = await fetch(endpointUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(90000),
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        return_full_text: false,
        temperature: 0.1,
        do_sample: false,
        repetition_penalty: 1.1,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (errorText.includes("CUDA out of memory")) {
      throw new Error("GPU_MEMORY_EXCEEDED: The AI model's GPU does not have enough memory to process this image. Please try again in a moment, or contact support about upgrading the GPU endpoint.");
    }
    throw new Error(`MedGemma endpoint error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  console.log("[MedGemma] Raw response:", JSON.stringify(result).substring(0, 500));
  const rawText = result[0]?.generated_text
    || result?.generated_text
    || result[0]?.text
    || "";
  return { rawText };
}

async function callServerlessAPI(apiToken: string, base64Image: string, userMessage: string): Promise<{ rawText: string }> {
  const url = `${HF_ROUTER_BASE}/chat/completions`;

  console.log(`[MedGemma] Calling serverless API with model: ${VISION_MODEL}`);
  console.log(`[MedGemma] Image data size: ${base64Image.length} chars (base64)`);
  console.log(`[MedGemma] Image data prefix: ${base64Image.substring(0, 20)}...`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    signal: controller.signal,
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
            { type: "text", text: userMessage },
          ],
        },
      ],
      max_tokens: 400,
      temperature: 0.1,
    }),
  });

  clearTimeout(timeout);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MedGemma API error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  console.log(`[MedGemma] API response status: ${response.status}`);
  console.log(`[MedGemma] Raw API result keys:`, Object.keys(result));
  const rawText = result.choices?.[0]?.message?.content || "";
  console.log(`[MedGemma] Extracted text (first 200 chars):`, rawText.substring(0, 200));
  return { rawText };
}

export function parseMedGemmaResponse(rawText: string): { success: boolean; data: MedGemmaResponse; method: string; warning?: string } {
  if (!rawText || rawText.trim() === "") {
    return { success: false, data: getFallbackObject("empty_response"), method: "empty" };
  }

  const cleaned = rawText.trim();

  try {
    const data = JSON.parse(cleaned);
    if (isValidMedGemmaJSON(data)) {
      return { success: true, data, method: "direct" };
    }
  } catch (e) {}

  const greedyMatch = cleaned.match(/\{[\s\S]*\}/);
  if (greedyMatch) {
    try {
      const data = JSON.parse(greedyMatch[0]);
      if (isValidMedGemmaJSON(data)) {
        return { success: true, data, method: "extracted_greedy" };
      }
    } catch (e) {}
  }

  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      const data = JSON.parse(codeBlockMatch[1].trim());
      if (isValidMedGemmaJSON(data)) {
        return { success: true, data, method: "markdown" };
      }
    } catch (e) {}
  }

  const truncatedRepair = repairTruncatedJSON(cleaned);
  if (truncatedRepair) {
    return { success: true, data: truncatedRepair, method: "repaired", warning: "truncated" };
  }

  return { success: true, data: extractFromProse(cleaned), method: "prose_fallback" };
}

function isValidMedGemmaJSON(data: any): data is MedGemmaResponse {
  return data && typeof data === "object" && data.pattern && data.severity && data.confidence;
}

function repairTruncatedJSON(text: string): MedGemmaResponse | null {
  try {
    let json = text;
    json = json.replace(/,\s*"[^"]*"\s*:\s*[^,}\]]*$/, "");
    json = json.replace(/,\s*"[^"]*"\s*$/, "");
    json = json.replace(/"[^"]*$/, '"[truncated]"');

    const openBraces = (json.match(/\{/g) || []).length;
    const closeBraces = (json.match(/\}/g) || []).length;
    const openBrackets = (json.match(/\[/g) || []).length;
    const closeBrackets = (json.match(/\]/g) || []).length;

    json += "]".repeat(Math.max(0, openBrackets - closeBrackets));
    json += "}".repeat(Math.max(0, openBraces - closeBraces));

    const data = JSON.parse(json);
    if (isValidMedGemmaJSON(data)) return data;
  } catch (e) {}
  return null;
}

function extractFromProse(text: string): MedGemmaResponse {
  const lower = text.toLowerCase();

  let pattern = "mixed";
  if (lower.match(/cyst/)) pattern = "cystic";
  else if (lower.match(/nodule|nodular/)) pattern = "nodular";
  else if (lower.match(/pustule|pustular|pus-filled|whitehead.*inflam|pus/)) pattern = "pustular";
  else if (lower.match(/papule|papular|red bump/)) pattern = "papular";
  else if (lower.match(/comedone|blackhead|whitehead|blocked pore|clogged/)) pattern = "comedonal";
  else if (lower.match(/clear|no (active|visible) lesion|no acne|healthy/)) pattern = "clear";

  let severity = "moderate";
  if (pattern === "cystic" || pattern === "nodular") severity = "urgent";
  else if (lower.match(/\burgent\b|\bsevere\b|\bsignificant\b|\bextensive\b|\bwidespread\b/)) severity = "severe";
  else if (lower.match(/\bmild\b|\bminimal\b|\bfew\b|\bscattered\b|\boccasional\b/)) severity = "mild";
  else if (lower.match(/\bclear\b|no lesion|no acne/)) severity = "clear";

  const zones: string[] = [];
  if (lower.includes("forehead")) zones.push("forehead");
  if (lower.includes("left cheek")) zones.push("left_cheek");
  if (lower.includes("right cheek")) zones.push("right_cheek");
  if (lower.includes("cheek") && !lower.includes("left cheek") && !lower.includes("right cheek")) {
    zones.push("left_cheek", "right_cheek");
  }
  if (lower.match(/\bchin\b|\bjaw/)) zones.push("chin");
  if (lower.match(/\bnose\b|t-zone|t zone/)) zones.push("nose");
  if (lower.includes("chest")) zones.push("chest");
  if (lower.includes("back")) zones.push("back");
  if (zones.length === 0) zones.push("face");

  let confidence: "low" | "medium" | "high" = "low";
  if (lower.match(/\bclearly\b|\bdefinitely\b|\bconfident\b/)) confidence = "medium";

  const flags: string[] = ["poor_image_quality"];
  if (lower.match(/\bfungal\b|\bmalassezia\b|\bfolliculitis\b/)) flags.push("possible_fungal");
  if (lower.match(/\bhormonal\b/)) flags.push("hormonal_pattern");
  if (lower.match(/\bscar/)) flags.push("scarring_risk");
  if (lower.match(/hyperpigment|dark spot|pih|post-inflammatory/)) flags.push("pih_present");

  let skin_tone = "medium";
  if (lower.match(/\bfair\b|\blight skin\b|\bpale\b/)) skin_tone = "light";
  if (lower.match(/\bdark skin\b|\bdeep(er)? skin\b|\bmelanin-rich\b/)) skin_tone = "dark";

  const see_doctor = ["urgent", "severe"].includes(severity) || ["cystic", "nodular"].includes(pattern);

  return {
    skin_tone,
    pattern,
    severity,
    zones,
    confidence,
    flags,
    message: "We had a bit of trouble reading the photo clearly - try retaking it in better lighting for a sharper result. Here's our best guess based on what we could see.",
    hypothesis: "Results are uncertain - see suggestions below",
    see_doctor,
    _method: "prose_fallback",
  };
}

function getFallbackObject(reason: string): MedGemmaResponse {
  return {
    skin_tone: "medium",
    pattern: "mixed",
    severity: "moderate",
    zones: ["face"],
    confidence: "low",
    flags: ["poor_image_quality"],
    message: "We couldn't get a clear reading from the photo. Try retaking in brighter lighting for better results.",
    hypothesis: "Unable to form a clear hypothesis - try again with a better photo",
    see_doctor: false,
    _method: reason,
  };
}
