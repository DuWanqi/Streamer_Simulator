# 主播模拟器 - Streamer Simulator

这是一款AI原生模拟经营游戏。玩家扮演一名小主播，通过直播、提升属性、应对各种事件，最终成为平台顶流！

## 🎮 游戏特点

- **20天挑战**：从不知名小主播成长为名扬海外的顶流
- **4大直播分区**：音乐歌手区、舞蹈区、游戏区、整活搞笑区
- **AI驱动内容**：弹幕、评论、结算评语由AI动态生成
- **丰富事件系统**：土豪打赏、PK挑战、大主播查房、同行互动、MCN机构、舆论事件

## 📁 项目结构

```
2d_game_template/
├── src/
│   ├── main.ts              # 游戏入口
│   ├── game/
│   │   ├── Game.ts          # 游戏主类（场景渲染和事件处理）
│   │   ├── GameConfig.ts    # 游戏配置（阶段、属性、事件定义）
│   │   ├── GameStateManager.ts # 场景状态管理
│   │   └── PlayerData.ts    # 玩家数据模型
│   ├── services/
│   │   ├── AIService.ts     # ⭐ AI服务（Prompt定义在这里）
│   │   └── DefaultContent.ts # 默认内容（无AI时的备用文本）
│   ├── systems/
│   │   └── EventPool.ts     # 事件池系统
│   └── utils/
│       └── helpers.ts       # 工具函数
├── assets/                  # 静态资源
└── stitch/                  # UI设计文件
```

---

## 🤖 AI系统说明

### AI模型

**使用模型**: Google Gemini 2.0 Flash (`gemini-2.0-flash`)

### AI服务位置

**文件路径**: `src/services/AIService.ts`

### AI调用流程（异步预热机制）

根据游戏设计方案，AI调用采用**异步预热机制**，在玩家升级属性期间完成AI响应：

```
1. 每天开始 → 弹出"今日直播计划"输入界面 (stream_planning)
2. 玩家输入直播内容 → 点击"确认计划" → 异步调用AI预热(preheat)
3. 进入主界面(main_hub) → 白天模式，可选择"自我提升"或"开始直播"
4. 属性提升期间 → AI在后台生成弹幕、评论、结算评语
5. 完成升级 → 返回主界面（晚上模式）→ 点击"开始直播" → 直播（AI内容已缓存就绪）
```

**代码位置** (Game.ts - renderStreamPlanning):
```typescript
// 用户确认直播计划时触发异步预热
element.querySelector('#btn-confirm-plan')?.addEventListener('click', async () => {
  const content = textarea.value.trim() || '今天随便播播~';
  this.playerData.setStreamContent(content);
  // 异步调用AI预热（在玩家升级属性期间完成AI响应）
  this.aiService.preheat(content, state.category, this.playerData.getState());
  this.stateManager.changeScene('main_hub');
});
```

**预热函数** (AIService.ts 第154-159行):
```typescript
async preheat(streamContent: string, category: StreamCategory, playerState: PlayerState): Promise<void> {
  await Promise.allSettled([
    this.generateDanmakuAndComments(streamContent, category, playerState),
    this.generateDailySummary(streamContent, category, playerState),
  ]);
}
```

### API调用与缓存

```
用户配置API Key → AIService.setApiKey() → 调用Gemini API → 缓存响应
                                         ↓ 失败/无Key
                                    DefaultContent (备用文本)
```

### Prompt定义位置

所有AI Prompt都定义在 `src/services/AIService.ts` 文件中：

#### 1. 弹幕和评论生成 (第91-93行)

```typescript
const prompt = `你是一个直播弹幕生成器。场景：${categoryName}主播正在直播，内容是："${streamContent}"。
生成20条弹幕和10条评论（JSON格式，搞笑中国互联网风格）：
{"danmaku":["弹幕1",...],"comments":[{"user":"用户名","text":"内容"},...]}`;
```

**功能**：根据直播分区和内容生成弹幕和评论
**输出格式**：JSON，包含 `danmaku` 数组和 `comments` 数组

#### 2. 每日结算评语 (第121-122行)

```typescript
const prompt = `主播模拟器AI裁判。分区：${getCategoryName(category)}，内容：${streamContent || '无'}，关注${playerState.followers}，收入${playerState.income}。
判断直播效果，输出JSON：{"summary":"搞笑评语","followerChange":${50*base}~${300*base},"fanClubChange":${3*base}~${20*base},"incomeChange":${200*base}~${1500*base}}`;
```

**功能**：AI作为"裁判"评估直播效果，生成搞笑评语和数值变化
**输出格式**：JSON，包含 `summary`、`followerChange`、`fanClubChange`、`incomeChange`

#### 3. 未来预测（游戏结束时）(第148-149行)

```typescript
const prompt = `主播模拟器游戏结束。玩家在${getCategoryName(category)}坚持20天，关注${playerState.followers}，收入${playerState.income}。
写一段这位主播的"未来发展"故事（150字，幽默搞笑脑洞大开）`;
```

**功能**：游戏结束时生成玩家的"未来命运"故事
**输出格式**：纯文本（150字左右）

### 备用内容（无AI模式）

**文件路径**: `src/services/DefaultContent.ts`

当用户未配置API Key或API调用失败时，系统会使用此文件中的预设内容：

| 函数 | 用途 |
|------|------|
| `getDanmaku(category)` | 获取随机弹幕 |
| `getRandomComment()` | 获取随机评论 |
| `getDailySummary()` | 获取每日结算评语 |
| `getFuturePrediction()` | 获取未来预测 |
| `getSuddenEvent(type, category)` | 获取突发事件文本（按分区分类） |
| `getUpgradeText(type, stageIndex)` | 获取属性升级提示文本 |

### 突发事件文本

突发事件文本按分区分类，包含丰富的中国互联网梗：

- **音乐区**：虎哥、古风圈、声卡党、翻唱版权等
- **舞蹈区**：韩舞翻跳、广场舞一姐、只因你太美、B站鬼畜等
- **游戏区**：原神、英雄联盟、王者荣耀、米哈游孝子等
- **整活搞笑区**：虎哥、宇将军、青海摇、东北往事、牢大等

---

## 🛠️ 技术栈

- **TypeScript** - 主要开发语言
- **Vite** - 构建工具
- **PixiJS** - 渲染引擎（部分UI使用）
- **HTML/CSS** - 主要UI渲染
- **Google Gemini API** - AI内容生成

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📝 配置API Key

1. 获取 [Google AI Studio](https://aistudio.google.com/) 的 API Key
2. 游戏开始时点击"设置"按钮
3. 输入API Key并保存
4. AI功能即可启用

> 如果不配置API Key，游戏会使用预设的默认文本运行。

---

## 📊 游戏数值设计

### 阶段定义

| 阶段 | 名称 | 等级范围 | 关注量目标 | 直播间人数 |
|------|------|----------|------------|------------|
| 1 | 不知名九流主播 | 1-4 | < 1万 | 10-100 |
| 2 | 小有名气 | 5-8 | 1-10万 | 100-1000 |
| 3 | 百大主播 | 9-12 | 100-200万 | 3000-1万+ |
| 4 | 平台顶流 | 13-16 | 200-1000万 | 5000-2万+ |
| 5 | 名扬海外 | 17+ | 1000-3000万 | 1-3万+ |

### 事件类型

| 事件类型 | 名称 | 影响 |
|----------|------|------|
| big_spender | 土豪打赏 | 正向（粉丝+收入大涨）|
| pk_battle | PK挑战 | 正向（胜率60%）|
| big_streamer_raid | 大主播查房 | 正向 |
| rival_attack | 同行互动 | 正向/负向 |
| mcn_offer | MCN机构 | 正向/负向 |
| slander | 舆论事件 | 负向 |

---

## 📄 License

MIT License
