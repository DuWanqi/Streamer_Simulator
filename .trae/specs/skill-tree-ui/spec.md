# 技能树页面 UI 实现规格

## Why
当前游戏的属性提升页面（attribute_panel）使用深色现代风格的卡片式布局，缺乏视觉吸引力和游戏沉浸感。需要根据设计稿实现一个温馨可爱二次元风格的技能树页面，以提升游戏体验和用户粘性。

## What Changes
- **新增** `renderSkillTree()` 方法替代现有的 `renderAttributePanel()` 方法，作为技能树页面的渲染入口
- **新增** 技能树数据模型定义（`SkillTreeConfig.ts`），包含4个维度、每层节点的配置数据
- **新增** 技能树节点组件的HTML/CSS模板，采用温馨可爱二次元风格（粉色系、圆角、可爱图标）
- **修改** `GameStateManager` 场景路由，将 `attribute_panel` 场景映射到新的 `renderSkillTree` 方法
- **保留** 原有 `renderAttributePanel` 方法不删除（标记为 deprecated），确保向后兼容
- **暂不实现** 节点解锁逻辑和赋能效果系统（下一步讨论）

## Impact
- Affected specs: 无现有spec受影响
- Affected code:
  - `src/game/Game.ts` — 新增 renderSkillTree() 方法（约300-400行），修改场景路由
  - `src/game/GameConfig.ts` — 新增技能树配置常量（或新建独立配置文件）
  - `src/game/GameStateManager.ts` — 可能需调整场景映射
  - `src/game/PlayerData.ts` — 可能需扩展状态字段（技能点、已解锁节点记录）

## ADDED Requirements

### Requirement: 技能树页面整体布局
系统 SHALL 提供一个全屏技能树页面，包含以下区域：
1. **顶部导航栏**：显示游戏标题"主播模拟器"、资源信息（粉丝数/上限、金币、人气）、导航按钮（参拜、粉丝栏、人粉）
2. **技能点计数器**：居中显示当前可用技能点数量（如 "技能点 20"）
3. **技能树主体区域**：4个维度的分支结构，从中心角色向外辐射
4. **底部操作栏**：返回/确认按钮

### Requirement: 视觉风格规范
页面 SHALL 采用以下视觉风格：
- **背景**：浅粉色渐变 + 闪烁星光粒子效果 + 模糊房间背景图
- **配色方案**：主色调粉色(#ffc0cb/#ffb6c1)、辅助色淡蓝(#b0e0e6)、淡紫(#e6e6fa)、暖黄(#fffacd)
- **节点样式**：圆角方形/六边形卡片，带可爱图标、名称标签、边框发光效果
- **连接线**：彩色曲线连接各层级节点，区分不同维度（口才=粉红、外貌=橙粉、才艺=紫色、知识=蓝色）
- **字体**：圆润可爱的中文字体（优先使用系统圆体/黑体回退）
- **动画效果**：节点hover放大、解锁时闪光、连线流动动画

### Requirement: 技能树数据结构
系统 SHALL 定义以下技能树数据模型：

```
SkillDimension（技能维度）:
  - id: string (eloquence/appearance/talent/knowledge)
  - name: string (口才/外貌/才艺/知识)
  - icon: string (emoji或图标标识)
  - color: string (主题色)
  - position: { x: number, y: number } (在画布中的相对位置)

SkillNode（技能节点）:
  - id: string (唯一标识)
  - name: string (节点名称)
  - icon: string (图标)
  - tier: number (层级: 1=基础, 2=进阶, 3=终极)
  - dimensionId: string (所属维度)
  - description: string (赋能效果描述)
  - unlockCondition: UnlockCondition (解锁条件)
  - state: 'locked' | 'available' | 'unlocked' (当前状态)

UnlockCondition（解锁条件）:
  - requiredNodes: string[] (前置节点ID列表)
  - minFollowers?: number (最低粉丝量要求)
  - requiredTasks?: string[] (需要完成的任务)
```

### Requirement: 四大维度技能节点定义
系统 SHALL 按照游戏设定文档定义以下技能节点：

#### 维度一：口才维度·嘴炮输出营（粉红色系 #ff69b4）
- 基础层：嘴瓢急救术、情绪开关
- 进阶层：反黑嘴替、带货嘴功
- 终极层：嘴炮天花板、粉丝动员术

#### 维度二：外貌维度·颜值buff馆（橙粉色系 #ffa07a）
- 基础层：颜值打底术、镜头显眼包
- 进阶层：风格切换器、开盒防护盾
- 终极层：流量颜值王、身份隐身术

#### 维度三：才艺维度·内容整活局（紫色系 #da70d6）
- 基础层：游戏入门仔、才艺小萌新、整活小萌新（三选一初始方向）
- 进阶层：游戏大神手、才艺显眼包、内容缝合怪、狠活小能手
- 终极层：游戏天花板、才艺卷王、整活狠活天花板

#### 维度四：知识维度·避坑生存课（蓝色系 #87ceeb）
- 基础层：平台避雷指南、谣言过滤器
- 进阶层：黑料鉴别师、合作排雷术、线索挖掘机
- 终极层：真相扒手、彩蛋解锁师

### Requirement: 技能树交互行为
- **WHEN** 用户点击一个可解锁的技能节点
- **THEN** 显示该节点的详细信息弹窗（名称、描述、解锁条件、确认按钮）
- **WHEN** 用户在弹窗中确认解锁
- **THEN** 扣除对应技能点，节点状态变为unlocked，播放解锁动画，更新相连节点的可用状态
- **WHEN** 用户点击已解锁节点
- **THEN** 显示该节点的赋能效果详情（只读模式）
- **WHEN** 用户点击锁定节点
- **THEN** 显示锁定原因（缺少前置节点/技能点不足等）

### Requirement: 页面入口与出口
- **WHEN** 从 main_hub 点击"属性升级"按钮进入
- **THEN** 渲染技能树页面，显示当前玩家进度
- **WHEN** 点击顶部关闭按钮或底部"完成"按钮
- **THEN** 返回 main_hub 场景，保持数据一致性

### Requirement: 响应式布局
- **WHEN** 在桌面端（>=1200px）显示
- **THEN** 技能树完整展示4个维度分支，中心角色清晰可见
- **WHEN** 在平板端（768px-1199px）显示
- **THEN** 缩小节点尺寸和间距，保持完整可见
- **WHEN** 在移动端（<768px）显示
- **THEN** 支持拖拽/缩放查看技能树，或切换为列表视图

## MODIFIED Requirements
无（纯新增功能）

## REMOVED Requirements
无
