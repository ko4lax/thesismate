// ThesisMate — MongoDB Schema
// MongoDB is the agent's working memory: evidence graph, paper index, hypothesis state, progress tracker.
// All operations go through MongoDB MCP Server.

export interface Paper {
  _id: string;
  projectId: string;
  title: string;
  authors: string[];
  year: number;
  doi?: string;
  abstract: string;
  claims: Claim[];
  importedAt: string;
}

export interface Claim {
  id: string;
  text: string;
  type: "finding" | "method" | "theory" | "definition";
  variables: string[];
  sampleSize?: number;
  confidence: number; // 0-1
}

export interface Hypothesis {
  _id: string;
  projectId: string;
  number: number; // H1, H2, H3...
  statement: string;
  independentVariable: string;
  dependentVariable: string;
  direction: "positive" | "negative";
  evidence: EvidenceLink[];
  strength: "strong" | "moderate" | "weak" | "unsupported";
  status: "pending" | "supported" | "rejected" | "needs_review";
}

export interface EvidenceLink {
  paperId: string;
  paperTitle: string;
  claimId: string;
  direction: "supporting" | "contradicting" | "neutral";
  strength: number; // 0-1
  excerpt: string;
}

export interface Citation {
  _id: string;
  projectId: string;
  paperId: string;
  formatted: string; // APA 7th
  bibtex: string;
}

export interface ResearchProject {
  _id: string;
  userId: string;
  topic: string;
  model: string; // e.g., "Norman's 3-Level Emotional Design"
  variables: {
    independent: string[];
    dependent: string[];
    mediating: string[];
  };
  hypotheses: Hypothesis[];
  papers: string[]; // paper IDs
  progress: Progress;
  createdAt: string;
  updatedAt: string;
}

export interface Progress {
  papersIngested: number;
  hypothesesDefined: number;
  hypothesesSupported: number;
  lastActivity: string;
  currentPhase: "setup" | "literature_review" | "model_building" | "analysis" | "writing";
  nextAction: string;
}

export interface AgentAction {
  type: "paper_ingest" | "extract_claims" | "map_evidence" | "assess_hypothesis" | "recommend_reading" | "generate_report";
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  timestamp: string;
}
