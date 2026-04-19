/**
 * 核心剧情节点 - 6个主线剧情
 *
 * 根据设计案第5章：事件系统（双轨制）
 * 这些剧情节点在固定天数必然触发
 */

import type { PlayerData } from '../game/PlayerData';

export interface StoryChoice {
  id: string;
  text: string;
  emotion: string;
  effects: {
    followers?: number;
    kindness?: number;
    integrity?: number;
    sanity?: number;
    money?: number;
    npcRelation?: { npcId: string; change: number };
    personaIntegrity?: number;
  };
  response: string;
  responseEmotion: string;
}

export interface StoryNode {
  id: string;
  name: string;
  triggerDay: number | [number, number]; // 单天或天数范围
  prerequisite?: (state: ReturnType<PlayerData['getState']>) => boolean;
  emotion: string;
  monologue: string; // 主角开场独白
  scene: string; // 场景描述
  dialog: string; // 对话内容
  choices: StoryChoice[];
  isMajor: boolean; // 是否重大事件（会生成热搜）
}

// ==================== 剧情节点1：房东太太晕倒（第3-5天）====================
const node1: StoryNode = {
  id: 'node1_landlady',
  name: '房东太太晕倒',
  triggerDay: [3, 5],
  emotion: 'panicked',
  monologue: '（正准备开播，突然听到楼道里传来一声闷响）什么声音？好像是有人摔倒了...',
  scene: '楼道里，房东太太倒在地上，脸色苍白。手机显示今晚有一场重要PK，如果错过可能会失去很多粉丝。',
  dialog: '房东太太："救...救命...我的心脏...药在...口袋里..."（她的呼吸越来越急促）',
  choices: [
    {
      id: 'help_first',
      text: '放弃PK，立即送医院',
      emotion: 'happy',
      effects: {
        kindness: 20,
        npcRelation: { npcId: 'landlady', change: 30 },
        money: -500,
      },
      response: '虽然错过了PK，但房东太太得到了及时救治。她在病床上握着我的手说："好孩子，以后房租给你打折。"',
      responseEmotion: 'happy',
    },
    {
      id: 'call_ambulance',
      text: '拨打120后继续直播',
      emotion: 'nervous',
      effects: {
        followers: 5000,
        npcRelation: { npcId: 'landlady', change: 10 },
        kindness: -5,
      },
      response: '救护车来了，我继续直播。弹幕里有人说我冷血，也有人说这是职业素养...',
      responseEmotion: 'nervous',
    },
    {
      id: 'ignore',
      text: '假装没看见，继续准备直播',
      emotion: 'disgusted',
      effects: {
        kindness: -30,
        npcRelation: { npcId: 'landlady', change: -50 },
        sanity: -10,
        personaIntegrity: -20,
      },
      response: '（直播时心不在焉）弹幕问怎么了，我说没事。但心里总有个声音在质问：你这样做对吗？',
      responseEmotion: 'scared',
    },
    {
      id: 'contact_son',
      text: '联系房东儿子后再直播',
      emotion: 'nervous',
      effects: {
        followers: 3000,
        integrity: -10,
        npcRelation: { npcId: 'landlady', change: 5 },
      },
      response: '房东儿子赶来接手了，我继续直播。虽然人不是我送的，但至少...我通知了家属对吧？',
      responseEmotion: 'nervous',
    },
  ],
  isMajor: true,
};

// ==================== 剧情节点2：邻居骚扰与网暴（第11-13天）====================
const node2: StoryNode = {
  id: 'node2_harassment',
  name: '邻居骚扰与网暴',
  triggerDay: [11, 13],
  prerequisite: (state) => state.followers > 10000, // 需要粉丝量>1万
  emotion: 'angry',
  monologue: '（看着手机屏幕，手在发抖）这是什么？为什么突然这么多人骂我？',
  scene: '猥琐男在网上散布谣言，说小爱是"靠不正当手段上位的女主播"。评论区被攻陷，私信里全是辱骂。',
  dialog: '（手机不断震动）新消息："装什么清纯"、"听说你和房东有一腿？"、"这种人也配当主播？"',
  choices: [
    {
      id: 'statement',
      text: '自己发声明澄清',
      emotion: 'angry',
      effects: {
        integrity: 10,
        followers: -2000,
        sanity: -10,
      },
      response: '我发了一条长微博解释真相。有人相信，有人继续骂。但至少我说了实话。',
      responseEmotion: 'tired',
    },
    {
      id: 'ignore',
      text: '冷处理，等风波过去',
      emotion: 'scared',
      effects: {
        integrity: -15,
        sanity: -20,
        followers: -5000,
      },
      response: '我假装什么都没发生，继续直播。但弹幕里的质疑声越来越多，我的笑容越来越僵硬...',
      responseEmotion: 'nervous',
    },
    {
      id: 'confront',
      text: '找邻居对质',
      emotion: 'angry',
      effects: {
        npcRelation: { npcId: 'harasser', change: -20 },
        kindness: -5,
        sanity: -5,
      },
      response: '我冲到隔壁敲门，他开门时一脸得意。我们大吵一架，最后房东太太出面调解...',
      responseEmotion: 'angry',
    },
    {
      id: 'platform_help',
      text: '寻求平台帮助',
      emotion: 'nervous',
      effects: {
        integrity: 5,
        followers: 3000,
      },
      response: '平台介入后删除了造谣内容。虽然伤害已经造成，但至少制止了谣言继续扩散。',
      responseEmotion: 'happy',
    },
  ],
  isMajor: true,
};

// ==================== 剧情节点3：捡到豆豆（第6天）====================
const node3: StoryNode = {
  id: 'node3_doudou',
  name: '捡到豆豆',
  triggerDay: 6,
  emotion: 'scared',
  monologue: '（下楼扔垃圾时听到呜咽声）这声音...是狗吗？',
  scene: '楼道角落里，一只脏兮兮的小狗蜷缩着，后腿有伤。它用湿漉漉的眼睛看着你。',
  dialog: '小狗：（虚弱地摇尾巴，发出微弱的呜咽）',
  choices: [
    {
      id: 'care_only',
      text: '不让豆豆直播，专心照顾',
      emotion: 'happy',
      effects: {
        kindness: 20,
        npcRelation: { npcId: 'doudou', change: 30 },
        sanity: 10,
      },
      response: '豆豆成了我最好的伙伴。每次下播回家，它都在门口等我。这种被需要的感觉...很温暖。',
      responseEmotion: 'happy',
    },
    {
      id: 'exploit',
      text: '让豆豆频繁直播赚钱',
      emotion: 'disgusted',
      effects: {
        money: 50000,
        kindness: -30,
        npcRelation: { npcId: 'doudou', change: -20 },
        personaIntegrity: -30,
      },
      response: '"萌宠主播"的人设让我涨粉飞快。但豆豆越来越没精神，最后...（我不敢想下去）',
      responseEmotion: 'sad',
    },
    {
      id: 'balance',
      text: '控制直播时长，兼顾',
      emotion: 'nervous',
      effects: {
        kindness: 10,
        money: 20000,
        npcRelation: { npcId: 'doudou', change: 15 },
      },
      response: '偶尔让豆豆出镜，但大部分时间让它休息。粉丝们都很喜欢这个毛茸茸的小家伙。',
      responseEmotion: 'happy',
    },
    {
      id: 'delegate',
      text: '转让代言，委托专业照顾',
      emotion: 'nervous',
      effects: {
        kindness: 15,
        money: 10000,
        npcRelation: { npcId: 'doudou', change: 10 },
      },
      response: '我把豆豆托付给了一个靠谱的宠物博主。虽然舍不得，但至少它能得到更好的照顾。',
      responseEmotion: 'sad',
    },
  ],
  isMajor: true,
};

// ==================== 剧情节点4：可心的悲剧（第10-12天）====================
const node4: StoryNode = {
  id: 'node4_kexin',
  name: '可心的悲剧',
  triggerDay: [10, 12],
  prerequisite: (state) => state.npcRelations.kexin > 50,
  emotion: 'scared',
  monologue: '（凌晨被警笛声惊醒）发生什么事了？可心怎么还没回来？',
  scene: '凌晨三点，警察敲响了你的门。可心在公司加班时突发意外，从楼上跳下...',
  dialog: '警察："你是她的室友吧？她留下了遗书...说工作压力太大，还提到了你。"',
  choices: [
    {
      id: 'exploit_tragedy',
      text: '利用悲剧"吃人血馒头"',
      emotion: 'disgusted',
      effects: {
        kindness: -50,
        followers: 50000,
        sanity: -30,
        personaIntegrity: -50,
      },
      response: '我发了一条煽情的微博，配上可心的照片。粉丝暴涨，但评论区有人骂我消费死者...',
      responseEmotion: 'disgusted',
    },
    {
      id: 'help_family',
      text: '默默帮助可心家人',
      emotion: 'sad',
      effects: {
        kindness: 30,
        integrity: 20,
        money: -10000,
      },
      response: '我匿名给可心父母汇了一笔钱。他们失去了女儿，我能做的只有这些了...',
      responseEmotion: 'sad',
    },
    {
      id: 'public_help',
      text: '寻求公众帮助',
      emotion: 'nervous',
      effects: {
        kindness: 25,
        followers: 2000,
        integrity: 10,
      },
      response: '我发起了为可心家人募捐的活动。很多粉丝响应，但也有人质疑我的动机...',
      responseEmotion: 'nervous',
    },
    {
      id: 'accompany_family',
      text: '暂停直播，陪伴家人',
      emotion: 'sad',
      effects: {
        kindness: 35,
        followers: -10000,
        sanity: 15,
      },
      response: '我陪可心父母处理了后事。虽然掉了很多粉，但我觉得这是对的。',
      responseEmotion: 'sad',
    },
  ],
  isMajor: true,
};

// ==================== 剧情节点5：与月牙儿的世纪PK（第16-18天）====================
const node5: StoryNode = {
  id: 'node5_pk',
  name: '与月牙儿的世纪PK',
  triggerDay: [16, 18],
  prerequisite: (state) => state.followers > 500000,
  emotion: 'nervous',
  monologue: '（看着私信，心跳加速）月牙儿的黑料？这要是发出去...',
  scene: '你收到了一份匿名邮件，里面是月牙儿的黑料——她早期的一些不当言论截图。',
  dialog: '邮件内容："想要打败月牙儿吗？把这些发出去，她就是你的了。"',
  choices: [
    {
      id: 'publish',
      text: '发布黑料',
      emotion: 'disgusted',
      effects: {
        kindness: -40,
        followers: 100000,
        npcRelation: { npcId: 'yueya', change: -50 },
        personaIntegrity: -40,
      },
      response: '黑料发出后，月牙儿瞬间被围攻。我赢了PK，但看着她的崩溃直播，心里五味杂陈...',
      responseEmotion: 'disgusted',
    },
    {
      id: 'fair_competition',
      text: '不发布，公平竞争',
      emotion: 'happy',
      effects: {
        kindness: 20,
        integrity: 20,
        npcRelation: { npcId: 'yueya', change: 20 },
      },
      response: 'PK时我全力以赴，虽然输了但输得光明磊落。月牙儿赛后私信说："你值得尊重。"',
      responseEmotion: 'happy',
    },
    {
      id: 'communicate',
      text: '私下沟通',
      emotion: 'nervous',
      effects: {
        kindness: 30,
        npcRelation: { npcId: 'yueya', change: 40 },
        integrity: 10,
      },
      response: '我把黑料发给了月牙儿，提醒她注意。她沉默了很久，然后说："谢谢你，我欠你一个人情。"',
      responseEmotion: 'happy',
    },
    {
      id: 'report',
      text: '举报给平台',
      emotion: 'angry',
      effects: {
        kindness: 15,
        npcRelation: { npcId: 'yueya', change: -20 },
      },
      response: '平台警告了月牙儿，但没有公开处理。她知道了是我举报的，关系彻底破裂...',
      responseEmotion: 'angry',
    },
  ],
  isMajor: true,
};

// ==================== 剧情节点6：母亲的阿尔茨海默症（第20天）====================
const node6: StoryNode = {
  id: 'node6_mother',
  name: '母亲的阿尔茨海默症',
  triggerDay: 20,
  emotion: 'scared',
  monologue: '（接到爸爸的电话，手在发抖）妈妈不认识人了？怎么会...',
  scene: '你终于成为了百万粉博主，但电话里传来的消息让你如坠冰窟——妈妈确诊阿尔茨海默症，已经开始忘记家人。',
  dialog: '爸爸：（哽咽）"小爱，你妈今天问我...你是谁。你什么时候回来看看？"',
  choices: [
    {
      id: 'go_home',
      text: '放弃直播，回老家陪伴',
      emotion: 'sad',
      effects: {
        kindness: 40,
        npcRelation: { npcId: 'mom', change: 50 },
        followers: -50000,
        sanity: 20,
        personaIntegrity: 30,
      },
      response: '我删掉了直播软件，买了回家的车票。妈妈看到我时眼神迷茫，但握着我的手笑了...',
      responseEmotion: 'happy',
    },
    {
      id: 'hire_caregiver',
      text: '请专人照顾，继续直播',
      emotion: 'nervous',
      effects: {
        money: 200000,
        kindness: -20,
        npcRelation: { npcId: 'mom', change: -10 },
        sanity: -20,
      },
      response: '我请了最好的护工，但视频通话时妈妈已经认不出我了。我笑着说"我是小爱啊"，她问"小爱是谁？"',
      responseEmotion: 'sad',
    },
    {
      id: 'balance_both',
      text: '调整节奏，兼顾',
      emotion: 'nervous',
      effects: {
        kindness: 25,
        money: 100000,
        npcRelation: { npcId: 'mom', change: 20 },
      },
      response: '我把直播时间减半，每个月回家一周。虽然很累，但至少能两边都照顾到。',
      responseEmotion: 'tired',
    },
    {
      id: 'bring_mom',
      text: '带着母亲直播',
      emotion: 'happy',
      effects: {
        kindness: 30,
        followers: 50000,
        npcRelation: { npcId: 'mom', change: 10 },
      },
      response: '妈妈坐在镜头旁边，虽然不知道在干什么，但看到弹幕夸她"阿姨好可爱"时会笑。也许...这样也不错？',
      responseEmotion: 'happy',
    },
  ],
  isMajor: true,
};

// 导出所有剧情节点
export const STORY_NODES: StoryNode[] = [node1, node2, node3, node4, node5, node6];

// 根据天数获取剧情节点
export function getStoryNodeByDay(day: number, state: ReturnType<PlayerData['getState']>): StoryNode | null {
  for (const node of STORY_NODES) {
    const [minDay, maxDay] = Array.isArray(node.triggerDay) ? node.triggerDay : [node.triggerDay, node.triggerDay];

    if (day >= minDay && day <= maxDay) {
      // 检查是否已触发过
      if (state.storyChoices[node.id]) {
        continue;
      }

      // 检查前置条件
      if (node.prerequisite && !node.prerequisite(state)) {
        continue;
      }

      return node;
    }
  }
  return null;
}

// 检查某天是否有剧情节点
export function hasStoryNode(day: number): boolean {
  for (const node of STORY_NODES) {
    const [minDay, maxDay] = Array.isArray(node.triggerDay) ? node.triggerDay : [node.triggerDay, node.triggerDay];
    if (day >= minDay && day <= maxDay) {
      return true;
    }
  }
  return false;
}
