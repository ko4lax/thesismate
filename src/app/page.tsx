"use client";

import { useState } from "react";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "init_project", topic, model }),
    });

    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Thesis<span className="text-emerald-400">Mate</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Autonomous research operations agent that builds and maintains a living thesis knowledge
            graph from papers, hypotheses, evidence, and citations.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-10 space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Research Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Emotional design in TikTok Shop UX"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Theoretical Model</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g., Norman's 3-Level Emotional Design"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !topic || !model}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? "Agent working..." : "Initialize Research Project"}
          </button>
        </form>

        {/* Demo Flow Preview */}
        <div className="border border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Agent Workflow
          </h2>
          <div className="space-y-3">
            {[
              "Enter thesis topic → Agent creates research project schema",
              "Agent finds and imports 5-10 papers → MongoDB storage",
              "Agent extracts variables and findings from paper abstracts",
              "Agent builds hypothesis-evidence map",
              "Agent flags unsupported hypotheses (e.g., 'H3 has weak evidence')",
              "Agent recommends next reading and actions",
              "Agent generates bibliography + weekly progress report",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-emerald-500 font-mono text-sm mt-0.5 shrink-0">
                  {(i + 1).toString().padStart(2, "0")}
                </span>
                <span className="text-zinc-300">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="border border-emerald-500/30 rounded-xl p-6 bg-emerald-500/5">
            <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">
              Agent Output
            </h2>
            <pre className="text-sm text-zinc-300 overflow-x-auto whitespace-pre-wrap font-mono">
              {result}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
