# Firefly 圖片清單

App 已經預留好以下檔案位置。整好圖之後，用**指定檔名**放入 `public/assets/` 對應資料夾，重新整理網頁就會自動換上，唔使改 code。未放圖之前，App 會顯示有文字嘅臨時卡，照樣玩得。

## 共通規格

- 格式：`.webp`（Firefly 匯出 PNG 之後，可以用 [Squoosh](https://squoosh.app) 轉 WebP，品質 80）
- 角色、道具：**透明背景**，主體置中，四邊留少少空位
- 背景：1280 × 800，橫向，唔好有文字
- 風格：同現有胖胖、咚咚一致

**風格句（每個 prompt 後面都加上）：**

> soft watercolor children's picture-book illustration, warm pastel colors, rounded cute shapes, gentle outlines, friendly, for 3-4 year old kids, no text, no letters

## 1. 十二生肖（每隻一張獨立全身圖）

位置：`public/assets/avatar/zodiac/`，尺寸 768 × 768，透明背景。

Prompt 範本：

> a cute chibi baby **{動物}** character standing, full body, big head small body, smiling, facing viewer, simple pose, isolated on transparent background, + 風格句

| 檔名           | 動物 | 英文填入 {動物}                    |
| -------------- | ---- | ---------------------------------- |
| `rat.webp`     | 鼠   | mouse                              |
| `ox.webp`      | 牛   | ox calf                            |
| `tiger.webp`   | 虎   | tiger cub                          |
| `rabbit.webp`  | 兔   | white bunny                        |
| `dragon.webp`  | 龍   | Chinese dragon (green, soft horns) |
| `snake.webp`   | 蛇   | snake (green, round)               |
| `horse.webp`   | 馬   | pony                               |
| `goat.webp`    | 羊   | goat kid                           |
| `monkey.webp`  | 猴   | monkey                             |
| `rooster.webp` | 雞   | chick / rooster                    |
| `dog.webp`     | 狗   | puppy                              |
| `pig.webp`     | 豬   | piglet                             |

小貼士：12 隻最好用同一個 prompt，只換動物名，再用 Firefly 嘅「Style reference」揀第一張做參考，咁風格先會一致。

## 2. 農曆新年

背景：`public/assets/newyear/story/`（1280 × 800）

| 檔名                    | 內容         | Prompt 重點                                                                                   |
| ----------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `bg_village_night.webp` | 古時村莊夜景 | ancient Chinese village at night, lanterns unlit, starry sky, empty space in the middle       |
| `bg_door.webp`          | 屋企門口     | front door of a Hong Kong home decorated for Lunar New Year, empty wall space beside the door |
| `bg_home.webp`          | 新年客廳     | cosy living room at Lunar New Year, family table with snacks, warm light                      |

道具：`public/assets/newyear/props/`（512 × 512，透明背景）

| 檔名               | 內容   | Prompt 重點                                                             |
| ------------------ | ------ | ----------------------------------------------------------------------- |
| `nian_beast.webp`  | 年獸   | a cute, not scary, Nian beast from Chinese legend, fluffy, one horn     |
| `firecracker.webp` | 炮仗   | a string of red Chinese firecrackers                                    |
| `fai_chun.webp`    | 揮春   | a red diamond-shaped fai chun paper with a gold pattern (no characters) |
| `lantern_red.webp` | 紅燈籠 | a round red Chinese lantern with gold tassel                            |
| `red_packet.webp`  | 利是   | a red packet (lai see) with gold pattern                                |
| `nian_gou.webp`    | 年糕   | a plate of Chinese New Year cake (nian gao)                             |
| `tangerine.webp`   | 年桔   | a small tangerine plant in a pot                                        |

拼圖：`public/assets/newyear/puzzle/`（800 × 800，正方形）

| 檔名            | 內容               |
| --------------- | ------------------ |
| `puzzle_1.webp` | 一家人拜年、派利是 |
| `puzzle_2.webp` | 舞獅               |

## 3. 飲茶

背景：`public/assets/yumcha/story/`（1280 × 800）

| 檔名               | 內容         | Prompt 重點                                                              |
| ------------------ | ------------ | ------------------------------------------------------------------------ |
| `bg_street.webp`   | 茶樓門口街景 | a Hong Kong street outside a traditional Chinese teahouse, morning       |
| `bg_teahouse.webp` | 茶樓入面     | inside a Hong Kong dim sum restaurant, round table, empty seats in front |

道具：`public/assets/yumcha/props/`（512 × 512，透明背景）

| 檔名                | 內容               |
| ------------------- | ------------------ |
| `teapot.webp`       | 茶壺               |
| `teacup.webp`       | 茶杯               |
| `har_gow.webp`      | 蝦餃（蒸籠入面）   |
| `siu_mai.webp`      | 燒賣（蒸籠入面）   |
| `char_siu_bao.webp` | 叉燒包（蒸籠入面） |
| `egg_tart.webp`     | 蛋撻               |
| `cheung_fun.webp`   | 腸粉               |

拼圖：`public/assets/yumcha/puzzle/`（800 × 800，正方形）

| 檔名            | 內容             |
| --------------- | ---------------- |
| `puzzle_1.webp` | 一家人圍住枱飲茶 |
| `puzzle_2.webp` | 一枱點心         |

## 4. 檢查

放好圖之後：

1. `npm run dev`，打開 `#newyear`、`#yumcha` 同 `#avatar`
2. 文字卡應該全部變成圖片
3. 如果仲見到文字卡，即係檔名或者資料夾唔啱
