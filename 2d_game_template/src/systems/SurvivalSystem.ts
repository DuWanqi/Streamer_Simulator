/**
 * 生存支付系统 - 管理房租、水电、食物、网费
 * 
 * 根据设计案第4章：现实生存支付系统
 */

import type { PlayerData } from '../game/PlayerData';
import { DAILY_EXPENSES, SURVIVAL_THRESHOLDS } from '../game/GameConfig';

export interface SurvivalCrisis {
  type: 'rent' | 'utilities' | 'food' | 'internet';
  level: 'warning' | 'critical';
  message: string;
  effects: {
    canStream?: boolean;
    sanityPenalty?: number;
    followerPenalty?: number;
  };
}

export interface DailySurvivalResult {
  expenses: {
    rent: number;
    utilities: number;
    food: number;
    internet: number;
    total: number;
  };
  paid: boolean;
  crisis?: SurvivalCrisis;
  messages: string[];
}

export class SurvivalSystem {
  private playerData: PlayerData;

  constructor(playerData: PlayerData) {
    this.playerData = playerData;
  }

  /**
   * 处理每日生存支付
   * 每天扣除固定支出，检查生存危机
   */
  processDaily(): DailySurvivalResult {
    const state = this.playerData.getState();
    const messages: string[] = [];
    let crisis: SurvivalCrisis | undefined;

    // 计算每日支出
    const expenses = { ...DAILY_EXPENSES };
    
    // 检查是否有足够资金支付
    const canPay = state.income >= expenses.total;

    if (canPay) {
      // 扣除费用
      this.playerData.addIncome(-expenses.total);
      messages.push(`今日支出：房租¥${expenses.rent}、水电¥${expenses.utilities}、食物¥${expenses.food}、网费¥${expenses.internet}`);
      
      // 重置拖欠天数
      this.resetSurvivalState();
    } else {
      // 资金不足，开始拖欠
      messages.push('资金不足，无法支付今日费用！');
      this.handleUnpaidExpenses(expenses, messages);
    }

    // 检查生存危机
    crisis = this.checkSurvivalCrisis();
    if (crisis) {
      messages.push(crisis.message);
      this.applyCrisisEffects(crisis);
    }

    return {
      expenses,
      paid: canPay,
      crisis,
      messages,
    };
  }

  /**
   * 处理拖欠费用
   */
  private handleUnpaidExpenses(expenses: typeof DAILY_EXPENSES, messages: string[]): void {
    const state = this.playerData.getState();

    // 优先支付网费（直播必需）
    if (state.income >= expenses.internet) {
      this.playerData.addIncome(-expenses.internet);
      this.playerData.updateSurvival('internetDue', -state.survival.internetDue);
      messages.push('勉强支付了网费，可以正常直播');
    } else {
      this.playerData.updateSurvival('internetDue', 1);
      messages.push('网费拖欠，网络可能不稳定');
    }

    // 然后支付食物
    if (state.income >= expenses.food) {
      this.playerData.addIncome(-expenses.food);
      this.playerData.updateSurvival('foodDays', -state.survival.foodDays);
      messages.push('买了些便宜的食物');
    } else {
      this.playerData.updateSurvival('foodDays', 1);
      messages.push('没钱买食物，只能饿着');
    }

    // 水电费
    if (state.income >= expenses.utilities) {
      this.playerData.addIncome(-expenses.utilities);
      this.playerData.updateSurvival('utilitiesDue', -state.survival.utilitiesDue);
    } else {
      this.playerData.updateSurvival('utilitiesDue', 1);
    }

    // 房租（优先级最低，因为可以拖欠最久）
    if (state.income >= expenses.rent) {
      this.playerData.addIncome(-expenses.rent);
      this.playerData.updateSurvival('rentDue', -state.survival.rentDue);
    } else {
      this.playerData.updateSurvival('rentDue', 1);
      messages.push(`房租拖欠第${state.survival.rentDue + 1}天`);
    }
  }

  /**
   * 重置生存状态（支付成功后）
   */
  private resetSurvivalState(): void {
    this.playerData.updateSurvival('rentDue', -this.playerData.getState().survival.rentDue);
    this.playerData.updateSurvival('utilitiesDue', -this.playerData.getState().survival.utilitiesDue);
    this.playerData.updateSurvival('foodDays', -this.playerData.getState().survival.foodDays);
    this.playerData.updateSurvival('internetDue', -this.playerData.getState().survival.internetDue);
  }

  /**
   * 检查生存危机
   */
  private checkSurvivalCrisis(): SurvivalCrisis | undefined {
    const state = this.playerData.getState();
    const { survival } = state;

    // 房租危机
    if (survival.rentDue >= SURVIVAL_THRESHOLDS.rent.critical) {
      return {
        type: 'rent',
        level: 'critical',
        message: '房东下达最后通牒：今晚必须搬走！',
        effects: {
          canStream: false,
          sanityPenalty: 30,
          followerPenalty: 5000,
        },
      };
    }
    if (survival.rentDue >= SURVIVAL_THRESHOLDS.rent.warning) {
      return {
        type: 'rent',
        level: 'warning',
        message: '房东警告：再拖欠就要断水断电了！',
        effects: {
          sanityPenalty: 10,
        },
      };
    }

    // 水电危机
    if (survival.utilitiesDue >= SURVIVAL_THRESHOLDS.utilities.critical) {
      return {
        type: 'utilities',
        level: 'critical',
        message: '断水断电！无法正常生活',
        effects: {
          canStream: false,
          sanityPenalty: 20,
        },
      };
    }
    if (survival.utilitiesDue >= SURVIVAL_THRESHOLDS.utilities.warning) {
      return {
        type: 'utilities',
        level: 'warning',
        message: '水电费拖欠，供应不稳定',
        effects: {
          sanityPenalty: 5,
        },
      };
    }

    // 食物危机
    if (survival.foodDays >= SURVIVAL_THRESHOLDS.food.critical) {
      return {
        type: 'food',
        level: 'critical',
        message: '已经两天没吃东西了，头晕眼花...',
        effects: {
          sanityPenalty: 15,
          followerPenalty: 1000,
        },
      };
    }
    if (survival.foodDays >= SURVIVAL_THRESHOLDS.food.warning) {
      return {
        type: 'food',
        level: 'warning',
        message: '肚子好饿...今天没吃东西',
        effects: {
          sanityPenalty: 5,
        },
      };
    }

    // 网费危机
    if (survival.internetDue >= SURVIVAL_THRESHOLDS.internet.critical) {
      return {
        type: 'internet',
        level: 'critical',
        message: '网络已断开！无法直播',
        effects: {
          canStream: false,
          followerPenalty: 2000,
        },
      };
    }

    return undefined;
  }

  /**
   * 应用危机效果
   */
  private applyCrisisEffects(crisis: SurvivalCrisis): void {
    if (crisis.effects.sanityPenalty) {
      this.playerData.addSanity(-crisis.effects.sanityPenalty);
    }
    if (crisis.effects.followerPenalty) {
      this.playerData.addFollowers(-crisis.effects.followerPenalty);
    }
  }

  /**
   * 检查是否可以直播
   */
  canStream(): { canStream: boolean; reason?: string } {
    const state = this.playerData.getState();
    const { survival } = state;

    // 断网无法直播
    if (survival.internetDue >= SURVIVAL_THRESHOLDS.internet.critical) {
      return { canStream: false, reason: '网络已断开，无法直播' };
    }

    // 断水断电无法直播（设备没电）
    if (survival.utilitiesDue >= SURVIVAL_THRESHOLDS.utilities.critical) {
      return { canStream: false, reason: '断水断电，设备无法运行' };
    }

    // 被驱逐无法直播
    if (survival.rentDue >= SURVIVAL_THRESHOLDS.rent.critical) {
      return { canStream: false, reason: '已被房东驱逐，无处直播' };
    }

    return { canStream: true };
  }

  /**
   * 获取生存状态摘要
   */
  getSurvivalSummary(): string {
    const state = this.playerData.getState();
    const { survival } = state;
    const parts: string[] = [];

    if (survival.rentDue > 0) {
      parts.push(`房租拖欠${survival.rentDue}天`);
    }
    if (survival.utilitiesDue > 0) {
      parts.push(`水电拖欠${survival.utilitiesDue}天`);
    }
    if (survival.foodDays > 0) {
      parts.push(`未进食${survival.foodDays}天`);
    }
    if (survival.internetDue > 0) {
      parts.push(`网费拖欠${survival.internetDue}天`);
    }

    return parts.length > 0 ? parts.join('，') : '一切正常';
  }

  /**
   * 支付特定费用（用于事件中的选择）
   */
  payExpense(type: 'rent' | 'utilities' | 'food' | 'internet', amount: number): boolean {
    const state = this.playerData.getState();
    
    if (state.income < amount) {
      return false;
    }

    this.playerData.addIncome(-amount);
    
    const survivalKey = {
      rent: 'rentDue',
      utilities: 'utilitiesDue',
      food: 'foodDays',
      internet: 'internetDue',
    } as const;

    // 清除拖欠状态
    const currentDue = state.survival[survivalKey[type]];
    if (currentDue > 0) {
      this.playerData.updateSurvival(survivalKey[type], -currentDue);
    }

    return true;
  }

  /**
   * 获取每日支出金额
   */
  getDailyExpenses(): typeof DAILY_EXPENSES {
    return { ...DAILY_EXPENSES };
  }
}
