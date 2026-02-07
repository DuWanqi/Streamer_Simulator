/**
 * 事件池系统 - 管理直播事件
 */

import { EVENTS, EVENTS_PER_DAY, type EventType } from '../game/GameConfig';
import type { PlayerState } from '../game/PlayerData';
import { weightedRandom, randomInt } from '../utils/helpers';

export interface GameEvent {
  type: EventType;
  name: string;
}

export class EventPool {
  // 根据玩家阶段生成当天的事件
  generateDayEvents(playerState: PlayerState): GameEvent[] {
    const stageIndex = playerState.stageId - 1;
    const eventCount = randomInt(EVENTS_PER_DAY.min, EVENTS_PER_DAY.max);
    const events: GameEvent[] = [];
    const usedTypes = new Set<EventType>();

    for (let i = 0; i < eventCount; i++) {
      // 根据阶段权重选择事件
      const weights = EVENTS.map(e => {
        // 如果已使用过，降低权重
        if (usedTypes.has(e.type)) return e.baseWeights[stageIndex] * 0.3;
        return e.baseWeights[stageIndex];
      });

      const eventConfig = weightedRandom(EVENTS, weights);
      usedTypes.add(eventConfig.type);
      
      events.push({
        type: eventConfig.type,
        name: eventConfig.name,
      });
    }

    return events;
  }

  // 计算事件影响 - 调整数值确保20天能达到百大/顶流/名扬海外
  // 目标：百大(100万+)、顶流(200万~1000万)、名扬海外(1000万~3000万)
  calculateEventImpact(event: GameEvent, playerState: PlayerState): {
    followers: number;
    fanClub: number;
    income: number;
  } {
    // 阶段倍率：随阶段指数增长
    const stageMultipliers = [1, 10, 100, 1000, 5000]; // 阶段1-5的倍率
    const base = stageMultipliers[playerState.stageId - 1] || 1;
    
    switch (event.type) {
      case 'big_spender':
        return {
          followers: randomInt(500, 1500) * base,
          fanClub: randomInt(50, 150) * base,
          income: randomInt(5000, 20000) * base,
        };
      
      case 'pk_battle':
        // PK结果由UI处理，这里返回基础值
        return {
          followers: randomInt(300, 800) * base,
          fanClub: randomInt(30, 80) * base,
          income: randomInt(2000, 8000) * base,
        };
      
      case 'big_streamer_raid':
        return {
          followers: randomInt(1000, 3000) * base,
          fanClub: randomInt(100, 300) * base,
          income: randomInt(5000, 15000) * base,
        };
      
      case 'rival_attack':
        // 同行互动 - 可能正向也可能负向
        return {
          followers: randomInt(-200, 500) * base,
          fanClub: randomInt(-20, 50) * base,
          income: randomInt(-1000, 3000) * base,
        };
      
      case 'mcn_offer':
        return {
          followers: randomInt(500, 1500) * base,
          fanClub: randomInt(50, 150) * base,
          income: randomInt(10000, 50000) * base,
        };
      
      case 'slander':
        // 舆论事件 - 负向影响
        return {
          followers: randomInt(-500, -100) * base,
          fanClub: randomInt(-50, -10) * base,
          income: randomInt(-5000, -1000) * base,
        };
      
      default:
        return { followers: 0, fanClub: 0, income: 0 };
    }
  }
}
