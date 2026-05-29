# ThesisMate

**Autonomous research operations agent** — builds and maintains a living thesis knowledge graph from papers, hypotheses, evidence, and citations.

Built for the **Google Cloud Rapid Agent Hackathon** (MongoDB track). Powered by Gemini + MongoDB MCP.

## What It Does

ThesisMate is not a chatbot. It's an autonomous agent that:

1. **Creates** a structured research project schema
2. **Ingests** academic papers into MongoDB
3. **Extracts** claims, variables, methods, and findings from paper abstracts
4. **Maps** evidence from papers to hypotheses
5. **Flags** unsupported hypotheses ("H3 has weak evidence")
6. **Recommends** next reading and actions
7. **Generates** bibliography + weekly progress reports

## Demo Flow

> "From 10 papers to validated thesis model in 3 minutes."

1. User enters thesis topic and theoretical model
2. Agent creates research project schema in MongoDB
3. Agent finds and imports papers
4. Agent extracts variables and findings
5. Agent builds hypothesis-evidence map
6. Agent flags unsupported hypotheses
7. Agent recommends next reading and actions
8. Agent generates bibliography + next action plan

## Architecture

- **Intelligence:** Gemini via Google Cloud Agent Builder
- **Tool Layer:** MongoDB MCP Server (persistent memory, evidence graph, paper index)
- **Frontend:** Next.js 16, TypeScript, Tailwind CSS
- **Infrastructure:** Google Cloud Run

## MongoDB as the Agent's Working Memory

MongoDB is not just storage. It is the agent's:

- **Paper Index** — structured paper metadata with extracted claims
- **Evidence Graph** — links between claims and hypotheses
- **Hypothesis State** — tracked strength, status, and supporting evidence
- **Progress Tracker** — phase, activity, and next actions
- **Citation Store** — APA 7th formatted references

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and enter a research topic.

## Hackathon

- **Challenge:** Google Cloud Rapid Agent Hackathon
- **Track:** MongoDB
- **Deadline:** June 11, 2026
- **Built by:** [ko4lax](https://github.com/ko4lax)

## License

MIT — see [LICENSE](LICENSE)
