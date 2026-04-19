/**
 * 游戏流程模拟器
 * 用于自动化模拟20天游戏流程，验证游戏逻辑正确性
 */

import { logger } from '../core/DebugLogger';
import type { PlayerState, GameEvent } from '../data/Types';
import { DEFAULT_PLAYER_STATE } from '../data/Types';
import { EventManager, createEventManager } from '../events/EventManager';
import { NPCSystem, createNPCSystem } from '../systems/NPCSystem';
import { SurvivalSystem, getSurvivalSystem } from '../systems/SurvivalSystem';
import { EndingSystem, createEndingSystem } from '../systems/EndingSystem';

export interface SimulationConfig {
  strategy: 'random' | 'kind' | 'selfish' | 'balanced';
  verbose?: boolean;
}

export interface DayLog {
  day: number;
  event?: GameEvent;
  choice?: string;
  state: PlayerState;
  hotSearch?: string;
}

export interface SimulationResult {
  success: boolean;
  days: DayLog[];
  finalState: PlayerState;
  ending: string;
  issues: string[];
  duration: number;
}

/**
 * 游戏流程模拟器
 */
export class GameFlowSimulator {
  private state: PlayerState;
  private eventManager: EventManager;
  private npcSystem: NPCSystem;
  private survivalSystem: SurvivalSystem;
  private endingSystem: EndingSystem;
  private dayLogs: DayLog[] = [];
  private issues: string[] = [];

  constructor() {
    this.state = { ...DEFAULT_PLAYER_STATE };
    this.eventManager = createEventManager();
    this.npcSystem = createNPCSystem();
    this.survivalSystem = getSurvivalSystem(this.state);
    this.endingSystem = createEndingSystem();
  }

  /**
   * 运行完整游戏模拟
   */
  async simulate(config: SimulationConfig): Promise<SimulationResult> {
    const startTime = performance.now();
    this.dayLogs = [];
    this.issues = [];

    logger.log('info', 'GameFlowSimulator', `开始游戏模拟，策略: ${config.strategy}`);

    // 模拟20天
    for (let day = 1; day <= 20; day++) {
      await this.simulateDay(day, config);
    }

    // 判定结局
    const ending = this.endingSystem.determineEnding(
      this.state,
      this.eventManager.getTriggeredStoryNodes(),
      {}
    );

    const duration = performance.now() - startTime;

    const result: SimulationResult = {
      success: this.issues.length === 0,
      days: this.dayLogs,
      finalState: { ...this.state },
      ending: ending.name,
      issues: this.issues,
      duration
    };

    logger.log('info', 'GameFlowSimulator', '模拟完成', {
      ending: ending.name,
      issues: this.issues.length,
      duration
    });

    return result;
  }

  /**
   * 模拟单天
   */
  private async simulateDay(day: number, config: SimulationConfig): Promise<void> {
    this.npcSystem.setDay(day);

    const dayLog: DayLog = {
      day,
      state: { ...this.state }
    };

    // 处理生存系统
    const survivalResult = this.survivalSystem.processDaily();
    if (survivalResult.crisis) {
      this.issues.push(`第${day}天: ${survivalResult.crisis.description}`);
    }

    // 检查事件
    const event = this.eventManager.checkDailyEvent(day, this.state);
    if (event) {
      dayLog.event = event;

      // 根据策略选择选项
      const choice = this.selectChoice(event, config.strategy);
      if (choice) {
        dayLog.choice = choice.text;
        this.applyChoiceEffects(choice.effects);

        // 检查是否生成热搜
        if (event.isMajor || Math.random() < 0.3) {
          dayLog.hotSearch = `#${event.title}#`;
        }
      }
    }

    this.dayLogs.push(dayLog);

    if (config.verbose) {
      logger.log('debug', 'GameFlowSimulator', `第${day}天完成`, {
        event: event?.title,
        followers: this.state.followers
      });
    }
  }

  /**
   * 根据策略选择选项
   */
  private selectChoice(event: GameEvent, strategy: SimulationConfig['strategy']) {
    if (!event.choices || event.choices.length === 0) return null;

    switch (strategy) {
      case 'random':
        return event.choices[Math.floor(Math.random() * event.choices.length)];

      case 'kind':
        // 选择善良值增加最多的选项
        return event.choices.reduce((best, choice) => {
          const kindness = choice.effects.kindness || 0;
          const bestKindness = best.effects.kindness || 0;
          return kindness > bestKindness ? choice : best;
        }, event.choices[0]);

      case 'selfish':
        // 选择粉丝增加最多的选项
        return event.choices.reduce((best, choice) => {
          const followers = choice.effects.followers || 0;
          const bestFollowers = best.effects.followers || 0;
          return followers > bestFollowers ? choice : best;
        }, event.choices[0]);

      case 'balanced':
        // 选择综合收益最高的选项
        return event.choices.reduce((best, choice) => {
          const score = this.calculateChoiceScore(choice);
          const bestScore = this.calculateChoiceScore(best);
          return score > bestScore ? choice : best;
        }, event.choices[0]);

      default:
        return event.choices[0];
    }
  }

  /**
   * 计算选项综合得分
   */
  private calculateChoiceScore(choice: any): number {
    const effects = choice.effects;
    let score = 0;

    // 粉丝权重
    score += (effects.followers || 0) * 0.3;
    // 善良权重
    score += (effects.kindness || 0) * 0.2;
    // 诚信权重
    score += (effects.integrity || 0) * 0.2;
    // 精神权重
    score += (effects.sanity || 0) * 0.15;
    // 金钱权重
    score += (effects.money || 0) * 0.0001;
    // 人设权重
    score += (effects.personaIntegrity || 0) * 0.15;

    return score;
  }

  /**
   * 应用选择效果
   */
  private applyChoiceEffects(effects: any): void {
    if (effects.followers) this.state.followers += effects.followers;
    if (effects.stamina) this.state.stamina = Math.max(0, Math.min(100, this.state.stamina + effects.stamina));
    if (effects.kindness) this.state.kindness = Math.max(0, Math.min(100, this.state.kindness + effects.kindness));
    if (effects.integrity) this.state.integrity = Math.max(0, Math.min(100, this.state.integrity + effects.integrity));
    if (effects.money) this.state.money += effects.money;
    if (effects.sanity) this.state.sanity = Math.max(0, Math.min(100, this.state.sanity + effects.sanity));
    if (effects.personaIntegrity) this.state.personaIntegrity = Math.max(0, Math.min(100, this.state.personaIntegrity + effects.personaIntegrity));

    if (effects.npcRelations) {
      this.npcSystem.modifyRelations(effects.npcRelations);
    }
  }

  /**
   * 生成模拟报告
   */
  generateReport(result: SimulationResult): string {
    const report = `
========================================
    游戏流程模拟报告
========================================

模拟策略: ${result.days[0]?.state ? 'random' : 'unknown'}
模拟天数: 20天
模拟耗时: ${result.duration.toFixed(2)}ms

最终状态:
- 粉丝数: ${result.finalState.followers.toLocaleString()}
- 善良值: ${result.finalState.kindness}
- 诚信值: ${result.finalState.integrity}
- 精神值: ${result.finalState.sanity}
- 人设完整度: ${result.finalState.personaIntegrity}
- 翻车次数: ${result.finalState.failCount}
- 金钱: ${result.finalState.money}

结局: ${result.ending}

触发事件:
${result.days.filter(d => d.event).map(d => `  第${d.day}天: ${d.event?.title} - ${d.choice}`).join('\n')}

热搜记录:
${result.days.filter(d => d.hotSearch).map(d => `  第${d.day}天: ${d.hotSearch}`).join('\n')}

${result.issues.length > 0 ? `
发现问题:
${result.issues.map(i => `  ⚠ ${i}`).join('\n')}
` : '✓ 未发现严重问题'}

========================================
    模拟完成
========================================
    `;

    return report;
  }

  /**
   * 运行多次模拟，统计结果
   */
  async runMultipleSimulations(count: number, config: SimulationConfig): Promise<{
    results: SimulationResult[];
    statistics: {
      endingDistribution: Record<string, number>;
      averageFollowers: number;
      averageFailCount: number;
      issueRate: number;
    }
  }> {
    const results: SimulationResult[] = [];

    for (let i = 0; i < count; i++) {
      // 重置状态
      this.state = { ...DEFAULT_PLAYER_STATE };
      this.eventManager = createEventManager();
      this.npcSystem = createNPCSystem();
      this.survivalSystem = getSurvivalSystem(this.state);

      const result = await this.simulate(config);
      results.push(result);
    }

    // 统计
    const endingDistribution: Record<string, number> = {};
    results.forEach(r => {
      endingDistribution[r.ending] = (endingDistribution[r.ending] || 0) + 1;
    });

    const statistics = {
      endingDistribution,
      averageFollowers: results.reduce((sum, r) => sum + r.finalState.followers, 0) / count,
      averageFailCount: results.reduce((sum, r) => sum + r.finalState.failCount, 0) / count,
      issueRate: results.filter(r => r.issues.length > 0).length / count
    };

    return { results, statistics };
  }
}

/**
 * 便捷函数
 */
export function createGameFlowSimulator(): GameFlowSimulator {
  return new GameFlowSimulator();
}

export async function quickSimulate(): Promise<SimulationResult> {
  const simulator = createGameFlowSimulator();
  return await simulator.simulate({ strategy: 'balanced', verbose: false });
}
