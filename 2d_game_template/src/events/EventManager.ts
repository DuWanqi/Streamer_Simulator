/**
 * 事件管理器
 * 双轨制事件系统：6个核心剧情节点 + 30个随机翻车事件
 */

import { logger } from '../core/DebugLogger';
import type { 
  GameEvent, 
  EventChoice, 
  PlayerState, 
  NPCId,
  StoryNode,
  RandomEvent 
} from '../data/Types';
import { STORY_NODES } from './StoryNodes';
import { RANDOM_EVENTS } from './RandomEvents';

export interface EventResult {
  event: GameEvent;
  choice: EventChoice;
  effects: {
    followers?: number;
    stamina?: number;
    kindness?: number;
    integrity?: number;
    money?: number;
    sanity?: number;
    personaIntegrity?: number;
    npcRelations?: Partial<Record<NPCId, number>>;
    failCount?: number;
  };
  isMajor: boolean;
  shouldGenerateHotSearch: boolean;
}

export class EventManager {
  private triggeredStoryNodes: Set<string> = new Set();
  private triggeredEvents: Set<string> = new Set();
  private dailyRandomEventChance: number = 0.3; // 30%概率触发随机事件

  constructor() {
    logger.log('info', 'EventManager', '事件管理器初始化完成');
  }

  /**
   * 检查当天事件
   * 优先级：核心剧情节点 > 随机翻车事件
   */
  checkDailyEvent(day: number, state: PlayerState): GameEvent | null {
    logger.log('debug', 'EventManager', '检查当天事件', { day });

    // 1. 检查核心剧情节点
    const storyNode = this.getStoryNode(day, state);
    if (storyNode) {
      logger.log('info', 'EventManager', '触发剧情节点', { 
        nodeId: storyNode.id, 
        name: storyNode.title 
      });
      return storyNode;
    }

    // 2. 检查随机翻车事件（30%概率）
    if (Math.random() < this.dailyRandomEventChance) {
      const randomEvent = this.getRandomEvent(state);
      if (randomEvent) {
        logger.log('info', 'EventManager', '触发随机事件', { 
          eventId: randomEvent.id, 
          name: randomEvent.title 
        });
        return randomEvent;
      }
    }

    logger.log('debug', 'EventManager', '当天无事件触发');
    return null;
  }

  /**
   * 获取剧情节点
   */
  private getStoryNode(day: number, state: PlayerState): GameEvent | null {
    for (const node of STORY_NODES) {
      // 检查是否已经触发过
      if (this.triggeredStoryNodes.has(node.id)) {
        continue;
      }

      // 检查触发天数
      const [startDay, endDay] = node.triggerDay;
      if (day >= startDay && day <= endDay) {
        // 检查前置条件
        if (this.checkPrerequisites(node, state)) {
          this.triggeredStoryNodes.add(node.id);
          return this.convertStoryNodeToEvent(node);
        }
      }
    }
    return null;
  }

  /**
   * 检查剧情节点前置条件
   */
  private checkPrerequisites(node: StoryNode, state: PlayerState): boolean {
    // 检查粉丝数要求
    if (node.prerequisites?.minFollowers && state.followers < node.prerequisites.minFollowers) {
      return false;
    }

    // 检查NPC好感度要求
    if (node.prerequisites?.npcRelations) {
      for (const [npcId, minRelation] of Object.entries(node.prerequisites.npcRelations)) {
        if (state.npcRelations[npcId as NPCId] < minRelation) {
          return false;
        }
      }
    }

    // 检查前置剧情节点
    if (node.prerequisites?.completedNodes) {
      for (const nodeId of node.prerequisites.completedNodes) {
        if (!this.triggeredStoryNodes.has(nodeId)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 获取随机翻车事件
   */
  private getRandomEvent(state: PlayerState): GameEvent | null {
    // 根据当前状态筛选可用事件
    const availableEvents = RANDOM_EVENTS.filter(event => {
      // 检查是否已经触发过（某些事件只能触发一次）
      if (event.once && this.triggeredEvents.has(event.id)) {
        return false;
      }

      // 检查触发条件
      if (event.condition) {
        return event.condition(state);
      }

      return true;
    });

    if (availableEvents.length === 0) {
      return null;
    }

    // 加权随机选择
    const totalWeight = availableEvents.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;

    for (const event of availableEvents) {
      random -= event.weight;
      if (random <= 0) {
        if (event.once) {
          this.triggeredEvents.add(event.id);
        }
        return this.convertRandomEventToEvent(event);
      }
    }

    return null;
  }

  /**
   * 将StoryNode转换为GameEvent
   */
  private convertStoryNodeToEvent(node: StoryNode): GameEvent {
    return {
      id: node.id,
      type: 'story',
      category: 'main_story',
      title: node.title,
      description: node.description,
      background: node.background,
      character: node.character,
      choices: node.choices,
      isMajor: true,
      triggerDay: node.triggerDay
    };
  }

  /**
   * 将RandomEvent转换为GameEvent
   */
  private convertRandomEventToEvent(event: RandomEvent): GameEvent {
    return {
      id: event.id,
      type: 'random',
      category: event.category,
      title: event.title,
      description: event.description,
      choices: event.choices,
      isMajor: event.isMajor || false
    };
  }

  /**
   * 应用选择效果
   */
  applyChoice(event: GameEvent, choiceId: string, state: PlayerState): EventResult {
    const choice = event.choices.find(c => c.id === choiceId);
    if (!choice) {
      throw new Error(`选择 ${choiceId} 不存在于事件 ${event.id}`);
    }

    logger.log('info', 'EventManager', '应用选择效果', { 
      eventId: event.id, 
      choiceId,
      effects: choice.effects 
    });

    const result: EventResult = {
      event,
      choice,
      effects: {
        followers: choice.effects.followers,
        stamina: choice.effects.stamina,
        kindness: choice.effects.kindness,
        integrity: choice.effects.integrity,
        money: choice.effects.money,
        sanity: choice.effects.sanity,
        personaIntegrity: choice.effects.personaIntegrity,
        npcRelations: choice.effects.npcRelations,
        failCount: event.category?.includes('fail') ? 1 : 0
      },
      isMajor: event.isMajor || false,
      shouldGenerateHotSearch: this.shouldGenerateHotSearch(event, choice)
    };

    return result;
  }

  /**
   * 判断是否生成热搜
   */
  private shouldGenerateHotSearch(event: GameEvent, choice: EventChoice): boolean {
    // 重大事件自动上热搜
    if (event.isMajor) {
      return true;
    }

    // 翻车事件大概率上热搜
    if (event.category?.includes('fail') && Math.random() < 0.7) {
      return true;
    }

    // 某些特定选择可能上热搜
    if (choice.hotSearchChance && Math.random() < choice.hotSearchChance) {
      return true;
    }

    return false;
  }

  /**
   * 获取事件历史
   */
  getTriggeredStoryNodes(): string[] {
    return Array.from(this.triggeredStoryNodes);
  }

  /**
   * 检查剧情节点是否已触发
   */
  hasTriggeredStoryNode(nodeId: string): boolean {
    return this.triggeredStoryNodes.has(nodeId);
  }

  /**
   * 获取已触发的随机事件
   */
  getTriggeredRandomEvents(): string[] {
    return Array.from(this.triggeredEvents);
  }

  /**
   * 重置状态（用于重新开始游戏）
   */
  reset(): void {
    this.triggeredStoryNodes.clear();
    this.triggeredEvents.clear();
    logger.log('info', 'EventManager', '事件管理器已重置');
  }

  /**
   * 设置随机事件触发概率
   */
  setRandomEventChance(chance: number): void {
    this.dailyRandomEventChance = Math.max(0, Math.min(1, chance));
  }

  /**
   * 获取所有剧情节点信息
   */
  getAllStoryNodes(): StoryNode[] {
    return [...STORY_NODES];
  }

  /**
   * 获取所有随机事件信息
   */
  getAllRandomEvents(): RandomEvent[] {
    return [...RANDOM_EVENTS];
  }

  /**
   * 手动触发指定事件（用于调试）
   */
  triggerEventById(eventId: string): GameEvent | null {
    // 查找剧情节点
    const storyNode = STORY_NODES.find(n => n.id === eventId);
    if (storyNode) {
      this.triggeredStoryNodes.add(storyNode.id);
      return this.convertStoryNodeToEvent(storyNode);
    }

    // 查找随机事件
    const randomEvent = RANDOM_EVENTS.find(e => e.id === eventId);
    if (randomEvent) {
      if (randomEvent.once) {
        this.triggeredEvents.add(randomEvent.id);
      }
      return this.convertRandomEventToEvent(randomEvent);
    }

    return null;
  }
}

/**
 * 创建事件管理器的工厂函数
 */
export function createEventManager(): EventManager {
  return new EventManager();
}
