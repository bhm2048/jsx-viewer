# JSX Viewer

一個輕量的純前端 React 應用程式，用於即時渲染由 Claude Code 產生的 JSX 說明文件。

## 為��麼需要這個工具？

使用 Claude Code  產生的 JSX 檔案通常是**自包含的 React 元件**，包含豐富的視覺化內容（動畫、圖表、互動式卡片等）。這些檔案無法直接在瀏覽器中開啟，傳統上需要手動建立 React 專案才能預覽。

JSX Viewer 解決了這個問題 —— **拖放即渲染**。

## 功能

- **即時渲染** — 拖放 `.jsx` 檔案，在瀏覽器中立即看到渲染結果
- **多檔頁籤** — 同時開啟多個檔案，點擊切換
- **第三方套件支援** — 自動透過 esm.sh CDN 載入 `framer-motion` 等套件
- **完全隔離** — 每個檔案在獨立 iframe 中渲染，不會互相干擾
- **錯誤提示** — 編譯失敗時顯示清楚的錯誤訊息
- **零後端** — 純前端，無需伺服器，無需上傳檔案

## 快速開始

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

開啟 `http://localhost:5173`，將 `.jsx` 檔案拖入左側拖放區即可。

## 技術棧

| 技術 | 用途 |
|------|------|
| [Vite](https://vite.dev/) | 建置工具與開發伺服器 |
| [React 18](https://react.dev/) | UI 框架 |
| [Babel Standalone](https://babeljs.io/docs/babel-standalone) | 瀏覽���端 JSX 編譯 |
| [esm.sh](https://esm.sh/) | 第三方套件 CDN |
| [Import Maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) | 瀏覽器原生模組解析 |

## 專案結構

```
src/
  main.jsx                  # 進入點
  App.jsx                   # 根版面（sidebar + render area）
  App.css                   # 深色主題樣式
  state/
    useFileStore.jsx        # 狀態管理（Context + useReducer）
  components/
    Sidebar.jsx             # 側邊欄（Tab 列表 + 拖放區）
    TabItem.jsx             # 單一 Tab（檔名 + 關閉按鈕）
    DropZone.jsx            # 拖放區 + Browse 按鈕
    RenderPane.jsx          # 核心：Babel 編譯 + iframe 渲染
    ErrorPanel.jsx          # 錯誤顯示面板
  iframe/
    importResolver.js       # import 語句解析 + import map 產生
    template.js             # iframe srcdoc HTML 模板產生器
```

## 支援的 JSX 檔案格式

```jsx
import { useState } from "react";
// 支援第三方套件 import
// import { motion } from "framer-motion";

export default function MyComponent() {
  const [count, setCount] = useState(0);
  return <div>Hello World: {count}</div>;
}
```

**要求：**
- 必須有 `export default function` 或 `export default ComponentName`
- 所有元件定義在同一檔案內（自包���）
- `import` 語句必須是單行格式

## 瀏覽器相容性

需要支援 [Import Maps](https://caniuse.com/import-maps) 的瀏覽器：
- Chrome 89+
- Firefox 108+
- Safari 16.4+
- Edge 89+

## 相關文件

- [操作手���](docs/操作手冊.md) — 詳細使用說明
- [設計目的](docs/設計目的.md) — ���什麼這樣設計
- [技術架構](docs/技術架構.md) ��� 渲染管線與架構解析
- [OpenSpec 設計文件](openspec/changes/jsx-viewer-mvp/design.md) — ��構化設計記錄
