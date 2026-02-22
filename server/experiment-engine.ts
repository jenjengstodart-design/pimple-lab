import type { IntakeForm, MedGemmaResponse, ExperimentPlan, ResultCard } from "@shared/schema";

function isFungalLikely(medgemma: MedGemmaResponse, intake: IntakeForm): boolean {
  const { flags, zones } = medgemma;
  const { is_itchy, antibiotic_cream_no_improvement, is_uniform_size,
          plays_sport_sweats, uses_oily_hair_products } = intake;

  const hardSignal = antibiotic_cream_no_improvement === true;

  const softSignals = [
    flags.includes("possible_fungal"),
    is_itchy,
    is_uniform_size,
    plays_sport_sweats && uses_oily_hair_products,
    (zones.includes("forehead") || zones.includes("chest") || zones.includes("back"))
      && is_uniform_size,
  ].filter(Boolean).length;

  return (hardSignal && softSignals >= 1) || softSignals >= 3;
}

export function generateExperiment(medgemma: MedGemmaResponse, intake: IntakeForm): ExperimentPlan {
  const { pattern, severity, zones, flags, skin_tone } = medgemma;
  const {
    biological_sex, is_itchy, antibiotic_cream_no_improvement,
    plays_sport_sweats, uses_oily_hair_products, is_uniform_size,
    acne_worsens_before_period, stress_level, duration_weeks,
    wears_daily_makeup, concern_zones,
  } = intake;

  if (severity === "urgent" || ["cystic", "nodular"].includes(pattern)) {
    return {
      type: "urgent",
      title: "This needs a doctor, not an experiment",
      hypothesis: "Over-the-counter products won't be enough for this level of acne",
      message: "Based on what we can see, this looks like it could cause permanent scarring if it's not treated properly. Please see a GP or dermatologist as soon as you can - ideally this week. Don't leave this one.",
      experiment_valid: false,
      duration_days: null,
      products: [],
      see_doctor: true,
    };
  }

  if (severity === "clear" || pattern === "clear") {
    return {
      type: "maintenance",
      title: "Looking good — let's keep it that way",
      hypothesis: "A simple preventive routine should keep your skin clear over 4 weeks",
      explanation: "Your skin looks mostly clear right now. The goal is to prevent future breakouts rather than treat active ones. A lightweight routine focused on gentle cleansing and sun protection is all you need.",
      experiment_question: "Can a minimal routine keep your skin breakout-free for 28 days?",
      duration_days: 28,
      purge_warning: false,
      products: [
        {
          step: "AM + PM",
          name: "Gentle non-comedogenic cleanser (e.g. CeraVe, La Roche-Posay)",
          instruction: "Wash twice daily with lukewarm water. Don't scrub.",
          budget: "5-8",
        },
        {
          step: "AM",
          name: "Lightweight moisturiser with SPF 30+",
          instruction: "Apply after cleansing every morning. Protects against UV damage and dark marks.",
          budget: "8-15",
        },
        {
          step: "PM (optional, 2-3x per week)",
          name: "Niacinamide 5-10% serum",
          instruction: "Helps regulate oil and keeps pores clear. Apply after cleansing.",
          budget: "5-8",
        },
      ],
      avoid: [
        "Over-washing or scrubbing your face",
        "Heavy makeup that clogs pores - always remove makeup before bed",
        "Touching your face throughout the day",
      ],
      routine_tips: [
        "Change your pillowcase every few days",
        "Drink enough water throughout the day",
        "Notice if certain foods seem to trigger breakouts",
      ],
      check_in_prompt: "Still clear? Any new spots forming? What did your week look like?",
      see_doctor: false,
    };
  }

  const isFungal = isFungalLikely(medgemma, intake);

  if (isFungal) {
    const tips = [
      "Change your pillowcase every 2-3 days",
      "Shower right after sport or exercise - don't let sweat sit on skin",
    ];
    if (uses_oily_hair_products) tips.push("Switch to an oil-free hair product or keep it away from your hairline");
    if (plays_sport_sweats) tips.push("Wear breathable fabrics during exercise");

    return {
      type: "fungal",
      title: "Hypothesis: Could this be fungal acne?",
      hypothesis: "If this is fungal (Malassezia), an antifungal cleanser should improve it in 2 weeks",
      explanation: "Fungal acne isn't caused by bacteria - it's a yeast that lives on skin and loves warm, sweaty environments. That's why antibiotic creams won't touch it, and why spots that look like pimples might actually be fungal folliculitis.",
      experiment_question: "Will switching to an antifungal cleanser clear these spots in 14 days?",
      duration_days: 14,
      purge_warning: false,
      products: [
        {
          step: "AM + PM Cleanser",
          name: "Ketoconazole 1% shampoo (e.g. Nizoral)",
          instruction: "Lather it onto your face (or affected area), leave for 3 minutes, then rinse. Once daily for 14 days.",
          budget: "8-12 at boots/pharmacy",
        },
        {
          step: "Moisturiser",
          name: "Light oil-free gel moisturiser",
          instruction: "After cleansing. Keep this minimal - heavy creams can feed the fungus.",
          budget: "Any non-comedogenic option",
        },
      ],
      avoid: [
        "Antibiotic creams or gels (won't help, may worsen)",
        "Heavy moisturisers or oils on the affected area",
        "Oily hair products that touch your forehead or back",
      ],
      routine_tips: tips,
      check_in_prompt: "Same angle, same light. Have the spots reduced in size or number? Still itchy?",
      see_doctor: false,
    };
  }

  const hormonalZones = ["chin", "left_cheek", "right_cheek"];
  const hasHormonalZones = zones.some(z => hormonalZones.includes(z));
  const isHormonal = biological_sex === "female" &&
    hasHormonalZones &&
    (acne_worsens_before_period || flags.includes("hormonal_pattern"));

  if (isHormonal) {
    return {
      type: "hormonal",
      title: "Hypothesis: Could this be hormonal acne?",
      hypothesis: "If this is hormonal, tracking your cycle should reveal a pattern in 28 days",
      explanation: "Hormonal acne clusters on the lower face - chin, jaw, cheeks - and often flares in the 2 weeks before your period. This isn't random. It follows a pattern, and once you see it, you can plan around it.",
      experiment_question: "Does your skin consistently worsen in the 2 weeks before your period?",
      duration_days: 28,
      purge_warning: false,
      products: [
        {
          step: "AM - after cleansing",
          name: "Niacinamide 10% serum (e.g. The Ordinary)",
          instruction: "Apply to whole face. Reduces oil and calms redness.",
          budget: "5-8",
        },
        {
          step: "PM - after cleansing",
          name: "Azelaic acid 10% (e.g. The Ordinary or Paula's Choice)",
          instruction: "Apply to chin/jawline area. Fights bacteria AND fades dark marks.",
          budget: "7-15",
        },
        {
          step: "AM + PM",
          name: "Gentle non-comedogenic cleanser",
          instruction: "Wash twice daily. Don't scrub.",
          budget: "CeraVe or Simple - 5-8",
        },
      ],
      avoid: [
        "Heavy foundation or concealer on the jawline if possible",
        "Dairy (some evidence it worsens hormonal acne - experiment with cutting it if you want a second hypothesis)",
        "Changing multiple things at once - this experiment tracks ONE variable",
      ],
      routine_tips: [
        "Log your cycle stage every time you do a check-in",
        "Take your follow-up photo on the same cycle day as your baseline",
        "Full cycle = 28 days. Don't judge at 2 weeks.",
      ],
      check_in_prompt: "Where are you in your cycle? Have spots on your chin/jaw changed?",
      note: "Hormonal acne needs more than 14 days to judge - come back at the 4-week mark.",
      see_doctor: false,
    };
  }

  if (pattern === "comedonal") {
    const tips = [
      "Don't pop or squeeze blackheads - it pushes debris deeper",
    ];
    if (wears_daily_makeup) tips.push("Double-cleanse at night: oil cleanser first, then gentle wash");
    if (stress_level >= 3) tips.push("Stress increases sebum production - try to get enough sleep");

    return {
      type: "comedonal",
      title: "Hypothesis: Blocked pores are the main issue",
      hypothesis: "If these are blocked pores, adapalene should reduce new ones in 6 weeks",
      explanation: "Blackheads and closed bumps under the skin form when pores get plugged with sebum and dead skin cells. A retinoid (like adapalene) speeds up skin cell turnover so pores don't block in the first place - but it takes 6 weeks to see results.",
      experiment_question: "Will adapalene 0.1% reduce new blackheads and under-skin bumps in 42 days?",
      duration_days: 42,
      purge_warning: true,
      purge_message: "IMPORTANT - The Purge: Your skin may look WORSE in weeks 1-3 with adapalene. This is normal and means it's working. Don't stop. If you quit during the purge, you'll never know if it would have worked.",
      products: [
        {
          step: "PM - every other night for first 2 weeks, then nightly",
          name: "Adapalene 0.1% gel (Differin - available OTC in UK/US)",
          instruction: "Apply a pea-sized amount to CLEAN DRY skin. Avoid eye area. Moisturise on top.",
          budget: "12-18",
        },
        {
          step: "AM + PM",
          name: "Gentle non-comedogenic cleanser",
          instruction: "Don't scrub. Rinse with lukewarm water.",
          budget: "5-8",
        },
        {
          step: "AM - every day",
          name: "SPF 30+ sunscreen (non-comedogenic)",
          instruction: "Non-negotiable with retinoids. They increase sun sensitivity.",
          budget: "La Roche-Posay SPF50 - 15, or any non-comedogenic SPF",
        },
      ],
      avoid: [
        "Pore-clogging ingredients: coconut oil, cocoa butter, shea butter, lanolin",
        "Physical scrubs or exfoliators - these make retinoid irritation worse",
        "Vitamin C serum on nights you use adapalene - causes irritation",
      ],
      routine_tips: tips,
      check_in_prompt: "Any new spots? Compare the texture of your skin to before. Has the sandpaper feeling reduced?",
      see_doctor: false,
    };
  }

  if (pattern === "pustular") {
    const tips = [
      "Never pop pustules - it spreads bacteria and causes scarring",
      "Use a clean towel each time you wash your face",
    ];
    if (plays_sport_sweats) tips.push("Wash your face within 30 minutes of finishing exercise");
    if (duration_weeks >= 8) tips.push("Persistent pustules (8+ weeks) may need prescription treatment - see a GP if this experiment doesn't help");

    return {
      type: "bacterial_pustular",
      title: "Hypothesis: Bacteria are driving these breakouts",
      hypothesis: "If bacteria are causing these pus-filled spots, BPO should reduce them in 3 weeks",
      explanation: "Pustules — those red spots with visible white or yellow centres — happen when C. acnes bacteria get trapped in a pore and your immune system fights back. Benzoyl peroxide (BPO) is one of the best bacteria killers for acne and doesn't build resistance like antibiotics.",
      experiment_question: "Will BPO 2.5% wash reduce the number of active pustules in 21 days?",
      duration_days: 21,
      purge_warning: false,
      products: [
        {
          step: "AM - as face wash",
          name: "Benzoyl peroxide 2.5% wash (e.g. PanOxyl, Brevoxyl)",
          instruction: "Lather onto damp skin, leave 1-2 minutes, rinse. Start every other day for week 1.",
          budget: "6-12",
        },
        {
          step: "PM - on clean dry skin",
          name: "Niacinamide 10% serum",
          instruction: "Calms redness and inflammation. Apply after cleansing.",
          budget: "5-8",
        },
        {
          step: "AM + PM",
          name: "Non-comedogenic moisturiser",
          instruction: "Essential — BPO can dry your skin. Moisturise every time.",
          budget: "8-12",
        },
      ],
      avoid: [
        "BPO bleaches fabric - use a white pillowcase and white towel",
        "Picking or squeezing spots - this causes scarring and spreads infection",
        "Too many active ingredients at once - keep it simple",
      ],
      routine_tips: tips,
      check_in_prompt: "Count the spots with visible pus. Have they reduced? Are new ones still forming?",
      see_doctor: severity === "severe",
    };
  }

  if (pattern === "papular") {
    const tips: string[] = [];
    if (stress_level >= 3) tips.push("High stress increases inflammation - prioritise sleep and downtime");
    if (wears_daily_makeup) tips.push("Use mineral or non-comedogenic makeup only, and always remove before bed");
    if (concern_zones.includes("back") || concern_zones.includes("chest")) {
      tips.push("For body acne, use a BPO body wash and wear breathable fabrics");
    }
    tips.push("Be patient - papular acne responds slower than pustular, give it the full 3 weeks");

    const plan: ExperimentPlan = {
      type: "bacterial_papular",
      title: "Hypothesis: Inflammation is the main driver",
      hypothesis: "If inflammation is causing these red bumps, a combo approach should calm them in 4 weeks",
      explanation: "Papules — those red bumps without a visible head — are inflamed but haven't developed pus yet. They need a different approach: calm the inflammation while preventing new blockages. Adapalene addresses the root cause while azelaic acid reduces redness.",
      experiment_question: "Will adapalene + azelaic acid reduce redness and bump count in 28 days?",
      duration_days: 28,
      purge_warning: true,
      purge_message: "Adapalene can make your skin look slightly worse in weeks 1-2. This is temporary. Stick with it.",
      products: [
        {
          step: "PM - every other night (week 1-2), then nightly",
          name: "Adapalene 0.1% gel (Differin)",
          instruction: "Thin layer on affected areas after cleansing. Build up slowly.",
          budget: "12-18",
        },
        {
          step: "AM - after cleansing",
          name: "Azelaic acid 10% (The Ordinary or Paula's Choice)",
          instruction: "Reduces redness and post-inflammatory marks. Apply to affected areas.",
          budget: "7-15",
        },
        {
          step: "AM + PM",
          name: "Gentle cleanser + moisturiser",
          instruction: "Non-foaming cleanser, followed by a simple moisturiser. Don't skip.",
          budget: "10-16 total",
        },
        {
          step: "AM",
          name: "SPF 30+ sunscreen",
          instruction: "Required when using adapalene. Non-negotiable.",
          budget: "8-15",
        },
      ],
      avoid: [
        "Hot water on your face - use lukewarm only",
        "Harsh scrubs or physical exfoliation",
        "Layering too many products - less is more",
      ],
      routine_tips: tips,
      check_in_prompt: "Are the red bumps less inflamed? Has the overall redness reduced? Any new bumps?",
      see_doctor: severity === "severe",
    };

    if (skin_tone === "dark") {
      plan.skin_tone_note = "On darker skin tones, healed spots can leave dark marks (PIH). Azelaic acid is already in your routine and helps fade these.";
    }

    return plan;
  }

  const tips: string[] = [];
  if (stress_level >= 3) tips.push("Stress management can genuinely help - even small changes in sleep make a difference");
  if (plays_sport_sweats) tips.push("Shower or at least wash your face after exercise");
  tips.push("Track what you're doing daily so you can spot patterns");

  return {
    type: "mixed",
    title: "Hypothesis: Multiple factors at play — let's simplify",
    hypothesis: "A streamlined BPO + adapalene combo should reduce overall activity in 3 weeks",
    explanation: "When different types of spots are happening at once, we start with the duo most likely to address both inflammation and blockage. Keep it simple - one routine, 3 weeks, then reassess what's improved and what hasn't.",
    experiment_question: "Will this standard combination reduce overall spot activity in 21 days?",
    duration_days: 21,
    purge_warning: false,
    products: [
      {
        step: "AM",
        name: "BPO 2.5% wash",
        instruction: "Lather, leave 1 min, rinse. Start every other day for the first week.",
        budget: "6-12",
      },
      {
        step: "PM",
        name: "Adapalene 0.1% gel",
        instruction: "Thin layer on affected areas. Whole face if widespread.",
        budget: "12-18",
      },
      {
        step: "AM + PM",
        name: "Non-comedogenic moisturiser + SPF (AM only)",
        instruction: "Don't skip moisturiser - especially with BPO + retinoid.",
        budget: "10-18 total",
      },
    ],
    avoid: [
      "Changing multiple products at the same time - one variable only",
      "Heavy makeup on active breakout areas",
    ],
    routine_tips: tips,
    check_in_prompt: "Overall, does your skin feel calmer? Are there fewer active spots? Which type improved most?",
    see_doctor: severity === "severe",
  };
}

export function calculateConfidenceScore(
  medgemma: MedGemmaResponse,
  intake: IntakeForm,
  parseMethod: string
): number {
  let score = 0;

  const confMap: Record<string, number> = { high: 35, medium: 22, low: 8 };
  score += confMap[medgemma.confidence] || 10;

  if (!medgemma.flags.includes("poor_image_quality")) score += 20;
  else score -= 5;

  const parseMap: Record<string, number> = {
    direct: 20,
    extracted: 18,
    extracted_greedy: 15,
    markdown: 15,
    repaired: 8,
    prose_fallback: 0,
  };
  score += parseMap[parseMethod] || 0;

  const keyFields: (keyof IntakeForm)[] = [
    "age", "biological_sex", "concern_zones", "is_itchy", "is_painful",
    "is_uniform_size", "duration_weeks", "tried_before", "family_acne_history",
  ];
  const filled = keyFields.filter(f =>
    intake[f] !== null && intake[f] !== undefined && intake[f] !== ""
  ).length;
  score += Math.round((filled / keyFields.length) * 15);

  if (medgemma.pattern !== "mixed" && medgemma.pattern !== "unclear") score += 8;

  if (medgemma._method === "prose_fallback") score -= 15;

  return Math.min(Math.max(Math.round(score), 12), 90);
}

export function formatResultCard(
  medgemma: MedGemmaResponse,
  experiment: ExperimentPlan,
  confidenceScore: number
): ResultCard {
  const isUncertain = confidenceScore < 40 || medgemma.flags.includes("poor_image_quality");

  const card: ResultCard = {
    title: experiment.title,
    confidence_percent: confidenceScore,
    confidence_label: confidenceScore >= 70
      ? "Good signal"
      : confidenceScore >= 45
      ? "Reasonable estimate"
      : "Uncertain - use as a starting point",
    what_we_see: medgemma.message,
    disclaimer: "This is our best hypothesis - not a medical diagnosis. Use it as a starting point for your experiment, not as medical advice.",
    hypothesis: experiment.hypothesis,
    experiment_question: experiment.experiment_question,
    duration_days: experiment.duration_days,
    check_in_date: experiment.duration_days
      ? new Date(Date.now() + experiment.duration_days * 86400000).toLocaleDateString("en-GB")
      : null,
    products: experiment.products,
    avoid: experiment.avoid,
    tips: experiment.routine_tips || [],
    check_in_prompt: experiment.check_in_prompt,
    see_doctor: medgemma.see_doctor || experiment.see_doctor,
  };

  if (isUncertain) {
    card.image_warning = "The photo quality made this harder to assess. Try retaking in brighter lighting for a sharper result next time.";
  }

  if (experiment.purge_warning && experiment.purge_message) {
    card.purge_warning = experiment.purge_message;
  }

  if (medgemma.skin_tone === "dark" && experiment.skin_tone_note) {
    card.skin_tone_note = experiment.skin_tone_note;
  }

  if (experiment.explanation) {
    card.explanation = experiment.explanation;
  }

  if (medgemma.see_doctor || experiment.see_doctor) {
    card.doctor_message = "Based on what we can see, please see a GP or dermatologist soon. This level of acne can cause permanent scarring - get professional help before trying to treat it yourself.";
  }

  return card;
}
