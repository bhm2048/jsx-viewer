# JSX Viewer MVP 提案

## 變更摘要

建立一個獨立的純前端 JSX Viewer 應用程式，用於即時渲染由 Claude Code 產生的自包含 JSX 說明文件。

## 動機

Claude Code 經常產生包含豐富視覺化內容的 JSX 檔案（動畫、互動元件、資料視覺化），但這些檔案需要完整的 React 開發環境才能檢視。每次預覽都需要手動配置專案，嚴重降低了 AI 產生視覺化文件的實用性。

## 目標

- 提供「拖放即渲染」的 JSX 檔案檢視體驗
- 零後端依賴，純前端運作
- 支援 React 及常用第三方套件
- 以 MVP 方式交付，預留擴充空間

## 非目標

- 不做檔案編輯功能
- 不做目錄瀏覽（無後端）
- 不做 TypeScript 編譯
- 不做多框架支援（Vue、Svelte）

## 技術方案

| 面向 | 選擇 |
|------|------|
| 建置 | Vite + React |
| 編譯 | Babel Standalone (瀏覽器端) |
| 隔離 | iframe srcdoc |
| 套件 | esm.sh CDN + 原生 Import Maps |
| 狀態 | React Context + useReducer |
| 載入 | 拖放 + FileReader API |

## 範圍

- 拖放載入 + Browse 按鈕
- 多檔 Tab 切換
- iframe 隔離渲染
- 第三方套件自動解析
- 編譯/執行錯誤面板
- 深色主題 UI

## 風險

| 風險 | 影響 | 緩解 |
|------|------|------|
| Babel CDN 不可用 | 完全無法使用 | 可改為本地打包 Babel |
| esm.sh 不可用 | 第三方套件無法載入 | React 仍可運作；可加入備選 CDN |
| 複雜 JSX 編譯失敗 | 特定檔案無法渲染 | 錯誤面板提示；逐步改善正則 |
