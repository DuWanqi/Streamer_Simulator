/**
 * 30个随机翻车事件
 * 分为5类：技术翻车、社交翻车、技能翻车、人设翻车、平台/超现实
 */

import type { RandomEvent } from '../data/Types';

/**
 * 30个随机翻车事件
 */
export const RANDOM_EVENTS: RandomEvent[] = [
  // ========== 技术翻车类（6个）==========
  {
    id: 'tech_1_beauty_fail',
    category: 'tech_fail',
    title: '美颜失效',
    description: '美颜滤镜突然失效，前后对比被截图，弹幕瞬间爆炸...',
    weight: 15,
    choices: [
      {
        id: 'c1',
        text: '假装无事发生',
        effects: { personaIntegrity: -10, followers: 1000 }
      },
      {
        id: 'c2',
        text: '大方自嘲',
        effects: { personaIntegrity: 5, followers: 3000, kindness: 5 }
      },
      {
        id: 'c3',
        text: '紧急下播',
        effects: { followers: -1000, stamina: -10 }
      },
      {
        id: 'c4',
        text: '把素颜当卖点',
        effects: { kindness: 5, followers: 5000, personaIntegrity: 10 }
      }
    ]
  },
  {
    id: 'tech_2_mic_on',
    category: 'tech_fail',
    title: '忘关麦',
    description: '下播后忘关麦，吐槽粉丝的话被全程直播...',
    weight: 12,
    isMajor: true,
    choices: [
      {
        id: 'c1',
        text: '假装被盗号',
        effects: { followers: -5000, integrity: -10, personaIntegrity: -20 }
      },
      {
        id: 'c2',
        text: '承认并道歉',
        effects: { followers: -2000, integrity: 10, kindness: 5 }
      },
      {
        id: 'c3',
        text: '立"真性情"人设',
        effects: { integrity: -10, followers: 3000, personaIntegrity: -10 }
      },
      {
        id: 'c4',
        text: '继续骂',
        effects: { sanity: -20, followers: 10000, integrity: -30, kindness: -20 }
      }
    ]
  },
  {
    id: 'tech_3_crash',
    category: 'tech_fail',
    title: '直播软件崩溃',
    description: '摄像头切到后置，出租屋全貌曝光，粉丝们看到了你的真实生活环境...',
    weight: 10,
    choices: [
      {
        id: 'c1',
        text: '紧急切换',
        effects: { followers: -1000, stamina: -5 }
      },
      {
        id: 'c2',
        text: '直播room tour',
        effects: { followers: 3000, personaIntegrity: 10 }
      },
      {
        id: 'c3',
        text: '假装故意策划',
        effects: { integrity: -5, followers: 2000, personaIntegrity: -5 }
      }
    ]
  },
  {
    id: 'tech_4_popup',
    category: 'tech_fail',
    title: '弹窗入侵',
    description: 'Windows更新/广告弹窗挡住你的脸，弹幕开始疯狂玩梗...',
    weight: 8,
    choices: [
      {
        id: 'c1',
        text: '关掉继续',
        effects: {}
      },
      {
        id: 'c2',
        text: '和弹窗互动',
        effects: { followers: 2000, sanity: 5 }
      },
      {
        id: 'c3',
        text: '直播卸载软件',
        effects: { followers: 1000, stamina: -5 }
      }
    ]
  },
  {
    id: 'tech_5_equipment_fail',
    category: 'tech_fail',
    title: '设备连环故障',
    description: '麦克风→耳机→摄像头连环故障，直播变成默剧...',
    weight: 10,
    choices: [
      {
        id: 'c1',
        text: '坚持直播',
        effects: { stamina: -20, followers: 5000, integrity: 10 }
      },
      {
        id: 'c2',
        text: '下播维修',
        effects: { followers: -2000 }
      },
      {
        id: 'c3',
        text: '用手机继续',
        effects: { followers: 1000, money: -500 }
      }
    ]
  },
  {
    id: 'tech_6_deepfake',
    category: 'tech_fail',
    title: 'AI换脸入侵',
    description: '有人用你的脸做AI换脸视频，内容不堪入目...',
    weight: 8,
    isMajor: true,
    choices: [
      {
        id: 'c1',
        text: '律师函警告',
        effects: { money: -2000, integrity: 5 }
      },
      {
        id: 'c2',
        text: '直播看换脸视频',
        effects: { sanity: -20, followers: 10000, personaIntegrity: -15 }
      },
      {
        id: 'c3',
        text: '自己也做换脸反击',
        effects: { kindness: -30, followers: 5000, integrity: -20 }
      },
      {
        id: 'c4',
        text: '假装是自己拍的',
        effects: { kindness: -50, followers: 20000, integrity: -40, personaIntegrity: -30 }
      }
    ]
  },

  // ========== 社交翻车类（6个）==========
  {
    id: 'social_1_landlady_intrude',
    category: 'social_fail',
    title: '房东太太乱入',
    description: '房东敲门催租/想入镜，弹幕开始起哄...',
    weight: 12,
    choices: [
      {
        id: 'c1',
        text: '让房东入镜',
        effects: { followers: 3000, npcRelations: { landlady: 5 } }
      },
      {
        id: 'c2',
        text: '下播处理',
        effects: { followers: -1000, npcRelations: { landlady: -5 } }
      },
      {
        id: 'c3',
        text: '直播借钱交租',
        effects: { kindness: 5, followers: 5000, money: 2000, integrity: -10 }
      },
      {
        id: 'c4',
        text: '假装不在家',
        effects: { npcRelations: { landlady: -10 }, followers: -500 }
      }
    ]
  },
  {
    id: 'social_2_parents_visit',
    category: 'social_fail',
    title: '父母查岗',
    description: '父母突然来访，不知道你做主播，场面一度十分尴尬...',
    weight: 10,
    choices: [
      {
        id: 'c1',
        text: '让他们入镜',
        effects: { followers: 3000, npcRelations: { mom: 10 }, personaIntegrity: -10 }
      },
      {
        id: 'c2',
        text: '紧急下播',
        effects: { followers: -2000, npcRelations: { mom: 5 } }
      },
      {
        id: 'c3',
        text: '假装正经工作',
        effects: { integrity: -10, sanity: -10, npcRelations: { mom: -5 } }
      },
      {
        id: 'c4',
        text: '坦白',
        effects: { personaIntegrity: 20, npcRelations: { mom: 15 }, followers: 1000 }
      }
    ]
  },
  {
    id: 'social_3_roommate',
    category: 'social_fail',
    title: '室友可心乱入',
    description: '可心以为你没在直播，穿着睡衣出镜，弹幕炸了...',
    weight: 10,
    condition: (state) => state.day >= 3,
    choices: [
      {
        id: 'c1',
        text: '让可心入镜',
        effects: { followers: 3000, npcRelations: { kexin: 5 } }
      },
      {
        id: 'c2',
        text: '道歉下播',
        effects: { followers: -1000, npcRelations: { kexin: 10 } }
      },
      {
        id: 'c3',
        text: '直播可心日常',
        effects: { followers: 5000, npcRelations: { kexin: 10 }, integrity: -5 }
      }
    ]
  },
  {
    id: 'social_4_ex',
    category: 'social_fail',
    title: '前任出现',
    description: '前任突然刷礼物/连麦，旧情复燃还是公开处刑？',
    weight: 8,
    choices: [
      {
        id: 'c1',
        text: '直播连麦撕逼',
        effects: { kindness: -20, followers: 5000, sanity: -10, personaIntegrity: -10 }
      },
      {
        id: 'c2',
        text: '假装不认识',
        effects: { kindness: 5, followers: -1000, integrity: -5 }
      },
      {
        id: 'c3',
        text: '复合炒作',
        effects: { kindness: -30, followers: 10000, integrity: -20, personaIntegrity: -20 }
      }
    ]
  },
  {
    id: 'social_5_fans_recognize',
    category: 'social_fail',
    title: '被粉丝认出',
    description: '在街上被粉丝认出，要求合影直播...',
    weight: 10,
    choices: [
      {
        id: 'c1',
        text: '合影直播',
        effects: { followers: 1000, stamina: -5 }
      },
      {
        id: 'c2',
        text: '逃跑',
        effects: { sanity: -10, followers: -500 }
      },
      {
        id: 'c3',
        text: '假装不是本人',
        effects: { followers: -500, integrity: -5 }
      },
      {
        id: 'c4',
        text: '直播"偶遇粉丝"',
        effects: { followers: 2000, personaIntegrity: -5 }
      }
    ]
  },
  {
    id: 'social_6_harasser',
    category: 'social_fail',
    title: '猥琐男骚扰',
    description: '合租邻居频繁骚扰，甚至在直播间发不当言论...',
    weight: 8,
    condition: (state) => state.day >= 11,
    choices: [
      {
        id: 'c1',
        text: '自己发声明',
        effects: { integrity: 10, followers: -2000, npcRelations: { harasser: -10 } }
      },
      {
        id: 'c2',
        text: '冷处理',
        effects: { integrity: -15, followers: -1000, sanity: -10 }
      },
      {
        id: 'c3',
        text: '找邻居对质',
        effects: { stamina: -10, kindness: -5, npcRelations: { harasser: -20 } }
      },
      {
        id: 'c4',
        text: '寻求平台帮助',
        effects: { integrity: 5, followers: 3000, money: -500 }
      }
    ]
  },

  // ========== 技能翻车类（6个）==========
  {
    id: 'skill_1_game_lose',
    category: 'skill_fail',
    title: '游戏连败',
    description: '连输10把，队友骂你是"演员"，弹幕开始嘲笑...',
    weight: 15,
    choices: [
      {
        id: 'c1',
        text: '继续打',
        effects: { stamina: -20, followers: 3000, sanity: -10 }
      },
      {
        id: 'c2',
        text: '换游戏',
        effects: { followers: -500 }
      },
      {
        id: 'c3',
        text: '直播砸键盘',
        effects: { followers: 5000, money: -500, sanity: -5 }
      },
      {
        id: 'c4',
        text: '哭着求带',
        effects: { followers: 2000, personaIntegrity: -10 }
      }
    ]
  },
  {
    id: 'skill_2_talent_fail',
    category: 'skill_fail',
    title: '才艺表演翻车',
    description: '唱歌破音/跳舞摔倒，场面一度十分尴尬...',
    weight: 12,
    choices: [
      {
        id: 'c1',
        text: '坚持演完',
        effects: { stamina: -10, followers: 1000, integrity: 5 }
      },
      {
        id: 'c2',
        text: '自嘲',
        effects: { followers: 3000, personaIntegrity: 5 }
      },
      {
        id: 'c3',
        text: '重来过',
        effects: { stamina: -20, followers: -1000 }
      },
      {
        id: 'c4',
        text: '把翻车当才艺',
        effects: { followers: 5000, personaIntegrity: 10 }
      }
    ]
  },
  {
    id: 'skill_3_pk_lose',
    category: 'skill_fail',
    title: 'PK惨败',
    description: '和别的主播PK被碾压，惩罚环节惨不忍睹...',
    weight: 10,
    choices: [
      {
        id: 'c1',
        text: '认输',
        effects: { sanity: -10, followers: -1000 }
      },
      {
        id: 'c2',
        text: '耍赖',
        effects: { kindness: -20, followers: 3000, integrity: -15 }
      },
      {
        id: 'c3',
        text: '直播复盘',
        effects: { followers: 1000, integrity: 5 }
      },
      {
        id: 'c4',
        text: '约明天再战',
        effects: { followers: 2000, stamina: -5 }
      }
    ]
  },
  {
    id: 'skill_4_big_shot',
    category: 'skill_fail',
    title: '被大佬查房',
    description: '百大主播突然进入直播间，你激动到语无伦次...',
    weight: 8,
    choices: [
      {
        id: 'c1',
        text: '激动到语无伦次',
        effects: { sanity: -10, followers: 5000, personaIntegrity: -5 }
      },
      {
        id: 'c2',
        text: '淡定欢迎',
        effects: { followers: 3000, integrity: 5 }
      },
      {
        id: 'c3',
        text: '反向查房',
        effects: { followers: -2000, kindness: -10 }
      },
      {
        id: 'c4',
        text: '求连麦',
        effects: { followers: Math.random() > 0.5 ? 10000 : -1000 }
      }
    ]
  },
  {
    id: 'skill_5_challenge_fail',
    category: 'skill_fail',
    title: '挑战失败',
    description: '接受粉丝挑战失败，惩罚是吃超辣火锅...',
    weight: 10,
    choices: [
      {
        id: 'c1',
        text: '认怂',
        effects: { followers: -1000, personaIntegrity: -5 }
      },
      {
        id: 'c2',
        text: '真吃',
        effects: { stamina: -15, followers: 3000, integrity: 10 }
      },
      {
        id: 'c3',
        text: '吃假的被发现',
        effects: { kindness: -20, followers: -5000, integrity: -20, personaIntegrity: -30 }
      },
      {
        id: 'c4',
        text: '加码挑战',
        effects: { followers: 5000, stamina: -20, sanity: -10 }
      }
    ]
  },
  {
    id: 'skill_6_sleep',
    category: 'skill_fail',
    title: '直播睡觉',
    description: '太累在直播间睡着，醒来发现弹幕刷疯了...',
    weight: 8,
    choices: [
      {
        id: 'c1',
        text: '继续睡',
        effects: { followers: 2000, stamina: 10 }
      },
      {
        id: 'c2',
        text: '假装ASMR',
        effects: { followers: 1000, personaIntegrity: -5 }
      },
      {
        id: 'c3',
        text: '说是行为艺术',
        effects: { followers: 3000, personaIntegrity: 5 }
      },
      {
        id: 'c4',
        text: '羞愧下播',
        effects: { followers: -500, sanity: -5 }
      }
    ]
  },

  // ========== 人设翻车类（6个）==========
  {
    id: 'persona_1_contradiction',
    category: 'persona_fail',
    title: '人设崩塌现场',
    description: '刚说"我从不XX"，下一秒就XX，弹幕疯狂截图...',
    weight: 10,
    choices: [
      {
        id: 'c1',
        text: '强行解释',
        effects: { followers: -3000, personaIntegrity: -20, integrity: -10 }
      },
      {
        id: 'c2',
        text: '承认打脸',
        effects: { followers: 2000, personaIntegrity: 5, integrity: 5 }
      },
      {
        id: 'c3',
        text: '把打脸当梗',
        effects: { followers: 3000, personaIntegrity: 10 }
      }
    ]
  },
  {
    id: 'persona_2_fake_luxury',
    category: 'persona_fail',
    title: '炫富翻车',
    description: '展示"奢侈品"被认出是假货，弹幕开始扒皮...',
    weight: 8,
    isMajor: true,
    choices: [
      {
        id: 'c1',
        text: '坚持是真的',
        effects: { kindness: -20, followers: -5000, integrity: -30, personaIntegrity: -30 }
      },
      {
        id: 'c2',
        text: '大方承认是仿品',
        effects: { followers: 2000, integrity: 5, personaIntegrity: 5 }
      },
      {
        id: 'c3',
        text: '说是故意买的fake',
        effects: { followers: 1000, personaIntegrity: -5 }
      }
    ]
  },
  {
    id: 'persona_3_fake_background',
    category: 'persona_fail',
    title: '学历/经历造假被发现',
    description: '吹的牛被扒皮了，弹幕开始人肉搜索...',
    weight: 8,
    isMajor: true,
    choices: [
      {
        id: 'c1',
        text: '继续硬撑',
        effects: { kindness: -30, followers: -10000, integrity: -40, personaIntegrity: -40 }
      },
      {
        id: 'c2',
        text: '直播道歉',
        effects: { followers: -3000, integrity: 10, personaIntegrity: 5 }
      },
      {
        id: 'c3',
        text: '说是节目效果',
        effects: { followers: Math.random() > 0.5 ? 2000 : -3000, personaIntegrity: -10 }
      }
    ]
  },
  {
    id: 'persona_4_fake_data',
    category: 'persona_fail',
    title: '数据造假被发现',
    description: '买粉/刷数据被扒，弹幕开始质疑一切...',
    weight: 8,
    isMajor: true,
    choices: [
      {
        id: 'c1',
        text: '承认',
        effects: { followers: -Math.floor(50000 * 0.5), integrity: 10, personaIntegrity: -20 }
      },
      {
        id: 'c2',
        text: '否认',
        effects: { followers: -Math.floor(50000 * 0.3), integrity: -20, personaIntegrity: -30 }
      },
      {
        id: 'c3',
        text: '说是对家陷害',
        effects: { kindness: -20, followers: Math.random() > 0.5 ? 1000 : -5000 }
      },
      {
        id: 'c4',
        text: '直播删粉',
        effects: { followers: -50000, integrity: 20, personaIntegrity: 10 }
      }
    ]
  },
  {
    id: 'persona_5_plagiarism',
    category: 'persona_fail',
    title: '抄袭/盗用内容',
    description: '直播内容被指出是抄的，原作者找上门...',
    weight: 8,
    choices: [
      {
        id: 'c1',
        text: '承认并道歉',
        effects: { followers: -5000, integrity: 10, kindness: 5 }
      },
      {
        id: 'c2',
        text: '说是致敬',
        effects: { kindness: -10, followers: -2000, integrity: -10 }
      },
      {
        id: 'c3',
        text: '反咬对方',
        effects: { kindness: -40, followers: 3000, integrity: -30 }
      }
    ]
  },
  {
    id: 'persona_6_scripted_pk',
    category: 'persona_fail',
    title: '剧本PK被揭穿',
    description: '对剧本PK被粉丝发现，信任危机爆发...',
    weight: 8,
    choices: [
      {
        id: 'c1',
        text: '承认',
        effects: { followers: -10000, integrity: 5, personaIntegrity: -20 }
      },
      {
        id: 'c2',
        text: '说是为了节目效果',
        effects: { followers: -5000, personaIntegrity: -10 }
      },
      {
        id: 'c3',
        text: '真PK报复',
        effects: { kindness: -20, followers: 2000, stamina: -15 }
      }
    ]
  },

  // ========== 平台/超现实类（6个）==========
  {
    id: 'platform_1_mcn',
    category: 'platform_fail',
    title: 'MCN签约',
    description: 'MCN给了一份"卖身契"，每天播8小时，违约金天价...',
    weight: 8,
    once: true,
    choices: [
      {
        id: 'c1',
        text: '签约',
        effects: { money: 100000, sanity: -20, stamina: -10, personaIntegrity: -10 }
      },
      {
        id: 'c2',
        text: '拒绝',
        effects: {}
      },
      {
        id: 'c3',
        text: '假装签约然后跑路',
        effects: { kindness: -50, money: 50000, followers: -10000, integrity: -50 }
      },
      {
        id: 'c4',
        text: '曝光合同',
        effects: { kindness: 20, followers: 5000, money: -5000 }
      }
    ]
  },
  {
    id: 'platform_2_algorithm',
    category: 'platform_fail',
    title: '平台算法显灵',
    description: '收到算法私信"你被我选中了"，接受后人气暴涨但失去自由...',
    weight: 6,
    once: true,
    choices: [
      {
        id: 'c1',
        text: '接受算法',
        effects: { followers: 100000, sanity: -30, personaIntegrity: -30, kindness: -20 }
      },
      {
        id: 'c2',
        text: '拒绝',
        effects: {}
      },
      {
        id: 'c3',
        text: '直播对话',
        effects: { followers: 30000, sanity: -10 }
      },
      {
        id: 'c4',
        text: '举报算法',
        effects: { followers: -20000, integrity: 10 }
      }
    ]
  },
  {
    id: 'platform_3_ai_audience',
    category: 'platform_fail',
    title: '观众其实是AI',
    description: '发现90%观众是AI机器人，礼物也是虚拟的...',
    weight: 6,
    once: true,
    isMajor: true,
    choices: [
      {
        id: 'c1',
        text: '直播曝光',
        effects: { followers: -50000, integrity: 20, personaIntegrity: 20 }
      },
      {
        id: 'c2',
        text: '假装不知道',
        effects: { integrity: -20, money: 10000, personaIntegrity: -20 }
      },
      {
        id: 'c3',
        text: '和AI谈恋爱',
        effects: { sanity: -20, followers: 10000, personaIntegrity: -10 }
      }
    ]
  },
  {
    id: 'platform_4_mystery_gift',
    category: 'platform_fail',
    title: '收到神秘礼物',
    description: '收到匿名包裹，里面可能是惊喜也可能是惊吓...',
    weight: 8,
    choices: [
      {
        id: 'c1',
        text: '打开看看',
        effects: (() => {
          const rand = Math.random();
          if (rand < 0.25) return { sanity: -10, followers: 1000 }; // 活蟑螂
          if (rand < 0.5) return { sanity: 5, followers: 500 }; // 情书
          if (rand < 0.75) return { sanity: -30, followers: 5000 }; // 刀
          return { money: Math.floor(Math.random() * 100000), followers: 2000 }; // 彩票
        })()
      },
      {
        id: 'c2',
        text: '扔掉',
        effects: {}
      },
      {
        id: 'c3',
        text: '直播开箱',
        effects: { followers: 3000, sanity: -5 }
      }
    ]
  },
  {
    id: 'platform_5_haunted',
    category: 'platform_fail',
    title: '直播间闹鬼',
    description: '直播间出现奇怪声音和影子，弹幕说是灵异事件...',
    weight: 6,
    choices: [
      {
        id: 'c1',
        text: '直播捉鬼',
        effects: { followers: 10000, sanity: -15, stamina: -10 }
      },
      {
        id: 'c2',
        text: '搬家',
        effects: { money: -50000, sanity: 10 }
      },
      {
        id: 'c3',
        text: '假装没看见',
        effects: { sanity: -20, followers: 2000 }
      },
      {
        id: 'c4',
        text: '请道士',
        effects: { money: -10000, sanity: 5, followers: 3000 }
      }
    ]
  },
  {
    id: 'platform_6_time_travel',
    category: 'platform_fail',
    title: '穿越了',
    description: '一觉醒来回到开播第一天，保留所有记忆...',
    weight: 4,
    once: true,
    isMajor: true,
    choices: [
      {
        id: 'c1',
        text: '重开',
        effects: { sanity: 10, personaIntegrity: 10, kindness: 10, integrity: 10 }
      },
      {
        id: 'c2',
        text: '这是梦',
        effects: {}
      },
      {
        id: 'c3',
        text: '直播"我穿越了"',
        effects: { followers: 20000, sanity: -10, personaIntegrity: -10 }
      }
    ]
  }
];

/**
 * 按分类获取事件
 */
export function getEventsByCategory(category: RandomEvent['category']): RandomEvent[] {
  return RANDOM_EVENTS.filter(event => event.category === category);
}

/**
 * 获取事件分类名称
 */
export const CATEGORY_NAMES: Record<Exclude<RandomEvent['category'], 'main_story'>, string> = {
  tech_fail: '技术翻车',
  social_fail: '社交翻车',
  skill_fail: '技能翻车',
  persona_fail: '人设翻车',
  platform_fail: '平台事件',
  chaos_wild: '超现实事件'
};

/**
 * 获取事件总数
 */
export function getTotalEventCount(): number {
  return RANDOM_EVENTS.length;
}

/**
 * 获取各分类事件数量
 */
export function getEventCountByCategory(): Record<RandomEvent['category'], number> {
  const counts = {} as Record<RandomEvent['category'], number>;
  
  for (const event of RANDOM_EVENTS) {
    counts[event.category] = (counts[event.category] || 0) + 1;
  }
  
  return counts;
}
