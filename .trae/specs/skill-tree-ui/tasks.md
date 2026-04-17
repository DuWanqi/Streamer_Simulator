# Tasks

- [x] Task 1: 创建技能树数据配置文件 `SkillTreeConfig.ts`

  - [x] 1.1 定义 SkillDimension、SkillNode、UnlockCondition 等 TypeScript 接口

  - [x] 1.2 按照四大维度（口才/外貌/才艺/知识）创建完整的技能节点数据常量

  - [x] 1.3 为每个节点配置图标（使用 emoji 或 CSS 图标）、位置坐标、描述文本

  - [x] 1.4 导出供 Game.ts 使用的配置对象

- [x] Task 2: 实现 `renderSkillTree()` 核心渲染方法

  - [x] 2.1 创建技能树页面 HTML 模板（顶部导航栏 + 技能点计数器 + 技能树容器 + 底部操作栏）

  - [x] 2.2 实现温馨可爱二次元风格的 CSS 样式（粉色渐变背景、圆角节点、发光效果、动画）

  - [x] 2.3 实现技能树节点网格布局算法（根据维度和层级计算每个节点的屏幕位置）

  - [x] 2.4 绘制节点间的连接线（SVG path 或 CSS 伪元素，带颜色区分维度）

  - [x] 2.5 渲染所有技能节点（基础层/进阶层/终极层），标注 locked/available/unlocked 状态

- [x] Task 3: 实现技能树交互逻辑

  - [x] 3.1 实现节点点击事件处理（显示详情弹窗）

  - [x] 3.2 创建技能节点详情弹窗组件（显示名称、描述、解锁条件、前置节点链路）

  - [x] 3.3 实现解锁确认流程（UI 层展示，实际扣费逻辑预留接口）

  - [x] 3.4 实现 hover 效果（节点放大、显示 tooltip）

  - [x] 3.5 实现页面导航（关闭/完成按钮绑定场景切换）

- [x] Task 4: 集成到游戏主流程

  - [x] 4.1 在 Game.ts 中添加 renderSkillTree() 方法

  - [x] 4.2 修改 GameStateManager 或场景路由，将 attribute_panel 映射到 renderSkillTree

  - [x] 4.3 确保 main_hub 的"属性升级"按钮正确跳转到新页面

  - [x] 4.4 扩展 PlayerData.state 新增 skillPoints 和 unlockedNodes 字段（预留）

- [x] Task 5: 视觉打磨与响应式适配

  - [x] 5.1 添加背景装饰元素（星光闪烁动画、漂浮爱心、模糊房间背景）

  - [x] 5.2 实现中心角色头像区域（使用占位图/CSS绘制可爱形象）

  - [x] 5.3 添加节点解锁时的闪光/粒子动画效果

  - [x] 5.4 响应式布局适配（桌面/平板/移动端三种断点）

  - [x] 5.5 测试页面在不同分辨率下的显示效果

# Task Dependencies

- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 2]
- [Task 5] depends on [Task 2, Task 3]
