import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThesisMate — Autonomous Research Operations Agent",
  description:
    "An agent that builds and maintains a living thesis knowledge graph from papers, hypotheses, evidence, and citations. Built with Gemini + MongoDB MCP.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
