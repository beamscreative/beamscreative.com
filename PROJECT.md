# BEAMS Creative - Webflow Project

## Project Information

| Property | Value |
|----------|-------|
| **Site Name** | BEAMS Creative |
| **Site ID** | `65251aa22981fa2f54bc8129` |
| **Platform** | Webflow |
| **Repository** | beamscreative.com |

## Webflow MCP Integration

MCP 配置檔位於 `.cursor/mcp.json`，已連接到 Webflow MCP 伺服器。

### 使用方式

1. 確保 Cursor 已授權 Webflow 帳戶
2. 在 Webflow Designer 中啟動 MCP Bridge App
3. 使用自然語言指令操作網站

## Pages

| Page Name | Page ID | Slug | Path | Type |
|-----------|---------|------|------|------|
| **Home** | `` | - | `/` | Static |
| **Works** | `654dddb7fac1a92339fe4eae` | `works` | `/works` | Static |
| **Works Template** | `654dddb7fac1a92339fe4ea8` | `detail_works` | `/works/[slug]` | CMS Template |
| **Works-categories Template** | `654dddb7fac1a92339fe4ea9` | `detail_works-categories` | `/works-categories/[slug]` | CMS Template |
| **About** | `654dddb7fac1a92339fe4ea3` | `about` | `/about` | Static |
| **Insight** | `69088d9226e4a435f5e21c9e` | `insight` | `/insight` | Static |
| **Insights Template** | `6908905f9e6b6881d76beb7e` | `detail_insight` | `/insight/[slug]` | CMS Template |
| **404** | `654dddb7fac1a92339fe4ea2` | `404` | `/404` | Utility |
| **Password** | `654dddb7fac1a92339fe4ea1` | `401` | `/401` | Utility |
| **Style Guide** | `654dddb7fac1a92339fe4ead` | `style-guide` | `/admin/style-guide` | Admin |
| **Licences** | `654dddb7fac1a92339fe4eac` | `licences` | `/admin/licences` | Admin |

### CMS Collections

| Collection | Collection ID | Template Page |
|------------|---------------|---------------|
| Works | `654dddb7fac1a92339fe4eeb` | Works Template |
| Works Categories | `654dddb7fac1a92339fe4ed1` | Works-categories Template |
| Insights | `6908905f9e6b6881d76beb6f` | Insights Template |

## Project Structure

```
beamscreative.com/
├── .cursor/
│   └── mcp.json          # Webflow MCP 配置
├── modules/
│   ├── scroll-lock.js    # 滾動鎖定模組
│   └── scroll-smoother.js # 平滑滾動模組
├── hero-project.js       # 首頁 Hero 輪播
├── mobile-menu.js        # 手機選單
├── pop-up-lightbox.js    # 彈出燈箱
├── work-detail.js        # 作品詳情頁
├── work-page.js          # 作品列表頁
└── PROJECT.md            # 專案資訊（本文件）
```

## Custom Scripts

### hero-project.js
首頁 Hero 區塊的輪播功能，支援：
- 自動背景色過渡
- 桌面版點擊切換
- 手機版滑動/滾動切換
- 導航點同步

### work-detail.js / work-page.js
作品頁面相關的互動腳本

### modules/
可重用的功能模組：
- `scroll-lock.js` - 控制頁面滾動鎖定
- `scroll-smoother.js` - GSAP ScrollSmoother 整合

## Dependencies

- **GSAP** - 動畫庫（透過 Webflow 或 CDN 載入）

## Notes

- 所有 JavaScript 檔案透過 Webflow 的 Custom Code 功能載入
- 使用 GitHub 進行版本控制和備份
654dddb7fac1a92339fe4ea0