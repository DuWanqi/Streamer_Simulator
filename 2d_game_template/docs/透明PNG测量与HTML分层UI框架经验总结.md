# 透明PNG测量与HTML分层UI框架 — 经验总结

> 日期：2026-04-23
> 项目：主播模拟器 (Streamer Simulator)
> 场景：设计师交付了一张带透明镂空的直播间UI PNG，需要精确测量镂空区域并生成匹配的HTML分层框架

## 一、问题背景

设计师交付了 `直播间UI挖空真.png`（1672x941px），这是一张直播间UI的**透明PNG overlay**：
- **不透明部分**：边框、装饰元素（卡通角色、蝴蝶结、云朵等）
- **透明部分（镂空洞）**：3个区域，分别是直播画面区、评论区、公告栏

目标：让透明PNG作为最顶层，3个镂空区域露出底层的HTML内容div。

## 二、走过的弯路

### 弯路1：用AI视觉分析测量像素

```
尝试次数：3次
结果：每次测量数据不同，且互相矛盾

第1次：左区域 756px宽（结束于x=782），右区域从x=808开始
第2次：某些高度值超过图片总高度941px（不可能）
第3次：又有不同的数值
```

**教训**：AI视觉模型无法精确读取像素坐标。它"看"到的是语义，不是像素。对于需要像素级精度的任务，**必须用代码直接读取像素数据**。

### 弯路2：浏览器内canvas + BFS flood-fill

```
方案：HTML加载PNG到canvas，用BFS flood-fill找连通透明区域
结果：页面卡死，无限loading
```

**根因**：BFS的 `queue.shift()` 是 O(n) 操作。1672×941 = 157万像素，大透明区域可能有几十万个像素入队，每次 `shift()` 都要移动整个数组，总复杂度变成 O(n²)，浏览器直接卡死。

**教训**：对百万级像素的连通分量分析，必须用 **Union-Find（并查集）**，时间复杂度 O(n·α(n)) ≈ O(n)，瞬间完成。

### 弯路3：file:// 协议下 canvas 跨域报错

```
错误：SecurityError: Failed to execute 'getImageData' on 'CanvasRenderingContext2D'
原因：file:// 协议下，即使是本地图片也被视为跨域
```

**教训**：需要读取像素数据的工具，不要做成浏览器HTML，用 **Node.js 脚本** 直接读文件。不依赖浏览器，不受CORS限制。

### 弯路4：background: cover 导致对不齐

```
最初方案：100vw × 100vh容器 + background: cover
问题：cover会裁剪图片以填满视口，百分比坐标不再对应图片像素位置
```

**教训**：当需要百分比定位匹配背景图的特定位置时：
- 容器必须和图片**同宽高比**
- 背景用 `100% 100%` 而不是 `cover`
- 或者直接用**固定像素容器**（与PNG同尺寸）

## 三、最终方案

### 架构：三层分离

```
┌─────────────────────────────────────────────┐
│  顶层 (z-index: 10)                         │
│  透明PNG overlay                             │
│  background-size: 100% 100%                  │
│  pointer-events: none ← 关键：点击穿透       │
├─────────────────────────────────────────────┤
│  底层 (z-index: 1)                          │
│  精确定位的div容器，透过镂空洞显示            │
├─────────────────────────────────────────────┤
│  主容器：与PNG同尺寸 (1672×941px)            │
└─────────────────────────────────────────────┘
```

核心CSS：

```css
/* 主容器 - 与PNG同尺寸 */
.live-container { width: 1672px; height: 941px; position: relative; overflow: hidden; }

/* 底层内容 - 每个镂空洞一个div */
#live-area { position: absolute; top: 163px; left: 33px; width: 1256px; height: 701px; z-index: 1; }
#chat-area { position: absolute; top: 172px; left: 1304px; width: 326px; height: 652px; z-index: 1; }
#title-bar { position: absolute; top: 48px; left: 273px; width: 915px; height: 73px; z-index: 1; }

/* 顶层overlay - 透明PNG覆盖 */
.ui-overlay {
    position: absolute; inset: 0;
    background-image: url('透明PNG.png');
    background-size: 100% 100%;
    pointer-events: none; /* 关键！ */
    z-index: 10;
}
```

### 测量工具：Node.js + Union-Find

**文件**：`scripts/measure-png.mjs`

**原理**：
1. `pngjs` 读取PNG的RGBA像素数据
2. 遍历所有像素，标记 alpha < 128 的为透明
3. 4-连通 Union-Find 合并相邻透明像素
4. 按连通分量根节点分组，计算每个区域的包围盒 (minX, minY, maxX, maxY)
5. 过滤噪点（面积 < 5000px），按面积排序，自动分类

**运行**：
```bash
cd 2d_game_template
npm install --save-dev pngjs   # 首次需要
node scripts/measure-png.mjs   # 瞬间完成
```

**实测结果**：
```
图片尺寸: 1672 x 941px
区域1 (■ 直播画面):  top:163 left:33  1256×701  (781,540像素)
区域2 (↓ 竖直侧栏):  top:172 left:1304  326×652  (196,459像素)
区域3 (→ 水平公告栏): top:48 left:273  915×73   (62,464像素)
```

## 四、可复用的 Skill

已封装为 Claude Code skill `measure-png-ui`，可通过 `/measure-png-ui` 触发。

**Skill 位置**：`.agents/skills/measure-png-ui/SKILL.md`

**适用场景**：
- 任何「透明PNG overlay + 底层内容div」的分层UI需求
- 设计师交付了带镂空的UI切图
- 需要精确知道PNG透明区域的像素坐标

## 五、关键经验清单

| # | 经验 | 适用范围 |
|---|------|----------|
| 1 | 像素级精度任务不要靠AI视觉，用代码读像素 | 所有图片测量 |
| 2 | 百万级数据量的连通分量用Union-Find，不要BFS | 图像分析、聚类 |
| 3 | 需要读像素的工具用Node.js，不要做浏览器HTML | 图片分析工具 |
| 4 | 透明PNG做UI overlay：`pointer-events: none` 是关键 | 分层UI |
| 5 | 定位匹配背景图：容器必须同宽高比 + `100% 100%` | 精确定位 |
| 6 | CSS变量集中管理尺寸，方便调参 | 所有固定尺寸UI |
