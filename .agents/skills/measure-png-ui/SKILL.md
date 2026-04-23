---
name: measure-png-ui
description: 测量透明PNG的镂空区域并生成HTML UI框架。输入一张带透明镂空的PNG图片，自动用Union-Find算法扫描像素级精确的透明区域边界，然后生成对应的HTML文件——透明PNG作为顶层overlay（pointer-events:none），底层放置匹配镂空位置的div容器。触发词：测量透明PNG、镂空区域、UI框架、透明overlay、测量切图、PNG to HTML。
---

# measure-png-ui · 透明PNG测量 & HTML框架生成

给定一张带透明镂空区域的PNG图片，自动生成精确匹配镂空位置的HTML UI框架。

## 适用场景

- 设计师交付了带镂空的UI overlay PNG（边框+装饰层）
- 需要把透明PNG叠在内容层上方，镂空区域透出下方内容
- 任何「透明PNG overlay + 底层内容div」的分层UI需求

## 工作流

### Step 1：确认输入

向用户确认以下信息：
- **PNG文件路径**：透明PNG的绝对路径
- **画布尺寸**：通常就是PNG的实际像素尺寸（脚本会自动读取）
- **区域命名**：每个镂空区域的用途和CSS id（如 `#live-area`, `#chat-area`, `#title-bar`）

如果用户没给命名，脚本会按面积和宽高比自动分类：
- `宽高比 > 2` → 水平公告栏
- `宽高比 < 0.6` → 竖直侧栏
- 面积最大 → 主内容区
- 其余 → 评论区

### Step 2：运行测量脚本

项目内已内置测量脚本：`2d_game_template/scripts/measure-png.mjs`

**前提**：需要 `pngjs` 依赖（`npm install --save-dev pngjs`）

**运行方式**：

```bash
cd 2d_game_template
node scripts/measure-png.mjs
```

如果需要测量其他PNG文件，修改脚本中 `filePath` 变量指向目标文件。

**脚本原理**：
1. 用 `pngjs` 读取PNG像素数据（RGBA）
2. 标记所有 alpha < 128 的像素为透明
3. 用 Union-Find（并查集）做4-连通分量分析，O(n) 时间
4. 过滤面积 < 5000 像素的噪点
5. 按面积排序，自动分类，输出每个区域的 `top/left/width/height`

### Step 3：生成HTML框架

用测量结果生成单文件HTML，架构如下：

```
┌─────────────────────────────────────────┐
│  顶层 (z-index: 10)                     │
│  透明PNG 作为 background-image           │
│  pointer-events: none（点击穿透）        │
├─────────────────────────────────────────┤
│  底层 (z-index: 1)                      │
│  ┌──────┐  ┌──────┐  ┌──────────┐      │
│  │ div1  │  │ div2 │  │  div3    │      │
│  └──────┘  └──────┘  └──────────┘      │
├─────────────────────────────────────────┤
│  主容器：与PNG同尺寸（如1672x941）        │
└─────────────────────────────────────────┘
```

**HTML模板要点**：

1. **主容器** `div.live-container`
   - `width` / `height` 等于PNG实际像素尺寸
   - `position: relative; overflow: hidden`
   - 居中于视口（`display:flex; align-items:center; justify-content:center`）

2. **底层内容div**（每个镂空区域一个）
   - `position: absolute`
   - `top/left/width/height` 使用测量脚本的精确像素值
   - 用CSS变量集中管理尺寸（方便调参）：
     ```css
     :root {
       --area1-top: 48px; --area1-left: 273px;
       --area1-width: 915px; --area1-height: 73px;
     }
     ```
   - `z-index: 1`
   - `background: transparent` 或自定义背景色

3. **顶层overlay** `div.ui-overlay`
   - `position: absolute; inset: 0`
   - `background-image: url('透明PNG路径'); background-size: 100% 100%`
   - **`pointer-events: none`** — 关键属性，让鼠标事件穿透到底层
   - `z-index: 10`

### Step 4：验证

1. 通过dev server打开HTML（`file://` 协议会有跨域限制，但此方案不依赖canvas所以实际无影响）
2. 检查底层div是否精确对齐透明PNG的镂空区域
3. 如有偏差，调整CSS变量即可

## 踩坑记录

| 坑 | 原因 | 解决 |
|---|---|---|
| AI视觉测量不准确 | AI无法精确读取像素坐标，每次结果不同 | 用代码逐像素扫描，不靠视觉 |
| BFS flood-fill 卡死 | `queue.shift()` 是O(n)，百万像素变成O(n²) | 用Union-Find并查集，O(n·α(n)) |
| canvas getImageData跨域报错 | `file://` 协议下图片被当成跨域 | 改用Node.js脚本读文件，绕过浏览器 |
| `background: cover` 对不齐 | cover会裁剪/拉伸，百分比不对应像素 | 用 `100% 100%` + 固定尺寸容器 |
| 100vw/100vh容器错位 | 视口宽高比与图片不一致 | 用固定像素容器，与PNG尺寸完全一致 |

## 文件清单

| 文件 | 用途 |
|------|------|
| `scripts/measure-png.mjs` | PNG像素测量脚本（Union-Find） |
| `prepared_assets/直播间UI框架.html` | 本skill生成的示例HTML框架 |
