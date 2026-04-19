/**
 * 生存支付系统
 * 管理每日支出、收入、生存危机
 */

import { logger } from '../core/DebugLogger';
import { 
  PlayerState, 
  DAILY_EXPENSES,
  NPCRelations 
} from '../data/Types';

export interface DailyResult {
  expenses: number;
  income: number;
  balance: number;
  crisis?: SurvivalCrisis;
}

export interface SurvivalCrisis {
  type: 'rent' | 'utilities' | 'food' | 'internet' | 'eviction';
  description: string;
  effects: {
    stamina?: number;
    followers?: number;
    canLivestream?: boolean;
  };
}

export class SurvivalSystem {
  private state: PlayerState;

  constructor(state: PlayerState) {
    this.state = state;
  }

  /**
   * 处理每日结算
   */
  processDaily(): DailyResult {
    logger.info('SurvivalSystem', 'Processing daily survival', { day: this.state.day });

    // 1. 计算支出
    const expenses = this.calculateExpenses();
    
    // 2. 计算收入
    const income = this.calculateIncome();
    
    // 3. 更新金钱
    const oldMoney = this.state.money;
    this.state.money += income - expenses;
    
    logger.info('SurvivalSystem', 'Daily balance updated', {
      oldMoney,
      newMoney: this.state.money,
      income,
      expenses
    });

    // 4. 检查生存危机
    const crisis = this.checkCrisis();

    // 5. 更新生存状态
    this.updateSurvivalStatus(expenses);

    return {
      expenses,
      income,
      balance: this.state.money,
      crisis
    };
  }

  /**
   * 计算每日支出
   */
  private calculateExpenses(): number {
    let total = 0;

    DAILY_EXPENSES.forEach(expense => {
      // 检查是否拖欠
      const dueDays = this.getDueDays(expense.name);
      
      if (dueDays >= expense.overdueDays) {
        // 已经触发危机，不扣费但记录
        logger.warn('SurvivalSystem', `${expense.name} crisis active`, { dueDays });
      } else {
        total += expense.amount;
      }
    });

    return total;
  }

  /**
   * 计算每日收入
   */
  private calculateIncome(): number {
    let total = 0;

    // 1. 直播打赏收入
    const livestreamIncome = this.calculateLivestreamIncome();
    total += livestreamIncome;

    // 2. 品牌合作（随机触发）
    if (this.state.followers > 10000 && Math.random() < 0.3) {
      const brandIncome = 5000 + Math.random() * 45000;
      total += Math.floor(brandIncome);
      logger.info('SurvivalSystem', 'Brand deal income', { amount: brandIncome });
    }

    // 3. 带货分成（如果有）
    // TODO: 实现带货系统

    logger.info('SurvivalSystem', 'Daily income calculated', {
      livestream: livestreamIncome,
      total
    });

    return Math.floor(total);
  }

  /**
   * 计算直播打赏收入
   */
  private calculateLivestreamIncome(): number {
    // 基础收入 = 人气值 * 系数
    const baseMultiplier = 0.1 + Math.random() * 0.4; // 0.1 ~ 0.5
    const income = this.state.followers * baseMultiplier;
    
    // 精神状态影响收入
    let sanityMultiplier = 1;
    if (this.state.sanity < 30) {
      // 精神崩溃时收入增加（猎奇效应）
      sanityMultiplier = 1.5;
    } else if (this.state.sanity > 80) {
      // 太正常反而没人看
      sanityMultiplier = 0.7;
    }

    return Math.floor(income * sanityMultiplier);
  }

  /**
   * 检查生存危机
   */
  private checkCrisis(): SurvivalCrisis | undefined {
    const { survival } = this.state;

    // 1. 被驱逐（房租拖欠10天）
    if (survival.rentDue >= 10) {
      return {
        type: 'eviction',
        description: '你被房东赶出了出租屋，无家可归',
        effects: {
          canLivestream: false
        }
      };
    }

    // 2. 断水断电（水电拖欠3天）
    if (survival.utilitiesDue >= 3) {
      return {
        type: 'utilities',
        description: '水电被切断，无法正常生活',
        effects: {
          stamina: -10,
          canLivestream: false
        }
      };
    }

    // 3. 断网（网费拖欠1天）
    if (survival.internetDue >= 1) {
      return {
        type: 'internet',
        description: '网络被切断，无法直播',
        effects: {
          canLivestream: false
        }
      };
    }

    // 4. 饥饿（2天没吃）
    if (survival.foodDays >= 2) {
      return {
        type: 'food',
        description: '你已经饿得前胸贴后背了',
        effects: {
          stamina: -20
        }
      };
    }

    // 5. 房租催缴（7天）
    if (survival.rentDue >= 7) {
      return {
        type: 'rent',
        description: '房东下达最后通牒，再不交房租就要被赶出去',
        effects: {}
      };
    }

    return undefined;
  }

  /**
   * 更新生存状态
   */
  private updateSurvivalStatus(expenses: number): void {
    const { survival, money } = this.state;

    // 如果钱不够支付全部费用，记录拖欠
    if (money < 0) {
      // 按优先级记录拖欠
      let remainingDebt = -money;

      // 房租（最高优先级）
      if (remainingDebt > 0) {
        survival.rentDue++;
        remainingDebt -= 100;
      }

      // 水电
      if (remainingDebt > 0) {
        survival.utilitiesDue++;
        remainingDebt -= 20;
      }

      // 食物
      if (remainingDebt > 0) {
        survival.foodDays++;
        remainingDebt -= 30;
      }

      // 网费
      if (remainingDebt > 0) {
        survival.internetDue++;
        remainingDebt -= 10;
      }
    } else {
      // 有钱支付，重置拖欠天数
      survival.rentDue = 0;
      survival.utilitiesDue = 0;
      survival.foodDays = 0;
      survival.internetDue = 0;
    }

    logger.info('SurvivalSystem', 'Survival status updated', { survival });
  }

  /**
   * 获取拖欠天数
   */
  private getDueDays(expenseName: string): number {
    const { survival } = this.state;
    
    switch (expenseName) {
      case '房租': return survival.rentDue;
      case '水电费': return survival.utilitiesDue;
      case '食物': return survival.foodDays;
      case '网费': return survival.internetDue;
      default: return 0;
    }
  }

  /**
   * 外出打工赚钱
   */
  workPartTime(): { success: boolean; earnings: number; message: string } {
    const earnings = 100;
    this.state.money += earnings;
    this.state.stamina -= 30;
    this.state.followers -= 1000; // 没时间直播，掉粉

    logger.info('SurvivalSystem', 'Part-time work completed', { earnings });

    return {
      success: true,
      earnings,
      message: `你外出打工赚了${earnings}元，但体力消耗很大，粉丝也流失了一些`
    };
  }

  /**
   * 恳求延期支付
   */
  requestExtension(npcRelations: NPCRelations): { success: boolean; message: string } {
    // 需要房东好感度≥40或诚信值>60
    if (npcRelations.landlady >= 40 || this.state.integrity > 60) {
      this.state.survival.rentDue = Math.max(0, this.state.survival.rentDue - 3);
      
      logger.info('SurvivalSystem', 'Extension granted');
      
      return {
        success: true,
        message: '房东同意给你延期3天'
      };
    }

    return {
      success: false,
      message: '房东拒绝了你的请求'
    };
  }

  /**
   * 直播借钱
   */
  livestreamForDonations(): { success: boolean; amount: number; message: string } {
    const baseAmount = 500;
    const randomBonus = Math.floor(Math.random() * 1000);
    const totalAmount = baseAmount + randomBonus;

    this.state.money += totalAmount;
    this.state.integrity -= 5; // 诚信值下降

    logger.info('SurvivalSystem', 'Livestream donations received', { amount: totalAmount });

    return {
      success: true,
      amount: totalAmount,
      message: `粉丝们给你打赏了${totalAmount}元，但有人质疑你在卖惨`
    };
  }

  /**
   * 获取生存状态摘要
   */
  getSurvivalSummary(): {
    dailyExpenses: number;
    currentMoney: number;
    daysUntilCrisis: Record<string, number>;
    canLivestream: boolean;
  } {
    const { survival, money } = this.state;

    return {
      dailyExpenses: 160,
      currentMoney: money,
      daysUntilCrisis: {
        eviction: Math.max(0, 10 - survival.rentDue),
        utilities: Math.max(0, 3 - survival.utilitiesDue),
        food: Math.max(0, 2 - survival.foodDays),
        internet: Math.max(0, 1 - survival.internetDue)
      },
      canLivestream: survival.internetDue < 1 && survival.utilitiesDue < 3
    };
  }

  /**
   * 强制支付某项费用（用于玩家主动选择）
   */
  forcePayExpense(expenseName: string): { success: boolean; message: string } {
    const expense = DAILY_EXPENSES.find(e => e.name === expenseName);
    if (!expense) {
      return { success: false, message: '未知的费用类型' };
    }

    if (this.state.money >= expense.amount) {
      this.state.money -= expense.amount;
      
      // 重置对应的拖欠天数
      switch (expenseName) {
        case '房租':
          this.state.survival.rentDue = 0;
          break;
        case '水电费':
          this.state.survival.utilitiesDue = 0;
          break;
        case '食物':
          this.state.survival.foodDays = 0;
          this.state.stamina = Math.min(100, this.state.stamina + 20);
          break;
        case '网费':
          this.state.survival.internetDue = 0;
          break;
      }

      logger.info('SurvivalSystem', `Paid ${expenseName}`, { amount: expense.amount });

      return {
        success: true,
        message: `支付了${expenseName} ${expense.amount}元`
      };
    }

    return {
      success: false,
      message: '余额不足'
    };
  }
}

// 单例导出
let survivalSystemInstance: SurvivalSystem | null = null;

export function getSurvivalSystem(state: PlayerState): SurvivalSystem {
  if (!survivalSystemInstance || survivalSystemInstance['state'] !== state) {
    survivalSystemInstance = new SurvivalSystem(state);
  }
  return survivalSystemInstance;
}
