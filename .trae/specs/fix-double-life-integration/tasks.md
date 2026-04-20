# Fix Double Life Integration Tasks

## 任务列表

### 任务1：修复图片路径和立绘显示
- [ ] 检查当前半身像文件位置和命名
- [ ] 修复Game.ts中的图片路径
- [ ] 添加图片加载错误处理
- [ ] 验证立绘能正确显示而非emoji

**详细步骤**：
1. 检查 `assets/portraits/` 目录下的文件
2. 修改 `renderCharacterPortrait` 方法使用正确路径
3. 添加 `onerror` 处理避免显示破损图标
4. 测试图片加载

### 任务2：创建开场穿越剧情场景
- [ ] 在Game.ts中添加 `renderOpeningScene()` 方法
- [ ] 使用完整立绘（白毛1.3.png）作为背景
- [ ] 实现分步骤剧情展示（粉丝→穿越→开始）
- [ ] 添加机械音对话框样式
- [ ] 最后跳转到第1天白天场景

**详细步骤**：
1. 创建开场场景容器
2. 添加完整立绘背景（半透明）
3. 实现剧情文本逐步显示
4. 添加"下一步"按钮
5. 最后显示"绑定成功，开始游戏"并进入day 1

### 任务3：重构横板对话UI
- [ ] 修改 `double-life.css` 创建横板布局
- [ ] 主角立绘固定在右侧
- [ ] NPC立绘在左侧（如有）
- [ ] 对话框在底部，支持多行文本
- [ ] 选项按钮横向排列

**CSS布局要求**：
```css
.dialog-scene {
  display: flex;
  position: relative;
  height: 100vh;
}
.character-portrait {
  position: absolute;
  right: 0;
  bottom: 180px; /* 对话框高度 */
  height: 350px;
}
.npc-portrait {
  position: absolute;
  left: 0;
  bottom: 180px;
  height: 350px;
}
.dialog-box {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 180px;
  background: rgba(0,0,0,0.85);
}
```

### 任务4：整合NPC对话到游戏流程
- [ ] 修改每日流程，在白天添加NPC互动检查
- [ ] 第1天：房东太太介绍房租
- [ ] 第3天：可心首次出现
- [ ] 确保NPC对话使用横板UI
- [ ] 对话后进入直播选择

**触发逻辑**：
```typescript
// 在dailyFlow中添加
if (day === 1) {
  await this.renderNPCDialog('landlady', 'intro');
}
if (day === 3) {
  await this.renderNPCDialog('kexin', 'first_meet');
}
// ... 其他天数
```

### 任务5：整合生存系统到每日结算
- [ ] 修改 `renderDailySummary` 显示生存支出
- [ ] 显示房租、水电、食物、网费明细
- [ ] 显示拖欠状态
- [ ] 在每日开始时检查并显示危机事件

**结算界面修改**：
- 添加支出明细区域
- 添加拖欠警告区域
- 保持原有收入显示

### 任务6：整合剧情节点触发
- [ ] 在直播后检查剧情节点
- [ ] 第3-5天：房东晕倒事件
- [ ] 第6天：捡到豆豆
- [ ] 第10-12天：可心悲剧
- [ ] 第11天：猥琐男骚扰
- [ ] 第16天：月牙儿PK
- [ ] 第20天：母亲病情

**触发逻辑**：
```typescript
const node = storyNodes.checkTrigger(day, playerState);
if (node) {
  await this.renderStoryNode(node);
  const choice = await this.waitForChoice();
  storyNodes.applyEffects(choice, playerState);
}
```

### 任务7：整合随机翻车事件
- [ ] 30%概率触发随机事件
- [ ] 有剧情节点时优先节点
- [ ] 使用横板对话UI显示
- [ ] 选择后应用效果

### 任务8：测试完整20天流程
- [ ] 从第1天开始测试
- [ ] 验证开场剧情显示
- [ ] 验证立绘正确加载
- [ ] 验证NPC对话触发
- [ ] 验证生存系统显示
- [ ] 验证剧情节点触发
- [ ] 验证结局判定

## 任务依赖关系

```
任务1 (图片路径) → 任务2 (开场剧情) → 任务4 (NPC对话)
                ↓                    ↓
                任务3 (对话UI) ←──────┘
                ↓
                任务5 (生存系统)
                ↓
                任务6 (剧情节点)
                ↓
                任务7 (随机事件)
                ↓
                任务8 (测试)
```

## 并行任务

- 任务1、任务3 可以并行
- 任务5、任务6、任务7 可以并行（在任务3完成后）
