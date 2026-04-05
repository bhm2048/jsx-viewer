# JSX Viewer MVP 任務清單

## Phase 1 — 專案骨架

- [x] **Task 1.1** Vite + React 專案初始化
  - `npm create vite@latest . -- --template react`
  - 清理預設模板檔案
  - 建立目錄結構：`src/state/`, `src/components/`, `src/iframe/`

- [x] **Task 1.2** 狀態管理 (`useFileStore.jsx`)
  - 定義 state shape: `{ files, activeFileId, errors }`
  - 實作 reducer: `ADD_FILE`, `REMOVE_FILE`, `SET_ACTIVE`, `SET_ERROR`, `CLEAR_ERROR`
  - 匯出 `FileStoreProvider`, `useFileStore`, `useFileActions`

- [x] **Task 1.3** App 版面 (`App.jsx` + `App.css`)
  - CSS Grid 雙欄佈局：240px sidebar + 1fr render area
  - 深色主題（#1a1a2e 背景）
  - 完整 CSS 包含所有元件樣式

- [x] **Task 1.4** 拖放區 (`DropZone.jsx`)
  - onDragOver / onDrop 事件處理
  - FileReader.readAsText() 讀取檔案
  - 過濾 `.jsx` / `.tsx` 副檔名
  - Browse 按鈕（隱藏 input[type=file]）
  - 拖放時視覺回饋

- [x] **Task 1.5** 側邊欄與 Tab (`Sidebar.jsx` + `TabItem.jsx`)
  - Tab 列表（按新增時間排序）
  - Active tab 高亮
  - 關閉按鈕（×）
  - 關閉 active tab 時自動切換

## Phase 2 — 核心渲染管線

- [x] **Task 2.1** Babel Standalone 載入
  - 在 `index.html` 加入 CDN script tag
  - `window.Babel` 全域可用

- [x] **Task 2.2** Import 解析器 (`importResolver.js`)
  - `extractImports()`: regex 掃描 import 語句
  - 分離 react/react-dom vs 第三方套件
  - `buildImportMap()`: 建立 import map JSON
  - 所有第三方帶 `?external=react,react-dom`

- [x] **Task 2.3** iframe 模板 (`template.js`)
  - `generateSrcdoc()`: 產生完整 HTML 字串
  - 嵌入 import map
  - 嵌入 import 語句 + compiled code
  - try/catch + postMessage 錯誤回傳
  - 內建基本 CSS reset for #root

- [x] **Task 2.4** 渲染面板 (`RenderPane.jsx`)
  - `compileJSX()`: 串接 importResolver + Babel + template
    - 移除 import 語句（轉為 iframe import）
    - 處理 `export default function` / `export default name`
    - Babel.transform() 編譯 JSX
  - iframe 管理：設定 srcdoc、監聽 postMessage
  - 空狀態 placeholder
  - Loading spinner

## Phase 3 — 錯誤處理

- [x] **Task 3.1** 錯誤面板 (`ErrorPanel.jsx`)
  - 紅色全屏 overlay
  - 顯示錯誤訊息 + stack trace
  - 區分：Babel 編譯錯誤 vs iframe 執行時錯誤

- [x] **Task 3.2** 邊界情況處理
  - 空檔案 → 錯誤提示
  - 無 default export → 錯誤提示 "No valid component found"
  - Babel 未載入 → 錯誤提示 "check internet connection"

## Phase 4 — 細修

- [x] **Task 4.1** 多檔案支援
  - 拖放多檔同時載入
  - Browse 支援多選

- [x] **Task 4.2** Loading 指示
  - 編譯+載入期間顯示 spinner
  - iframe onLoad / postMessage render-success 時隱藏

## 已完成

所有任務已於 2026-04-05 完成。MVP 功能完整可用。

## 未來待辦（Post-MVP）

- [ ] TypeScript 支援（加入 `@babel/preset-typescript`）
- [ ] 內建程式碼編輯器（CodeMirror / Monaco）
- [ ] 多 iframe 快取（避免 Tab 切換重新渲染）
- [ ] 多行 import 語句支援（改用 AST parser）
- [ ] 目錄瀏覽功能（加入 Node.js 後端）
- [ ] 匯出靜態 HTML 功能
- [ ] 暗/亮主題切換
