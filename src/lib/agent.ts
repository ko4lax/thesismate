// ThesisMate Agent Workflow
// Connects Gemini (Google Cloud Agent Builder) to MongoDB MCP Server.
// The agent: reasons → calls MongoDB tools → extracts findings → maps evidence → acts.

import type { Paper, Hypothesis, ResearchProject, EvidenceLink, AgentAction, Claim } from "./mongodb-schema";

// Step 1: Agent creates project schema in MongoDB
export async function createResearchProject(topic: string, model: string): Promise<ResearchProject> {
  return {
    _id: crypto.randomUUID(),
    userId: "researcher-1",
    topic,
    model,
    variables: { independent: [], dependent: [], mediating: [] },
    hypotheses: [],
    papers: [],
    progress: {
      papersIngested: 0,
      hypothesesDefined: 0,
      hypothesesSupported: 0,
      lastActivity: new Date().toISOString(),
      currentPhase: "setup",
      nextAction: "Define hypotheses based on research model",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Step 2: Agent ingests papers via MongoDB MCP
// The Gemini agent reads paper metadata, extracts claims, stores them
export async function ingestPaper(
  projectId: string,
  paperMeta: { title: string; authors: string[]; year: number; doi?: string; abstract: string }
): Promise<Paper> {
  const paper: Paper = {
    _id: crypto.randomUUID(),
    projectId,
    ...paperMeta,
    claims: [],
    importedAt: new Date().toISOString(),
  };
  return paper;
}

// Step 3: Agent extracts claims from paper abstracts using Gemini reasoning
// Gemini analyzes the abstract → identifies variables, methods, findings → stores as Claims in MongoDB
export function extractClaimsPrompt(paper: Paper): string {
  return `You are a research methodology agent. Analyze this academic paper abstract and extract structured claims.

Paper: "${paper.title}" (${paper.year})
Authors: ${paper.authors.join(", ")}
Abstract: ${paper.abstract}

For each claim found, identify:
1. The specific finding or assertion
2. What type it is: finding, method, theory, or definition
3. The variables involved (independent, dependent, mediating)
4. Sample size if mentioned
5. Your confidence in this extraction (0-1)

Return as JSON array of claims. Be precise. Only extract what's actually stated in the abstract.`;
}

// Step 4: Agent maps evidence from papers to hypotheses
// Uses MongoDB to query claims, matches them to hypothesis variables
export function mapEvidencePrompt(hypothesis: Hypothesis, claims: Claim[]): string {
  const claimSummaries = claims
    .map((c) => `- [${c.id}] ${c.text} (confidence: ${c.confidence}, variables: ${c.variables.join(", ")})`)
    .join("\n");

  return `You are a research methodology agent. Map evidence from extracted paper claims to this hypothesis.

Hypothesis: "${hypothesis.statement}"
Independent Variable: ${hypothesis.independentVariable}
Dependent Variable: ${hypothesis.dependentVariable}
Direction: ${hypothesis.direction}

Available claims from papers:
${claimSummaries}

For each claim that relates to this hypothesis:
1. Is it supporting, contradicting, or neutral?
2. How strong is the evidence link (0-1)?
3. Provide the relevant excerpt.

Return as JSON. Only link claims that genuinely relate to the hypothesis variables.`;
}

// Step 5: Agent assesses hypothesis strength based on evidence
export function assessHypothesisPrompt(hypothesis: Hypothesis): string {
  const evidenceSummary = hypothesis.evidence
    .map((e) => `- ${e.direction} evidence from "${e.paperTitle}" (strength: ${e.strength})`)
    .join("\n");

  return `You are a research methodology agent. Assess this hypothesis based on the collected evidence.

Hypothesis: "${hypothesis.statement}"
Evidence:
${evidenceSummary || "No evidence collected yet."}

Determine:
1. Overall strength: strong, moderate, weak, or unsupported
2. Status: supported, rejected, or needs_review
3. If needs_review: what additional evidence would strengthen or falsify it?

Return as JSON. Be honest — don't inflate weak evidence.`;
}

// Step 6: Agent recommends next reading/actions
export function recommendNextActionPrompt(project: ResearchProject): string {
  const weakHypotheses = project.hypotheses.filter((h) => h.strength === "weak" || h.strength === "unsupported");
  const totalPapers = project.papers.length;
  const supportedCount = project.hypotheses.filter((h) => h.status === "supported").length;

  return `You are a research methodology agent. Recommend the next action for this thesis project.

Topic: ${project.topic}
Model: ${project.model}
Papers ingested: ${totalPapers}
Hypotheses defined: ${project.hypotheses.length}
Hypotheses supported: ${supportedCount}
Hypotheses needing evidence: ${weakHypotheses.map((h) => `H${h.number}: ${h.statement}`).join("; ") || "none"}
Current phase: ${project.progress.currentPhase}

Recommend:
1. What to read next (specific topics or search queries)
2. What to do next (collect data? analyze? write?)
3. Priority ranking of actions

Return as JSON. Be specific and actionable.`;
}

// Step 7: Agent generates thesis progress report
export function generateProgressReportPrompt(project: ResearchProject): string {
  const hStatus = project.hypotheses
    .map((h) => `H${h.number}: ${h.strength.toUpperCase()} — ${h.status}`)
    .join("\n");

  return `You are a research advisor agent. Generate a weekly thesis progress report.

Project: ${project.topic}
Model: ${project.model}
Phase: ${project.progress.currentPhase}

Hypothesis Status:
${hStatus || "No hypotheses defined yet."}

Papers: ${project.progress.papersIngested}
Supported hypotheses: ${project.progress.hypothesesSupported}/${project.progress.hypothesesDefined}

Generate:
1. Summary paragraph (what was accomplished)
2. Current state of evidence
3. Recommendations for next week
4. Estimated completion percentage

Return as JSON. Professional tone, suitable for an academic advisor.`;
}

// Agent action log — stored in MongoDB for transparency
export function logAgentAction(action: AgentAction): AgentAction {
  action.timestamp = new Date().toISOString();
  return action;
}
