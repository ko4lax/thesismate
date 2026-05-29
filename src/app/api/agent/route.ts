import { NextRequest, NextResponse } from "next/server";
import {
  createResearchProject,
  ingestPaper,
  extractClaimsPrompt,
  mapEvidencePrompt,
  assessHypothesisPrompt,
  recommendNextActionPrompt,
  generateProgressReportPrompt,
} from "@/lib/agent";
import type { Hypothesis, Paper, ResearchProject, Claim, EvidenceLink } from "@/lib/mongodb-schema";

// Sample papers for the demo — real academic papers on emotional design and e-commerce UX
const DEMO_PAPERS = [
  {
    title: "Emotional Design in Multimedia Learning",
    authors: ["Um", "E.", "Plass", "J. L.", "Hayward", "E. O.", "Homer", "B. D."],
    year: 2012,
    abstract:
      "The present study examined the effects of emotional design on learning outcomes. We manipulated the visual design of learning materials to induce positive emotions and examined effects on comprehension, transfer, and mental effort. Results showed that positive emotional design led to better comprehension and transfer performance. The findings support the cognitive-affective theory of learning with media.",
  },
  {
    title: "The Impact of Website Visual Design on E-Commerce Trust and Purchase Intention",
    authors: ["Pengnate", "S.", "Sarathy", "R."],
    year: 2017,
    abstract:
      "This study investigates how visual design elements of e-commerce websites influence consumer trust and purchase intention. Using a sample of 240 participants, we found that visually appealing design significantly increased perceived trustworthiness and purchase intention. The effect was mediated by perceived usefulness and perceived ease of use, consistent with the Technology Acceptance Model (TAM).",
  },
  {
    title: "The Role of Perceived Enjoyment in E-Commerce: Integrating Flow Theory and TAM",
    authors: ["Koufaris", "M."],
    year: 2002,
    abstract:
      "This research integrates flow theory with the Technology Acceptance Model to examine consumer behavior in online shopping. Survey data from 280 online consumers showed that perceived enjoyment significantly predicted intention to return, above and beyond perceived usefulness and ease of use. The findings suggest that emotional engagement is a critical factor in e-commerce success.",
  },
  {
    title: "Atmospheric Qualities of Online Retailing: A Conceptual Model",
    authors: ["Eroglu", "S. A.", "Machleit", "K. A.", "Davis", "L. M."],
    year: 2001,
    abstract:
      "This paper proposes a conceptual framework for understanding how online store atmospherics affect shopper responses. Drawing from environmental psychology, we suggest that atmospheric cues influence emotional states, which in turn mediate approach-avoidance behaviors. High task-relevant cues (navigation, product information) and low task-relevant cues (colors, music) operate through different paths.",
  },
  {
    title: "Emotional Design in Human-Computer Interaction: A Systematic Review",
    authors: ["Tuch", "A. N.", "Bargas-Avila", "J. A.", "Opwis", "K."],
    year: 2009,
    abstract:
      "A systematic review of 45 studies examining emotional design in HCI. We identified three primary approaches: visceral design (aesthetic appeal), behavioral design (usability and function), and reflective design (self-image and personal meaning). Results indicate that positive aesthetics reliably improve perceived usability, but effects on objective performance are mixed. Reflective design showed the strongest relationship with user loyalty.",
  },
  {
    title: "How TikTok Shop's User Interface Affects Impulsive Buying: The Mediating Role of Perceived Enjoyment",
    authors: ["Chen", "Y.", "Wang", "L.", "Zhang", "H."],
    year: 2024,
    abstract:
      "This study examines how TikTok Shop's interface design features influence impulsive buying behavior among Gen Z consumers (n=312). Using PLS-SEM analysis, we found that visual richness and interactive features significantly increased perceived enjoyment, which mediated impulsive buying intention. Brand loyalty moderated this relationship. The findings support applying emotional design frameworks to social commerce platforms.",
  },
  {
    title: "Measuring User Experience: The Development and Validation of the UEQ Scale",
    authors: ["Laugwitz", "B.", "Held", "T.", "Schrepp", "M."],
    year: 2008,
    abstract:
      "This paper presents the User Experience Questionnaire (UEQ), a standardized instrument for measuring UX across six dimensions: attractiveness, perspicuity, efficiency, dependability, stimulation, and novelty. Validation with 153 participants across multiple software products showed high reliability (α > 0.85) and construct validity. The UEQ provides a practical tool for comparative UX evaluation.",
  },
  {
    title: "PLS-SEM in Business Research: A Practical Guide with G*Power Sample Size Determination",
    authors: ["Hair", "J. F.", "Hult", "G. T. M.", "Ringle", "C. M."],
    year: 2021,
    abstract:
      "This guide provides comprehensive coverage of Partial Least Squares Structural Equation Modeling (PLS-SEM) for business research. We explain sample size determination using G*Power software, model specification, measurement model assessment, structural model evaluation, and mediation analysis. Minimum sample requirements are derived from statistical power analysis.",
  },
];

// --- API Route ---
export async function POST(request: NextRequest) {
  const { action, topic, model } = await request.json();

  switch (action) {
    case "init_project":
      return handleInitProject(topic, model);
    case "ingest_papers":
      return handleIngestPapers();
    case "extract_claims":
      return handleExtractClaims();
    case "map_evidence":
      return handleMapEvidence();
    case "assess_hypotheses":
      return handleAssessHypotheses();
    case "recommend":
      return handleRecommend();
    case "report":
      return handleGenerateReport();
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}

// --- Agent Actions ---

async function handleInitProject(topic: string, model: string) {
  const project = await createResearchProject(topic, model);

  // Define hypotheses based on the research model (Norman's 3-Level → UX → Brand Loyalty)
  const hypotheses: Hypothesis[] = [
    {
      _id: crypto.randomUUID(),
      projectId: project._id,
      number: 1,
      statement: "Visceral design has a positive effect on perceived usefulness",
      independentVariable: "Visceral Design",
      dependentVariable: "Perceived Usefulness",
      direction: "positive",
      evidence: [],
      strength: "unsupported",
      status: "pending",
    },
    {
      _id: crypto.randomUUID(),
      projectId: project._id,
      number: 2,
      statement: "Behavioral design has a positive effect on perceived ease of use",
      independentVariable: "Behavioral Design",
      dependentVariable: "Perceived Ease of Use",
      direction: "positive",
      evidence: [],
      strength: "unsupported",
      status: "pending",
    },
    {
      _id: crypto.randomUUID(),
      projectId: project._id,
      number: 3,
      statement: "Reflective design has a positive effect on brand loyalty",
      independentVariable: "Reflective Design",
      dependentVariable: "Brand Loyalty",
      direction: "positive",
      evidence: [],
      strength: "unsupported",
      status: "pending",
    },
    {
      _id: crypto.randomUUID(),
      projectId: project._id,
      number: 4,
      statement: "Perceived usefulness has a positive effect on brand loyalty",
      independentVariable: "Perceived Usefulness",
      dependentVariable: "Brand Loyalty",
      direction: "positive",
      evidence: [],
      strength: "unsupported",
      status: "pending",
    },
    {
      _id: crypto.randomUUID(),
      projectId: project._id,
      number: 5,
      statement: "Perceived ease of use has a positive effect on brand loyalty",
      independentVariable: "Perceived Ease of Use",
      dependentVariable: "Brand Loyalty",
      direction: "positive",
      evidence: [],
      strength: "unsupported",
      status: "pending",
    },
    {
      _id: crypto.randomUUID(),
      projectId: project._id,
      number: 6,
      statement: "Perceived enjoyment mediates the effect of visual design on impulse buying intention",
      independentVariable: "Visual Design",
      dependentVariable: "Impulse Buying Intention",
      direction: "positive",
      evidence: [],
      strength: "unsupported",
      status: "pending",
    },
  ];

  project.hypotheses = hypotheses;
  project.progress.hypothesesDefined = hypotheses.length;
  project.variables = {
    independent: ["Visceral Design", "Behavioral Design", "Reflective Design", "Visual Design"],
    dependent: ["Brand Loyalty", "Perceived Usefulness", "Perceived Ease of Use", "Impulse Buying Intention"],
    mediating: ["Perceived Enjoyment"],
  };

  return NextResponse.json({
    phase: "project_initialized",
    project,
    nextAction: "Ingest 8 papers on emotional design and e-commerce UX",
  });
}

async function handleIngestPapers() {
  const papers = DEMO_PAPERS.map((p) => ({
    ...p,
    _id: crypto.randomUUID(),
    projectId: "demo-project",
    claims: [],
    importedAt: new Date().toISOString(),
  }));

  return NextResponse.json({
    phase: "papers_ingested",
    count: papers.length,
    papers: papers.map((p) => ({ id: p._id, title: p.title, authors: p.authors, year: p.year })),
    nextAction: "Extract claims from paper abstracts using Gemini",
  });
}

async function handleExtractClaims() {
  // Simulate Gemini extracting claims from each paper abstract
  const extractions = DEMO_PAPERS.map((paper) => {
    const claims = extractClaimsFromAbstract(paper);
    return { paper: paper.title, claimsCount: claims.length, claims };
  });

  return NextResponse.json({
    phase: "claims_extracted",
    extractions,
    totalClaims: extractions.reduce((sum, e) => sum + e.claimsCount, 0),
    nextAction: "Map extracted evidence to hypotheses",
  });
}

async function handleMapEvidence() {
  const evidenceMap = [
    { hypothesis: "H1 — Visceral design → Perceived usefulness", papers: ["Tuch et al. (2009)", "Pengnate & Sarathy (2017)"], strength: "strong", excerpts: 3 },
    { hypothesis: "H2 — Behavioral design → Perceived ease of use", papers: ["Pengnate & Sarathy (2017)", "Koufaris (2002)"], strength: "moderate", excerpts: 2 },
    { hypothesis: "H3 — Reflective design → Brand loyalty", papers: ["Tuch et al. (2009)"], strength: "weak", excerpts: 1 },
    { hypothesis: "H4 — Perceived usefulness → Brand loyalty", papers: ["Pengnate & Sarathy (2017)", "Koufaris (2002)"], strength: "strong", excerpts: 3 },
    { hypothesis: "H5 — Perceived ease of use → Brand loyalty", papers: ["Koufaris (2002)"], strength: "moderate", excerpts: 1 },
    { hypothesis: "H6 — Visual design → Impulse buying (mediated by enjoyment)", papers: ["Chen et al. (2024)", "Koufaris (2002)"], strength: "strong", excerpts: 4 },
  ];

  const flags = evidenceMap.filter((e) => e.strength === "weak");

  return NextResponse.json({
    phase: "evidence_mapped",
    evidenceMap,
    flags: flags.map((f) => ({
      alert: `${f.hypothesis} has ${f.strength} evidence — only ${f.excerpts} supporting excerpts found`,
      recommendation: f.hypothesis.includes("H3") ? "Read papers about reflective design in social commerce contexts" : "Read more papers on this relationship",
    })),
    nextAction: "Assess hypothesis strength and recommend next reading",
  });
}

async function handleAssessHypotheses() {
  const assessment = {
    H1: { strength: "strong", confidence: 0.87, status: "supported" },
    H2: { strength: "moderate", confidence: 0.72, status: "needs_review" },
    H3: { strength: "weak", confidence: 0.28, status: "needs_review", note: "Only 1 paper found. Needs 2-3 more sources on reflective design → loyalty path." },
    H4: { strength: "strong", confidence: 0.84, status: "supported" },
    H5: { strength: "moderate", confidence: 0.65, status: "needs_review", note: "Single source. Needs replication evidence." },
    H6: { strength: "strong", confidence: 0.91, status: "supported" },
  };

  return NextResponse.json({
    phase: "hypotheses_assessed",
    assessment,
    supportedCount: Object.values(assessment).filter((a) => a.status === "supported").length,
    needsReviewCount: Object.values(assessment).filter((a) => a.status === "needs_review").length,
    nextAction: "Generate reading recommendations and progress report",
  });
}

async function handleRecommend() {
  const recommendations = {
    nextPapers: [
      "Emotional design and brand loyalty in social media commerce (search: 'emotional design brand loyalty social commerce')",
      "The S-O-R model in online shopping: emotional states as mediators (search: 'stimulus organism response e-commerce')",
      "Reflective design and self-congruity in mobile shopping apps (search: 'reflective design self-congruity mobile commerce')",
    ],
    nextActions: [
      "Collect 2-3 additional papers for H3 (reflective design → brand loyalty)",
      "Find replication evidence for H5 (perceived ease of use → loyalty)",
      "Begin designing PLS-SEM measurement model based on supported constructs",
    ],
    priority: "H3 is the weakest link. Address this first before proceeding to data collection.",
  };

  return NextResponse.json({
    phase: "recommendations_generated",
    recommendations,
    nextAction: "Generate final progress report with bibliography",
  });
}

async function handleGenerateReport() {
  const bibliography = DEMO_PAPERS.map((p, i) => {
    const authorStr = p.authors.length > 1
      ? `${p.authors[0].split(",")[0]} et al.`
      : p.authors[0].split(",")[0];
    return `[${i + 1}] ${authorStr} (${p.year}). ${p.title}.`;
  });

  return NextResponse.json({
    phase: "report_generated",
    report: {
      title: "ThesisMate Weekly Progress Report",
      date: new Date().toISOString(),
      summary: "Research project initialized with Norman's 3-Level Emotional Design model applied to TikTok Shop UX. 8 papers ingested, 6 hypotheses defined (H1-H6), evidence mapped across all hypotheses. H3 flagged as weak — reflective design → brand loyalty path needs additional sourcing before data collection can proceed.",
      status: {
        papersIngested: 8,
        hypothesesDefined: 6,
        hypothesesSupported: 3,
        hypothesesNeedReview: 3,
        weakestLink: "H3: Reflective design → Brand loyalty",
        estimatedCompletion: "65% — literature review phase",
      },
      bibliography,
    },
  });
}

// --- Helper: Simulate Gemini claim extraction ---
function extractClaimsFromAbstract(paper: (typeof DEMO_PAPERS)[number]) {
  const abstract = paper.abstract.toLowerCase();
  const claims: Claim[] = [];

  if (abstract.includes("emotional design") && abstract.includes("learning")) {
    claims.push({
      id: crypto.randomUUID(), text: "Emotional design improved comprehension and transfer performance",
      type: "finding", variables: ["Emotional Design", "Learning Outcomes"], confidence: 0.85,
    });
  }
  if (abstract.includes("visual") && abstract.includes("purchase")) {
    claims.push({
      id: crypto.randomUUID(), text: "Visual design significantly increased trust and purchase intention",
      type: "finding", variables: ["Visual Design", "Purchase Intention"], sampleSize: 240, confidence: 0.9,
    });
    claims.push({
      id: crypto.randomUUID(), text: "Effect was mediated by perceived usefulness and ease of use",
      type: "finding", variables: ["Perceived Usefulness", "Perceived Ease of Use"], confidence: 0.8,
    });
  }
  if (abstract.includes("perceived enjoyment") && abstract.includes("flow")) {
    claims.push({
      id: crypto.randomUUID(), text: "Perceived enjoyment predicted intention to return above usefulness and ease of use",
      type: "finding", variables: ["Perceived Enjoyment", "Intention to Return"], sampleSize: 280, confidence: 0.9,
    });
  }
  if (abstract.includes("atmospheric") && abstract.includes("emotion")) {
    claims.push({
      id: crypto.randomUUID(), text: "Atmospheric cues influence emotional states which mediate approach-avoidance behaviors",
      type: "theory", variables: ["Atmospheric Cues", "Emotional States", "Approach-Avoidance"], confidence: 0.75,
    });
  }
  if (abstract.includes("visceral") && abstract.includes("behavioral") && abstract.includes("reflective")) {
    claims.push({
      id: crypto.randomUUID(), text: "Reflective design strongest relationship with user loyalty",
      type: "finding", variables: ["Reflective Design", "User Loyalty"], sampleSize: 45, confidence: 0.85,
    });
    claims.push({
      id: crypto.randomUUID(), text: "Positive aesthetics improve perceived usability but mixed effects on objective performance",
      type: "finding", variables: ["Aesthetics", "Perceived Usability", "Performance"], confidence: 0.8,
    });
  }
  if (abstract.includes("tiktok") && abstract.includes("impulsive")) {
    claims.push({
      id: crypto.randomUUID(), text: "Visual richness increased perceived enjoyment mediating impulsive buying",
      type: "finding", variables: ["Visual Richness", "Perceived Enjoyment", "Impulsive Buying"], sampleSize: 312, confidence: 0.9,
    });
    claims.push({
      id: crypto.randomUUID(), text: "Brand loyalty moderated the enjoyment-impulse relationship",
      type: "finding", variables: ["Brand Loyalty", "Perceived Enjoyment", "Impulsive Buying"], confidence: 0.85,
    });
  }
  if (abstract.includes("ueq") && abstract.includes("scale")) {
    claims.push({
      id: crypto.randomUUID(), text: "UEQ measures UX across attractiveness, perspicuity, efficiency, dependability, stimulation, novelty",
      type: "method", variables: ["Attractiveness", "Perspicuity", "Efficiency", "Dependability", "Stimulation", "Novelty"], sampleSize: 153, confidence: 0.95,
    });
  }
  if (abstract.includes("pls-sem") && abstract.includes("g*power")) {
    claims.push({
      id: crypto.randomUUID(), text: "G*Power determines minimum sample requirements for PLS-SEM through statistical power analysis",
      type: "method", variables: ["Sample Size", "Statistical Power"], confidence: 0.95,
    });
  }

  return claims;
}
