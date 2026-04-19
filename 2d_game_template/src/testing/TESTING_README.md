# 主播模拟器：自动化测试与Debug方案

## 概述

本测试方案旨在自动化验证《主播模拟器：双面人生》游戏是否符合设计文档要求，并确保原项目的直播系统得到保留。

## 测试模块

### 1. GameTestFramework - 设计文档一致性测试

验证游戏实现是否符合设计文档要求。

#### 测试套件

1. **设计文档一致性测试**
   - 验证6个核心剧情节点存在
   - 验证剧情节点触发天数正确
   - 验证30个随机翻车事件存在
   - 验证事件分类分布正确
   - 验证6个NPC存在且初始好感度正确
   - 验证8个弹幕人格存在

2. **剧情节点测试**
   - 验证所有节点有完整选项和效果
   - 验证节点触发天数不重叠

3. **NPC系统测试**
   - 验证所有NPC有完整对话配置
   - 验证NPC首次出现天数合理

4. **随机事件测试**
   - 验证所有事件有选项和效果
   - 验证事件权重分布合理

5. **游戏数值测试**
   - 验证数值范围合理（0-100）

6. **结局系统测试**
   - 验证结局条件覆盖所有情况

#### 使用方法

```typescript
import { createGameTestFramework } from './testing';

// 创建测试框架
const framework = createGameTestFramework();

// 运行所有测试
const results = await framework.runAllTests();

// 生成报告
const report = framework.generateReport();
console.log(report);

// 导出结果
const json = framework.exportResults();
```

### 2. GameFlowSimulator - 游戏流程模拟器

模拟20天游戏流程，验证游戏逻辑正确性。

#### 模拟策略

1. **random** - 随机选择
2. **kind** - 优先选择善良值增加的选项
3. **selfish** - 优先选择粉丝增加的选项
4. **balanced** - 综合评分最高的选项

#### 使用方法

```typescript
import { createGameFlowSimulator } from './testing';

// 创建模拟器
const simulator = createGameFlowSimulator();

// 运行单次模拟
const result = await simulator.simulate({
  strategy: 'balanced',
  verbose: true
});

// 生成报告
const report = simulator.generateReport(result);
console.log(report);

// 运行多次模拟
const { results, statistics } = await simulator.runMultipleSimulations(10, {
  strategy: 'balanced',
  verbose: false
});
```

### 3. 便捷测试函数

```typescript
import { runFullTest, runQuickCheck, runBatchSimulation } from './testing';

// 运行完整测试套件
await runFullTest();

// 快速检查
const passed = await runQuickCheck();

// 批量模拟
await runBatchSimulation(100);
```

## 浏览器中使用

在浏览器控制台中运行：

```javascript
// 运行完整测试
await GameTester.runFullTest();

// 快速检查
await GameTester.runQuickCheck();

// 批量模拟
await GameTester.runBatchSimulation(50);
```

## 测试覆盖范围

### 设计文档验证
- [x] 6个核心剧情节点
- [x] 30个随机翻车事件
- [x] 6个NPC系统
- [x] 8个弹幕人格
- [x] 5种结局判定
- [x] 生存支付系统

### 游戏流程验证
- [x] 20天完整流程
- [x] 事件触发逻辑
- [x] 选择效果应用
- [x] 数值变化计算
- [x] 结局判定逻辑
- [x] 生存危机处理

### 原系统保留验证
- [x] 直播系统（通过Game.ts保留）
- [x] 技能树系统（通过SkillTreeConfig.ts保留）
- [x] AI服务（通过AIService.ts保留）
- [x] 事件池（通过EventPool.ts保留）

## Debug功能

### DebugLogger 日志系统

```typescript
import { logger } from './core/DebugLogger';

// 记录信息
logger.log('info', 'ModuleName', '操作成功', { data: 'value' });

// 记录警告
logger.log('warn', 'ModuleName', '需要注意', { warning: 'details' });

// 记录错误
logger.log('error', 'ModuleName', '发生错误', { error: err });

// 导出日志
const logs = logger.exportLogs();
logger.downloadLogs('game-debug.log');

// 获取统计
const stats = logger.getStats();
```

### 性能监控

```typescript
// 开始性能标记
logger.startPerformanceMark('operation-name');

// 执行操作
await doSomething();

// 结束性能标记
logger.endPerformanceMark('operation-name', 'ModuleName', '操作完成');
```

## 测试报告示例

```
========================================
    游戏自动化测试报告
========================================

测试统计:
- 总测试数: 25
- 通过: 25 (100.0%)
- 失败: 0 (0.0%)
- 总耗时: 15.32ms

详细结果:
✓ STORY-001: ✓ 通过 (0.52ms)
✓ STORY-002: ✓ 通过 (0.31ms)
...
✓ 剧情节点完整性: ✓ 所有节点完整 (2.15ms)
✓ NPC对话完整性: ✓ 所有NPC对话完整 (1.87ms)

========================================
    测试完成
========================================
```

## 持续集成建议

1. **每次提交前运行**
   ```bash
   npm run build
   npm run test
   ```

2. **定期运行完整测试**
   ```bash
   npm run test:full
   ```

3. **发布前验证**
   ```bash
   npm run test:ci
   ```

## 文件结构

```
src/testing/
├── GameTestFramework.ts    # 设计文档一致性测试
├── GameFlowSimulator.ts    # 游戏流程模拟器
├── index.ts                # 统一导出
└── TESTING_README.md       # 本文档
```

## 总结

本测试方案提供了：
1. **自动化验证** - 确保游戏符合设计文档
2. **流程模拟** - 验证20天游戏流程正确性
3. **Debug工具** - 完整的日志和性能监控
4. **便捷使用** - 浏览器和Node.js环境都支持

通过这些工具，可以快速发现和修复问题，确保游戏质量。
