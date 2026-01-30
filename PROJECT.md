# BEAMS Creative - Webflow Project

## Project Information

| Property | Value |
|----------|-------|
| **Site Name** | BEAMS Creative |
| **Site ID** | `65251aa22981fa2f54bc8129` |
| **Platform** | Webflow |
| **Repository** | beamscreative.com |
| **GitHub Pages URL** | `https://beamscreative.github.io/beamscreative.com/` |

## Project Structure

```
beamscreative.com/
├── src/
│   ├── modules/                    # 共用模組
│   │   ├── scroll-smoother.js      # ScrollSmoother 響應式封裝
│   │   ├── scroll-lock.js          # 滾動鎖定控制
│   │   └── lightbox.js             # 圖片燈箱功能
│   │
│   ├── components/                 # 共用組件
│   │   └── mobile-menu.js          # 手機選單動畫
│   │
│   ├── pages/                      # 頁面專屬腳本
│   │   ├── home.js                 # Home 頁面
│   │   ├── works.js                # Works 列表頁
│   │   ├── works-detail.js         # Works 詳情頁
│   │   ├── works-category.js       # Works 分類頁
│   │   ├── about.js                # About 頁面
│   │   ├── insight.js              # Insight 列表頁
│   │   └── insight-detail.js       # Insight 詳情頁
│   │
│   └── global.js                   # 全站入口 (載入共用組件)
│
├── dist/                           # Build 輸出 (GitHub Pages)
│   ├── global.min.js
│   ├── home.min.js
│   ├── works.min.js
│   └── ...
│
├── .github/
│   └── workflows/
│       └── deploy.yml              # 自動部署 GitHub Pages
│
├── package.json                    # NPM 配置
├── vite.config.js                  # Vite 構建配置
└── PROJECT.md                      # 本文件
```

## Pages 與 Scripts 對應表

| Page | Page ID | Path | Script | 功能 |
|------|---------|------|--------|------|
| Home | `654dddb7fac1a92339fe4ea0` | `/` | `home.min.js` | Hero 輪播、ScrollTrigger |
| Works | `654dddb7fac1a92339fe4eae` | `/works` | `works.min.js` | 手機水平滾動 |
| Works Template | `654dddb7fac1a92339fe4ea8` | `/works/[slug]` | `works-detail.min.js` | Lightbox、Reader popup |
| Works-categories | `654dddb7fac1a92339fe4ea9` | `/works-categories/[slug]` | `works-category.min.js` | - |
| About | `654dddb7fac1a92339fe4ea3` | `/about` | `about.min.js` | - |
| Insight | `69088d9226e4a435f5e21c9e` | `/insight` | `insight.min.js` | - |
| Insights Template | `6908905f9e6b6881d76beb7e` | `/insight/[slug]` | `insight-detail.min.js` | - |
| 404 | `654dddb7fac1a92339fe4ea2` | `/404` | (global only) | - |
| Password | `654dddb7fac1a92339fe4ea1` | `/401` | (global only) | - |

### CMS Collections

| Collection | Collection ID | Template Page |
|------------|---------------|---------------|
| Works | `654dddb7fac1a92339fe4eeb` | Works Template |
| Works Categories | `654dddb7fac1a92339fe4ed1` | Works-categories Template |
| Insights | `6908905f9e6b6881d76beb6f` | Insights Template |

## Development

### 安裝依賴

```bash
npm install
```

### 本地開發

```bash
npm run dev
```

### 生產構建

```bash
npm run build
```

構建後的檔案會輸出到 `dist/` 目錄。

## Webflow Integration

### Step 1: Site-wide Scripts (Project Settings)

在 Webflow **Project Settings > Custom Code > Footer Code** 加入：

```html
<!-- GSAP (required) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollSmoother.min.js"></script>

<!-- Global Scripts (全站共用) -->
<script src="https://beamscreative.github.io/beamscreative.com/global.min.js"></script>
```

### Step 2: Page-specific Scripts (Page Settings)

在各頁面的 **Page Settings > Custom Code > Before </body> tag** 加入對應腳本：

**Home 頁面:**
```html
<script src="https://beamscreative.github.io/beamscreative.com/home.min.js"></script>
```

**Works 頁面:**
```html
<script src="https://beamscreative.github.io/beamscreative.com/works.min.js"></script>
```

**Works Detail 頁面 (Template):**
```html
<script src="https://beamscreative.github.io/beamscreative.com/works-detail.min.js"></script>
```

## GitHub Pages Setup

### 方法一：自動部署 (推薦)

1. 在 GitHub Repository Settings > Pages 設定：
   - Source: **GitHub Actions**

2. Push 到 `main` branch 會自動觸發 build 和 deploy

### 方法二：手動部署

1. 本地執行 `npm run build`
2. Commit `dist/` 目錄
3. 在 GitHub Pages 設定：
   - Source: **Deploy from a branch**
   - Branch: `main`
   - Folder: `/dist`

## Workflow

```
1. 在 Cursor 編輯 src/ 下的檔案
2. 執行 npm run build (或 push 後自動 build)
3. Commit & Push 到 GitHub
4. GitHub Actions 自動部署到 GitHub Pages
5. Webflow 網站自動載入最新腳本
6. 重新整理 Webflow 頁面查看效果
```

## Modules

### scroll-smoother.js
- `initResponsiveScrollSmoother(options)` - 響應式初始化 ScrollSmoother
- `getScrollSmoother()` - 取得 ScrollSmoother 實例
- `pauseScrollSmoother(paused)` - 暫停/恢復 ScrollSmoother

### scroll-lock.js
- `lockScroll()` - 鎖定頁面滾動
- `unlockScroll()` - 解鎖頁面滾動

### lightbox.js
- `initLightbox(options)` - 初始化圖片燈箱

## Dependencies

- **GSAP** - 動畫庫 (透過 CDN 載入)
- **Vite** - 構建工具 (開發依賴)
- **Terser** - JS 壓縮 (開發依賴)

## Notes

- 所有 JavaScript 透過 GitHub Pages 提供，Webflow 以 `<script>` 標籤載入
- GSAP 相關插件必須透過 CDN 載入，因為需要 Club GreenSock 許可證
- `dist/` 目錄由 GitHub Actions 自動產生，不需要手動 commit
- 修改後 push 即可，網站會自動更新（可能需要等待幾分鐘的 CDN 快取）
