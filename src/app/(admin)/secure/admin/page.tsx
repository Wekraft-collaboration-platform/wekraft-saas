"use client";

import { useState } from "react";

const messages = [
  {
    id: 1,
    user: "rihudino",
    avatar: "RI",
    channel: "#general",
    message: "You are completely useless to this team",
    sentiment: "Negative",
    sentimentScore: 94.2,
    toxicity: 8.3,
    timestamp: "Today, 5:07 AM",
    action: "BLOCK USER",
    flagged: true,
    model: "RoBERTa",
    tokens: 9,
  },
  {
    id: 2,
    user: "alex_m",
    avatar: "AL",
    channel: "#rox",
    message: "Can someone stop uploading garbage files to the shared drive?",
    sentiment: "Negative",
    sentimentScore: 78.5,
    toxicity: 6.1,
    timestamp: "Today, 4:52 AM",
    action: "WARN USER",
    flagged: true,
    model: "RoBERTa",
    tokens: 13,
  },
  {
    id: 3,
    user: "priya_k",
    avatar: "PR",
    channel: "#client-chat",
    message: "Great job everyone, the sprint went really well!",
    sentiment: "Positive",
    sentimentScore: 97.1,
    toxicity: 0.4,
    timestamp: "Today, 3:30 AM",
    action: "NONE",
    flagged: false,
    model: "RoBERTa",
    tokens: 11,
  },
  {
    id: 4,
    user: "ritesh_29",
    avatar: "RT",
    channel: "#general",
    message: "Tasks have been updated. Please review before EOD.",
    sentiment: "Neutral",
    sentimentScore: 88.3,
    toxicity: 0.2,
    timestamp: "Today, 2:17 AM",
    action: "NONE",
    flagged: false,
    model: "RoBERTa",
    tokens: 10,
  },
  {
    id: 5,
    user: "sam_dev",
    avatar: "SD",
    channel: "#rox",
    message: "Why does nobody bother reading the docs? This is honestly embarrassing.",
    sentiment: "Negative",
    sentimentScore: 85.6,
    toxicity: 5.7,
    timestamp: "Yesterday, 11:45 PM",
    action: "WARN USER",
    flagged: true,
    model: "RoBERTa",
    tokens: 14,
  },
  {
    id: 6,
    user: "nisha_ui",
    avatar: "NI",
    channel: "#general",
    message: "The new design system looks amazing, love the dark theme!",
    sentiment: "Positive",
    sentimentScore: 95.8,
    toxicity: 0.1,
    timestamp: "Yesterday, 9:10 PM",
    action: "NONE",
    flagged: false,
    model: "RoBERTa",
    tokens: 12,
  },
  {
    id: 7,
    user: "karan_b",
    avatar: "KB",
    channel: "#client-chat",
    message: "I'll get that report to you by end of week.",
    sentiment: "Neutral",
    sentimentScore: 82.0,
    toxicity: 0.3,
    timestamp: "Yesterday, 7:40 PM",
    action: "NONE",
    flagged: false,
    model: "RoBERTa",
    tokens: 10,
  },
  {
    id: 8,
    user: "anon_x",
    avatar: "AX",
    channel: "#general",
    message: "Honestly this whole team is a joke, I can't believe we shipped this.",
    sentiment: "Negative",
    sentimentScore: 91.4,
    toxicity: 7.6,
    timestamp: "Yesterday, 5:05 PM",
    action: "BLOCK USER",
    flagged: true,
    model: "RoBERTa",
    tokens: 15,
  },
];

const sentimentColor = (s: string) => {
  if (s === "Positive") return "#22c55e";
  if (s === "Negative") return "#ef4444";
  return "#f59e0b";
};

const toxicityColor = (t: number) => {
  if (t >= 7) return "#ef4444";
  if (t >= 4) return "#f59e0b";
  return "#22c55e";
};

const actionBadge = (a: string) => {
  if (a === "BLOCK USER") return { bg: "#ef444422", color: "#ef4444", border: "#ef444455" };
  if (a === "WARN USER") return { bg: "#f59e0b22", color: "#f59e0b", border: "#f59e0b55" };
  return { bg: "#ffffff0a", color: "#6b7280", border: "#ffffff15" };
};

export default function AdminMLPage() {
  const [filter, setFilter] = useState<"all" | "flagged" | "positive" | "negative" | "neutral">("all");
  const [selectedMsg, setSelectedMsg] = useState<(typeof messages)[0] | null>(null);
  const [actionDone, setActionDone] = useState<Record<number, string>>({});

  const filtered = messages.filter((m) => {
    if (filter === "flagged") return m.flagged;
    if (filter === "positive") return m.sentiment === "Positive";
    if (filter === "negative") return m.sentiment === "Negative";
    if (filter === "neutral") return m.sentiment === "Neutral";
    return true;
  });

  const stats = {
    total: messages.length,
    flagged: messages.filter((m) => m.flagged).length,
    positive: messages.filter((m) => m.sentiment === "Positive").length,
    negative: messages.filter((m) => m.sentiment === "Negative").length,
    neutral: messages.filter((m) => m.sentiment === "Neutral").length,
    avgToxicity: (messages.reduce((a, m) => a + m.toxicity, 0) / messages.length).toFixed(1),
  };

  const handleAction = (id: number, action: string) => {
    setActionDone((prev) => ({ ...prev, [id]: action }));
    setSelectedMsg(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", color: "#f4f4f5", fontFamily: "'Inter', sans-serif", padding: "0" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Top Bar */}
      <div style={{ background: "linear-gradient(135deg, #0f0f12 0%, #12121a 100%)", borderBottom: "1px solid #1e1e2e", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🛡️</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.3px" }}>AI Safety Intelligence</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>Wekraft · NLP Moderation Engine · RoBERTa v2</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ padding: "6px 14px", borderRadius: 20, background: "#7c3aed22", border: "1px solid #7c3aed55", fontSize: 12, color: "#a78bfa", fontWeight: 500 }}>🤖 Model: RoBERTa</div>
          <div style={{ padding: "6px 14px", borderRadius: 20, background: "#22c55e15", border: "1px solid #22c55e40", fontSize: 12, color: "#4ade80", fontWeight: 500 }}>● Live Monitoring</div>
        </div>
      </div>

      <div style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>

        {/* NLP Model Info Banner */}
        <div style={{ background: "linear-gradient(135deg, #1e1033, #0f1729)", border: "1px solid #312e81", borderRadius: 14, padding: "18px 24px", marginBottom: 28, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 28 }}>🧠</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#c4b5fd", marginBottom: 4 }}>
              Wekraft uses AI-powered sentiment &amp; toxicity intelligence to maintain healthy team communication and automatically flag risky conversations for admins.
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Task Type: <span style={{ color: "#a78bfa" }}>NLP Text Classification</span> &nbsp;·&nbsp; Architecture: <span style={{ color: "#a78bfa" }}>Transformer (RoBERTa)</span> &nbsp;·&nbsp; Inference: <span style={{ color: "#a78bfa" }}>Real-time · &lt;80ms latency</span> &nbsp;·&nbsp; Confidence Threshold: <span style={{ color: "#a78bfa" }}>70%</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {[{ label: "Accuracy", val: "96.4%" }, { label: "F1 Score", val: "0.941" }, { label: "Latency", val: "78ms" }].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#a78bfa" }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Total Scanned", val: stats.total, icon: "📊", color: "#6b7280" },
            { label: "Flagged", val: stats.flagged, icon: "🚩", color: "#ef4444" },
            { label: "Positive", val: stats.positive, icon: "✅", color: "#22c55e" },
            { label: "Negative", val: stats.negative, icon: "⚠️", color: "#ef4444" },
            { label: "Neutral", val: stats.neutral, icon: "📋", color: "#f59e0b" },
            { label: "Avg Toxicity", val: `${stats.avgToxicity}/10`, icon: "☣️", color: "#f59e0b" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#0f0f12", border: "1px solid #1e1e2e", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["all", "flagged", "negative", "positive", "neutral"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 18px", borderRadius: 8, border: filter === f ? "1px solid #7c3aed" : "1px solid #1e1e2e", background: filter === f ? "#7c3aed22" : "#0f0f12", color: filter === f ? "#a78bfa" : "#6b7280", fontSize: 13, fontWeight: 500, cursor: "pointer", textTransform: "capitalize", transition: "all 0.2s" }}>
              {f === "all" ? "All Messages" : f === "flagged" ? "🚩 Flagged" : f === "negative" ? "⚠️ Negative" : f === "positive" ? "✅ Positive" : "📋 Neutral"}
            </button>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#6b7280", alignSelf: "center" }}>{filtered.length} messages · RoBERTa NLP Classification</div>
        </div>

        {/* Message Table */}
        <div style={{ background: "#0f0f12", border: "1px solid #1e1e2e", borderRadius: 14, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 140px 110px 130px 140px", gap: 0, padding: "12px 20px", borderBottom: "1px solid #1e1e2e", background: "#09090b" }}>
            {["User", "Message", "Sentiment", "Toxicity", "Admin Action", "Model"].map((h) => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</div>
            ))}
          </div>

          {filtered.map((m, i) => {
            const ab = actionBadge(actionDone[m.id] || m.action);
            return (
              <div key={m.id} onClick={() => setSelectedMsg(m)} style={{ display: "grid", gridTemplateColumns: "200px 1fr 140px 110px 130px 140px", gap: 0, padding: "16px 20px", borderBottom: i < filtered.length - 1 ? "1px solid #1a1a24" : "none", cursor: "pointer", background: selectedMsg?.id === m.id ? "#1a1a2e" : "transparent", transition: "background 0.15s" }}
                onMouseEnter={(e) => { if (selectedMsg?.id !== m.id) (e.currentTarget as HTMLDivElement).style.background = "#111118"; }}
                onMouseLeave={(e) => { if (selectedMsg?.id !== m.id) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                {/* User */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{m.avatar}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{m.user}</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{m.channel}</div>
                  </div>
                </div>

                {/* Message */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingRight: 16 }}>
                  <div style={{ fontSize: 13, color: m.flagged ? "#fca5a5" : "#d1d5db", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {m.flagged && <span style={{ marginRight: 6 }}>🚩</span>}{m.message}
                  </div>
                  <div style={{ fontSize: 11, color: "#4b5563", marginTop: 3 }}>{m.timestamp}</div>
                </div>

                {/* Sentiment */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: sentimentColor(m.sentiment) }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: sentimentColor(m.sentiment) }}>{m.sentiment}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{m.sentimentScore}% conf.</div>
                </div>

                {/* Toxicity */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: toxicityColor(m.toxicity) }}>{m.toxicity}<span style={{ fontSize: 11, fontWeight: 400, color: "#4b5563" }}>/10</span></div>
                  <div style={{ marginTop: 5, height: 4, background: "#1e1e2e", borderRadius: 4, width: 80 }}>
                    <div style={{ height: "100%", borderRadius: 4, width: `${(m.toxicity / 10) * 100}%`, background: toxicityColor(m.toxicity) }} />
                  </div>
                </div>

                {/* Action */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", background: ab.bg, color: ab.color, border: `1px solid ${ab.border}` }}>
                    {actionDone[m.id] || m.action || "—"}
                  </span>
                </div>

                {/* Model */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 500 }}>{m.model}</div>
                  <div style={{ fontSize: 11, color: "#4b5563" }}>{m.tokens} tokens</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        {selectedMsg && (
          <div style={{ marginTop: 20, background: "linear-gradient(135deg, #0f0f1a, #12121e)", border: "1px solid #312e81", borderRadius: 14, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>🔬 NLP Analysis Report · RoBERTa Transformer</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#f4f4f5" }}>Message Deep Scan</div>
              </div>
              <button onClick={() => setSelectedMsg(null)} style={{ background: "#1e1e2e", border: "1px solid #2d2d3a", color: "#6b7280", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13 }}>✕ Close</button>
            </div>

            <div style={{ background: "#09090b", border: "1px solid #1e1e2e", borderRadius: 10, padding: "14px 18px", marginBottom: 20, fontFamily: "monospace", fontSize: 14, color: "#fca5a5", lineHeight: 1.6 }}>
              &quot;{selectedMsg.message}&quot;
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
              {[
                { label: "Sentiment", val: selectedMsg.sentiment, sub: `${selectedMsg.sentimentScore}% confidence`, color: sentimentColor(selectedMsg.sentiment) },
                { label: "Toxicity Score", val: `${selectedMsg.toxicity}/10`, sub: selectedMsg.toxicity >= 7 ? "HIGH RISK" : selectedMsg.toxicity >= 4 ? "MODERATE" : "SAFE", color: toxicityColor(selectedMsg.toxicity) },
                { label: "Channel", val: selectedMsg.channel, sub: selectedMsg.timestamp, color: "#a78bfa" },
                { label: "NLP Model", val: selectedMsg.model, sub: `${selectedMsg.tokens} tokens processed`, color: "#60a5fa" },
              ].map((d) => (
                <div key={d.label} style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{d.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: d.color }}>{d.val}</div>
                  <div style={{ fontSize: 11, color: "#4b5563", marginTop: 3 }}>{d.sub}</div>
                </div>
              ))}
            </div>

            {/* Confidence Bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                <span>Sentiment Confidence Distribution</span>
                <span>RoBERTa · 3-class classifier</span>
              </div>
              {[
                { label: "Positive", val: selectedMsg.sentiment === "Positive" ? selectedMsg.sentimentScore : Math.random() * 10, color: "#22c55e" },
                { label: "Neutral", val: selectedMsg.sentiment === "Neutral" ? selectedMsg.sentimentScore : Math.random() * 15, color: "#f59e0b" },
                { label: "Negative", val: selectedMsg.sentiment === "Negative" ? selectedMsg.sentimentScore : Math.random() * 10, color: "#ef4444" },
              ].map((bar) => (
                <div key={bar.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 60, fontSize: 12, color: "#6b7280" }}>{bar.label}</div>
                  <div style={{ flex: 1, height: 8, background: "#1e1e2e", borderRadius: 4 }}>
                    <div style={{ height: "100%", borderRadius: 4, width: `${bar.val}%`, background: bar.color, transition: "width 0.6s ease" }} />
                  </div>
                  <div style={{ width: 45, fontSize: 12, color: bar.color, fontWeight: 600, textAlign: "right" }}>{bar.val.toFixed(1)}%</div>
                </div>
              ))}
            </div>

            {/* Admin Actions */}
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Admin Actions</div>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { label: "🚫 Block User", action: "BLOCKED", style: { background: "#ef444422", border: "1px solid #ef444455", color: "#ef4444" } },
                  { label: "⚠️ Warn User", action: "WARNED", style: { background: "#f59e0b22", border: "1px solid #f59e0b55", color: "#f59e0b" } },
                  { label: "🗑️ Delete Message", action: "DELETED", style: { background: "#6b728022", border: "1px solid #6b728055", color: "#9ca3af" } },
                  { label: "✅ Mark Safe", action: "SAFE", style: { background: "#22c55e22", border: "1px solid #22c55e55", color: "#22c55e" } },
                ].map((a) => (
                  <button key={a.action} onClick={() => handleAction(selectedMsg.id, a.action)} style={{ padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", ...a.style, transition: "opacity 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 24, padding: "16px 0", borderTop: "1px solid #1e1e2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "#4b5563" }}>Wekraft AI Safety Engine · NLP Text Classification · Powered by RoBERTa Transformer Model</div>
          <div style={{ fontSize: 12, color: "#4b5563" }}>Last scan: Today 12:11 AM · {messages.length} messages analyzed</div>
        </div>
      </div>
    </div>
  );
}
