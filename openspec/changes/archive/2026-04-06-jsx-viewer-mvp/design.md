# JSX Viewer MVP 設計文件

## 架構概覽

```
┌─────────────────────────────────────────────────────���
│                JSX Viewer (SPA)                     │
│                Vite + React                         │
├───────────┬─────────────────────────────────────────┤
│           │                                         │
│  Sidebar  │        RenderPane                       │
│  ┌─────┐  │  ┌───────────────────────────────────┐  │
│  │Tabs │  │  │ <iframe srcdoc>                   │  │
│  │  ×N │  │  │   Import Map + Compiled JS        │  │
│  └─────┘  │  │   React.createElement → DOM       │  │
│  ┌─────┐  │  └───────────────────────────────────┘  │
│  │Drop │  │                                         │
│  │Zone │  │  ErrorPanel (conditional overlay)       │
│  └─────┘  │                                         │
├───────────┴─────────────────────────────────────────┤
│  FileStore (Context + useReducer)                   │
└─────────────────────────────────────────────────────┘
```

## 核心設計決策

### D1: 編譯策略 — Babel Standalone in Parent

**決策：** Babel Standalone 載入在 parent app 中，編譯後的純 JS 注入 iframe。

**理由：**
- 只需載入一次 800KB 的 Babel（而非每個 iframe 都載入）
- 語法錯誤在 parent 端直接捕獲，不需 postMessage
- iframe 只需處理純 JS 執行

**替代方案（已排除）：**
- Babel in iframe：每個 iframe 重複載入 800KB
- SWC WASM：2MB 體積，MVP 階段穩定性不如 Babel

### D2: 渲染隔離 — iframe srcdoc

**決策：** 使用 `<iframe srcdoc>` 進行完全隔離渲染。

**理由：**
- 目標 JSX 檔案包含全域 CSS reset（`* { margin: 0 }`）和 `@keyframes`
- 不隔離會破壞 Viewer 自身的 UI
- srcdoc 比 blob: URL 簡單，無 CORS 問題

**替代方案（已排除）：**
- Shadow DOM：只隔離 CSS，不隔離 JS 全域變數
- 直接渲染：無隔離，全域 CSS 衝突

### D3: 套件解析 — esm.sh + Import Maps

**決策：** 使用��覽器原生 Import Maps 搭配 esm.sh CDN。

**理由：**
- 瀏覽器原生標準，不需要額外的 module loader
- esm.sh 的 `?external` 參數確保所有套件共用同一份 React
- 自動處理子路徑 import 和 dynamic import()

**關鍵細節：**
```
所有第三方套件 URL 必須帶 ?external=react,react-dom
避免多個 React 實例導致 hooks 錯誤
```

### D4: 狀態管理 — Context + useReducer

**決策：** 不引入外部狀態��，使用 React 內建方案。

**理由：**
- 狀態形狀簡單（files map + activeId + errors map）
- 只有 5 個 action，useReducer 完全能勝任
- 零外部依賴，符合 MVP 原則

### D5: Tab 切換 — 完全替換 srcdoc

**決策：** 切換 Tab 時替換整個 iframe srcdoc，不保留舊 iframe。

**理由：**
- 實作最簡單，保證乾淨狀態
- 避免多 iframe 的記憶體消耗
- MVP 階段可接受的體驗

**未來改善：** 使用多 iframe + display:none 快取已渲染的 Tab。

## 資料流

```
User Action          State Change           Side Effect
───────────          ────────────           ───────────
Drop file    ──▶  ADD_FILE           ──▶  New tab appears, set active
Click tab    ──▶  SET_ACTIVE         ──▶  iframe re-renders
Close tab    ──▶  REMOVE_FILE        ──▶  Switch to next tab
Babel error  ──▶  SET_ERROR          ──▶  ErrorPanel shows
iframe ok    ──▶  CLEAR_ERROR        ──▶  ErrorPanel hides
```

## iframe 通訊協定

```
Parent → iframe:  透過 srcdoc 屬性（整份 HTML）
iframe → Parent:  透過 window.parent.postMessage()

Message types:
  { type: "render-success" }                        ── 渲染成功
  { type: "render-error", message: str, stack: str } ── 執行時錯誤
```

## 樣式系統

- Viewer UI：傳統 CSS 檔案（App.css），BEM 命名慣例
- 目標 JSX：在 iframe 內自由使用任何樣式方式（inline / style tag）
- 主題：深色系（#1a1a2e 背景，#e94560 強調色）
- 無外部 CSS 框架（MVP 原則）

## 安全考量

- iframe sandbox: `allow-scripts allow-same-origin allow-popups`
- `allow-scripts`：必要，元件需要執行 JS
- `allow-same-origin`：必要，esm.sh import 需要網路存取
- `allow-popups`：允許元件內的連結開啟新分頁
- 不允許 `allow-forms`、`allow-top-navigation`

## 擴充點

| 功能 | 擴充方式 | 影響範圍 |
|------|---------|---------|
| TypeScript 支援 | 加入 `@babel/preset-typescript` | compileJSX() |
| 檔案編輯 | 加入 CodeMirror，監聽變更重新編譯 | 新元件 + RenderPane |
| 目錄瀏覽 | 加入 Express 後端 + FS API | 新的資料來源層 |
| 多 iframe 快取 | 每個 tab 獨立 iframe，display 切換 | RenderPane |
| 暗/亮主題 | CSS 變數 + 主題切換按鈕 | App.css |
