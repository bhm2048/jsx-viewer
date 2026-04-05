import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   JSX Viewer 開發之旅
   ── Claude Code × 人類開發者的 Vibe Coding 完整紀實
   ══════════════════════════════════════════════════════════ */

// ─── 色彩系統 ───
const C = {
  bg: "#0B0B1A",
  surface: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.08)",
  text: "#E0E0E0",
  textDim: "#888",
  accent: "#E94560",
  accentSoft: "rgba(233,69,96,0.15)",
  gold: "#FFD700",
  green: "#66FF88",
  blue: "#4488FF",
  purple: "#C77DFF",
  orange: "#FF6B35",
  cyan: "#00E5FF",
  red: "#FF4444",
};

const GLOW = (color, intensity = 0.4) => `0 0 30px rgba(${hexToRgb(color)},${intensity})`;

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ─── 通用元件 ───

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function FadeIn({ children, delay = 0, direction = "up", style = {} }) {
  const [ref, visible] = useInView();
  const offsets = { up: "translateY(40px)", down: "translateY(-40px)", left: "translateX(40px)", right: "translateX(-40px)" };
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translate(0)" : offsets[direction],
      transition: `all 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function Card({ children, glow = C.accent, style = {} }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: "28px 24px",
      backdropFilter: "blur(12px)",
      boxShadow: `0 0 25px rgba(${hexToRgb(glow)},0.2), inset 0 1px 0 rgba(255,255,255,0.04)`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, title, subtitle, color = C.gold }) {
  return (
    <FadeIn>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{icon}</div>
        <h2 style={{
          fontSize: 32, fontWeight: 900, lineHeight: 1.3, marginBottom: 10,
          background: `linear-gradient(135deg, ${color}, ${C.accent})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          {title}
        </h2>
        {subtitle && <p style={{ fontSize: 18, color: C.textDim, maxWidth: 700, margin: "0 auto", lineHeight: 1.7 }}>{subtitle}</p>}
      </div>
    </FadeIn>
  );
}

function CodeBlock({ code, title, language = "jsx" }) {
  return (
    <FadeIn delay={0.1}>
      <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 20, border: `1px solid ${C.border}` }}>
        {title && (
          <div style={{
            background: "rgba(255,255,255,0.06)", padding: "8px 16px",
            fontSize: 13, color: C.textDim, fontWeight: 600, borderBottom: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: C.accent }} />
            {title}
          </div>
        )}
        <pre style={{
          background: "rgba(0,0,0,0.4)", padding: "16px 20px", margin: 0,
          fontSize: 14, lineHeight: 1.7, color: "#d4d4d4",
          fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
          overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>
          {code}
        </pre>
      </div>
    </FadeIn>
  );
}

function PromptBubble({ role, children, color = C.cyan }) {
  const isHuman = role === "human";
  return (
    <FadeIn delay={0.1} direction={isHuman ? "right" : "left"}>
      <div style={{
        display: "flex", gap: 14, marginBottom: 20,
        flexDirection: isHuman ? "row-reverse" : "row",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: isHuman ? "linear-gradient(135deg, #4488FF, #66AAFF)" : "linear-gradient(135deg, #E94560, #FF6B35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, fontWeight: 700, color: "#fff",
          boxShadow: `0 0 15px ${isHuman ? "rgba(68,136,255,0.3)" : "rgba(233,69,96,0.3)"}`,
        }}>
          {isHuman ? "人" : "AI"}
        </div>
        <div style={{
          flex: 1, padding: "14px 18px", borderRadius: 14,
          background: isHuman ? "rgba(68,136,255,0.08)" : "rgba(233,69,96,0.08)",
          border: `1px solid ${isHuman ? "rgba(68,136,255,0.2)" : "rgba(233,69,96,0.2)"}`,
          fontSize: 15, lineHeight: 1.8, color: C.text,
          maxWidth: "85%",
        }}>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 6, fontWeight: 600 }}>
            {isHuman ? "開發者 (Human)" : "Claude Code (AI)"}
          </div>
          {children}
        </div>
      </div>
    </FadeIn>
  );
}

function TimelineItem({ step, title, desc, color = C.gold }) {
  return (
    <FadeIn delay={step * 0.08}>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: `linear-gradient(135deg, ${color}, ${C.accent})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900, color: "#fff",
            boxShadow: `0 0 15px rgba(${hexToRgb(color)},0.4)`,
          }}>
            {step}
          </div>
          <div style={{ flex: 1, width: 2, background: `linear-gradient(to bottom, ${color}, transparent)`, marginTop: 8 }} />
        </div>
        <div style={{ flex: 1, paddingBottom: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color, marginBottom: 6 }}>{title}</div>
          <div style={{ fontSize: 15, color: C.text, lineHeight: 1.8 }}>{desc}</div>
        </div>
      </div>
    </FadeIn>
  );
}

function StatBox({ num, label, color = C.gold }) {
  const [ref, visible] = useInView();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / 1200, 1);
      setVal(Math.round(num * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, num]);

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ fontSize: 36, fontWeight: 900, color, fontFamily: "'Orbitron', monospace" }}>{val}</div>
      <div style={{ fontSize: 14, color: C.textDim, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function Pill({ children, color = C.accent }) {
  return (
    <span style={{
      display: "inline-block", padding: "4px 12px", borderRadius: 20,
      background: `rgba(${hexToRgb(color)},0.15)`, color,
      fontSize: 13, fontWeight: 600, margin: "2px 4px",
    }}>
      {children}
    </span>
  );
}

function ProgressBar({ label, value, max = 100, color = C.accent }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 14, color: C.text }}>{label}</span>
        <span style={{ fontSize: 14, color, fontWeight: 700 }}>{value}%</span>
      </div>
      <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          width: visible ? `${value}%` : "0%", height: "100%",
          background: `linear-gradient(90deg, ${color}, ${C.gold})`,
          borderRadius: 4, transition: "width 1.5s cubic-bezier(0.22,1,0.36,1)",
        }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// 頁面章節
// ═══════════════════════════════════════

const CHAPTERS = [
  { id: "cover", icon: "����", title: "封面", color: C.gold },
  { id: "story", icon: "📖", title: "開發故事", color: C.blue },
  { id: "prompts", icon: "💬", title: "Prompt 實錄", color: C.cyan },
  { id: "decisions", icon: "⚖️", title: "關鍵決策", color: C.orange },
  { id: "openspec", icon: "📋", title: "OpenSpec 流程", color: C.purple },
  { id: "arch", icon: "🏗️", title: "技術架構", color: C.green },
  { id: "pipeline", icon: "🔧", title: "渲染管線", color: C.accent },
  { id: "state", icon: "🧠", title: "狀態管理", color: C.blue },
  { id: "iframe", icon: "🖼️", title: "iframe 隔離", color: C.orange },
  { id: "esm", icon: "📦", title: "esm.sh 運作", color: C.cyan },
  { id: "react101", icon: "⚛️", title: "React 模式教學", color: C.blue },
  { id: "css", icon: "🎨", title: "CSS 設計解析", color: C.purple },
  { id: "debugging", icon: "🐛", title: "除錯實錄", color: C.red },
  { id: "babel", icon: "🔮", title: "Babel 深入", color: C.gold },
  { id: "dragdrop", icon: "🖱️", title: "拖放 API 教學", color: C.green },
  { id: "postmessage", icon: "📡", title: "跨域通訊", color: C.cyan },
  { id: "regex", icon: "🔍", title: "正規表達式", color: C.orange },
  { id: "patterns", icon: "🧩", title: "設計模式", color: C.purple },
  { id: "perf", icon: "⚡", title: "效能思維", color: C.accent },
  { id: "fileapi", icon: "📁", title: "File API 教學", color: C.blue },
  { id: "importmap", icon: "🗺️", title: "Import Maps 標準", color: C.green },
  { id: "devtools", icon: "🔧", title: "開發工具技巧", color: C.orange },
  { id: "coderead", icon: "📖", title: "程式碼導讀", color: C.gold },
  { id: "mistakes", icon: "💥", title: "常見錯誤", color: C.red },
  { id: "vibecoding", icon: "🎵", title: "Vibe Coding 學", color: C.gold },
  { id: "skills", icon: "🎯", title: "你學到了什麼", color: C.green },
  { id: "nextlesson", icon: "📚", title: "下一堂課", color: C.purple },
  { id: "experiments", icon: "🧪", title: "更多嘗試", color: C.accent },
  { id: "glossary", icon: "📘", title: "術語表", color: C.cyan },
  { id: "closing", icon: "🌟", title: "結語", color: C.gold },
];

// ─── 封面 ───
function CoverPage() {
  const [glow, setGlow] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setGlow(g => (g + 1) % 360), 30);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative" }}>
      <FadeIn>
        <div style={{ fontSize: 14, letterSpacing: 8, color: C.textDim, textTransform: "uppercase", marginBottom: 20 }}>
          Claude Code × Human Developer
        </div>
      </FadeIn>
      <FadeIn delay={0.2}>
        <h1 style={{
          fontSize: 56, fontWeight: 900, lineHeight: 1.2, marginBottom: 16,
          background: `linear-gradient(${glow}deg, ${C.gold}, ${C.accent}, ${C.purple}, ${C.blue}, ${C.gold})`,
          backgroundSize: "300% 300%",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          animation: "gradientShift 4s ease infinite",
        }}>
          JSX Viewer
          <br />
          開發之旅
        </h1>
      </FadeIn>
      <FadeIn delay={0.4}>
        <p style={{ fontSize: 20, color: C.textDim, maxWidth: 600, lineHeight: 1.8, marginBottom: 40 }}>
          一個從零到一的 Vibe Coding 完整紀實
          <br />
          ── 當人類的直覺遇上 AI 的執行力
        </p>
      </FadeIn>
      <FadeIn delay={0.6}>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { num: 12, label: "原始檔案" },
            { num: 4, label: "開發階段" },
            { num: 30, label: "章節內容" },
            { num: 1, label: "開發者 + 1 AI" },
          ].map((s, i) => (
            <Card key={i} glow={[C.gold, C.accent, C.blue, C.green][i]} style={{ minWidth: 120, padding: "20px 24px" }}>
              <StatBox num={s.num} label={s.label} color={[C.gold, C.accent, C.blue, C.green][i]} />
            </Card>
          ))}
        </div>
      </FadeIn>
      <FadeIn delay={0.8}>
        <div style={{ marginTop: 48, fontSize: 15, color: C.textDim }}>
          ↓ 向下捲動開始閱讀 ↓
        </div>
      </FadeIn>
    </div>
  );
}

// ─── Ch1: 開發故事 ───
function StoryPage() {
  return (
    <div>
      <SectionTitle icon="📖" title="開發故事：從一句��到一個產品" subtitle="這一切是怎麼開始的？一個需求，一段對話，一個下午。" color={C.blue} />

      <FadeIn>
        <Card glow={C.blue} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 22, color: C.blue, marginBottom: 16, fontWeight: 700 }}>🌱 起源</h3>
          <p style={{ fontSize: 16, lineHeight: 2, color: C.text }}>
            開發者經常使用 Claude Code 來產生<strong style={{ color: C.gold }}>視覺化的 JSX 說明文件</strong>。
            這些不是普通的文字文��，而是包含動畫、互動、資料視覺化的完整 React 元件。
          </p>
          <p style={{ fontSize: 16, lineHeight: 2, color: C.text, marginTop: 12 }}>
            但問題是：<strong style={{ color: C.red }}>每次要看這些檔案，都得手動建一個 React 專案</strong>。
            建資料夾、裝依賴、改路由、啟動伺服器⋯⋯只為了「看一眼」。
          </p>
          <div style={{
            marginTop: 16, padding: "16px 20px", borderRadius: 10,
            background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)",
          }}>
            <div style={{ fontSize: 15, color: C.red, fontWeight: 700, marginBottom: 8 }}>😫 痛點</div>
            <div style={{ fontSize: 15, color: C.text, lineHeight: 1.8 }}>
              AI 花 30 秒產生一份精美的 JSX 說明 → 人類花 5 分鐘建環境才能看到它
            </div>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Card glow={C.green} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 22, color: C.green, marginBottom: 16, fontWeight: 700 }}>💡 靈感</h3>
          <p style={{ fontSize: 16, lineHeight: 2, color: C.text }}>
            「如果有一個工具，<strong style={{ color: C.gold }}>拖放 JSX 檔案就能直接看到渲染結果</strong>呢？」
          </p>
          <p style={{ fontSize: 16, lineHeight: 2, color: C.text, marginTop: 12 }}>
            就這樣，開發者打開 Claude Code，輸入了第一個 prompt。
            而這個 prompt 不是「幫我寫一個 JSX Viewer」——而是先進入了<strong style={{ color: C.purple }}> OpenSpec 的探索模式</strong>，
            要求 AI 主動提出問題和選項。
          </p>
        </Card>
      </FadeIn>

      <FadeIn delay={0.3}>
        <Card glow={C.purple} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 22, color: C.purple, marginBottom: 16, fontWeight: 700 }}>🤝 合作模式的確立</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, fontSize: 15, color: C.text, lineHeight: 1.9 }}>
            <div>
              <div style={{ color: C.blue, fontWeight: 700, marginBottom: 8 }}>人類負責的</div>
              <div>✦ 定義問題和目標</div>
              <div>✦ 提供範例檔案</div>
              <div>✦ 在選項中做決策</div>
              <div>✦ 確認方向是否正確</div>
              <div>✦ 審核最終計畫</div>
            </div>
            <div>
              <div style={{ color: C.accent, fontWeight: 700, marginBottom: 8 }}>AI 負責的</div>
              <div>✦ 分析問題空間</div>
              <div>✦ 提出技術選項與取捨</div>
              <div>✦ 設計架構與管線</div>
              <div>✦ 撰寫全部程式碼</div>
              <div>✦ 建立文件</div>
            </div>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.4}>
        <h3 style={{ fontSize: 20, color: C.gold, marginBottom: 16, fontWeight: 700, textAlign: "center" }}>📅 開發時間線</h3>
        <TimelineItem step={1} title="探索模式 (Explore)" desc="開發者描述需求，AI 分析問題空間、畫架構圖、提出 6 個關鍵問題讓人類決策" color={C.purple} />
        <TimelineItem step={2} title="人類決策" desc="開發者回答：用 Babel Standalone、iframe 隔離、多檔 Tab、一開始就支援第三方套件" color={C.blue} />
        <TimelineItem step={3} title="規劃模式 (Plan)" desc="AI 進入 Plan Mode，啟動 Explore Agent 研究 + Plan Agent 設計，產出完整實作計畫" color={C.green} />
        <TimelineItem step={4} title="計畫審核" desc="人類審閱計畫文件（技術決策表、架構圖、4 Phase 實作順序、驗證矩陣），批准執行" color={C.gold} />
        <TimelineItem step={5} title="全速實作" desc="AI 一口氣建立 12 個原始碼檔案：狀態管理、拖放元件、渲染管線、iframe 模板、錯誤處理" color={C.accent} />
        <TimelineItem step={6} title="驗證與文件" desc="啟動 dev server 驗證、修正 .js → .jsx 副檔名問題、建立完整文件套件" color={C.cyan} />
      </FadeIn>
    </div>
  );
}

// ─── Ch2: Prompt 實錄 ───
function PromptsPage() {
  return (
    <div>
      <SectionTitle icon="💬" title="Prompt 實錄：對話的藝術" subtitle="好的 prompt 不是命令，而是邀請 AI 一起思考。以下是這個專案中最關鍵的幾段對話。" color={C.cyan} />

      <FadeIn>
        <Card glow={C.cyan} style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, color: C.cyan, marginBottom: 16 }}>🔑 第一個 Prompt — 開場</h3>
          <PromptBubble role="human">
            <p>基於常常使用 claude code 產生 jsx 格式的說明與解釋原理的單一 Jsx 文件��需要設計一個獨立的專門的 Jsx viewer 來檢視與閱讀這些 Jsx 檔案，並能使用自己的簡易檔案瀏���功能，使用的前端技術為 React，並以最小可行性方案來規劃，以方便之後的功能擴增與修正。</p>
            <p style={{ color: C.gold, fontWeight: 600, marginTop: 8 }}>請參考使用 openspec skill，並要求 ai 主動提出討論細節與選項，以釐清目標與條件要求。</p>
          </PromptBubble>
          <div style={{ padding: "12px 16px", background: "rgba(0,229,255,0.06)", borderRadius: 10, marginTop: 12 }}>
            <div style={{ fontSize: 14, color: C.cyan, fontWeight: 700, marginBottom: 6 }}>💡 這個 Prompt 好在哪裡？</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>
              ① 明確說明了<strong>使用情境</strong>（Claude Code 產生的 JSX 文件）<br />
              ② 指定��<strong>技術約束</strong>（React、MVP）<br />
              ③ 指定了<strong>工作流程</strong>（使用 OpenSpec）<br />
              ④ 最關鍵：<strong>要求 AI 主動提問</strong>，而不是直接開始寫
            </div>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card glow={C.accent} style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, color: C.accent, marginBottom: 16 }}>🤖 AI 的回應 — 不急著寫，先釐清</h3>
          <PromptBubble role="ai">
            <p>AI 沒有立刻開始寫程式碼，而是：</p>
            <p style={{ marginTop: 8 }}>① 畫了一張<strong style={{ color: C.gold }}>問題空間 ASCII 圖</strong>，把核心問題分成三大塊</p>
            <p>② 針對「JSX 檢視」提出<strong style={{ color: C.gold }}>三個層次</strong>：原始碼檢視 / 即時渲染 / 混合模式</p>
            <p>③ 對「檔案瀏覽」列出<strong style={{ color: C.gold }}>三個方案</strong>的優缺點比較表</p>
            <p>④ 提出了自己傾向的 MVP 架構</p>
            <p>⑤ 最後丟出<strong style={{ color: C.accent }}>三個必須回答的問題</strong></p>
          </PromptBubble>
          <div style={{ padding: "12px 16px", background: "rgba(233,69,96,0.06)", borderRadius: 10, marginTop: 12 }}>
            <div style={{ fontSize: 14, color: C.accent, fontWeight: 700, marginBottom: 6 }}>🔍 AI 行為模式分析</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>
              這是「<strong>結構化探索</strong>」模式 —— AI 不是被動等待指令，而是主動將模糊需求分解為具體的選項，
              並用視覺化方式（表格、圖表）幫助人類做決策。
            </div>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.25}>
        <Card glow={C.blue} style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, color: C.blue, marginBottom: 16 }}>🎯 決策性 Prompt — 人類的判斷</h3>
          <PromptBubble role="human">
            <p>除第 2 點需要「情境 B: 一開始就支援常用套件」，其他都照著你的建議</p>
          </PromptBubble>
          <PromptBubble role="ai">
            <p>明白了！AI 收到決策後立即進入 Plan Mode，啟動專門的 Plan Agent 設計完整實作方案⋯⋯</p>
          </PromptBubble>
          <div style={{ padding: "12px 16px", background: "rgba(68,136,255,0.06)", borderRadius: 10, marginTop: 12 }}>
            <div style={{ fontSize: 14, color: C.blue, fontWeight: 700, marginBottom: 6 }}>💡 為什麼這個 Prompt 有效？</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>
              <strong>簡短但有決策力。</strong>只有一句話，但回答了所有 AI 需要的資訊。
              人類不需要寫長篇解釋 —— AI 已經把選項攤開了，人類只需要「選」。
              這就是<strong style={{ color: C.gold }}>好的 AI 協作：AI 列選項，人做決策</strong>。
            </div>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.35}>
        <Card glow={C.green} style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, color: C.green, marginBottom: 16 }}>📝 範例提供 — 最關鍵的一步</h3>
          <PromptBubble role="human">
            <p>（附上了一個完整的 WEC 賽車規則分析 JSX 檔案，包含動畫、互動 Tab、數據對比條、IntersectionObserver 等）</p>
          </PromptBubble>
          <PromptBubble role="ai">
            <p>AI 立即分析了範例檔案的技術特徵：</p>
            <p>• React Hooks: useState, useEffect, useRef</p>
            <p>• 瀏覽器 API: IntersectionObserver, RAF</p>
            <p>• 全 inline style + 內嵌 CSS 動畫</p>
            <p>• Google Fonts 外部引入</p>
            <p>• <strong style={{ color: C.gold }}>export default 單一主元件</strong></p>
            <p>• <strong style={{ color: C.gold }}>僅依賴 React，無第三方套件</strong></p>
          </PromptBubble>
          <div style={{ padding: "12px 16px", background: "rgba(102,255,136,0.06)", borderRadius: 10, marginTop: 12 }}>
            <div style={{ fontSize: 14, color: C.green, fontWeight: 700, marginBottom: 6 }}>🎓 學到的一課</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>
              <strong>給 AI 看實際的範例，比寫 100 字需求描述更有效。</strong>
              範例讓 AI 能準確分析檔案特徵，從而做出正確的技術判斷。
              這個範例直接影響了「必須用 iframe 隔離」和「Import Map 解析策略」兩個核心決策。
            </div>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}

// ─── Ch3: 關鍵決策 ───
function DecisionsPage() {
  const [activeDecision, setActiveDecision] = useState(0);
  const decisions = [
    {
      title: "Babel Standalone vs SWC",
      icon: "⚙️",
      chosen: "Babel Standalone",
      reason: "穩定性",
      detail: "800KB 的 Babel 在瀏覽器端已久經考驗，SWC WASM 雖快但體積 2MB 且較新。MVP 階段穩定最重要。",
      color: C.gold,
    },
    {
      title: "iframe vs Shadow DOM vs 直接渲染",
      icon: "🖼️",
      chosen: "iframe srcdoc",
      reason: "完全隔離",
      detail: "JSX 檔案含 * { margin:0 } 全域 CSS reset。Shadow DOM 只隔離 CSS 不隔離 JS。直接渲染完全沒隔離。只有 iframe 能提供 CSS + JS + DOM 三重隔離。",
      color: C.accent,
    },
    {
      title: "Import Maps vs URL 改寫",
      icon: "📦",
      chosen: "瀏覽器原生 Import Maps",
      reason: "標準、乾淨",
      detail: "不需要改寫原始碼。自動處理子路徑 import 和 dynamic import()。是瀏覽器原生標準，無額外依賴。",
      color: C.blue,
    },
    {
      title: "Babel 在 parent vs iframe 中",
      icon: "📍",
      chosen: "Parent 端編譯",
      reason: "效能 + 錯誤處理",
      detail: "只載入一次 800KB（不用每個 iframe 都載入）。語法錯誤在 parent 直接捕獲，不需 postMessage 繞路。",
      color: C.green,
    },
    {
      title: "esm.sh ?external 參數",
      icon: "🔗",
      chosen: "所有第三方帶 ?external=react,react-dom",
      reason: "避免多 React 實例",
      detail: "不加 external，每個套件會各自帶一份 React，導致 'Invalid hook call' 錯��。加了 external 後，所有套件共用一份 React。",
      color: C.purple,
    },
  ];

  return (
    <div>
      <SectionTitle icon="⚖️" title="五個關鍵技術決策" subtitle="每個看似簡單的選擇背後���都有仔細的取捨分析" color={C.orange} />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
        {decisions.map((d, i) => (
          <button key={i} onClick={() => setActiveDecision(i)} style={{
            padding: "10px 20px", fontSize: 14, fontWeight: 700, borderRadius: 10, cursor: "pointer",
            border: activeDecision === i ? `2px solid ${d.color}` : `2px solid ${C.border}`,
            background: activeDecision === i ? `rgba(${hexToRgb(d.color)},0.12)` : "transparent",
            color: activeDecision === i ? d.color : C.textDim,
            transition: "all 0.3s",
          }}>
            {d.icon} {d.title}
          </button>
        ))}
      </div>

      {decisions.map((d, i) => i === activeDecision && (
        <FadeIn key={d.title}>
          <Card glow={d.color}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 36 }}>{d.icon}</span>
              <div>
                <h3 style={{ fontSize: 22, color: d.color, fontWeight: 700 }}>{d.title}</h3>
                <div style={{ fontSize: 14, color: C.textDim }}>Decision #{i + 1}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={{ padding: "12px 16px", borderRadius: 10, background: `rgba(${hexToRgb(d.color)},0.08)` }}>
                <div style={{ fontSize: 13, color: C.textDim, marginBottom: 4 }}>選擇</div>
                <div style={{ fontSize: 18, color: d.color, fontWeight: 700 }}>{d.chosen}</div>
              </div>
              <div style={{ padding: "12px 16px", borderRadius: 10, background: `rgba(${hexToRgb(d.color)},0.08)` }}>
                <div style={{ fontSize: 13, color: C.textDim, marginBottom: 4 }}>最關鍵的理由</div>
                <div style={{ fontSize: 18, color: d.color, fontWeight: 700 }}>{d.reason}</div>
              </div>
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.9, color: C.text }}>{d.detail}</p>
          </Card>
        </FadeIn>
      ))}
    </div>
  );
}

// ─── Ch4: OpenSpec 流程 ───
function OpenSpecPage() {
  return (
    <div>
      <SectionTitle icon="📋" title="OpenSpec：結構化的開發流程" subtitle="不是直接寫 code，而是先用結構化的方式釐清問題、設計方案、追蹤進度" color={C.purple} />

      <FadeIn>
        <Card glow={C.purple} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.purple, fontWeight: 700, marginBottom: 16 }}>什麼是 OpenSpec？</h3>
          <p style={{ fontSize: 16, lineHeight: 2, color: C.text }}>
            OpenSpec 是一個<strong style={{ color: C.gold }}>結構化的變更管理框架</strong>，
            幫助開發者（和 AI）用有組織的方式推進從「想法」到「實作」的過程。
          </p>
          <div style={{
            marginTop: 16, padding: "20px", borderRadius: 12,
            background: "rgba(199,125,255,0.06)", border: "1px solid rgba(199,125,255,0.15)",
          }}>
            <div style={{ fontFamily: "monospace", fontSize: 14, lineHeight: 2.2, color: C.text }}>
              <div style={{ color: C.purple, fontWeight: 700, marginBottom: 8 }}>OpenSpec 工作流程：</div>
              <div>① <Pill color={C.purple}>Explore</Pill> 探索問題空間，釐清需求</div>
              <div>② <Pill color={C.blue}>Propose</Pill> 提出變更提案（目標、範圍、風險）</div>
              <div>③ <Pill color={C.green}>Design</Pill> 設計架構與技術方案</div>
              <div>④ <Pill color={C.gold}>Tasks</Pill> 拆解為可執行的任務清單</div>
              <div>⑤ <Pill color={C.accent}>Apply</Pill> 按任務逐步實作</div>
              <div>⑥ <Pill color={C.cyan}>Verify</Pill> 驗證實作是否符合設計</div>
              <div>⑦ <Pill color={C.orange}>Archive</Pill> 歸檔完成的變更</div>
            </div>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card glow={C.blue} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.blue, fontWeight: 700, marginBottom: 16 }}>在這個專案中的實際應用</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { name: "proposal.md", desc: "動機、目標、非目標、風險評估", icon: "📄", color: C.blue },
              { name: "design.md", desc: "5 個核心決策 + 替代方案分析", icon: "🏗️", color: C.green },
              { name: "tasks.md", desc: "4 Phase、10 Tasks 完整追蹤", icon: "✅", color: C.gold },
            ].map((f, i) => (
              <Card key={i} glow={f.color} style={{ padding: "16px" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: f.color, marginBottom: 6 }}>{f.name}</div>
                <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6 }}>{f.desc}</div>
              </Card>
            ))}
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.25}>
        <Card glow={C.gold} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.gold, fontWeight: 700, marginBottom: 16 }}>💡 OpenSpec 的價值</h3>
          <div style={{ fontSize: 15, lineHeight: 2, color: C.text }}>
            <div>✦ <strong>防止「直覺性編碼」的陷阱</strong> — 不是想到什麼寫什麼，而是先想清楚再動手</div>
            <div>✦ <strong>保留決策脈絡</strong> — 未來回頭看，知道「為什麼選 Babel 不選 SWC」</div>
            <div>✦ <strong>AI 和人類的共同語言</strong> — proposal / design / tasks 是雙方都能理解的格式</div>
            <div>✦ <strong>可複製的成功模式</strong> — 下一個專案可以照同樣流程走</div>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}

// ─── Ch5: 技術架構 ───
function ArchPage() {
  return (
    <div>
      <SectionTitle icon="🏗️" title="技術架構全景" subtitle="12 個檔案如何組成一個完整的應用程式" color={C.green} />

      <FadeIn>
        <Card glow={C.green} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.green, fontWeight: 700, marginBottom: 16 }}>📂 檔案結構與職責</h3>
          <div style={{ fontFamily: "monospace", fontSize: 14, lineHeight: 2, color: C.text }}>
            {[
              { path: "index.html", desc: "載入 Babel CDN", color: C.textDim },
              { path: "src/main.jsx", desc: "React 進入點", color: C.textDim },
              { path: "src/App.jsx", desc: "根版面 Grid Layout", color: C.blue },
              { path: "src/App.css", desc: "全域深色主題樣式", color: C.blue },
              { path: "src/state/useFileStore.jsx", desc: "Context + useReducer 狀態中心", color: C.purple },
              { path: "src/components/Sidebar.jsx", desc: "側邊欄容器", color: C.green },
              { path: "src/components/TabItem.jsx", desc: "單一 Tab（檔名 + 關閉）", color: C.green },
              { path: "src/components/DropZone.jsx", desc: "拖放 + Browse 輸入", color: C.green },
              { path: "src/components/RenderPane.jsx", desc: "★ 核心：編譯 + 渲染", color: C.gold },
              { path: "src/components/ErrorPanel.jsx", desc: "錯誤面板 overlay", color: C.red },
              { path: "src/iframe/importResolver.js", desc: "import 掃描 + map 建立", color: C.accent },
              { path: "src/iframe/template.js", desc: "iframe HTML 模板產生", color: C.accent },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "4px 0" }}>
                <span style={{ color: f.color, minWidth: 300 }}>{f.path}</span>
                <span style={{ color: C.textDim }}>← {f.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card glow={C.blue} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.blue, fontWeight: 700, marginBottom: 16 }}>🔌 元件依賴圖</h3>
          <pre style={{
            fontFamily: "monospace", fontSize: 13, lineHeight: 1.8, color: C.text,
            padding: "16px", background: "rgba(0,0,0,0.3)", borderRadius: 10, overflowX: "auto",
          }}>
{`App.jsx
  ├── FileStoreProvider ← (useFileStore.jsx)
  │     提供全域狀態 Context
  │
  ├── Sidebar.jsx
  │     ├── TabItem.jsx  ×N   ← 讀取 files + activeFileId
  │     │     └── click → SET_ACTIVE / REMOVE_FILE
  │     │
  │     └── DropZone.jsx       ← FileReader API
  │           └── drop → ADD_FILE
  │
  └── RenderPane.jsx           ★ 最複雜的元件
        ├── importResolver.js  ← 純函式：regex 掃描
        ├── template.js        ← 純函式：HTML 產生
        ├── ErrorPanel.jsx     ← 條件式 overlay
        ├── window.Babel       ← 全域（CDN 載入）
        └── <iframe>           ← srcdoc + postMessage`}
          </pre>
        </Card>
      </FadeIn>

      <FadeIn delay={0.25}>
        <Card glow={C.gold}>
          <h3 style={{ fontSize: 20, color: C.gold, fontWeight: 700, marginBottom: 16 }}>🎯 架構的三層分離</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div style={{ padding: "16px", borderRadius: 10, background: "rgba(199,125,255,0.06)", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
              <div style={{ color: C.purple, fontWeight: 700, marginBottom: 6 }}>資料層</div>
              <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6 }}>useFileStore.jsx<br />Context + useReducer</div>
            </div>
            <div style={{ padding: "16px", borderRadius: 10, background: "rgba(102,255,136,0.06)", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎨</div>
              <div style={{ color: C.green, fontWeight: 700, marginBottom: 6 }}>UI 層</div>
              <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6 }}>Sidebar, TabItem,<br />DropZone, ErrorPanel</div>
            </div>
            <div style={{ padding: "16px", borderRadius: 10, background: "rgba(233,69,96,0.06)", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
              <div style={{ color: C.accent, fontWeight: 700, marginBottom: 6 }}>引擎層</div>
              <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6 }}>importResolver,<br />template, RenderPane</div>
            </div>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}

// ─── Ch6: 渲染管線 ───
function PipelinePage() {
  const steps = [
    { icon: "📁", title: "拖放檔案", desc: "FileReader.readAsText() 讀取 .jsx 原始碼文字", color: C.blue },
    { icon: "🔍", title: "掃描 Import", desc: "正則表達式提取所有 import 語句，分離 React 和第三方套件", color: C.cyan },
    { icon: "🗺️", title: "建立 Import Map", desc: "為每個套件建立 esm.sh URL，確保帶 ?external=react,react-dom", color: C.purple },
    { icon: "⚙️", title: "Babel 編譯", desc: "JSX 語法 → React.createElement() 呼叫（純 JavaScript）", color: C.gold },
    { icon: "📝", title: "組裝 HTML", desc: "Import Map + Import 語句 + 編譯後程式碼 → 完整 HTML 文件", color: C.green },
    { icon: "🖼️", title: "iframe 載入", desc: "設定 iframe.srcdoc，瀏覽器解析 Import Map 並從 CDN 載入模組", color: C.accent },
    { icon: "📡", title: "結果回報", desc: "iframe 透過 postMessage 回傳 render-success 或 render-error", color: C.orange },
  ];

  return (
    <div>
      <SectionTitle icon="🔧" title="渲染管線：從文字到畫面的 7 步" subtitle="一個 .jsx 檔案如何變成你看到的互動式頁面" color={C.accent} />

      {steps.map((s, i) => (
        <FadeIn key={i} delay={i * 0.08}>
          <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 50 }}>
              <div style={{
                width: 50, height: 50, borderRadius: 14,
                background: `rgba(${hexToRgb(s.color)},0.15)`,
                border: `2px solid ${s.color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24,
              }}>
                {s.icon}
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, width: 2, background: `linear-gradient(to bottom, ${s.color}, ${steps[i + 1].color})`, marginTop: 8, minHeight: 20 }} />
              )}
            </div>
            <Card glow={s.color} style={{ flex: 1, padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: s.color, fontWeight: 700, background: `rgba(${hexToRgb(s.color)},0.15)`, padding: "2px 8px", borderRadius: 6 }}>Step {i + 1}</span>
                <span style={{ fontSize: 17, fontWeight: 700, color: s.color }}>{s.title}</span>
              </div>
              <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
            </Card>
          </div>
        </FadeIn>
      ))}

      <FadeIn delay={0.6}>
        <Card glow={C.gold} style={{ marginTop: 12 }}>
          <h3 style={{ fontSize: 18, color: C.gold, fontWeight: 700, marginBottom: 12 }}>⚡ 關鍵轉換範例</h3>
          <CodeBlock title="輸入：JSX 原始碼" code={`export default function App() {
  const [count, setCount] = useState(0);
  return <div onClick={() => setCount(c => c+1)}>
    Count: {count}
  </div>;
}`} />
          <div style={{ textAlign: "center", fontSize: 24, margin: "8px 0", color: C.gold }}>↓ Babel.transform() ↓</div>
          <CodeBlock title="輸出：純 JavaScript" code={`function App() {
  const [count, setCount] = useState(0);
  return React.createElement("div", {
    onClick: () => setCount(c => c + 1)
  }, "Count: ", count);
}`} />
        </Card>
      </FadeIn>
    </div>
  );
}

// ─── Ch7: 狀態管理 ───
function StatePage() {
  return (
    <div>
      <SectionTitle icon="🧠" title="狀態管理：useReducer 模式" subtitle="用 React 內建工具管理應用程式的所有狀態" color={C.blue} />

      <FadeIn>
        <Card glow={C.blue} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.blue, fontWeight: 700, marginBottom: 16 }}>📐 State Shape — 狀態的形狀</h3>
          <CodeBlock title="useFileStore.jsx - State" code={`{
  files: {
    "uuid-1": {
      id: "uuid-1",
      name: "WEC-analysis.jsx",
      content: "import { useState }...",
      addedAt: 1712300000
    },
    "uuid-2": { ... }
  },
  activeFileId: "uuid-1",    // 目前選中的 Tab
  errors: {
    "uuid-1": null,           // 無錯誤
    "uuid-2": {               // 有錯誤
      message: "SyntaxError: ...",
      stack: "at line 42..."
    }
  }
}`} />
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(68,136,255,0.06)", marginTop: 12 }}>
            <div style={{ fontSize: 14, color: C.blue, fontWeight: 700, marginBottom: 6 }}>🎓 設計原則</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>
              使用 <strong>map 結構</strong>（以 id 為 key）而非 array，因為：<br />
              ① 按 id 查找是 O(1)，不用遍歷<br />
              ② 刪除操作只需解構，不用 filter<br />
              ③ errors 與 files 用相同的 id 對應，結構清晰
            </div>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card glow={C.green} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.green, fontWeight: 700, marginBottom: 16 }}>🎬 Actions — 會發生的事</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { action: "ADD_FILE", trigger: "拖放/選擇檔案", effect: "新增到 files map，自動設為 active", color: C.green },
              { action: "REMOVE_FILE", trigger: "點擊 Tab 的 ×", effect: "從 map 移除，如果是 active 則切到最近的", color: C.red },
              { action: "SET_ACTIVE", trigger: "點擊 Tab", effect: "更新 activeFileId", color: C.blue },
              { action: "SET_ERROR", trigger: "Babel 編譯失敗 / iframe 錯誤", effect: "記錄該檔案的錯誤資訊", color: C.orange },
            ].map((a, i) => (
              <div key={i} style={{ padding: "12px", borderRadius: 10, background: `rgba(${hexToRgb(a.color)},0.06)`, border: `1px solid rgba(${hexToRgb(a.color)},0.15)` }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: a.color, fontFamily: "monospace" }}>{a.action}</div>
                <div style={{ fontSize: 13, color: C.textDim, marginTop: 4 }}>觸發：{a.trigger}</div>
                <div style={{ fontSize: 13, color: C.text, marginTop: 4 }}>效果：{a.effect}</div>
              </div>
            ))}
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.25}>
        <Card glow={C.purple}>
          <h3 style={{ fontSize: 20, color: C.purple, fontWeight: 700, marginBottom: 16 }}>🔀 Context 架構 — 為什麼分兩個？</h3>
          <CodeBlock title="雙 Context 分離模式" code={`// 讀取用（state 變化時才 re-render）
const FileStoreContext = createContext(null);

// 寫入用（dispatch 永遠不變，不會觸發 re-render）
const DispatchContext = createContext(null);

// DropZone 只需要 dispatch（寫入），不關心 state
// → 只訂閱 DispatchContext
// → files 變化時，DropZone 不會 re-render ✅`} />
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(199,125,255,0.06)", marginTop: 12 }}>
            <div style={{ fontSize: 14, color: C.purple, fontWeight: 700, marginBottom: 6 }}>💡 效能最佳化技巧</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>
              把 state 和 dispatch 分成兩個 Context，讓只需要「寫入」的元件（如 DropZone）
              不會因為「讀取」的值變化而重新渲染。這是 React 官方推薦的模式。
            </div>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}

// ─── Ch8: iframe 隔離 ───
function IframePage() {
  return (
    <div>
      <SectionTitle icon="🖼️" title="iframe 隔離：為���麼不能直接渲染" subtitle="看似簡單的選擇，背後是對 Web 安全模型的深刻理解" color={C.orange} />

      <FadeIn>
        <Card glow={C.red} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.red, fontWeight: 700, marginBottom: 16 }}>❌ 如果不用 iframe 會怎樣？</h3>
          <CodeBlock title="JSX 檔案中的全域樣式" code={`// 使用者的 JSX 檔案經常包含：
<style>{\`
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  ::-webkit-scrollbar { width: 6px }
\`}</style>`} />
          <p style={{ fontSize: 15, lineHeight: 1.9, color: C.text, marginTop: 12 }}>
            如果直接在 Viewer 的 DOM 中渲染，<code style={{ color: C.red }}>* {'{'} margin: 0 {'}'}</code> 會
            <strong style={{ color: C.red }}>把 Viewer 自己的側邊欄和 Tab 列表的 margin 全部清零</strong>，
            導致介面崩潰。
          </p>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card glow={C.green} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.green, fontWeight: 700, marginBottom: 16 }}>✅ iframe 的三重隔離</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { title: "CSS 隔離", desc: "iframe 內的全域樣式不會影響 parent。* { margin:0 } 只在 iframe 內生效。", icon: "🎨" },
              { title: "JS 隔離", desc: "iframe 內的全域變數不會汙染 parent 的 window 物件。", icon: "⚡" },
              { title: "DOM 隔離", desc: "document.querySelector() 在 iframe 內只會搜尋 iframe 自己的 DOM tree。", icon: "🌳" },
            ].map((item, i) => (
              <Card key={i} glow={C.green} style={{ padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.green, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6 }}>{item.desc}</div>
              </Card>
            ))}
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.25}>
        <Card glow={C.cyan}>
          <h3 style={{ fontSize: 20, color: C.cyan, fontWeight: 700, marginBottom: 16 }}>🔐 sandbox 屬性</h3>
          <CodeBlock title="iframe 安全設定" code={`<iframe
  sandbox="allow-scripts allow-same-origin allow-popups"
  srcdoc={htmlString}
/>

// allow-scripts    → 允許執行 JS（元件需要）
// allow-same-origin → 允許 esm.sh 網路請求
// allow-popups      → 允許連結開新分頁
// 不允許: allow-forms, allow-top-navigation`} />
        </Card>
      </FadeIn>
    </div>
  );
}

// ─���─ Ch9: esm.sh ───
function EsmPage() {
  return (
    <div>
      <SectionTitle icon="📦" title="esm.sh：CDN 上的 npm" subtitle="不需要 npm install，瀏覽器直接 import 任何套件" color={C.cyan} />

      <FadeIn>
        <Card glow={C.cyan} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.cyan, fontWeight: 700, marginBottom: 16 }}>⚙️ 運作原理</h3>
          <CodeBlock title="Import Map 的魔法" code={`// 瀏覽器看到這行：
import { motion } from "framer-motion";

// Import Map 將其對應到：
"framer-motion" → "https://esm.sh/framer-motion?external=react,react-dom"

// esm.sh 做的事：
// 1. 從 npm 取得 framer-motion 的原始碼
// 2. 轉換成 ESM 格式��瀏覽器可直接使用）
// 3. 自動解析所有子依賴
// 4. 但 react 和 react-dom 留著不打包（因為 ?external）
// 5. 回傳可直接 import 的 URL`} />
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card glow={C.red} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.red, fontWeight: 700, marginBottom: 16 }}>⚠️ ?external 的關鍵性</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ padding: "16px", borderRadius: 10, background: "rgba(255,68,68,0.06)" }}>
              <div style={{ color: C.red, fontWeight: 700, marginBottom: 8 }}>❌ 不加 ?external</div>
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>
                framer-motion 帶自己的 React<br />
                styled-components 帶自己的 React<br />
                我們的 Import Map 也有一份 React<br />
                <strong style={{ color: C.red }}>→ 3 份 React 同時存在！</strong><br />
                → "Invalid hook call" 錯誤 💥
              </div>
            </div>
            <div style={{ padding: "16px", borderRadius: 10, background: "rgba(102,255,136,0.06)" }}>
              <div style={{ color: C.green, fontWeight: 700, marginBottom: 8 }}>��� 加了 ?external</div>
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>
                framer-motion 留下 bare import<br />
                styled-components 留下 bare import<br />
                所有 bare import 由 Import Map 解析<br />
                <strong style={{ color: C.green }}>→ 全部指向同一份 React ✅</strong><br />
                → 完美運作 🎉
              </div>
            </div>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}

// ─── Ch10: React 模式教學 ───
function React101Page() {
  return (
    <div>
      <SectionTitle icon="⚛️" title="React 模式教學" subtitle="這個專案中用到的 React 核心概念與最佳實踐" color={C.blue} />

      <FadeIn>
        <Card glow={C.blue} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.blue, fontWeight: 700, marginBottom: 16 }}>🎣 Hooks 全覽</h3>
          <div style={{ fontSize: 15, lineHeight: 2, color: C.text }}>
            <p>這個專案用到了 React 的 4 個核心 Hook：</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            {[
              { hook: "useState", use: "管理本地元件狀態", example: "DropZone 的 isDragOver、RenderPane 的 loading", color: C.blue },
              { hook: "useReducer", use: "管理複雜全域狀態", example: "FileStore 的 files/activeFileId/errors", color: C.green },
              { hook: "useEffect", use: "處理副作用", example: "監聽 postMessage、iframe 更新", color: C.purple },
              { hook: "useCallback", use: "記憶函式引用", example: "handleMessage 避免每次 render 重建", color: C.gold },
            ].map((h, i) => (
              <Card key={i} glow={h.color} style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: h.color, fontFamily: "monospace" }}>{h.hook}</div>
                <div style={{ fontSize: 13, color: C.text, marginTop: 6 }}>{h.use}</div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>用在：{h.example}</div>
              </Card>
            ))}
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card glow={C.purple} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.purple, fontWeight: 700, marginBottom: 16 }}>🏭 Provider 模式</h3>
          <CodeBlock title="Context Provider 模式" code={`// 1. 建立 Context
const FileStoreContext = createContext(null);

// 2. 建立 Provider（包裹整個 App）
function FileStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <FileStoreContext.Provider value={state}>
      {children}  {/* ← 所有子元件都能讀取 state */}
    </FileStoreContext.Provider>
  );
}

// 3. 建立自訂 Hook（使用更方便）
function useFileStore() {
  return useContext(FileStoreContext);
}

// 4. 在任何子元件中使用
function TabItem() {
  const { activeFileId } = useFileStore();  // ← 一行搞定！
}`} />
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(199,125,255,0.06)", marginTop: 12 }}>
            <div style={{ fontSize: 14, color: C.purple, fontWeight: 700, marginBottom: 6 }}>為什麼不用 props drilling？</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>
              如果用 props 傳遞，App → Sidebar → TabItem 每層都要加 prop。
              Context 讓任何層級的元件直接讀取，不需要中間層轉傳。
            </div>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.25}>
        <Card glow={C.gold}>
          <h3 style={{ fontSize: 20, color: C.gold, fontWeight: 700, marginBottom: 16 }}>🔄 useReducer vs useState</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.textDim, marginBottom: 8 }}>useState 適合</div>
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.9 }}>
                ✦ 單一值（boolean, string, number）<br />
                ✦ 獨立的狀態片段<br />
                ✦ 簡單的切換開關<br />
                <div style={{ color: C.textDim, marginTop: 8 }}>例：isDragOver, loading, activeTab</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.gold, marginBottom: 8 }}>useReducer 適合</div>
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.9 }}>
                ✦ 多個相關聯的值<br />
                ✦ 狀態轉換有明確規則<br />
                ✦ 下一個狀態依賴前一個狀態<br />
                <div style={{ color: C.textDim, marginTop: 8 }}>例：files + activeFileId + errors</div>
              </div>
            </div>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}

// ─── Ch11: CSS 設計解析 ───
function CssPage() {
  return (
    <div>
      <SectionTitle icon="🎨" title="CSS 設計解析" subtitle="深色主題、BEM 命名、視覺回饋的設計思路" color={C.purple} />

      <FadeIn>
        <Card glow={C.purple} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.purple, fontWeight: 700, marginBottom: 16 }}>🌙 深色主題配色系統</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {[
              { name: "Background", hex: "#1a1a2e", desc: "主背景" },
              { name: "Surface", hex: "#16213e", desc: "側邊欄" },
              { name: "Render", hex: "#0f0f1a", desc: "渲染區" },
              { name: "Accent", hex: "#e94560", desc: "強調色" },
              { name: "Text", hex: "#e0e0e0", desc: "主文字" },
            ].map((c, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: c.hex, margin: "0 auto 8px", border: "1px solid rgba(255,255,255,0.1)" }} />
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{c.name}</div>
                <div style={{ fontSize: 11, color: C.textDim, fontFamily: "monospace" }}>{c.hex}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(199,125,255,0.06)", marginTop: 16 }}>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>
              深色主題的核心原則：<strong style={{ color: C.purple }}>不要用純黑 #000</strong>。
              我們用 #1a1a2e（帶藍色調的深灰），讓畫面有層次感而不刺眼。
              不同區域用不同深度（#16213e 側邊欄 vs #0f0f1a 渲染區）建立視覺分隔。
            </div>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card glow={C.green} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.green, fontWeight: 700, marginBottom: 16 }}>📝 BEM 命名慣例</h3>
          <CodeBlock title="Block__Element--Modifier 模式" code={`/* Block: 元件名稱 */
.tab-item { }

/* Element: 元件內的子元素（雙底線） */
.tab-item__name { }
.tab-item__close { }

/* Modifier: 元件的狀態變化（雙連字號） */
.tab-item--active { }

/* 實際使用 */
.drop-zone { }              /* Block */
.drop-zone--active { }      /* 拖放中狀態 */
.drop-zone__icon { }        /* 子元素 */
.drop-zone__btn { }         /* 子元素 */

/* 好處：看 class name 就知道元件結構 */`} />
        </Card>
      </FadeIn>

      <FadeIn delay={0.25}>
        <Card glow={C.accent}>
          <h3 style={{ fontSize: 20, color: C.accent, fontWeight: 700, marginBottom: 16 }}>✨ 視覺回饋設計</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { name: "拖放進入", css: "border-color: #e94560;\nbackground: rgba(233,69,96,0.1);", desc: "邊框變紅 + 背景微亮" },
              { name: "Tab hover", css: "background: rgba(255,255,255,0.05);", desc: "滑過時微亮" },
              { name: "Active Tab", css: "border-left: 3px solid #e94560;\nbackground: rgba(233,69,96,0.12);", desc: "左邊紅色標記" },
            ].map((v, i) => (
              <div key={i} style={{ padding: "14px", borderRadius: 10, background: "rgba(233,69,96,0.06)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, marginBottom: 8 }}>{v.name}</div>
                <pre style={{ fontSize: 11, color: C.textDim, fontFamily: "monospace", lineHeight: 1.6, marginBottom: 6 }}>{v.css}</pre>
                <div style={{ fontSize: 12, color: C.text }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}

// ─── Ch12: 除錯實錄 ───
function DebuggingPage() {
  return (
    <div>
      <SectionTitle icon="🐛" title="除錯實錄：真實的開發不總是順利的" subtitle="這個專案開發過程中遇到的真實問題與解決方式" color={C.red} />

      <FadeIn>
        <Card glow={C.red} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.red, fontWeight: 700, marginBottom: 16 }}>🐛 Bug #1：.js 副檔名裡的 JSX</h3>
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,68,68,0.06)", marginBottom: 12 }}>
            <div style={{ fontSize: 14, color: C.red, fontWeight: 700 }}>錯誤訊息</div>
            <pre style={{ fontSize: 13, color: C.textDim, fontFamily: "monospace", marginTop: 6 }}>
{`[PARSE_ERROR] Error: Unexpected JSX expression
╭─[ src/state/useFileStore.js:62:5 ]
│
62 │ ╭─▶   <FileStoreContext.Provider value={state}>
   ┆ ┆
66 │ ├─▶     </FileStoreContext.Provider>
│
│ Help: JSX syntax is disabled via the parser options`}
            </pre>
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.9, color: C.text }}>
            <strong style={{ color: C.gold }}>原因：</strong>Vite 的依賴掃描器（rolldown）在掃描 <code>.js</code> 檔案時不會啟用 JSX parser。
            我們的 <code>useFileStore.js</code> 包含了 JSX 語法（Provider 的 return），但副檔名是 <code>.js</code> 不是 <code>.jsx</code>。
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.9, color: C.text, marginTop: 12 }}>
            <strong style={{ color: C.green }}>解法：</strong>把 <code>useFileStore.js</code> 改名為 <code>useFileStore.jsx</code>。
            Vite 看到 <code>.jsx</code> 副檔名就會自動啟用 JSX parser。
          </div>
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,215,0,0.06)", marginTop: 12 }}>
            <div style={{ fontSize: 14, color: C.gold, fontWeight: 700, marginBottom: 4 }}>🎓 教訓</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>
              在 Vite 中，<strong>任何包含 JSX 語法的檔案都必須用 .jsx 或 .tsx 副檔名</strong>。
              純邏輯（沒有 JSX）才能用 .js。這跟 Create React App 不同（CRA 允許 .js 寫 JSX）。
            </div>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card glow={C.orange} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.orange, fontWeight: 700, marginBottom: 16 }}>🐛 Bug #2：create-vite 非空目錄</h3>
          <div style={{ fontSize: 15, lineHeight: 1.9, color: C.text }}>
            <strong style={{ color: C.red }}>問題：</strong><code>npm create vite@latest . -- --template react</code> 在非空目錄中被取消。
            目錄中已存在 <code>.claude/</code> 和 <code>openspec/</code> 資料夾。
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.9, color: C.text, marginTop: 12 }}>
            <strong style={{ color: C.green }}>解法：</strong>先建在臨時目錄再搬移：
          </div>
          <CodeBlock title="解法" code={`# 建在臨時資料夾
npx create-vite@latest tmp-init --template react

# 搬移到目標目錄
cp -r tmp-init/* tmp-init/.* .
rm -rf tmp-init`} />
        </Card>
      </FadeIn>

      <FadeIn delay={0.25}>
        <Card glow={C.blue}>
          <h3 style={{ fontSize: 20, color: C.blue, fontWeight: 700, marginBottom: 16 }}>🐛 潛在問題：多 React 實例</h3>
          <div style={{ fontSize: 15, lineHeight: 1.9, color: C.text }}>
            <strong style={{ color: C.red }}>症狀：</strong><code>Invalid hook call. Hooks can only be called inside of the body of a function component.</code>
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.9, color: C.text, marginTop: 12 }}>
            <strong style={{ color: C.gold }}>原因：</strong>從 esm.sh 載入的第三方套件如果各自帶一份 React，
            就會出現多個 React 實例，Hooks 就會出錯。
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.9, color: C.text, marginTop: 12 }}>
            <strong style={{ color: C.green }}>預防措施：</strong>所有 esm.sh URL 都帶 <code>?external=react,react-dom</code>，
            強制第三方套件使用 Import Map 中共用的 React。
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}

// ─── Ch13: Babel 深入 ───
function BabelPage() {
  return (
    <div>
      <SectionTitle icon="🔮" title="Babel 深入：JSX 怎麼變成 JS" subtitle="理解 Babel 的轉換過程，是理解整個渲染管線的關鍵" color={C.gold} />

      <FadeIn>
        <Card glow={C.gold} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.gold, fontWeight: 700, marginBottom: 16 }}>🔄 JSX 不是 HTML</h3>
          <p style={{ fontSize: 16, lineHeight: 2, color: C.text }}>
            JSX 是<strong style={{ color: C.gold }}>語法糖</strong> —— 瀏覽器不認識它。
            <code>{"<div className=\"box\">Hello</div>"}</code> 只是
            <code>React.createElement("div", {"{ className: \"box\" }"}, "Hello")</code> 的簡寫。
            Babel 的工作就是把前者轉換成後者。
          </p>
        </Card>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card glow={C.blue} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.blue, fontWeight: 700, marginBottom: 16 }}>📊 轉換範例對照</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <CodeBlock title="JSX 語法" code={`<Card glow={C.gold}>
  <h3 style={{ color: "red" }}>
    Title
  </h3>
  <p>Content</p>
</Card>`} />
            </div>
            <div>
              <CodeBlock title="Babel 轉換後" code={`React.createElement(
  Card,
  { glow: C.gold },
  React.createElement(
    "h3",
    { style: { color: "red" } },
    "Title"
  ),
  React.createElement("p", null, "Content")
)`} />
            </div>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Card glow={C.accent}>
          <h3 style={{ fontSize: 20, color: C.accent, fontWeight: 700, marginBottom: 16 }}>⚙️ Babel Standalone 的使用方式</h3>
          <CodeBlock title="在瀏覽器中呼叫 Babel" code={`// index.html 中先載入：
// <script src="https://unpkg.com/@babel/standalone@7/babel.min.js">

// 然後在 JS 中使用：
const result = window.Babel.transform(jsxCode, {
  presets: ['react'],  // ← 啟用 JSX 轉換
  filename: 'component.jsx',
});

console.log(result.code);  // ← 轉換後的純 JS`} />
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(233,69,96,0.06)", marginTop: 12 }}>
            <div style={{ fontSize: 14, color: C.accent, fontWeight: 700, marginBottom: 6 }}>Presets 是什麼？</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>
              Preset 是一組轉換規則的集合。<code>react</code> preset 包含了 JSX → createElement 的轉換。
              如果要支援 TypeScript，只需加入 <code>typescript</code> preset：<br />
              <code style={{ color: C.gold }}>presets: ['react', 'typescript']</code>
            </div>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}

// ─── Ch14: 拖放 API ───
function DragDropPage() {
  return (
    <div>
      <SectionTitle icon="🖱️" title="HTML5 拖放 API 教學" subtitle="三個事件就能實作完整的拖放功能" color={C.green} />

      <FadeIn>
        <Card glow={C.green} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.green, fontWeight: 700, marginBottom: 16 }}>🎯 核心三事件</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { event: "onDragOver", desc: "檔案拖到元素上方時觸發。必須呼叫 e.preventDefault() 否則 Drop 不會觸發！", color: C.blue },
              { event: "onDragLeave", desc: "檔案離開元素範圍時觸發。用來移除視覺回饋（恢復原本外觀）。", color: C.orange },
              { event: "onDrop", desc: "檔案放下時觸發。從 e.dataTransfer.files 取得檔案列表。", color: C.green },
            ].map((e, i) => (
              <Card key={i} glow={e.color} style={{ padding: "14px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: e.color, fontFamily: "monospace" }}>{e.event}</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, marginTop: 8 }}>{e.desc}</div>
              </Card>
            ))}
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card glow={C.blue}>
          <h3 style={{ fontSize: 20, color: C.blue, fontWeight: 700, marginBottom: 16 }}>📝 完整程式碼解析</h3>
          <CodeBlock title="DropZone.jsx 核心邏輯" code={`const onDrop = (e) => {
  e.preventDefault();          // ← 必要！阻止瀏覽器預設行為
  setIsDragOver(false);        // ← 移除拖放中的視覺效果

  // e.dataTransfer.files 是 FileList 物件
  Array.from(e.dataTransfer.files).forEach((file) => {
    // 只接受 .jsx 和 .tsx 檔案
    if (file.name.endsWith('.jsx') || file.name.endsWith('.tsx')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        addFile(file.name, e.target.result);  // ← 讀完後存入 store
      };
      reader.readAsText(file);  // ← 以文字格式讀取
    }
  });
};`} />
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(68,136,255,0.06)", marginTop: 12 }}>
            <div style={{ fontSize: 14, color: C.blue, fontWeight: 700, marginBottom: 6 }}>💡 常見陷阱</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>
              onDragOver 中不呼叫 <code>e.preventDefault()</code> 的話，onDrop 事件<strong style={{ color: C.red }}>根本不會觸發</strong>！
              這是最常見的拖放 bug。
            </div>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}

// ─── Ch15: postMessage 跨域通訊 ───
function PostMessagePage() {
  return (
    <div>
      <SectionTitle icon="📡" title="postMessage：iframe 跨域通訊" subtitle="parent 和 iframe 之間如何安全地傳遞訊息" color={C.cyan} />

      <FadeIn>
        <Card glow={C.cyan} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.cyan, fontWeight: 700, marginBottom: 16 }}>📤 iframe → Parent（回報結果）</h3>
          <CodeBlock title="iframe 內的程式碼" code={`// 在 iframe 的 <script type="module"> 中：
try {
  // ... 渲染成功
  window.parent.postMessage({ type: "render-success" }, "*");
} catch(err) {
  // ... 渲染失敗
  window.parent.postMessage({
    type: "render-error",
    message: err.message,
    stack: err.stack
  }, "*");
}`} />
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card glow={C.blue}>
          <h3 style={{ fontSize: 20, color: C.blue, fontWeight: 700, marginBottom: 16 }}>📥 Parent 監聽（接收結果）</h3>
          <CodeBlock title="RenderPane.jsx 中的監聽" code={`// 用 useCallback 記憶 handler，避免重複建立
const handleMessage = useCallback((event) => {
  if (event.data?.type === 'render-error') {
    setError(activeFileId, {
      message: event.data.message,
      stack: event.data.stack
    });
  } else if (event.data?.type === 'render-success') {
    clearError(activeFileId);
  }
}, [activeFileId]);

// 用 useEffect 管理事件監聽器的生命週期
useEffect(() => {
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
  // ← cleanup：元件卸載時移除監聽器，避免記憶體洩漏
}, [handleMessage]);`} />
        </Card>
      </FadeIn>
    </div>
  );
}

// ─── Ch16: 正規表達式 ───
function RegexPage() {
  return (
    <div>
      <SectionTitle icon="🔍" title="正規表達式：Import 語句解析" subtitle="用 regex 從 JSX 原始碼中提取所有 import 語句" color={C.orange} />

      <FadeIn>
        <Card glow={C.orange} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.orange, fontWeight: 700, marginBottom: 16 }}>🔬 regex 逐段拆解</h3>
          <CodeBlock title="importResolver.js 的核心正則" code={`/import\\s+(.+?)\\s+from\\s+['"]([^./][^'"]*)['"]/g

拆解：
import     → 字面量 "import"
\\s+       → 一或多個空白
(.+?)      → 捕獲群組 1：import 的內容（non-greedy）
             例如 "{ useState, useEffect }" 或 "React"
\\s+from\\s+ → " from "
['"]       → 單引號或雙引號
([^./]     → 捕獲群組 2 開頭：不是 . 或 /
             （排除相對路徑 import，如 './utils'）
[^'"]*)    → 捕獲群組 2 剩餘：套件名稱
['"]       → 結尾引號
/g         → 全域搜尋（找所有 match）`} />
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card glow={C.green}>
          <h3 style={{ fontSize: 20, color: C.green, fontWeight: 700, marginBottom: 16 }}>✅ 匹配範例</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { input: 'import { useState } from "react"', match: true, g1: "{ useState }", g2: "react" },
              { input: 'import React from "react"', match: true, g1: "React", g2: "react" },
              { input: 'import { motion } from "framer-motion"', match: true, g1: "{ motion }", g2: "framer-motion" },
              { input: 'import "./styles.css"', match: false, g1: "-", g2: "-" },
              { input: 'import Header from "./Header"', match: false, g1: "-", g2: "-" },
            ].map((ex, i) => (
              <div key={i} style={{
                padding: "10px 14px", borderRadius: 8, fontSize: 13,
                background: ex.match ? "rgba(102,255,136,0.06)" : "rgba(255,68,68,0.06)",
                border: `1px solid ${ex.match ? "rgba(102,255,136,0.15)" : "rgba(255,68,68,0.15)"}`,
              }}>
                <div style={{ fontFamily: "monospace", color: C.text, marginBottom: 4 }}>{ex.input}</div>
                <div style={{ color: ex.match ? C.green : C.red, fontWeight: 600 }}>
                  {ex.match ? `✅ 群組1: ${ex.g1} | 群組2: ${ex.g2}` : "❌ 不匹配（相對路徑）"}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}

// ─── Ch17: 設計模式 ───
function PatternsPage() {
  return (
    <div>
      <SectionTitle icon="🧩" title="這個專案用了哪些設計模式？" subtitle="不需要背教科書，看實際應用就懂了" color={C.purple} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {[
          { name: "Provider 模式", where: "useFileStore.jsx", desc: "用 Context.Provider 包裹子元件，提供全域狀態存取。不需要 props drilling。", color: C.blue },
          { name: "Reducer 模式", where: "useFileStore.jsx", desc: "所有狀態變更都透過 dispatch(action) 進行，狀態轉換邏輯集中在 reducer 函式中。", color: C.green },
          { name: "Container/Presentational", where: "Sidebar + TabItem", desc: "Sidebar 負責資料邏輯（從 store 讀取），TabItem 負責呈現（接收 props 顯示）。", color: C.purple },
          { name: "Facade 模式", where: "useFileActions()", desc: "把 dispatch 包裝成語意化的函式（addFile, removeFile），隱藏 dispatch 的細節。", color: C.gold },
          { name: "Template 模式", where: "template.js", desc: "generateSrcdoc() 定義了 HTML 的骨架，動態填入 import map 和 compiled code。", color: C.accent },
          { name: "Observer 模式", where: "postMessage", desc: "iframe 發布事件，parent 訂閱並回應。鬆耦合的通訊方式。", color: C.cyan },
        ].map((p, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <Card glow={p.color}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: p.color }}>{p.name}</span>
                <Pill color={p.color}>{p.where}</Pill>
              </div>
              <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
            </Card>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

// ─── Ch18: 效能思維 ───
function PerfPage() {
  return (
    <div>
      <SectionTitle icon="⚡" title="效能思維：MVP 也要聰明" subtitle="不是過早優化，而是在設計時就做對的選擇" color={C.accent} />

      <FadeIn>
        <Card glow={C.accent} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.accent, fontWeight: 700, marginBottom: 16 }}>💡 這個專案的效能決策</h3>
          {[
            { decision: "Babel 只載入一次", detail: "在 parent 而非每個 iframe 中載入 800KB 的 Babel", impact: "省 ~800KB/iframe", color: C.gold },
            { decision: "雙 Context 分離", detail: "state 和 dispatch 分開，避免不必要的 re-render", impact: "DropZone 不因 files 變化重渲染", color: C.blue },
            { decision: "useCallback 記憶 handler", detail: "postMessage handler 用 useCallback 包裝", impact: "避免每次 render 都重新註冊 listener", color: C.green },
            { decision: "Map 結構而非 Array", detail: "files 用 { [id]: file } 而非 [file, file]", impact: "按 id 查找 O(1)，刪除也是 O(1)", color: C.purple },
          ].map((d, i) => (
            <div key={i} style={{
              display: "flex", gap: 12, padding: "12px 0",
              borderBottom: i < 3 ? `1px solid ${C.border}` : "none",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: d.color }}>{d.decision}</div>
                <div style={{ fontSize: 13, color: C.textDim, marginTop: 4 }}>{d.detail}</div>
              </div>
              <div style={{
                padding: "4px 12px", borderRadius: 8, alignSelf: "center",
                background: `rgba(${hexToRgb(d.color)},0.1)`, color: d.color,
                fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
              }}>
                {d.impact}
              </div>
            </div>
          ))}
        </Card>
      </FadeIn>
    </div>
  );
}

// ─── Ch19: File API ───
function FileApiPage() {
  return (
    <div>
      <SectionTitle icon="📁" title="File API：瀏覽器讀取檔案" subtitle="不需要後端，瀏覽器可以直接讀取使用者的本地檔案" color={C.blue} />

      <FadeIn>
        <Card glow={C.blue} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.blue, fontWeight: 700, marginBottom: 16 }}>📖 FileReader 的運作方式</h3>
          <CodeBlock title="讀取檔案的完整流程" code={`// 1. 使用者拖放或選擇檔案後，得到 File 物件
const file = e.dataTransfer.files[0];
console.log(file.name);  // "App.jsx"
console.log(file.size);  // 1234 (bytes)
console.log(file.type);  // "" (jsx 沒有 MIME type)

// 2. 建立 FileReader 實例
const reader = new FileReader();

// 3. 設定讀完後的 callback
reader.onload = (e) => {
  const content = e.target.result;  // ← 檔案內容（字串）
  console.log(content);  // "import { useState } from 'react'..."
  addFile(file.name, content);
};

// 4. 開始讀取（非同步）
reader.readAsText(file);  // ← 以 UTF-8 文字格式讀取`} />
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(68,136,255,0.06)", marginTop: 12 }}>
            <div style={{ fontSize: 14, color: C.blue, fontWeight: 700, marginBottom: 6 }}>重要概念</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>
              FileReader 是<strong>非同步</strong>的。呼叫 readAsText() 後不會立即得到結果，
              而是在 onload callback 中才能取得內容。這是瀏覽器保護使用者的設計 ——
              只有使用者主動操作（拖放/選擇）才能讀取檔案。
            </div>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}

// ─── Ch20: Import Maps ───
function ImportMapPage() {
  return (
    <div>
      <SectionTitle icon="🗺️" title="Import Maps：瀏覽器原生模組解析" subtitle="不需要 webpack 或 bundler，瀏覽器自己就能解析 bare import" color={C.green} />

      <FadeIn>
        <Card glow={C.green} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.green, fontWeight: 700, marginBottom: 16 }}>🧭 問題：瀏覽器不認識 bare import</h3>
          <CodeBlock title="bare import vs URL import" code={`// bare import（瀏覽器不認識！）
import React from "react";

// URL import（瀏覽器認識）
import React from "https://esm.sh/react@18.3.1";

// Import Map 把前者對應到後者
// → 開發者寫 bare import，瀏覽器自動解析成 URL`} />
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card glow={C.gold}>
          <h3 style={{ fontSize: 20, color: C.gold, fontWeight: 700, marginBottom: 16 }}>📝 Import Map 格式</h3>
          <CodeBlock title="完整的 Import Map 範例" code={`<script type="importmap">
{
  "imports": {
    "react":           "https://esm.sh/react@18.3.1",
    "react/":          "https://esm.sh/react@18.3.1/",
    "react-dom":       "https://esm.sh/react-dom@18.3.1?external=react",
    "react-dom/client": "https://esm.sh/react-dom@18.3.1/client?external=react",
    "framer-motion":   "https://esm.sh/framer-motion?external=react,react-dom"
  }
}
</script>

<!-- 有了這個 Import Map，下面的 import 就能正常運作 -->
<script type="module">
  import React from "react";          // → esm.sh/react@18.3.1
  import { motion } from "framer-motion"; // → esm.sh/framer-motion
</script>`} />
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,215,0,0.06)", marginTop: 12 }}>
            <div style={{ fontSize: 14, color: C.gold, fontWeight: 700, marginBottom: 6 }}>尾隨斜線的妙用</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>
              <code>"react/"</code> 映射可以處理子路徑 import：<br />
              <code>import jsx from "react/jsx-runtime"</code> → <code>esm.sh/react@18.3.1/jsx-runtime</code>
            </div>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}

// ─── Ch21: 開發工具技巧 ───
function DevToolsPage() {
  return (
    <div>
      <SectionTitle icon="🔧" title="開發工具技巧" subtitle="讓 Vite + React 開發更高效的實用技巧" color={C.orange} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {[
          { title: "Vite HMR", desc: "修改程式碼後自動更新瀏覽器，不需要手動重新整理。狀態還能保留。", cmd: "npm run dev", color: C.green },
          { title: "瀏覽器 Console", desc: "iframe 內的 console.log 可以在開發者工具的 Console 中看到。選擇正確的 context。", cmd: "F12 → Console → 選擇 iframe context", color: C.blue },
          { title: "Network 面板", desc: "觀察 esm.sh 的載入情況。第一次載入慢，之後會快取。", cmd: "F12 → Network → 過濾 esm.sh", color: C.purple },
          { title: "React DevTools", desc: "安裝 React DevTools 瀏覽器擴充，可以檢查 Viewer 的元件樹和狀態。", cmd: "Chrome Web Store 安裝", color: C.accent },
        ].map((t, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <Card glow={t.color}>
              <h3 style={{ fontSize: 17, color: t.color, fontWeight: 700, marginBottom: 8 }}>{t.title}</h3>
              <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, marginBottom: 10 }}>{t.desc}</p>
              <div style={{
                padding: "6px 12px", borderRadius: 6, background: "rgba(0,0,0,0.3)",
                fontFamily: "monospace", fontSize: 12, color: C.textDim,
              }}>
                {t.cmd}
              </div>
            </Card>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

// ─── Ch22: 程式碼導讀 ───
function CodeReadPage() {
  return (
    <div>
      <SectionTitle icon="📖" title="程式碼導讀：最值得細看的三段" subtitle="如果你只有時間看三段程式碼，看這三段" color={C.gold} />

      <FadeIn>
        <Card glow={C.gold} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.gold, fontWeight: 700, marginBottom: 16 }}>⭐ #1 compileJSX() — 整個管線的核心</h3>
          <p style={{ fontSize: 15, color: C.text, lineHeight: 1.8, marginBottom: 12 }}>
            位於 <code>src/components/RenderPane.jsx</code>，這個函式串接了所有步驟：
          </p>
          <CodeBlock code={`function compileJSX(source) {
  // Step 1: 掃描所有 import 語句
  const { imports, thirdPartyPackages } = extractImports(source);

  // Step 2: 從原始碼中移除 import，重建為 iframe 用的 import
  let codeBody = source;
  const importLines = [];
  for (const imp of imports) {
    codeBody = codeBody.replace(imp.fullMatch, '');
    importLines.push(\`import \${imp.specifiers} from "\${imp.pkg}";\`);
  }

  // Step 3: 確保 React 永遠被 import（Babel 轉換需要）
  if (!imports.some(i => i.pkg === 'react')) {
    importLines.unshift('import React from "react";');
  }

  // Step 4: 找到並處理 export default
  let componentName = 'DefaultExport';
  const match = /export\\s+default\\s+function\\s+(\\w+)/.exec(codeBody);
  if (match) {
    componentName = match[1];
    codeBody = codeBody.replace(/export\\s+default\\s+function/, 'function');
  }

  // Step 5: Babel 編譯 JSX → React.createElement
  const result = window.Babel.transform(codeBody, {
    presets: ['react'],
  });

  // Step 6: 建立 import map
  const importMap = buildImportMap(thirdPartyPackages);

  return { importStatements, compiledCode: result.code, componentName, importMap };
}`} />
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card glow={C.blue} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.blue, fontWeight: 700, marginBottom: 16 }}>⭐ #2 reducer() — 所有狀態變更的規則</h3>
          <p style={{ fontSize: 15, color: C.text, lineHeight: 1.8, marginBottom: 12 }}>
            位於 <code>src/state/useFileStore.jsx</code>，每個 case 就是一個狀態轉換規則：
          </p>
          <CodeBlock code={`case 'REMOVE_FILE': {
  const { id } = action.payload;
  // 解構移除指定 id（不修改原 object）
  const { [id]: _, ...remainingFiles } = state.files;

  // 如果關閉的是當前 active tab
  let nextActiveId = state.activeFileId;
  if (state.activeFileId === id) {
    // 自動切換到最近新增的 tab
    const sorted = Object.values(remainingFiles)
      .sort((a, b) => a.addedAt - b.addedAt);
    nextActiveId = sorted.length > 0
      ? sorted[sorted.length - 1].id
      : null;
  }

  return { ...state, files: remainingFiles, activeFileId: nextActiveId };
}`} />
        </Card>
      </FadeIn>

      <FadeIn delay={0.25}>
        <Card glow={C.accent}>
          <h3 style={{ fontSize: 20, color: C.accent, fontWeight: 700, marginBottom: 16 }}>⭐ #3 generateSrcdoc() — iframe 的 DNA</h3>
          <p style={{ fontSize: 15, color: C.text, lineHeight: 1.8 }}>
            位於 <code>src/iframe/template.js</code>，產生注入 iframe 的完整 HTML。
            理解這個函式就理解了整個渲染隔離的機制。重點在於 Import Map 和 try/catch + postMessage 的錯誤回報。
          </p>
        </Card>
      </FadeIn>
    </div>
  );
}

// ─── Ch23: 常見錯誤 ───
function MistakesPage() {
  return (
    <div>
      <SectionTitle icon="💥" title="初學者常犯的錯誤" subtitle="從別人的錯誤中學習，比自己犯錯更快" color={C.red} />

      {[
        { title: "忘記 e.preventDefault()", desc: "在 onDragOver 中不呼叫 preventDefault()，導致 onDrop 永遠不會觸發。瀏覽器預設會攔截拖放事件。", fix: "在 onDragOver handler 的第一行加上 e.preventDefault()", color: C.red },
        { title: "useEffect 缺少 cleanup", desc: "addEventListener 後沒有在 cleanup 中 removeEventListener，導致事件處理器越積越多。", fix: "useEffect 的 return 函式中呼叫 removeEventListener", color: C.orange },
        { title: "直接修改 state", desc: "在 reducer 中直接修改 state.files 而不是建立新物件，導致 React 偵測不到變化。", fix: "永遠 return 新物件：{ ...state, files: { ...state.files, [id]: newFile } }", color: C.gold },
        { title: "iframe sandbox 太嚴格", desc: "沒給 allow-scripts 導致 JS 不執行，或沒給 allow-same-origin 導致 esm.sh 請求被擋。", fix: "sandbox=\"allow-scripts allow-same-origin allow-popups\"", color: C.blue },
        { title: "Babel preset 寫錯", desc: "寫成 presets: ['jsx'] 而不是 presets: ['react']，導致轉換失敗。", fix: "React JSX 轉換的 preset 名稱是 'react' 不是 'jsx'", color: C.purple },
        { title: "忘記 ?external", desc: "esm.sh URL 不帶 ?external=react，導致多個 React 實例和 Invalid hook call 錯誤。", fix: "所有第三方套件的 esm.sh URL 都要帶 ?external=react,react-dom", color: C.accent },
      ].map((m, i) => (
        <FadeIn key={i} delay={i * 0.08}>
          <Card glow={m.color} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>💥</span>
              <span style={{ fontSize: 17, fontWeight: 700, color: m.color }}>{m.title}</span>
            </div>
            <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, marginBottom: 8 }}>{m.desc}</p>
            <div style={{
              padding: "8px 14px", borderRadius: 8,
              background: `rgba(${hexToRgb(C.green)},0.06)`,
              border: `1px solid rgba(${hexToRgb(C.green)},0.15)`,
              fontSize: 13, color: C.green,
            }}>
              ✅ 解法：{m.fix}
            </div>
          </Card>
        </FadeIn>
      ))}
    </div>
  );
}

// ─── Ch29: 術語表 ───
function GlossaryPage() {
  const terms = [
    { term: "JSX", def: "JavaScript XML，React 的語法擴充，讓你在 JS 中寫類似 HTML 的標記語法。" },
    { term: "Babel", def: "JavaScript 編譯器，將新語法（包括 JSX）轉換成瀏覽器能執行的標準 JS。" },
    { term: "Vite", def: "下一代前端建置工具，特色是極快的冷啟動和 HMR（熱模組替換）。" },
    { term: "Import Map", def: "瀏覽器原生功能，將 bare import specifier（如 'react'）對應到完整 URL。" },
    { term: "esm.sh", def: "CDN 服務，將 npm 套件轉換為 ESM 格式，瀏覽器可直接 import。" },
    { term: "srcdoc", def: "iframe 的屬性，直接用 HTML 字串設定 iframe 的內容，不需要額外的 URL。" },
    { term: "postMessage", def: "Web API，允許不同 origin 的視窗（包括 iframe）之間安全地傳遞訊息。" },
    { term: "useReducer", def: "React Hook，用 reducer 函式管理複雜狀態。類似 Redux 但更輕量。" },
    { term: "Context", def: "React 的跨層級資料傳遞機制，避免 props drilling（逐層傳遞）。" },
    { term: "sandbox", def: "iframe 的安全屬性，限制 iframe 內容的能力（JS 執行、表單提交等）。" },
    { term: "BEM", def: "CSS 命名慣例：Block__Element--Modifier。讓 class name 反映元件結構。" },
    { term: "MVP", def: "Minimum Viable Product，最小可行性產品。先做核心功能，再逐步擴充。" },
    { term: "HMR", def: "Hot Module Replacement，修改程式碼後瀏覽器自動更新，不需要整頁重新整理。" },
    { term: "OpenSpec", def: "結構化的變更管理框架：Explore → Propose → Design → Tasks → Apply → Verify。" },
    { term: "Vibe Coding", def: "用自然語言描述想要的結果，讓 AI 產生程式碼的開發方式。" },
  ];

  return (
    <div>
      <SectionTitle icon="📘" title="術語表" subtitle="這份文件中出現的所有技術名詞，一次看懂" color={C.cyan} />

      <FadeIn>
        <Card glow={C.cyan}>
          {terms.map((t, i) => (
            <div key={i} style={{
              display: "flex", gap: 16, padding: "12px 0",
              borderBottom: i < terms.length - 1 ? `1px solid ${C.border}` : "none",
            }}>
              <div style={{
                minWidth: 130, fontSize: 14, fontWeight: 700, color: C.cyan,
                fontFamily: "monospace",
              }}>
                {t.term}
              </div>
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.7 }}>
                {t.def}
              </div>
            </div>
          ))}
        </Card>
      </FadeIn>
    </div>
  );
}

// ─── Vibe Coding ───
function VibeCodingPage() {
  return (
    <div>
      <SectionTitle icon="🎵" title="Vibe Coding 是什麼？" subtitle="不是寫 code，而是「描述 vibe」—— 讓 AI 把你腦中的畫面變成現實" color={C.gold} />

      <FadeIn>
        <Card glow={C.gold} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 22, color: C.gold, fontWeight: 700, marginBottom: 16 }}>🎵 Vibe Coding 的核心精神</h3>
          <div style={{ fontSize: 16, lineHeight: 2.2, color: C.text }}>
            <p>Vibe Coding 是由 Andrej Karpathy 提出的概念：</p>
            <blockquote style={{
              borderLeft: `3px solid ${C.gold}`, paddingLeft: 16, margin: "12px 0",
              fontStyle: "italic", color: C.gold, fontSize: 17,
            }}>
              "You fully give in to the vibes, embrace exponentials, and forget that the code even exists."
            </blockquote>
            <p>意思是：<strong>你不再逐行寫程式碼，而是用自然語言描述你想要的東西，讓 AI 幫你實現。</strong></p>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card glow={C.purple} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.purple, fontWeight: 700, marginBottom: 16 }}>📊 這個專案中的 Vibe Coding 數據</h3>
          <ProgressBar label="人類直接寫的程式碼" value={0} color={C.blue} />
          <ProgressBar label="AI 產生的程式碼" value={100} color={C.accent} />
          <ProgressBar label="人類的決策介入" value={85} color={C.gold} />
          <ProgressBar label="AI 的自主判斷" value={70} color={C.green} />
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(199,125,255,0.06)", marginTop: 12 }}>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>
              <strong style={{ color: C.purple }}>有趣的矛盾：</strong>人類沒有寫任何一行程式碼，
              但做了<strong>所有的關鍵決策</strong>。這就是 Vibe Coding 的精髓 ——
              <strong style={{ color: C.gold }}>人類負責「What」和「Why」，AI 負責「How」。</strong>
            </div>
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.25}>
        <Card glow={C.accent} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, color: C.accent, fontWeight: 700, marginBottom: 16 }}>🔄 Vibe Coding 的工作循環</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, textAlign: "center" }}>
            {[
              { step: "描述", icon: "💬", desc: "用自然語言說出你想要什麼", color: C.blue },
              { step: "討論", icon: "🤔", desc: "AI 提問，人類澄清，雙方對齊理解", color: C.purple },
              { step: "生成", icon: "⚡", desc: "AI 根據共識產生完整的程式碼", color: C.accent },
              { step: "驗證", icon: "✅", desc: "人類檢查結果，提供回饋", color: C.green },
            ].map((s, i) => (
              <div key={i}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14, margin: "0 auto 8px",
                  background: `rgba(${hexToRgb(s.color)},0.15)`, border: `2px solid ${s.color}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.step}</div>
                <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}

// ─── Ch11: 你學到了什麼 ───
function SkillsPage() {
  const skills = [
    { category: "React 核心", items: ["useReducer 狀態管理", "Context 分離模式", "useCallback 效能優化", "useRef 管理 DOM", "元件拆分原則"], color: C.blue },
    { category: "瀏覽器 API", items: ["Drag & Drop API", "FileReader API", "postMessage 跨域通訊", "Import Maps 標準", "iframe sandbox"], color: C.green },
    { category: "工程實踐", items: ["MVP 範圍控制", "架構三層分離", "技術決策的取捨分析", "OpenSpec 結構化流程", "錯誤邊界處理"], color: C.purple },
    { category: "AI 協作", items: ["有效的 Prompt 寫法", "提供範例的重要性", "決策 vs 執行的分工", "Plan Mode 的使用", "結構化討論框架"], color: C.gold },
  ];

  return (
    <div>
      <SectionTitle icon="����" title="初學者能從這個專案學到什麼" subtitle="不只是寫 code，更是一套完整的工程思維" color={C.green} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {skills.map((s, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <Card glow={s.color}>
              <h3 style={{ fontSize: 18, color: s.color, fontWeight: 700, marginBottom: 14 }}>{s.category}</h3>
              {s.items.map((item, j) => (
                <div key={j} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "6px 0",
                  fontSize: 15, color: C.text,
                }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 6,
                    background: `rgba(${hexToRgb(s.color)},0.15)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, color: s.color, fontWeight: 700, flexShrink: 0,
                  }}>
                    {j + 1}
                  </span>
                  {item}
                </div>
              ))}
            </Card>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.5}>
        <Card glow={C.accent} style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 20, color: C.accent, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>
            🏆 最重要的一課
          </h3>
          <p style={{ fontSize: 18, lineHeight: 2, color: C.text, textAlign: "center", maxWidth: 700, margin: "0 auto" }}>
            好的軟體不是一次寫完的，而是<strong style={{ color: C.gold }}>先釐清問題 → 再設計方案 → 最後才寫程式碼</strong>。
            AI 可以幫你寫 100% 的 code，但<strong style={{ color: C.accent }}>0% 的 code 能替代你對問題的理解</strong>。
          </p>
        </Card>
      </FadeIn>
    </div>
  );
}

// ─── Ch12: 下一堂課 ───
function NextLessonPage() {
  const lessons = [
    {
      level: "Lv.1",
      title: "修改 JSX Viewer 的 UI",
      desc: "從修改 App.css 開始：換顏���、改字體、調整版面。這是學習 CSS 的最好起點，因為改一行就能看到效果。",
      tasks: ["改變強調色（從 #E94560 換成你喜歡的）", "調整側邊欄寬度", "新增暗/亮主題切換"],
      color: C.green,
    },
    {
      level: "Lv.2",
      title: "加入 TypeScript 支援",
      desc: "修改 RenderPane.jsx 的 compileJSX 函式，在 Babel presets 加入 @babel/preset-typescript，讓 Viewer 也能渲染 .tsx 檔案。",
      tasks: ["研究 Babel preset-typescript", "修改 DropZone 接受 .tsx", "修改 compileJSX 加入 TS preset"],
      color: C.blue,
    },
    {
      level: "Lv.3",
      title: "加入程式碼編輯器",
      desc: "整合 CodeMirror 或 Monaco Editor，讓使用者可以在左側編輯 JSX 原始碼，右側即時看到渲染結果。",
      tasks: ["研究 @codemirror/lang-javascript", "建立 Editor 元件", "實作 debounce 即時編譯"],
      color: C.purple,
    },
    {
      level: "Lv.4",
      title: "加入 Node.js 後端",
      desc: "用 Express 建立一個簡單的後端 API，讀取本地目錄結構，讓 Viewer 可以瀏覽資料夾而不只是拖放。",
      tasks: ["建立 Express server", "實作 /api/files 目錄讀取", "建立 FileBrowser 前端元件"],
      color: C.gold,
    },
    {
      level: "Lv.5",
      title: "建立自己的 Vite 插件",
      desc: "將 JSX Viewer 打包成一個 Vite 插件，讓任何 Vite 專案都能用 import 的方式使用它。",
      tasks: ["研究 Vite Plugin API", "設計插件的 API 介面", "發布到 npm"],
      color: C.accent,
    },
  ];

  return (
    <div>
      <SectionTitle icon="📚" title="初學者的下一堂課" subtitle="5 個漸進式的學習路徑，從改 CSS 到發布 npm 套件" color={C.purple} />

      {lessons.map((l, i) => (
        <FadeIn key={i} delay={i * 0.1}>
          <Card glow={l.color} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{
                width: 56, minWidth: 56, height: 56, borderRadius: 14,
                background: `linear-gradient(135deg, ${l.color}, ${C.accent})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 900, color: "#fff",
              }}>
                {l.level}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 19, color: l.color, fontWeight: 700, marginBottom: 8 }}>{l.title}</h3>
                <p style={{ fontSize: 15, color: C.text, lineHeight: 1.8, marginBottom: 12 }}>{l.desc}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {l.tasks.map((t, j) => (
                    <Pill key={j} color={l.color}>📌 {t}</Pill>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>
      ))}
    </div>
  );
}

// ─── Ch13: 更多嘗試 ───
function ExperimentsPage() {
  return (
    <div>
      <SectionTitle icon="🧪" title="還能做哪些嘗試？" subtitle="JSX Viewer 只是起點，以下是更多令人興奮的可能性" color={C.accent} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {[
          {
            title: "🎨 AI 即時生成 + 預覽",
            desc: "整合 Claude API，在 Viewer 裡面直接輸入 prompt，AI 即時產生 JSX，右側即時渲染。想像一下：打字→看到畫面。",
            tags: ["Claude API", "Streaming", "Real-time"],
            color: C.gold,
          },
          {
            title: "📱 響應式預覽",
            desc: "加入手機/平板/桌面三種尺寸的預覽模式，像 Chrome DevTools 的 device toolbar 一樣。",
            tags: ["CSS", "iframe resize", "Device simulation"],
            color: C.blue,
          },
          {
            title: "🔄 多版本對比",
            desc: "同一個元件的不同版本並排渲染，用於比較 AI 不同 prompt 產生的結果差異。",
            tags: ["Split view", "Diff", "Comparison"],
            color: C.green,
          },
          {
            title: "📤 匯出 & 分享",
            desc: "將渲染結果匯出為靜態 HTML ���案，或產生可分享的連結。讓別人不需要安裝任何東西就能看到你的 JSX。",
            tags: ["Static export", "Share URL", "Standalone HTML"],
            color: C.purple,
          },
          {
            title: "🧩 元件庫整合",
            desc: "預載 Ant Design、Material UI 等常用元件庫，讓 AI 可以直接使用這些元件來產生更專業的介面。",
            tags: ["Ant Design", "MUI", "Pre-loaded packages"],
            color: C.accent,
          },
          {
            title: "📊 效能分析面板",
            desc: "在渲染結果旁邊顯示 React render 次數、元件層級深度、記憶體使用量等效能指標。",
            tags: ["React Profiler", "Performance", "Metrics"],
            color: C.orange,
          },
          {
            title: "🌐 多框架支援",
            desc: "不只 React！加入 Vue SFC 和 Svelte 的支援，用相同的拖放體驗預覽不同框架的元件。",
            tags: ["Vue", "Svelte", "Multi-framework"],
            color: C.cyan,
          },
          {
            title: "💾 本地收藏夾",
            desc: "用 IndexedDB 儲存常用的 JSX 檔案，建立個人的「JSX 說明文件圖書館」。",
            tags: ["IndexedDB", "Local storage", "Library"],
            color: C.gold,
          },
        ].map((item, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <Card glow={item.color}>
              <h3 style={{ fontSize: 18, color: item.color, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, marginBottom: 12 }}>{item.desc}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {item.tags.map((tag, j) => <Pill key={j} color={item.color}>{tag}</Pill>)}
              </div>
            </Card>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

// ─── Ch14: 結語 ───
function ClosingPage() {
  return (
    <div>
      <SectionTitle icon="🌟" title="結語：程式碼是思考的副產品" color={C.gold} />

      <FadeIn>
        <Card glow={C.gold} style={{ marginBottom: 24, textAlign: "center" }}>
          <blockquote style={{
            fontSize: 22, lineHeight: 1.8, color: C.gold, fontWeight: 600,
            fontStyle: "italic", padding: "20px 0",
          }}>
            "The best programmers are not those who write the most code,
            <br />
            but those who understand the problem the best."
          </blockquote>
          <p style={{ fontSize: 15, color: C.textDim }}>—— 在 AI 時代，這句話比任何時候都更真實</p>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <Card glow={C.accent} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 22, color: C.accent, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>這個專案證明了什麼？</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { icon: "🎯", title: "問題理解 > 語法記憶", desc: "知道「為什麼用 iframe」比知道「iframe 怎麼寫」重要 100 倍", color: C.blue },
              { icon: "🤝", title: "AI 是夥伴不是工具", desc: "最好的結果來�� AI 和人類各自發揮所長的協作", color: C.green },
              { icon: "📋", title: "流程決定品質", desc: "OpenSpec 的結構化流程避免了「想到哪寫到哪」的混亂", color: C.purple },
            ].map((item, i) => (
              <Card key={i} glow={item.color} style={{ padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: item.color, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6 }}>{item.desc}</div>
              </Card>
            ))}
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.3}>
        <Card glow={C.gold} style={{ textAlign: "center", padding: "40px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
          <h3 style={{ fontSize: 24, color: C.gold, fontWeight: 700, marginBottom: 16 }}>
            你正在用 JSX Viewer 閱讀這份文件
          </h3>
          <p style={{ fontSize: 17, color: C.text, lineHeight: 1.8, maxWidth: 600, margin: "0 auto" }}>
            如果你把這個 .jsx 檔案拖進了 JSX Viewer 並看到了這些文字，
            那麼恭喜 —— <strong style={{ color: C.gold }}>你正在用自己建立的工具，閱讀自己建立這個工具的故事</strong>。
          </p>
          <p style={{ fontSize: 17, color: C.text, lineHeight: 1.8, maxWidth: 600, margin: "16px auto 0" }}>
            這就是 Vibe Coding 最美的地方：
            <strong style={{ color: C.accent }}>從一個想法開始，到一個能自我展示的產品結束。</strong>
          </p>
          <div style={{ marginTop: 32, fontSize: 14, color: C.textDim }}>
            Built with Claude Code × Human Creativity
            <br />
            2026-04-05
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}

// ═══════════════════════════════════════
// 主元件
// ═══════════════════════════════════════

const CHAPTER_MAP = {
  cover: CoverPage,
  story: StoryPage,
  prompts: PromptsPage,
  decisions: DecisionsPage,
  openspec: OpenSpecPage,
  arch: ArchPage,
  pipeline: PipelinePage,
  state: StatePage,
  iframe: IframePage,
  esm: EsmPage,
  react101: React101Page,
  css: CssPage,
  debugging: DebuggingPage,
  babel: BabelPage,
  dragdrop: DragDropPage,
  postmessage: PostMessagePage,
  regex: RegexPage,
  patterns: PatternsPage,
  perf: PerfPage,
  fileapi: FileApiPage,
  importmap: ImportMapPage,
  devtools: DevToolsPage,
  coderead: CodeReadPage,
  mistakes: MistakesPage,
  vibecoding: VibeCodingPage,
  skills: SkillsPage,
  nextlesson: NextLessonPage,
  experiments: ExperimentsPage,
  glossary: GlossaryPage,
  closing: ClosingPage,
};

export default function JSXViewerJourney() {
  const [activeChapter, setActiveChapter] = useState("cover");
  const ActiveComponent = CHAPTER_MAP[activeChapter];

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: "'Noto Sans TC', 'Segoe UI', sans-serif",
      position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Orbitron:wght@700;900&display=swap');
        @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes gridMove { 0%{background-position:0 0} 100%{background-position:60px 60px} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px }
        button { font-family: inherit; }
      `}</style>

      {/* Background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "60px 60px", animation: "gridMove 8s linear infinite",
      }} />

      {/* Navigation */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(11,11,26,0.88)", backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${C.border}`, padding: "10px 16px",
        display: "flex", gap: 4, overflowX: "auto", justifyContent: "center", flexWrap: "wrap",
      }}>
        {CHAPTERS.map((ch) => (
          <button key={ch.id} onClick={() => setActiveChapter(ch.id)} style={{
            padding: "6px 14px", fontSize: 13, fontWeight: 700, borderRadius: 8, cursor: "pointer",
            border: activeChapter === ch.id ? `1.5px solid ${ch.color}` : `1.5px solid transparent`,
            background: activeChapter === ch.id ? `rgba(${hexToRgb(ch.color)},0.12)` : "transparent",
            color: activeChapter === ch.id ? ch.color : C.textDim,
            transition: "all 0.3s", whiteSpace: "nowrap",
          }}>
            {ch.icon} {ch.title}
          </button>
        ))}
      </nav>

      {/* Page indicator */}
      <div style={{ textAlign: "center", padding: "12px 0 0", fontSize: 13, color: C.textDim }}>
        {CHAPTERS.findIndex(c => c.id === activeChapter) + 1} / {CHAPTERS.length}
      </div>

      {/* Content */}
      <main style={{ position: "relative", zIndex: 10, maxWidth: 960, margin: "0 auto", padding: "24px 20px 80px" }}>
        <ActiveComponent />
      </main>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "32px 20px", borderTop: `1px solid ${C.border}`, color: C.textDim, fontSize: 13 }}>
        JSX Viewer 開發之旅 ── Claude Code × Human Developer ── Vibe Coding Documentary
      </footer>
    </div>
  );
}
