/**
 * NPC系统 - 管理NPC好感度和互动
 * 
 * 根据设计案第3章：NPC好感度系统
 */

import type { PlayerData } from '../game/PlayerData';
import { NPCS, type NPCConfig } from '../game/GameConfig';

export interface NPCInteraction {
  npcId: string;
  npcName: string;
  emotion: string;
  dialog: string;
  choices?: NPCChoice[];
}

export interface NPCChoice {
  id: string;
  text: string;
  emotion: string;
  effects: {
    relation?: number;
    kindness?: number;
    integrity?: number;
    sanity?: number;
  };
  response: string;
}

export interface DailyNPCEvent {
  npcId: string;
  trigger: boolean;
  interaction?: NPCInteraction;
}

export class NPCSystem {
  private playerData: PlayerData;

  constructor(playerData: PlayerData) {
    this.playerData = playerData;
  }

  /**
   * 检查每日NPC互动
   * 根据设计案，某些NPC会在特定天数触发互动
   */
  checkDailyInteraction(day: number): DailyNPCEvent | null {
    const state = this.playerData.getState();

    // 第1天：房东太太首次出现（交房租提醒）
    if (day === 1) {
      return {
        npcId: 'landlady',
        trigger: true,
        interaction: this.getLandladyFirstMeeting(),
      };
    }

    // 第3天：可心出现
    if (day === 3) {
      return {
        npcId: 'kexin',
        trigger: true,
        interaction: this.getKexinFirstMeeting(),
      };
    }

    // 第6天：捡到豆豆
    if (day === 6) {
      return {
        npcId: 'doudou',
        trigger: true,
        interaction: this.getDoudouEvent(),
      };
    }

    // 第11天：猥琐男出现
    if (day === 11) {
      return {
        npcId: 'harasser',
        trigger: true,
        interaction: this.getHarasserFirstMeeting(),
      };
    }

    // 第16天：月牙儿出现
    if (day === 16) {
      return {
        npcId: 'yueya',
        trigger: true,
        interaction: this.getYueyaFirstMeeting(),
      };
    }

    // 随机日常互动（20%概率）
    if (Math.random() < 0.2) {
      const availableNPCs = this.getAvailableNPCs(day);
      if (availableNPCs.length > 0) {
        const randomNPC = availableNPCs[Math.floor(Math.random() * availableNPCs.length)];
        return {
          npcId: randomNPC.id,
          trigger: true,
          interaction: this.getRandomInteraction(randomNPC.id),
        };
      }
    }

    return null;
  }

  /**
   * 获取当前可用的NPC列表
   */
  private getAvailableNPCs(day: number): NPCConfig[] {
    return NPCS.filter(npc => npc.firstAppearanceDay <= day);
  }

  /**
   * 房东太太首次见面
   */
  private getLandladyFirstMeeting(): NPCInteraction {
    return {
      npcId: 'landlady',
      npcName: '房东太太',
      emotion: 'nervous',
      dialog: '（敲门声）小姑娘，我是房东。这个月的房租该交了，100块一天，可别拖欠太久啊。',
      choices: [
        {
          id: 'polite',
          text: '好的阿姨，我会按时交的',
          emotion: 'happy',
          effects: { relation: 10, kindness: 5 },
          response: '嗯，懂事。有困难可以跟我说，但别超过7天。',
        },
        {
          id: 'ask_delay',
          text: '阿姨，能不能宽限几天？我现在手头紧...',
          emotion: 'nervous',
          effects: { relation: -5 },
          response: '哼，每个租客都这么说。最多7天，超过我就断你水电！',
        },
        {
          id: 'silent',
          text: '（默默点头，关上门）',
          emotion: 'default',
          effects: {},
          response: '（房东太太皱眉离开）现在的年轻人，真没礼貌。',
        },
      ],
    };
  }

  /**
   * 可心首次见面
   */
  private getKexinFirstMeeting(): NPCInteraction {
    return {
      npcId: 'kexin',
      npcName: '可心',
      emotion: 'happy',
      dialog: '嗨！我是隔壁的可心，刚搬来不久。听说你也是做直播的？以后可以互相照应呀！',
      choices: [
        {
          id: 'friendly',
          text: '太好了！正愁没人说话呢，一起加油！',
          emotion: 'happy',
          effects: { relation: 15, kindness: 5, sanity: 5 },
          response: '嗯！我们一起在这个城市打拼，互相扶持！',
        },
        {
          id: 'cautious',
          text: '嗯...我先忙了，改天聊',
          emotion: 'nervous',
          effects: { relation: -5 },
          response: '哦...好的，那不打扰你了。',
        },
        {
          id: 'ask_help',
          text: '你能教我怎么做直播吗？我刚起步什么都不懂',
          emotion: 'nervous',
          effects: { relation: 10, integrity: 5 },
          response: '当然可以！我虽然不是大主播，但经验还是有一些的。',
        },
      ],
    };
  }

  /**
   * 捡到豆豆事件
   */
  private getDoudouEvent(): NPCInteraction {
    return {
      npcId: 'doudou',
      npcName: '???',
      emotion: 'scared',
      dialog: '（楼下传来微弱的呜咽声）一只脏兮兮的小狗蜷缩在角落，后腿似乎受了伤...',
      choices: [
        {
          id: 'help',
          text: '带它回家，给它包扎伤口',
          emotion: 'happy',
          effects: { relation: 30, kindness: 20, sanity: 10 },
          response: '小狗舔了舔你的手，尾巴摇了起来。你决定叫它"豆豆"。',
        },
        {
          id: 'ignore',
          text: '我连自己都养不起，还是别多管闲事了',
          emotion: 'sad',
          effects: { kindness: -10, sanity: -5 },
          response: '你转身离开，但心里总觉得空落落的。',
        },
        {
          id: 'call_help',
          text: '打电话给动物救助站',
          emotion: 'nervous',
          effects: { kindness: 10 },
          response: '救助站的人来了，说会好好照顾它。你看着小狗被带走，有点不舍。',
        },
      ],
    };
  }

  /**
   * 猥琐男首次见面
   */
  private getHarasserFirstMeeting(): NPCInteraction {
    return {
      npcId: 'harasser',
      npcName: '合租邻居',
      emotion: 'disgusted',
      dialog: '（电梯里）哟，这不是那个直播的小姑娘吗？长得挺漂亮的嘛，晚上一个人害不害怕啊？',
      choices: [
        {
          id: 'ignore',
          text: '（不理他，快步走开）',
          emotion: 'angry',
          effects: { relation: -5, sanity: -5 },
          response: '（他在背后阴阳怪气）装什么清高，不就是个主播嘛。',
        },
        {
          id: 'warn',
          text: '请你放尊重一点，不然我报警了',
          emotion: 'angry',
          effects: { relation: -10, integrity: 5 },
          response: '（他脸色一变）哼，开个玩笑而已，至于吗。',
        },
        {
          id: 'polite_refuse',
          text: '谢谢关心，我很好',
          emotion: 'nervous',
          effects: { relation: 5, kindness: 5 },
          response: '（他讪笑）哈哈，有个性，我喜欢。',
        },
      ],
    };
  }

  /**
   * 月牙儿首次见面
   */
  private getYueyaFirstMeeting(): NPCInteraction {
    return {
      npcId: 'yueya',
      npcName: '月牙儿',
      emotion: 'nervous',
      dialog: '你就是小爱吧？我看过你的直播，做得不错嘛。不过想在这个圈子混，光靠努力可不够哦。',
      choices: [
        {
          id: 'humble',
          text: '月牙儿前辈！我是你的粉丝，能给我一些建议吗？',
          emotion: 'happy',
          effects: { relation: 15, integrity: 5 },
          response: '（她愣了一下）呵，倒是挺会说话的。行，以后有机会合作。',
        },
        {
          id: 'competitive',
          text: '谢谢提醒，不过我相信实力会说话',
          emotion: 'confident',
          effects: { relation: -5 },
          response: '（她冷笑）有骨气，希望你别摔得太惨。',
        },
        {
          id: 'neutral',
          text: '每个人都有自己的风格，我会继续努力的',
          emotion: 'default',
          effects: { relation: 5 },
          response: '（她挑眉）有意思，我记住你了。',
        },
      ],
    };
  }

  /**
   * 随机日常互动
   */
  private getRandomInteraction(npcId: string): NPCInteraction {
    const interactions: Record<string, NPCInteraction[]> = {
      landlady: [
        {
          npcId: 'landlady',
          npcName: '房东太太',
          emotion: 'happy',
          dialog: '小姑娘，今天做了红烧肉，要不要来尝尝？',
          choices: [
            { id: 'accept', text: '谢谢阿姨！', emotion: 'happy', effects: { relation: 10, kindness: 5 }, response: '来吧来吧，一个人吃饭没意思。' },
            { id: 'decline', text: '不用了，我在直播', emotion: 'nervous', effects: {}, response: '唉，你们年轻人啊，就知道对着屏幕。' },
          ],
        },
      ],
      kexin: [
        {
          npcId: 'kexin',
          npcName: '可心',
          emotion: 'sad',
          dialog: '今天又被老板骂了...工作压力好大啊',
          choices: [
            { id: 'comfort', text: '别难过，来我直播间散散心吧', emotion: 'happy', effects: { relation: 10, kindness: 10 }, response: '谢谢你，有你这个朋友真好。' },
            { id: 'advice', text: '要不要考虑换个工作？', emotion: 'nervous', effects: { relation: 5 }, response: '我也想啊，但是...唉，再说吧。' },
          ],
        },
      ],
      doudou: [
        {
          npcId: 'doudou',
          npcName: '豆豆',
          emotion: 'playful',
          dialog: '（豆豆叼着玩具球，期待地看着你）',
          choices: [
            { id: 'play', text: '来，陪你玩一会儿', emotion: 'happy', effects: { relation: 10, sanity: 10 }, response: '（豆豆开心地摇尾巴）' },
            { id: 'busy', text: '乖，自己玩，我在忙', emotion: 'tired', effects: { relation: -5 }, response: '（豆豆委屈地趴下）' },
          ],
        },
      ],
    };

    const npcInteractions = interactions[npcId];
    if (npcInteractions && npcInteractions.length > 0) {
      return npcInteractions[Math.floor(Math.random() * npcInteractions.length)];
    }

    // 默认互动
    const npc = NPCS.find(n => n.id === npcId);
    return {
      npcId,
      npcName: npc?.name || '???',
      emotion: 'default',
      dialog: `（${npc?.name}看了你一眼，没有说话）`,
    };
  }

  /**
   * 应用选择效果
   */
  applyChoiceEffects(choice: NPCChoice, npcId: string): void {
    if (choice.effects.relation) {
      this.playerData.addNPCRelation(npcId as keyof import('../game/PlayerData').NPCRelations, choice.effects.relation);
    }
    if (choice.effects.kindness) {
      this.playerData.addKindness(choice.effects.kindness);
    }
    if (choice.effects.integrity) {
      this.playerData.addIntegrity(choice.effects.integrity);
    }
    if (choice.effects.sanity) {
      this.playerData.addSanity(choice.effects.sanity);
    }
  }

  /**
   * 获取NPC信息
   */
  getNPCInfo(npcId: string): NPCConfig | undefined {
    return NPCS.find(npc => npc.id === npcId);
  }

  /**
   * 获取NPC立绘路径（左侧显示）
   * 注意：NPC没有立绘资源，用文字头像代替
   */
  getNPCPortrait(npcId: string): string {
    // NPC使用emoji或默认头像
    const npcEmojis: Record<string, string> = {
      landlady: '👵',
      kexin: '👩',
      mom: '👩‍🦳',
      doudou: '🐕',
      yueya: '👸',
      harasser: '👨',
    };
    return npcEmojis[npcId] || '👤';
  }
}
