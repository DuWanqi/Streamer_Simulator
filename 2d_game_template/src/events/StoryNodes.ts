/**
 * 6个核心剧情节点
 * 双面人生主线剧情
 */

import type { StoryNode } from '../data/Types';

/**
 * 6个核心剧情节点
 */
export const STORY_NODES: StoryNode[] = [
  // ========== 节点1：房东太太晕倒（第3-5天）==========
  {
    id: 'node1_landlady',
    name: '房东太太晕倒',
    triggerDay: [3, 5],
    title: '楼道里的意外',
    description: '你正准备今晚的重要PK，却在楼道撞见房东太太晕倒在地。她的脸色苍白，呼吸微弱...',
    background: 'corridor',
    character: 'landlady',
    choices: [
      {
        id: 'choice_1a',
        text: '放弃PK，送医院',
        effects: {
          kindness: 20,
          money: -500,
          stamina: -10,
          npcRelations: { landlady: 30 }
        }
      },
      {
        id: 'choice_1b',
        text: '拨打120后继续直播',
        effects: {
          followers: 5000,
          integrity: -5,
          npcRelations: { landlady: 10 }
        }
      },
      {
        id: 'choice_1c',
        text: '假装没看见',
        effects: {
          kindness: -30,
          integrity: -15,
          npcRelations: { landlady: -30 }
        }
      },
      {
        id: 'choice_1d',
        text: '联系房东儿子后再直播',
        effects: {
          followers: 3000,
          integrity: -10
        }
      }
    ]
  },

  // ========== 节点2：邻居骚扰与网暴（第11-13天）==========
  {
    id: 'node2_harassment',
    name: '邻居骚扰与网暴',
    triggerDay: [11, 13],
    title: '风暴来袭',
    description: '猥琐男在直播间散布谣言，说你"靠不正当手段涨粉"。弹幕瞬间爆炸，#小爱自己清楚#冲上热搜...',
    background: 'livestream_room',
    character: 'harasser',
    prerequisites: {
      minFollowers: 10000
    },
    choices: [
      {
        id: 'choice_2a',
        text: '自己发声明澄清',
        effects: {
          integrity: 10,
          followers: -2000,
          sanity: -10
        }
      },
      {
        id: 'choice_2b',
        text: '冷处理，等待风波过去',
        effects: {
          integrity: -15,
          followers: -5000,
          sanity: -20,
          personaIntegrity: -10
        }
      },
      {
        id: 'choice_2c',
        text: '找邻居对质',
        effects: {
          stamina: -10,
          kindness: -5,
          sanity: -5,
          npcRelations: { harasser: -20 }
        }
      },
      {
        id: 'choice_2d',
        text: '寻求平台帮助',
        effects: {
          integrity: 5,
          followers: 3000,
          money: -1000
        }
      }
    ]
  },

  // ========== 节点3：捡到豆豆（第6天）==========
  {
    id: 'node3_doudou',
    name: '捡到豆豆',
    triggerDay: [6, 6],
    title: '雨中的相遇',
    description: '下班路上，你在垃圾桶旁发现了一只受伤的流浪狗。它瑟瑟发抖，眼神中满是恐惧...',
    background: 'street',
    character: 'doudou',
    choices: [
      {
        id: 'choice_3a',
        text: '不让豆豆直播，专心照顾',
        effects: {
          kindness: 20,
          sanity: 10,
          money: -200,
          npcRelations: { doudou: 30 }
        }
      },
      {
        id: 'choice_3b',
        text: '让豆豆频繁直播赚钱',
        effects: {
          kindness: -30,
          money: 50000,
          followers: 10000,
          sanity: -15,
          npcRelations: { doudou: -20 }
        }
      },
      {
        id: 'choice_3c',
        text: '控制直播时长，兼顾',
        effects: {
          kindness: 10,
          money: 20000,
          followers: 5000,
          npcRelations: { doudou: 10 }
        }
      },
      {
        id: 'choice_3d',
        text: '转让代言，委托专业照顾',
        effects: {
          kindness: 15,
          money: 10000,
          npcRelations: { doudou: 5 }
        }
      }
    ]
  },

  // ========== 节点4：可心的悲剧（第10-12天）==========
  {
    id: 'node4_kexin',
    name: '可心的悲剧',
    triggerDay: [10, 12],
    title: '无法承受之重',
    description: '可心因工伤被辞退，抑郁症爆发。你回到家时，发现她坐在窗边，眼神空洞...三天后，她选择了离开。',
    background: 'apartment',
    character: 'kexin',
    prerequisites: {
      npcRelations: { kexin: 50 }
    },
    choices: [
      {
        id: 'choice_4a',
        text: '利用悲剧"吃人血馒头"',
        effects: {
          kindness: -50,
          followers: 50000,
          money: 30000,
          sanity: -30,
          personaIntegrity: -40
        }
      },
      {
        id: 'choice_4b',
        text: '默默帮助可心家人',
        effects: {
          kindness: 30,
          integrity: 20,
          money: -10000,
          sanity: -10
        }
      },
      {
        id: 'choice_4c',
        text: '寻求公众帮助',
        effects: {
          kindness: 25,
          followers: 10000,
          money: 5000
        }
      },
      {
        id: 'choice_4d',
        text: '暂停直播，陪伴家人',
        effects: {
          kindness: 35,
          followers: -5000,
          stamina: 20,
          sanity: 15
        }
      }
    ]
  },

  // ========== 节点5：与月牙儿的世纪PK（第16-18天）==========
  {
    id: 'node5_pk',
    name: '与月牙儿的世纪PK',
    triggerDay: [16, 18],
    title: '巅峰对决',
    description: '你收到了月牙儿的黑料——她早期的不当言论截图。这是击败她的绝佳机会...',
    background: 'livestream_room',
    character: 'yueya',
    prerequisites: {
      minFollowers: 500000
    },
    choices: [
      {
        id: 'choice_5a',
        text: '发布黑料',
        effects: {
          kindness: -40,
          followers: 100000,
          integrity: -30,
          npcRelations: { yueya: -50 }
        }
      },
      {
        id: 'choice_5b',
        text: '不发布，公平竞争',
        effects: {
          kindness: 20,
          integrity: 20,
          followers: 20000,
          npcRelations: { yueya: 20 }
        }
      },
      {
        id: 'choice_5c',
        text: '私下沟通',
        effects: {
          kindness: 30,
          integrity: 10,
          npcRelations: { yueya: 40 }
        }
      },
      {
        id: 'choice_5d',
        text: '举报给平台',
        effects: {
          kindness: 15,
          followers: 50000,
          npcRelations: { yueya: -30 }
        }
      }
    ]
  },

  // ========== 节点6：母亲的阿尔茨海默症（第20天）==========
  {
    id: 'node6_mother',
    name: '母亲的阿尔茨海默症',
    triggerDay: [20, 20],
    title: '最终的抉择',
    description: '你终于成为了百万粉博主，但妈妈确诊了阿尔茨海默症。她渐渐记不起你是谁，只记得"我的小爱"...',
    background: 'hospital',
    character: 'mom',
    choices: [
      {
        id: 'choice_6a',
        text: '放弃直播，回老家陪伴',
        effects: {
          kindness: 40,
          followers: -200000,
          money: -50000,
          sanity: 30,
          personaIntegrity: 30,
          npcRelations: { mom: 50 }
        }
      },
      {
        id: 'choice_6b',
        text: '请专人照顾，继续直播',
        effects: {
          kindness: -20,
          money: 200000,
          sanity: -20,
          npcRelations: { mom: -20 }
        }
      },
      {
        id: 'choice_6c',
        text: '调整节奏，兼顾',
        effects: {
          kindness: 25,
          money: 100000,
          followers: -50000,
          npcRelations: { mom: 30 }
        }
      },
      {
        id: 'choice_6d',
        text: '带着母亲直播',
        effects: {
          kindness: 30,
          followers: 50000,
          money: 50000,
          npcRelations: { mom: 20 }
        }
      }
    ]
  }
];

/**
 * 获取指定剧情节点
 */
export function getStoryNodeById(id: string): StoryNode | undefined {
  return STORY_NODES.find(node => node.id === id);
}

/**
 * 获取指定天数范围内的剧情节点
 */
export function getStoryNodesByDay(day: number): StoryNode[] {
  return STORY_NODES.filter(node => {
    const [start, end] = node.triggerDay;
    return day >= start && day <= end;
  });
}

/**
 * 剧情节点名称映射
 */
export const STORY_NODE_NAMES: Record<string, string> = {
  'node1_landlady': '房东太太晕倒',
  'node2_harassment': '邻居骚扰与网暴',
  'node3_doudou': '捡到豆豆',
  'node4_kexin': '可心的悲剧',
  'node5_pk': '与月牙儿的世纪PK',
  'node6_mother': '母亲的阿尔茨海默症'
};
