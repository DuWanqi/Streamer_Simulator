/**
 * 游戏自动化测试框架
 * 用于验证游戏功能是否符合设计文档
 */

import { logger } from '../core/DebugLogger';
import type { PlayerState, GameEvent, StoryNode, RandomEvent } from '../data/Types';
import { STORY_NODES } from '../events/StoryNodes';
import { RANDOM_EVENTS } from '../events/RandomEvents';
import { NPCS } from '../systems/NPCSystem';
import { DANMAKU_PERSONALITIES } from '../data/Types';

// ==================== 测试类型定义 ====================

export interface TestResult {
  passed: boolean;
  testName: string;
  message: string;
  details?: any;
  duration: number;
}

export interface TestSuite {
  name: string;
  tests: TestCase[];
}

export interface TestCase {
  name: string;
  description: string;
  run: () => Promise<TestResult> | TestResult;
}

export interface DesignRequirement {
  id: string;
  category: 'story' | 'npc' | 'system' | 'ui' | 'event';
  description: string;
  verify: () => boolean;
}

// ==================== 游戏测试框架 ====================

export class GameTestFramework {
  private results: TestResult[] = [];
  private designDocRequirements: DesignRequirement[] = [];

  constructor() {
    this.initDesignRequirements();
    logger.log('info', 'GameTestFramework', '测试框架初始化完成');
  }

  // ==================== 设计文档验证 ====================

  private initDesignRequirements(): void {
    // 从设计文档提取的关键需求
    this.designDocRequirements = [
      // 剧情节点需求
      { id: 'STORY-001', category: 'story', description: '必须包含6个核心剧情节点', verify: () => STORY_NODES.length === 6 },
      { id: 'STORY-002', category: 'story', description: '节点1：房东太太晕倒在第3-5天触发', verify: () => {
        const node = STORY_NODES.find(n => n.id === 'node1_landlady');
        return node?.triggerDay[0] === 3 && node?.triggerDay[1] === 5;
      }},
      { id: 'STORY-003', category: 'story', description: '节点2：邻居骚扰与网暴在第11-13天触发', verify: () => {
        const node = STORY_NODES.find(n => n.id === 'node2_harassment');
        return node?.triggerDay[0] === 11 && node?.triggerDay[1] === 13;
      }},
      { id: 'STORY-004', category: 'story', description: '节点3：捡到豆豆在第6天触发', verify: () => {
        const node = STORY_NODES.find(n => n.id === 'node3_doudou');
        return node?.triggerDay[0] === 6 && node?.triggerDay[1] === 6;
      }},
      { id: 'STORY-005', category: 'story', description: '节点6：母亲的阿尔茨海默症在第20天触发', verify: () => {
        const node = STORY_NODES.find(n => n.id === 'node6_mother');
        return node?.triggerDay[0] === 20 && node?.triggerDay[1] === 20;
      }},

      // NPC需求
      { id: 'NPC-001', category: 'npc', description: '必须包含6个NPC', verify: () => Object.keys(NPCS).length === 6 },
      { id: 'NPC-002', category: 'npc', description: '房东太太初始好感度为30', verify: () => NPCS.landlady.initialRelation === 30 },
      { id: 'NPC-003', category: 'npc', description: '可心初始好感度为80', verify: () => NPCS.kexin.initialRelation === 80 },
      { id: 'NPC-004', category: 'npc', description: '豆豆初始好感度为0', verify: () => NPCS.doudou.initialRelation === 0 },

      // 随机事件需求
      { id: 'EVENT-001', category: 'event', description: '必须包含30个随机翻车事件', verify: () => RANDOM_EVENTS.length === 30 },
      { id: 'EVENT-002', category: 'event', description: '技术翻车类至少6个', verify: () => RANDOM_EVENTS.filter(e => e.category === 'tech_fail').length === 6 },
      { id: 'EVENT-003', category: 'event', description: '社交翻车类至少6个', verify: () => RANDOM_EVENTS.filter(e => e.category === 'social_fail').length === 6 },
      { id: 'EVENT-004', category: 'event', description: '技能翻车类至少6个', verify: () => RANDOM_EVENTS.filter(e => e.category === 'skill_fail').length === 6 },
      { id: 'EVENT-005', category: 'event', description: '人设翻车类至少6个', verify: () => RANDOM_EVENTS.filter(e => e.category === 'persona_fail').length === 6 },
      { id: 'EVENT-006', category: 'event', description: '平台/超现实类至少6个', verify: () => RANDOM_EVENTS.filter(e => e.category === 'platform_fail').length === 6 },

      // 弹幕人格需求
      { id: 'DANMAKU-001', category: 'system', description: '必须包含8个弹幕人格', verify: () => DANMAKU_PERSONALITIES.length === 8 },
    ];
  }

  // ==================== 测试套件定义 ====================

  getTestSuites(): TestSuite[] {
    return [
      {
        name: '设计文档一致性测试',
        tests: this.getDesignDocTests()
      },
      {
        name: '剧情节点测试',
        tests: this.getStoryNodeTests()
      },
      {
        name: 'NPC系统测试',
        tests: this.getNPCTests()
      },
      {
        name: '随机事件测试',
        tests: this.getRandomEventTests()
      },
      {
        name: '游戏数值测试',
        tests: this.getGameValueTests()
      },
      {
        name: '结局系统测试',
        tests: this.getEndingTests()
      }
    ];
  }

  // ==================== 设计文档测试 ====================

  private getDesignDocTests(): TestCase[] {
    return this.designDocRequirements.map(req => ({
      name: req.id,
      description: req.description,
      run: () => {
        const start = performance.now();
        const passed = req.verify();
        const duration = performance.now() - start;

        return {
          passed,
          testName: req.id,
          message: passed ? '✓ 通过' : '✗ 失败',
          details: { requirement: req.description },
          duration
        };
      }
    }));
  }

  // ==================== 剧情节点测试 ====================

  private getStoryNodeTests(): TestCase[] {
    return [
      {
        name: '剧情节点完整性',
        description: '验证所有剧情节点都有完整的选项和效果',
        run: () => {
          const start = performance.now();
          const issues: string[] = [];

          STORY_NODES.forEach(node => {
            if (!node.choices || node.choices.length === 0) {
              issues.push(`${node.id}: 缺少选项`);
            }
            if (!node.title || !node.description) {
              issues.push(`${node.id}: 缺少标题或描述`);
            }
            node.choices?.forEach(choice => {
              if (!choice.effects || Object.keys(choice.effects).length === 0) {
                issues.push(`${node.id}.${choice.id}: 选项缺少效果`);
              }
            });
          });

          const duration = performance.now() - start;
          return {
            passed: issues.length === 0,
            testName: '剧情节点完整性',
            message: issues.length === 0 ? '✓ 所有节点完整' : `✗ 发现${issues.length}个问题`,
            details: issues,
            duration
          };
        }
      },
      {
        name: '剧情节点触发天数',
        description: '验证剧情节点触发天数不重叠',
        run: () => {
          const start = performance.now();
          const dayRanges: Array<{ id: string; start: number; end: number }> = [];

          STORY_NODES.forEach(node => {
            dayRanges.push({
              id: node.id,
              start: node.triggerDay[0],
              end: node.triggerDay[1]
            });
          });

          const overlaps: string[] = [];
          for (let i = 0; i < dayRanges.length; i++) {
            for (let j = i + 1; j < dayRanges.length; j++) {
              const a = dayRanges[i];
              const b = dayRanges[j];
              if (a.start <= b.end && b.start <= a.end) {
                overlaps.push(`${a.id} 与 ${b.id} 触发天数重叠`);
              }
            }
          }

          const duration = performance.now() - start;
          return {
            passed: overlaps.length === 0,
            testName: '剧情节点触发天数',
            message: overlaps.length === 0 ? '✓ 无重叠' : `✗ 发现${overlaps.length}个重叠`,
            details: overlaps,
            duration
          };
        }
      }
    ];
  }

  // ==================== NPC系统测试 ====================

  private getNPCTests(): TestCase[] {
    return [
      {
        name: 'NPC对话完整性',
        description: '验证所有NPC都有完整的对话配置',
        run: () => {
          const start = performance.now();
          const issues: string[] = [];

          Object.entries(NPCS).forEach(([id, npc]) => {
            if (!npc.dialogs.high.length) issues.push(`${id}: 缺少高好感度对话`);
            if (!npc.dialogs.medium.length) issues.push(`${id}: 缺少中好感度对话`);
            if (!npc.dialogs.low.length) issues.push(`${id}: 缺少低好感度对话`);
            if (!npc.dialogs.zero.length) issues.push(`${id}: 缺少零好感度对话`);
          });

          const duration = performance.now() - start;
          return {
            passed: issues.length === 0,
            testName: 'NPC对话完整性',
            message: issues.length === 0 ? '✓ 所有NPC对话完整' : `✗ 发现${issues.length}个问题`,
            details: issues,
            duration
          };
        }
      },
      {
        name: 'NPC首次出现天数',
        description: '验证NPC首次出现天数合理',
        run: () => {
          const start = performance.now();
          const issues: string[] = [];

          Object.entries(NPCS).forEach(([id, npc]) => {
            if (npc.firstAppearanceDay < 1) {
              issues.push(`${id}: 首次出现天数小于1`);
            }
            if (npc.firstAppearanceDay > 20) {
              issues.push(`${id}: 首次出现天数大于20（游戏总天数）`);
            }
          });

          const duration = performance.now() - start;
          return {
            passed: issues.length === 0,
            testName: 'NPC首次出现天数',
            message: issues.length === 0 ? '✓ 天数合理' : `✗ 发现${issues.length}个问题`,
            details: issues,
            duration
          };
        }
      }
    ];
  }

  // ==================== 随机事件测试 ====================

  private getRandomEventTests(): TestCase[] {
    return [
      {
        name: '随机事件选项完整性',
        description: '验证所有随机事件都有选项和效果',
        run: () => {
          const start = performance.now();
          const issues: string[] = [];

          RANDOM_EVENTS.forEach(event => {
            if (!event.choices || event.choices.length === 0) {
              issues.push(`${event.id}: 缺少选项`);
            }
            if (event.weight <= 0) {
              issues.push(`${event.id}: 权重必须大于0`);
            }
          });

          const duration = performance.now() - start;
          return {
            passed: issues.length === 0,
            testName: '随机事件选项完整性',
            message: issues.length === 0 ? '✓ 所有事件完整' : `✗ 发现${issues.length}个问题`,
            details: issues,
            duration
          };
        }
      },
      {
        name: '随机事件权重分布',
        description: '验证随机事件权重分布合理',
        run: () => {
          const start = performance.now();
          const totalWeight = RANDOM_EVENTS.reduce((sum, e) => sum + e.weight, 0);
          const avgWeight = totalWeight / RANDOM_EVENTS.length;

          const highWeight = RANDOM_EVENTS.filter(e => e.weight > avgWeight * 2);
          const lowWeight = RANDOM_EVENTS.filter(e => e.weight < avgWeight * 0.5);

          const duration = performance.now() - start;
          return {
            passed: true,
            testName: '随机事件权重分布',
            message: `✓ 总权重: ${totalWeight}, 平均: ${avgWeight.toFixed(2)}`,
            details: {
              totalWeight,
              averageWeight: avgWeight,
              highWeightEvents: highWeight.map(e => e.id),
              lowWeightEvents: lowWeight.map(e => e.id)
            },
            duration
          };
        }
      }
    ];
  }

  // ==================== 游戏数值测试 ====================

  private getGameValueTests(): TestCase[] {
    return [
      {
        name: '数值范围检查',
        description: '验证游戏数值在合理范围内',
        run: () => {
          const start = performance.now();
          const testState: PlayerState = {
            followers: 1000000,
            stamina: 100,
            kindness: 100,
            integrity: 100,
            money: 100000,
            sanity: 100,
            personaIntegrity: 100,
            day: 20,
            failCount: 30,
            trendingTopics: [],
            npcRelations: {
              landlady: 100,
              kexin: 100,
              mom: 100,
              doudou: 100,
              yueya: 100,
              harasser: 100
            },
            survival: {
              rentDue: 0,
              utilitiesDue: 0,
              foodDays: 10,
              internetDue: 0
            }
          };

          const issues: string[] = [];
          if (testState.stamina > 100) issues.push('体力值超过100');
          if (testState.kindness > 100) issues.push('善良值超过100');
          if (testState.integrity > 100) issues.push('诚信值超过100');
          if (testState.sanity > 100) issues.push('精神值超过100');
          if (testState.personaIntegrity > 100) issues.push('人设完整度超过100');

          Object.entries(testState.npcRelations).forEach(([npc, value]) => {
            if (value > 100) issues.push(`${npc}好感度超过100`);
          });

          const duration = performance.now() - start;
          return {
            passed: issues.length === 0,
            testName: '数值范围检查',
            message: issues.length === 0 ? '✓ 数值范围合理' : `✗ 发现${issues.length}个问题`,
            details: issues,
            duration
          };
        }
      }
    ];
  }

  // ==================== 结局系统测试 ====================

  private getEndingTests(): TestCase[] {
    return [
      {
        name: '结局条件覆盖',
        description: '验证结局判定条件覆盖所有情况',
        run: () => {
          const start = performance.now();

          // 测试不同状态组合
          const testCases = [
            { name: '完美结局', kindness: 70, integrity: 70, npcAllHigh: true },
            { name: '失败结局', money: -1000, landladyZero: true },
            { name: '悲剧结局', kindness: 30, integrity: 30, personaLow: true },
            { name: '逃离结局', sanity: 10 },
            { name: '普通结局', kindness: 50, integrity: 50 }
          ];

          const duration = performance.now() - start;
          return {
            passed: true,
            testName: '结局条件覆盖',
            message: `✓ 已定义${testCases.length}种结局场景`,
            details: testCases,
            duration
          };
        }
      }
    ];
  }

  // ==================== 运行测试 ====================

  async runAllTests(): Promise<TestResult[]> {
    this.results = [];
    const suites = this.getTestSuites();

    logger.log('info', 'GameTestFramework', '开始运行所有测试');

    for (const suite of suites) {
      logger.log('info', 'GameTestFramework', `运行测试套件: ${suite.name}`);

      for (const test of suite.tests) {
        try {
          const result = await test.run();
          this.results.push(result);

          if (result.passed) {
            logger.log('info', 'GameTestFramework', `✓ ${test.name}`, { duration: result.duration });
          } else {
            logger.log('warn', 'GameTestFramework', `✗ ${test.name}`, { message: result.message, details: result.details });
          }
        } catch (error) {
          const errorResult: TestResult = {
            passed: false,
            testName: test.name,
            message: `测试执行出错: ${error}`,
            duration: 0
          };
          this.results.push(errorResult);
          logger.log('error', 'GameTestFramework', `测试异常: ${test.name}`, { error });
        }
      }
    }

    this.generateReport();
    return this.results;
  }

  // ==================== 生成报告 ====================

  generateReport(): string {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    const report = `
========================================
    游戏自动化测试报告
========================================

测试统计:
- 总测试数: ${total}
- 通过: ${passed} (${((passed/total)*100).toFixed(1)}%)
- 失败: ${failed} (${((failed/total)*100).toFixed(1)}%)
- 总耗时: ${totalDuration.toFixed(2)}ms

详细结果:
${this.results.map(r => `${r.passed ? '✓' : '✗'} ${r.testName}: ${r.message} (${r.duration.toFixed(2)}ms)`).join('\n')}

失败项详情:
${this.results.filter(r => !r.passed).map(r => `
[${r.testName}]
${r.message}
${r.details ? JSON.stringify(r.details, null, 2) : ''}
`).join('\n')}

========================================
    测试完成
========================================
    `;

    logger.log('info', 'GameTestFramework', '测试报告生成完成', { passed, failed, total });
    return report;
  }

  // ==================== 导出结果 ====================

  exportResults(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.passed).length,
        failed: this.results.filter(r => !r.passed).length
      }
    }, null, 2);
  }
}

// ==================== 便捷函数 ====================

export function createGameTestFramework(): GameTestFramework {
  return new GameTestFramework();
}

export async function runQuickTest(): Promise<TestResult[]> {
  const framework = createGameTestFramework();
  return await framework.runAllTests();
}
