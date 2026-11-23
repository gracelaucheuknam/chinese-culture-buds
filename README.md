# 童心樂中華

給香港 K1 幼兒學習中華文化的 Web App（APSS 資助項目）。

純前端靜態網站：Vite + React 18 + TypeScript + Framer Motion + Howler。  
開發規格見 [`SPEC.md`](./SPEC.md)。

## 開始

```bash
npm install
npm run dev
```

本機預設：http://127.0.0.1:5173/

### 主要畫面（hash 路由）

| Hash | 畫面 |
|---|---|
| `#start` | 開始畫面 |
| `#avatar` | 建立角色 |
| `#map` | 節日地圖 |
| `#midautumn` / `#dragonboat` | 主題首頁 |
| `#midautumn-ma_story` 等 | 活動 |
| `#stickers` | 貼紙簿 |
| `#parents` | 家長／老師專區 |
| `#dev` | 引擎測試頁 |

## Scripts

| 指令 | 說明 |
|---|---|
| `npm run dev` | 本機開發 |
| `npm run build` | 產出 `dist/` |
| `npm run preview` | 預覽 build |
| `npm run lint` | Oxlint |
| `npm run format` | Prettier |
| `npm run export-lines` | 匯出對白 CSV → `lines-export.csv` |

## 部署（GitHub Pages）

推上 `main` 之後，`.github/workflows/deploy-pages.yml` 會自動 build 同部署去 https://ccb-hk.github.io/chinese-culture-buds/ 。

**第一次要設定一次**：repo → Settings → Pages → Build and deployment → Source 揀 **GitHub Actions**。
如果揀咗「Deploy from a branch」，GitHub 會直接派未 build 嘅 `index.html`，網站就會一片空白。

部署後可以喺 repo 嘅 Actions 分頁睇 “Deploy to GitHub Pages” 有冇變綠色。

## 部署（Vercel，後備）

已包含 `vercel.json`（SPA rewrite + 靜態資源快取）。本機 build 後 `dist/` 約小於 1 MB（不含之後加入嘅音檔）。

**方法 A：CLI**

```bash
npx vercel login
npm run build
npx vercel --prod
```

**方法 B：網頁**  
去 [vercel.com](https://vercel.com) Import GitHub／本機專案，Framework 選 Vite，輸出目錄 `dist`。

部署完成後用 iPad Safari 打開 Production URL 做驗收。

## 如何新增主題

1. 新增 `src/content/themes/{id}.ts`（參考 `midautumn.ts`／`newyear.ts`）
2. 喺 `src/content/themes/index.ts` 註冊
3. 新增對白 `src/content/lines/{id}.ts`，並喺 `lines/index.ts` `registerLines`
4. 若有故事：`src/content/stories/{id}.ts`，喺 `stories/index.ts` 註冊
5. 美術放到 `public/assets/...`（見下）
6. 地圖 pin／貼紙檔名對應 `map/pin_{id}.svg`、`stickers/{id}.svg`
7. 活動類型可重用：`story` / `lantern` / `puzzle` / `zongzi` / `race`（見 `ActivityScreen.tsx`）

`coming_soon` 主題只需空殼設定檔，地圖會自動顯示鎖同語音提示。

## Firefly 新圖

農曆新年、飲茶同十二生肖全身圖嘅檔名同 prompt 見 [`design/firefly-prompts.md`](./design/firefly-prompts.md)。未放圖之前會顯示文字臨時卡，照樣玩得。

## 如何替換美術

開發中用 SVG 佔位；正式美術**直接覆蓋同名檔**即可，無需改程式。

```
public/assets/
  avatar/body|outfit|head/...
  characters/{puff,dongdong,houyi,change,quyuan}.svg
  map/map_bg.svg  map/pin_*.svg
  midautumn/...   dragonboat/...
  stickers/*.svg
```

所有路徑經 `assetPath()`（`src/engine/assets.ts`）。若改用 PNG／WebP，保持路徑或只改 helper 副檔名規則。

建議：單張圖盡量壓縮；首次載入（不含音檔）目標小於 2 MB。

## 如何加入音檔

1. 跑 `npm run export-lines` 取得 `lineId,yue,pu`
2. 用 ElevenLabs 等生成 mp3
3. 放到：
   - `public/audio/yue/{lineId}.mp3`
   - `public/audio/pu/{lineId}.mp3`
   - `public/audio/sfx/{tap,snap,success,cheer,drum,...}.mp3`
   - `public/audio/bgm/{track}.mp3`
4. App 會優先播 mp3；缺檔自動 fallback TTS（粵 `zh-HK`／普 `zh-CN`）或合成音效

含 `{name}` 嘅句子會用 TTS 讀出名字；`audioText` 係無名字嘅預錄音版本。

## 解鎖模式

`src/config/access.ts`：

- `free_all`（預設）：全部開放（Beta／上線初期）
- `trial_survey`：每主題前 N 項免費，其餘經家長鎖＋問卷
- `paid`：其餘顯示「敬請期待」（未接付款）

問卷 URL：`src/config/app.ts` → `surveyUrl`

## 進度儲存

本機 `localStorage` key：`tsl_progress_v1`（名字、頭像、完成活動、貼紙、設定）。  
失敗（例如私密瀏覽）時 App 仍可玩，只係唔會記住進度。

## 開發進度

- [x] Phase 0–7（設置 → 引擎 → 角色地圖 → 故事 → 中秋遊戲 → 端午 → 家長專區 → 打磨部署）

Phase 7 已備好載入畫面、錯誤邊界、轉場、程式碼分割、`vercel.json` 同完整 README；正式 Vercel URL 需你本機 `vercel login` 後部署。
