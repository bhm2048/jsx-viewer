import { useState, useEffect, useRef } from "react";

const PHASES = [
  {
    id: "overview",
    icon: "🔭",
    label: "總覽",
    title: "什麼是 OpenSpec？",
    subtitle: "Spec-Driven Development 的核心哲學",
    color: "#FF6B35",
    accent: "#FFD166",
    description:
      "OpenSpec 是一個開源的「規格驅動開發」框架，專為 AI 程式助手設計。它在你和 AI 之間建立一層結構化的規格文件，確保 AI 在寫任何一行 code 之前，先跟你對齊「要蓋什麼」。",
    details: [
      {
        icon: "🎯",
        title: "核心理念",
        text: "先定義規格，再產生程式碼。用 Markdown 文件取代模糊的聊天對話。",
      },
      {
        icon: "⚡",
        title: "輕量設計",
        text: "純 Markdown + CLI，不需要 SaaS API Key，不綁定特定 IDE。",
      },
      {
        icon: "🔗",
        title: "跨工具相容",
        text: "支援 Claude Code、Cursor、Codex、Cline 等 20+ AI 工具。",
      },
      {
        icon: "🏗️",
        title: "企業就緒",
        text: "適合注重隱私的企業環境，所有規格文件都在本地版本控制中。",
      },
    ],
  },
  {
    id: "problem",
    icon: "🔥",
    label: "痛點",
    title: "為何需要 OpenSpec？",
    subtitle: "Vibe Coding 的三大致命傷",
    color: "#E63946",
    accent: "#F4A261",
    description:
      "目前的 AI 程式開發常被稱為「Vibe Coding」——開發者透過鬆散的自然語言對話與 AI 互動，需求散落在冗長的聊天記錄中，缺乏持久性和系統化。",
    problems: [
      {
        emoji: "🧠",
        title: "上下文失憶",
        desc: "每次對話都要重新解釋專案結構、技術棧、編碼規範。Context window 塞滿後，AI 就開始「失憶」。",
        severity: 90,
      },
      {
        emoji: "🎲",
        title: "產出不可控",
        desc: "同一個需求，AI 這次寫得很好，下次完全跑偏。沒有穩定的品質保證機制。",
        severity: 85,
      },
      {
        emoji: "🧩",
        title: "風格不一致",
        desc: "架構模式混亂，命名慣例不統一，無法工程化，難以整合進 CI/CD 流程。",
        severity: 80,
      },
    ],
  },
  {
    id: "setup",
    icon: "⚙️",
    label: "安裝",
    title: "初始化 OpenSpec",
    subtitle: "三步完成專案設定",
    color: "#2A9D8F",
    accent: "#E9C46A",
    description:
      "OpenSpec 作為 Node.js CLI 工具，安裝和配置極為輕量，不需要複雜的依賴鏈。",
    steps: [
      {
        cmd: "npm install -g openspec",
        note: "全域安裝 OpenSpec CLI（需要 Node.js v20.19+）",
        icon: "📦",
      },
      {
        cmd: "cd your-project && openspec init",
        note: "在專案根目錄初始化，選擇 AI 工具（如 Claude Code）",
        icon: "🎬",
      },
      {
        cmd: "openspec config profile",
        note: "選擇工作流 profile，自動產生 project.md 和 AGENTS.md",
        icon: "📝",
      },
    ],
    files: [
      {
        name: "openspec/project.md",
        desc: "專案的「世界觀」——定義技術棧、架構模式、編碼慣例",
      },
      {
        name: "openspec/AGENTS.md",
        desc: "AI 助手的行為指引——slash commands 和互動規範",
      },
    ],
  },
  {
    id: "proposal",
    icon: "📋",
    label: "提案",
    title: "Phase 1：Proposal",
    subtitle: "/openspec:proposal — 定義要建什麼",
    color: "#6A4C93",
    accent: "#B8B8FF",
    description:
      "一切從提案開始。用自然語言描述你想要的功能，OpenSpec 會自動生成結構化的規格文件，包含提案理由、需求規格、技術設計和任務清單。",
    artifacts: [
      {
        file: "proposal.md",
        desc: "為什麼要做這個功能？影響範圍是什麼？",
        icon: "💡",
        color: "#B8B8FF",
      },
      {
        file: "specs/",
        desc: "需求與情境規格（requirements & scenarios）",
        icon: "📐",
        color: "#C3B1E1",
      },
      {
        file: "design.md",
        desc: "技術方案——AI 產生的架構洞察",
        icon: "🏛️",
        color: "#D4A5FF",
      },
      {
        file: "tasks.md",
        desc: "實作任務清單，帶完成狀態追蹤",
        icon: "✅",
        color: "#E0C3FC",
      },
    ],
    example: `/openspec:proposal add-dark-mode\n\n→ 產生 openspec/changes/add-dark-mode/\n  ✓ proposal.md\n  ✓ specs/\n  ✓ design.md\n  ✓ tasks.md`,
  },
  {
    id: "apply",
    icon: "🚀",
    label: "實作",
    title: "Phase 2：Apply",
    subtitle: "/openspec:apply — AI 依規格寫 Code",
    color: "#0077B6",
    accent: "#90E0EF",
    description:
      "規格確認後，AI 開始依據 tasks.md 逐項實作。每個任務都有明確的完成狀態追蹤，AI 不會偷偷用「隨手寫」的方式亂加功能。",
    taskFlow: [
      { task: "1.1 建立 Theme Context Provider", status: "done" },
      { task: "1.2 建立 Toggle 元件", status: "done" },
      { task: "2.1 加入 CSS Variables", status: "active" },
      { task: "2.2 接上 localStorage", status: "pending" },
      { task: "3.1 撰寫單元測試", status: "pending" },
    ],
  },
  {
    id: "archive",
    icon: "📦",
    label: "歸檔",
    title: "Phase 3：Archive",
    subtitle: "/openspec:archive — 歸檔並更新知識庫",
    color: "#386641",
    accent: "#A7C957",
    description:
      "實作完成後，OpenSpec 會把 Delta specs 合併到主要的 specs 目錄，更新專案的核心知識庫（source of truth），並將變更資料夾整理歸檔，供未來稽核。",
    archiveFlow: [
      { from: "changes/add-dark-mode/", action: "驗證", icon: "🔍" },
      { from: "specs/ (delta)", action: "合併", icon: "🔀" },
      { from: "openspec/specs/", action: "更新主規格", icon: "📚" },
      {
        from: "changes/archive/2026-04-04-add-dark-mode/",
        action: "歸檔",
        icon: "🗄️",
      },
    ],
  },
  {
    id: "benefits",
    icon: "🏆",
    label: "效益",
    title: "全端開發的實戰效益",
    subtitle: "從 Vibe Coding 到工程紀律",
    color: "#D4A373",
    accent: "#FEFAE0",
    description:
      "OpenSpec 把「跟 AI 聊天寫 code」升級成「有工程紀律的 AI 協作流程」。你不再是手動翻譯需求的碼農，而是管理規格與 AI agent 的指揮官。",
    benefits: [
      {
        icon: "🎯",
        title: "需求前置審查",
        value: "在寫 code 前攔住錯誤需求",
      },
      { icon: "📏", title: "架構一致性", value: "AI 始終遵循你定義的慣例" },
      { icon: "🔄", title: "可重現性", value: "相同規格 → 一致的產出品質" },
      { icon: "📖", title: "文件自動同步", value: "規格即文件，永不過時" },
      { icon: "👥", title: "團隊協作", value: "前後端共享規格，減少溝通成本" },
      { icon: "🔍", title: "稽核軌跡", value: "所有變更都有完整歸檔記錄" },
    ],
  },
];

/* ─── Animated background particles ─── */
function Particles({ color }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 4 + Math.random() * 8,
            height: 4 + Math.random() * 8,
            borderRadius: "50%",
            background: color,
            opacity: 0.12 + Math.random() * 0.15,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `floatParticle ${6 + Math.random() * 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Severity bar for problems ─── */
function SeverityBar({ value, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 200);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div
      style={{
        width: "100%",
        height: 10,
        borderRadius: 5,
        background: "rgba(255,255,255,0.1)",
        overflow: "hidden",
        marginTop: 8,
      }}
    >
      <div
        style={{
          width: `${width}%`,
          height: "100%",
          borderRadius: 4,
          background: `linear-gradient(90deg, ${color}, #fff3)`,
          transition: "width 1.2s cubic-bezier(.4,0,.2,1)",
        }}
      />
    </div>
  );
}

/* ─── Task item with status indicator ─── */
function TaskItem({ task, status, idx }) {
  const colors = {
    done: "#22c55e",
    active: "#f59e0b",
    pending: "rgba(255,255,255,0.25)",
  };
  const labels = { done: "✓ 完成", active: "⟳ 進行中", pending: "○ 待處理" };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        background:
          status === "active" ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)",
        borderRadius: 10,
        borderLeft: `3px solid ${colors[status]}`,
        animation: `slideInRight 0.5s ease forwards`,
        animationDelay: `${idx * 0.12}s`,
        opacity: 0,
      }}
    >
      <span
        style={{
          fontSize: 14,
          padding: "4px 12px",
          borderRadius: 20,
          background: colors[status],
          color: status === "pending" ? "#fff8" : "#000",
          fontWeight: 700,
          letterSpacing: 0.5,
          whiteSpace: "nowrap",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {labels[status]}
      </span>
      <span
        style={{
          color: status === "pending" ? "#fff6" : "#fffc",
          fontSize: 17,
          fontFamily: "'Noto Sans TC', sans-serif",
        }}
      >
        {task}
      </span>
    </div>
  );
}

/* ─── Code block ─── */
function CodeBlock({ code }) {
  return (
    <pre
      style={{
        background: "rgba(0,0,0,0.5)",
        borderRadius: 12,
        padding: "16px 20px",
        fontSize: 15,
        lineHeight: 1.7,
        color: "#a7f3d0",
        fontFamily: "'JetBrains Mono', monospace",
        overflowX: "auto",
        border: "1px solid rgba(255,255,255,0.08)",
        margin: 0,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {code}
    </pre>
  );
}

/* ─── Archive flow arrow diagram ─── */
function ArchiveStep({ from, action, icon, idx, total }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        animation: `slideInRight 0.5s ease forwards`,
        animationDelay: `${idx * 0.18}s`,
        opacity: 0,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            color: "#A7C957",
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {action}
        </div>
        <div
          style={{
            fontSize: 15,
            color: "#fffb",
            fontFamily: "'JetBrains Mono', monospace",
            wordBreak: "break-all",
          }}
        >
          {from}
        </div>
      </div>
      {idx < total - 1 && (
        <div
          style={{ fontSize: 26, color: "#fff4", flexShrink: 0 }}
        >
          →
        </div>
      )}
    </div>
  );
}

/* ═══════════════ MAIN COMPONENT ═══════════════ */
export default function OpenSpecGuide() {
  const [activeIdx, setActiveIdx] = useState(0);
  const phase = PHASES[activeIdx];
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeIdx]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#0a0a0f",
        fontFamily: "'Noto Sans TC', 'SF Pro Display', sans-serif",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700;900&family=JetBrains+Mono:wght@400;600;700&family=Sora:wght@300;400;600;700;800&display=swap');
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-8px) translateX(-12px); }
          75% { transform: translateY(-25px) translateX(8px); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.05); }
          50% { box-shadow: 0 0 35px rgba(255,255,255,0.12); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #fff2; border-radius: 4px; }
      `}</style>

      <Particles color={phase.color} />

      {/* ── HEADER ── */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          padding: "32px 20px 12px",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "5px 18px",
            borderRadius: 30,
            background: `linear-gradient(135deg, ${phase.color}33, ${phase.accent}22)`,
            border: `1px solid ${phase.color}44`,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: 2,
            color: phase.accent,
            textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 12,
          }}
        >
          OpenSpec 互動指南
        </div>
        <h1
          style={{
            fontSize: "clamp(28px, 6vw, 44px)",
            fontFamily: "'Sora', sans-serif",
            fontWeight: 800,
            margin: 0,
            background: `linear-gradient(135deg, ${phase.color}, ${phase.accent})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1.2,
          }}
        >
          Spec-Driven Development
        </h1>
        <p
          style={{
            color: "#fff7",
            fontSize: 16,
            margin: "8px 0 0",
            fontFamily: "'Noto Sans TC', sans-serif",
          }}
        >
          從 Vibe Coding 到工程紀律的進化之路
        </p>
      </div>

      {/* ── PHASE TABS ── */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          gap: 6,
          padding: "8px 16px 4px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {PHASES.map((p, i) => {
          const isActive = i === activeIdx;
          return (
            <button
              key={p.id}
              onClick={() => setActiveIdx(i)}
              style={{
                flex: "0 0 auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "10px 14px 8px",
                borderRadius: 14,
                border: isActive
                  ? `1.5px solid ${p.color}88`
                  : "1.5px solid transparent",
                background: isActive
                  ? `linear-gradient(145deg, ${p.color}22, ${p.accent}11)`
                  : "rgba(255,255,255,0.03)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                minWidth: 58,
              }}
            >
              <span style={{ fontSize: 24 }}>{p.icon}</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? p.accent : "#fff6",
                  letterSpacing: 0.3,
                  fontFamily: "'Noto Sans TC', sans-serif",
                }}
              >
                {p.label}
              </span>
              {isActive && (
                <div
                  style={{
                    width: 16,
                    height: 2.5,
                    borderRadius: 2,
                    background: p.color,
                    marginTop: 2,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── CONTENT AREA ── */}
      <div
        ref={contentRef}
        key={phase.id}
        style={{
          position: "relative",
          zIndex: 2,
          padding: "16px 16px 100px",
          animation: "fadeInUp 0.45s ease",
          overflowY: "auto",
        }}
      >
        {/* Title card */}
        <div
          style={{
            background: `linear-gradient(160deg, ${phase.color}15, ${phase.accent}08)`,
            border: `1px solid ${phase.color}30`,
            borderRadius: 20,
            padding: "24px 20px",
            marginBottom: 20,
            animation: "pulseGlow 4s ease-in-out infinite",
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: phase.accent,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 8,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {phase.subtitle}
          </div>
          <h2
            style={{
              fontSize: "clamp(26px, 5.5vw, 36px)",
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              margin: "0 0 12px",
              color: "#fffe",
            }}
          >
            {phase.title}
          </h2>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.9,
              color: "#fffc",
              margin: 0,
              fontFamily: "'Noto Sans TC', sans-serif",
            }}
          >
            {phase.description}
          </p>
        </div>

        {/* ── OVERVIEW DETAILS ── */}
        {phase.id === "overview" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {phase.details.map((d, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 16,
                  padding: "20px 18px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  animation: `slideInRight 0.5s ease forwards`,
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0,
                }}
              >
                <div style={{ fontSize: 34, marginBottom: 12 }}>{d.icon}</div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: phase.accent,
                    marginBottom: 8,
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  {d.title}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: "#fff9",
                    lineHeight: 1.75,
                    fontFamily: "'Noto Sans TC', sans-serif",
                  }}
                >
                  {d.text}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PROBLEM CARDS ── */}
        {phase.id === "problem" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {phase.problems.map((p, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 16,
                  padding: "20px 18px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  animation: `slideInRight 0.5s ease forwards`,
                  animationDelay: `${i * 0.15}s`,
                  opacity: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 26 }}>{p.emoji}</span>
                  <span
                    style={{
                      fontSize: 19,
                      fontWeight: 700,
                      color: "#fffd",
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    {p.title}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 14,
                      color: phase.accent,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                    }}
                  >
                    嚴重度 {p.severity}%
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 16,
                    color: "#fff9",
                    lineHeight: 1.75,
                    margin: 0,
                    fontFamily: "'Noto Sans TC', sans-serif",
                  }}
                >
                  {p.desc}
                </p>
                <SeverityBar value={p.severity} color={phase.color} />
              </div>
            ))}
          </div>
        )}

        {/* ── SETUP STEPS ── */}
        {phase.id === "setup" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {phase.steps.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    animation: `slideInRight 0.5s ease forwards`,
                    animationDelay: `${i * 0.15}s`,
                    opacity: 0,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: `linear-gradient(135deg, ${phase.color}44, ${phase.accent}22)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      flexShrink: 0,
                      border: `1px solid ${phase.color}44`,
                    }}
                  >
                    {s.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <code
                      style={{
                        display: "block",
                        background: "rgba(0,0,0,0.45)",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 15,
                        color: "#a7f3d0",
                        fontFamily: "'JetBrains Mono', monospace",
                        marginBottom: 6,
                        wordBreak: "break-all",
                      }}
                    >
                      $ {s.cmd}
                    </code>
                    <p
                      style={{
                        fontSize: 16,
                        color: "#fff8",
                        margin: 0,
                        fontFamily: "'Noto Sans TC', sans-serif",
                      }}
                    >
                      {s.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 20,
                background: "rgba(255,255,255,0.03)",
                borderRadius: 14,
                padding: "18px 16px",
                border: `1px solid ${phase.color}22`,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: phase.accent,
                  marginBottom: 12,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                📁 產生的關鍵檔案
              </div>
              {phase.files.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "baseline",
                    marginBottom: i < phase.files.length - 1 ? 10 : 0,
                  }}
                >
                  <code
                    style={{
                      fontSize: 15,
                      color: "#a7f3d0",
                      fontFamily: "'JetBrains Mono', monospace",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {f.name}
                  </code>
                  <span
                    style={{
                      fontSize: 15,
                      color: "#fff7",
                      fontFamily: "'Noto Sans TC', sans-serif",
                    }}
                  >
                    {f.desc}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── PROPOSAL ARTIFACTS ── */}
        {phase.id === "proposal" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
                marginBottom: 18,
              }}
            >
              {phase.artifacts.map((a, i) => (
                <div
                  key={i}
                  style={{
                    background: `linear-gradient(145deg, ${a.color}12, transparent)`,
                    borderRadius: 16,
                    padding: "18px 16px",
                    border: `1px solid ${a.color}33`,
                    animation: `slideInRight 0.5s ease forwards`,
                    animationDelay: `${i * 0.12}s`,
                    opacity: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 24,
                      marginBottom: 8,
                    }}
                  >
                    {a.icon}
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: a.color,
                      fontFamily: "'JetBrains Mono', monospace",
                      marginBottom: 4,
                    }}
                  >
                    {a.file}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: "#fff8",
                      lineHeight: 1.7,
                      fontFamily: "'Noto Sans TC', sans-serif",
                    }}
                  >
                    {a.desc}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: phase.accent,
                marginBottom: 8,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: 1,
              }}
            >
              EXAMPLE
            </div>
            <CodeBlock code={phase.example} />
          </>
        )}

        {/* ── APPLY TASK FLOW ── */}
        {phase.id === "apply" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {phase.taskFlow.map((t, i) => (
              <TaskItem key={i} task={t.task} status={t.status} idx={i} />
            ))}
            <div
              style={{
                marginTop: 14,
                background: "rgba(0,119,182,0.08)",
                borderRadius: 14,
                padding: "16px 18px",
                border: "1px solid rgba(0,119,182,0.2)",
                animation: "fadeInUp 0.6s ease 0.7s forwards",
                opacity: 0,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: phase.accent,
                  marginBottom: 8,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                💡 關鍵特性
              </div>
              <p
                style={{
                  fontSize: 16,
                  color: "#fff9",
                  lineHeight: 1.75,
                  margin: 0,
                  fontFamily: "'Noto Sans TC', sans-serif",
                }}
              >
                AI 嚴格按照 tasks.md 逐項執行，每完成一項就更新狀態。不會偷加功能、不會跳過步驟，你可以隨時中斷並從當前進度恢復。
              </p>
            </div>
          </div>
        )}

        {/* ── ARCHIVE FLOW ── */}
        {phase.id === "archive" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 12,
            }}
          >
            {phase.archiveFlow.map((a, i) => (
              <ArchiveStep
                key={i}
                {...a}
                idx={i}
                total={phase.archiveFlow.length}
              />
            ))}
            <div
              style={{
                marginTop: 10,
                background: "rgba(56,102,65,0.12)",
                borderRadius: 14,
                padding: "16px 18px",
                border: "1px solid rgba(167,201,87,0.2)",
                animation: "fadeInUp 0.6s ease 0.8s forwards",
                opacity: 0,
              }}
            >
              <p
                style={{
                  fontSize: 16,
                  color: "#fff9",
                  lineHeight: 1.75,
                  margin: 0,
                  fontFamily: "'Noto Sans TC', sans-serif",
                }}
              >
                歸檔完成後，專案的核心 specs/ 目錄就是唯一的 source of truth，文件永遠不會落後於程式碼。
              </p>
            </div>
          </div>
        )}

        {/* ── BENEFITS GRID ── */}
        {phase.id === "benefits" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            {phase.benefits.map((b, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 14,
                  padding: "16px 16px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  animation: `slideInRight 0.5s ease forwards`,
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${phase.color}33, ${phase.accent}22)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    flexShrink: 0,
                  }}
                >
                  {b.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#fffd",
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    {b.title}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: "#fff8",
                      fontFamily: "'Noto Sans TC', sans-serif",
                    }}
                  >
                    {b.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 20px",
          background: "linear-gradient(180deg, transparent, #0a0a0f 30%)",
        }}
      >
        <button
          onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
          disabled={activeIdx === 0}
          style={{
            padding: "10px 22px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)",
            background: activeIdx === 0 ? "transparent" : "rgba(255,255,255,0.06)",
            color: activeIdx === 0 ? "#fff3" : "#fffc",
            cursor: activeIdx === 0 ? "default" : "pointer",
            fontSize: 16,
            fontWeight: 600,
            fontFamily: "'Noto Sans TC', sans-serif",
            transition: "all 0.2s",
          }}
        >
          ← 上一步
        </button>
        <div
          style={{
            display: "flex",
            gap: 6,
          }}
        >
          {PHASES.map((_, i) => (
            <div
              key={i}
              onClick={() => setActiveIdx(i)}
              style={{
                width: i === activeIdx ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === activeIdx ? phase.color : "#fff2",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
        <button
          onClick={() =>
            setActiveIdx(Math.min(PHASES.length - 1, activeIdx + 1))
          }
          disabled={activeIdx === PHASES.length - 1}
          style={{
            padding: "10px 22px",
            borderRadius: 12,
            border: "none",
            background:
              activeIdx === PHASES.length - 1
                ? "rgba(255,255,255,0.04)"
                : `linear-gradient(135deg, ${phase.color}, ${phase.accent})`,
            color: activeIdx === PHASES.length - 1 ? "#fff3" : "#000",
            cursor: activeIdx === PHASES.length - 1 ? "default" : "pointer",
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "'Noto Sans TC', sans-serif",
            transition: "all 0.2s",
          }}
        >
          下一步 →
        </button>
      </div>
    </div>
  );
}
