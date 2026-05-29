"use client";

import { useState } from "react";

type AgentPhase = "idle" | "init" | "ingest" | "extract" | "map" | "assess" | "recommend" | "report";

const PHASES: { key: AgentPhase; label: string; step: number }[] = [
  { key: "idle", label: "Ready", step: 0 },
  { key: "init", label: "Initialize Project", step: 1 },
  { key: "ingest", label: "Ingest Papers", step: 2 },
  { key: "extract", label: "Extract Claims", step: 3 },
  { key: "map", label: "Map Evidence", step: 4 },
  { key: "assess", label: "Assess Hypotheses", step: 5 },
  { key: "recommend", label: "Recommend Actions", step: 6 },
  { key: "report", label: "Generate Report", step: 7 },
];

interface HypothesisData {
  number: number;
  statement: string;
  strength: "strong" | "moderate" | "weak" | "unsupported";
  status: "supported" | "needs_review" | "pending";
  confidence: number;
  papers: string[];
  flag?: string;
}

export default function Dashboard() {
  const [phase, setPhase] = useState<AgentPhase>("idle");
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("Emotional Design in TikTok Shop UX");
  const [model, setModel] = useState("Norman's 3-Level Emotional Design");
  const [papers, setPapers] = useState<string[]>([]);
  const [hypotheses, setHypotheses] = useState<HypothesisData[]>([]);
  const [flags, setFlags] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [report, setReport] = useState<Record<string, any> | null>(null);
  const [totalClaims, setTotalClaims] = useState(0);

  async function runFullPipeline() {
    setLoading(true);
    setPhase("init");

    // Step 1: Init
    await new Promise((r) => setTimeout(r, 600));
    setPhase("ingest");

    // Step 2: Ingest papers
    const ingestRes = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ingest_papers" }),
    });
    const ingestData = await ingestRes.json();
    setPapers(ingestData.papers.map((p: { title: string }) => p.title));
    await new Promise((r) => setTimeout(r, 800));
    setPhase("extract");

    // Step 3: Extract claims
    const extractRes = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "extract_claims" }),
    });
    const extractData = await extractRes.json();
    setTotalClaims(extractData.totalClaims);
    await new Promise((r) => setTimeout(r, 800));
    setPhase("map");

    // Step 4: Map evidence
    const mapRes = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "map_evidence" }),
    });
    const mapData = await mapRes.json();
    await new Promise((r) => setTimeout(r, 800));
    setPhase("assess");

    // Step 5: Assess hypotheses
    const assessRes = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "assess_hypotheses" }),
    });
    const assessData = await assessRes.json();
    const hData: HypothesisData[] = Object.entries(assessData.assessment).map(
      ([key, val]: [string, unknown]) => {
        const a = val as Record<string, unknown>;
        return {
          number: parseInt(key.replace("H", "")),
          statement: getHypothesisStatement(parseInt(key.replace("H", ""))),
          strength: a.strength as HypothesisData["strength"],
          status: a.status as HypothesisData["status"],
          confidence: a.confidence as number,
          papers: [],
          flag: a.note as string | undefined,
        };
      }
    );
    setHypotheses(hData);
    setFlags(mapData.flags.map((f: { alert: string }) => f.alert));
    await new Promise((r) => setTimeout(r, 800));
    setPhase("recommend");

    // Step 6: Recommend
    const recRes = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "recommend" }),
    });
    const recData = await recRes.json();
    setRecommendations([
      recData.recommendations.priority,
      ...recData.recommendations.nextActions,
    ]);
    await new Promise((r) => setTimeout(r, 800));
    setPhase("report");

    // Step 7: Report
    const reportRes = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "report" }),
    });
    const reportData = await reportRes.json();
    setReport(reportData.report);
    setLoading(false);
  }

  function getHypothesisStatement(n: number): string {
    const map: Record<number, string> = {
      1: "Visceral design → Perceived usefulness",
      2: "Behavioral design → Perceived ease of use",
      3: "Reflective design → Brand loyalty",
      4: "Perceived usefulness → Brand loyalty",
      5: "Perceived ease of use → Brand loyalty",
      6: "Visual design → Impulse buying (mediated by enjoyment)",
    };
    return map[n] || "";
  }

  const strengthColor = (s: string) =>
    s === "strong" ? "text-emerald-400" : s === "moderate" ? "text-amber-400" : "text-red-400";
  const strengthBg = (s: string) =>
    s === "strong"
      ? "bg-emerald-500/10 border-emerald-500/30"
      : s === "moderate"
        ? "bg-amber-500/10 border-amber-500/30"
        : "bg-red-500/10 border-red-500/30";

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Thesis<span className="text-emerald-400">Mate</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Autonomous research operations agent · MongoDB Track
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500">
              {phase === "idle" ? "Ready" : `Phase ${PHASES.find((p) => p.key === phase)?.step}/7`}
            </span>
            {!loading && phase === "idle" && (
              <button
                onClick={runFullPipeline}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Run Full Pipeline
              </button>
            )}
            {loading && (
              <span className="text-emerald-400 text-sm animate-pulse">Agent working...</span>
            )}
          </div>
        </div>

        {/* Pipeline Progress */}
        <div className="flex gap-1.5 mb-8 overflow-x-auto pb-2">
          {PHASES.filter((p) => p.key !== "idle").map((p) => {
            const phaseIdx = PHASES.findIndex((ph) => ph.key === phase);
            const stepIdx = PHASES.findIndex((ph) => ph.key === p.key);
            const isComplete = phaseIdx > stepIdx;
            const isActive = phaseIdx === stepIdx;
            const isPending = phaseIdx < stepIdx;
            return (
              <div
                key={p.key}
                className={`flex-1 min-w-[100px] rounded-lg px-3 py-2 text-center text-xs border transition-colors
                  ${isComplete ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" : ""}
                  ${isActive ? "bg-zinc-800 border-emerald-500/60 text-emerald-300 animate-pulse" : ""}
                  ${isPending ? "bg-zinc-900 border-zinc-800 text-zinc-600" : ""}
                `}
              >
                <div className="font-mono text-[10px] mb-0.5">0{p.step}</div>
                {p.label}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Papers Column */}
          <div className="border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              📄 Papers ({papers.length})
            </h2>
            {papers.length === 0 ? (
              <p className="text-sm text-zinc-600">No papers ingested yet.</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {papers.map((p, i) => (
                  <div key={i} className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                    <p className="text-sm text-zinc-300 leading-snug">{p}</p>
                  </div>
                ))}
              </div>
            )}
            {totalClaims > 0 && (
              <p className="text-xs text-emerald-400 mt-4">
                {totalClaims} claims extracted across {papers.length} papers
              </p>
            )}
          </div>

          {/* Hypotheses Column */}
          <div className="lg:col-span-2 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              🔬 Hypotheses ({hypotheses.length})
            </h2>
            {hypotheses.length === 0 ? (
              <p className="text-sm text-zinc-600">Run the pipeline to assess hypotheses.</p>
            ) : (
              <div className="space-y-3">
                {hypotheses.map((h) => (
                  <div
                    key={h.number}
                    className={`rounded-lg p-4 border ${strengthBg(h.strength)}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-zinc-500">H{h.number}</span>
                          <span
                            className={`text-xs font-semibold uppercase ${strengthColor(h.strength)}`}
                          >
                            {h.strength}
                          </span>
                          <span className="text-xs text-zinc-500">· {Math.round(h.confidence * 100)}% confidence</span>
                        </div>
                        <p className="text-sm text-zinc-200">{h.statement}</p>
                        {h.flag && (
                          <p className="text-xs text-red-400 mt-1.5">⚠ {h.flag}</p>
                        )}
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase shrink-0
                          ${h.status === "supported" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}
                      >
                        {h.status === "supported" ? "✓" : "REVIEW"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Flags */}
          {flags.length > 0 && (
            <div className="border border-red-500/30 rounded-xl p-5 bg-red-500/5">
              <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4">
                🚩 Evidence Flags
              </h2>
              <div className="space-y-2">
                {flags.map((f, i) => (
                  <p key={i} className="text-sm text-red-300">{f}</p>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="lg:col-span-2 border border-amber-500/30 rounded-xl p-5 bg-amber-500/5">
              <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
                💡 Recommendations
              </h2>
              <div className="space-y-2">
                {recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-amber-500 text-sm mt-0.5">→</span>
                    <p className="text-sm text-amber-200">{r}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Report */}
        {report && (
          <div className="mt-6 border border-emerald-500/30 rounded-xl p-6 bg-emerald-500/5">
            <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4">
              📊 Thesis Progress Report
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                ["Papers", String((report.status as any)?.papersIngested || 0)],
                ["Hypotheses", String((report.status as any)?.hypothesesDefined || 0)],
                ["Supported", String((report.status as any)?.hypothesesSupported || 0)],
                ["Completion", String((report.status as any)?.estimatedCompletion || "0%")],
              ].map(([label, value]) => (
                <div key={label} className="bg-zinc-900 rounded-lg p-3 text-center border border-zinc-800">
                  <div className="text-2xl font-bold text-emerald-400">{value}</div>
                  <div className="text-xs text-zinc-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-zinc-300 mb-4">{String(report.summary || "")}</p>
            {Boolean(report.bibliography) && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-2">Bibliography</h3>
                <div className="text-xs text-zinc-500 space-y-1">
                  {(report.bibliography as string[]).map((b, i) => (
                    <p key={i}>{b}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
