/**
 * 随机翻车事件池 - 30个随机事件
 *
 * 根据设计案第5章：事件系统（双轨制）
 * 这些事件有30%概率触发，与6个核心剧情节点并行
 */

import type { PlayerData } from '../game/PlayerData';

export interface RandomEventChoice {
  id: string;
  text: string;
  emotion: string;
  effects: {
    followers?: number;
    kindness?: number;
    integrity?: number;
    sanity?: number;
    money?: number;
    failCount?: number;
    personaIntegrity?: number;
    npcRelation?: { npcId: string; change: number };
  };
  response: string;
  responseEmotion: string;
  hotSearchChance?: number; // 生成热搜的概率
}

export interface RandomEvent {
  id: string;
  name: string;
  category: 'tech' | 'social' | 'personal' | 'content' | 'ethical';
  emotion: string;
  monologue: string;
  scene: string;
  dialog: string;
  choices: RandomEventChoice[];
}

// ==================== 技术翻车类（6个）====================

const techEvents: RandomEvent[] = [
  {
    id: 'tech_1',
    name: '美颜失效',
    category: 'tech',
    emotion: 'embarrassed',
    monologue: '（看着屏幕）咦？我的脸怎么...',
    scene: '直播时美颜软件突然崩溃，真实素颜暴露在镜头前。',
    dialog: '弹幕："主播怎么突然变样了？" "这是同一个人吗？" "美颜掉了哈哈哈"',
    choices: [
      { id: 'admit', text: '承认使用了美颜', emotion: 'embarrassed', effects: { followers: -1000, integrity: 10, personaIntegrity: -10 }, response: '我笑着说："是啊，谁不想好看点呢？"弹幕反而夸我真实。', responseEmotion: 'happy', hotSearchChance: 0.3 },
      { id: 'deny', text: '否认："是灯光问题"', emotion: 'nervous', effects: { followers: -3000, integrity: -15, personaIntegrity: -20 }, response: '我慌乱地调整灯光，但弹幕里的质疑声越来越多...', responseEmotion: 'scared', hotSearchChance: 0.5 },
      { id: 'joke', text: '自嘲："这才是真实的我"', emotion: 'playful', effects: { followers: 2000, kindness: 5 }, response: '我做了个鬼脸："惊喜吗？这才是正版小爱！"弹幕笑成一片。', responseEmotion: 'happy' },
    ],
  },
  {
    id: 'tech_2',
    name: '忘关麦',
    category: 'tech',
    emotion: 'panicked',
    monologue: '（下播后）终于结束了...那个粉丝真烦人...',
    scene: '下播后忘记关麦，吐槽粉丝的对话被直播出去。',
    dialog: '弹幕疯狂刷屏："主播没关麦！" "听到她在骂粉丝！" "截图了！"',
    choices: [
      { id: 'apologize', text: '立即道歉', emotion: 'embarrassed', effects: { followers: -5000, integrity: 5, sanity: -10 }, response: '我慌张地打开直播："对不起，我不该说那些话..."', responseEmotion: 'sad', hotSearchChance: 0.8 },
      { id: 'explain', text: '解释是误会', emotion: 'nervous', effects: { followers: -8000, integrity: -20 }, response: '我试图解释："我是在说别人..."但没人相信。', responseEmotion: 'scared', hotSearchChance: 0.9 },
      { id: 'embrace', text: '索性放飞自我', emotion: 'angry', effects: { followers: 3000, integrity: -30, personaIntegrity: -30 }, response: '我冷笑："既然都听到了，那我也不装了。"', responseEmotion: 'disgusted', hotSearchChance: 1.0 },
    ],
  },
  {
    id: 'tech_3',
    name: '软件崩溃',
    category: 'tech',
    emotion: 'nervous',
    monologue: '（看着黑屏）完了，OBS又崩溃了...',
    scene: '直播软件突然崩溃，屏幕卡住不动。',
    dialog: '弹幕："卡了卡了" "主播掉线了" "是不是被黑客攻击了？"',
    choices: [
      { id: 'restart', text: '快速重启直播', emotion: 'nervous', effects: { followers: -500, sanity: -5 }, response: '我手忙脚乱地重启软件，5分钟后重新上线。', responseEmotion: 'tired' },
      { id: 'show_room', text: '借机展示出租屋', emotion: 'playful', effects: { followers: 1000, personaIntegrity: -10 }, response: '我拿起手机："既然电脑坏了，带大家看看我的房间吧！"', responseEmotion: 'happy', hotSearchChance: 0.4 },
      { id: 'end_early', text: '提前下播', emotion: 'sad', effects: { followers: -2000, sanity: 5 }, response: '我无奈地发了条动态："设备故障，今天先到这里。"', responseEmotion: 'sad' },
    ],
  },
  {
    id: 'tech_4',
    name: '直播睡觉',
    category: 'tech',
    emotion: 'tired',
    monologue: '（打着哈欠）好困啊...就眯一会儿...',
    scene: '太累在直播中睡着，鼾声被直播出去。',
    dialog: '弹幕："主播睡着了？" "鼾声好大哈哈哈" "睡播实锤"',
    choices: [
      { id: 'wake_up', text: '惊醒后继续直播', emotion: 'embarrassed', effects: { followers: 3000, sanity: -10 }, response: '我突然惊醒："啊！我怎么睡着了！"弹幕笑疯了。', responseEmotion: 'embarrassed', hotSearchChance: 0.7 },
      { id: 'continue_sleep', text: '索性继续睡', emotion: 'tired', effects: { followers: 5000, sanity: 10, personaIntegrity: -20 }, response: '我翻了个身继续睡，醒来发现粉丝涨了5000...', responseEmotion: 'happy', hotSearchChance: 0.9 },
      { id: 'pretend', text: '假装是整活', emotion: 'playful', effects: { followers: 2000, integrity: -10 }, response: '我睁眼说："这是行为艺术，懂不懂？"', responseEmotion: 'playful' },
    ],
  },
  {
    id: 'tech_5',
    name: '误触摄像头',
    category: 'tech',
    emotion: 'panicked',
    monologue: '（伸手去够东西）哎呀！',
    scene: '不小心碰倒摄像头，画面变成天花板。',
    dialog: '弹幕："主播呢？" "看到天花板了" "是不是出事了？"',
    choices: [
      { id: 'fix_quick', text: '快速修好', emotion: 'nervous', effects: { followers: -200 }, response: '我迅速扶正摄像头："没事没事，手滑了。"', responseEmotion: 'nervous' },
      { id: 'show_ceiling', text: '展示天花板并解说', emotion: 'playful', effects: { followers: 500 }, response: '"欢迎来到天花板直播间，这里是我的私密空间..."', responseEmotion: 'happy' },
      { id: 'blame_cat', text: '甩锅给豆豆', emotion: 'playful', effects: { followers: 300 }, response: '"是豆豆撞倒的！"（豆豆无辜地看着镜头）', responseEmotion: 'playful' },
    ],
  },
  {
    id: 'tech_6',
    name: '网络卡顿',
    category: 'tech',
    emotion: 'angry',
    monologue: '（看着转圈）这破网络！',
    scene: '网络突然卡顿，直播画面变成PPT。',
    dialog: '弹幕："主播卡成PPT了" "是不是没交网费？" "这画质我奶奶都嫌弃"',
    choices: [
      { id: 'complain', text: '吐槽网络运营商', emotion: 'angry', effects: { followers: -300, sanity: -5 }, response: '"这破网络，我明天就换运营商！"', responseEmotion: 'angry' },
      { id: 'mobile_data', text: '切换手机流量', emotion: 'nervous', effects: { money: -50, followers: 100 }, response: '我切换到流量直播："为了你们，我豁出去了！"', responseEmotion: 'happy' },
      { id: 'end_stream', text: '无奈下播', emotion: 'sad', effects: { followers: -1000, sanity: 5 }, response: '"网络太差了，今天先到这里吧..."', responseEmotion: 'sad' },
    ],
  },
];

// ==================== 社交翻车类（6个）====================

const socialEvents: RandomEvent[] = [
  {
    id: 'social_1',
    name: '读错粉丝ID',
    category: 'social',
    emotion: 'embarrassed',
    monologue: '（看着弹幕）感谢...呃...这个名字怎么念？',
    scene: '感谢打赏时读错粉丝ID，粉丝名字很尴尬。',
    dialog: '弹幕："哈哈哈哈主播念错了" "那个名字确实难念" "社死现场"',
    choices: [
      { id: 'admit_difficult', text: '承认不会念', emotion: 'embarrassed', effects: { followers: 200, kindness: 5 }, response: '"这个名字太有创意了，我读不出来..."', responseEmotion: 'happy' },
      { id: 'make_up', text: '瞎编一个读音', emotion: 'nervous', effects: { followers: -200, integrity: -5 }, response: '"感谢...呃...张三同学的打赏！"（完全瞎编的）', responseEmotion: 'nervous' },
      { id: 'ask', text: '请教正确读法', emotion: 'happy', effects: { followers: 500, kindness: 10 }, response: '"这位同学，能教我怎么念你的名字吗？"', responseEmotion: 'happy' },
    ],
  },
  {
    id: 'social_2',
    name: 'PK对手嘲讽',
    category: 'social',
    emotion: 'angry',
    monologue: '（看着屏幕）这人说话怎么这么难听...',
    scene: 'PK时对手公开嘲讽你是"小主播"、"没人气"。',
    dialog: '对手："就这点粉丝也敢来PK？" "回去再练几年吧！"',
    choices: [
      { id: 'ignore', text: '无视嘲讽', emotion: 'nervous', effects: { sanity: 5, integrity: 5 }, response: '我保持微笑："大家开心就好。"', responseEmotion: 'happy' },
      { id: 'fight_back', text: '反击', emotion: 'angry', effects: { followers: 1000, kindness: -10, sanity: -5 }, response: '"你粉丝多又怎样？素质呢？"', responseEmotion: 'angry', hotSearchChance: 0.5 },
      { id: 'self_deprecate', text: '自嘲', emotion: 'playful', effects: { followers: 2000, kindness: 5 }, response: '"是啊，我就是小主播，但我很快乐！"', responseEmotion: 'happy' },
    ],
  },
  {
    id: 'social_3',
    name: '粉丝表白',
    category: 'social',
    emotion: 'nervous',
    monologue: '（看着私信）这是什么？表白？',
    scene: '有粉丝在直播间公开表白，弹幕起哄。',
    dialog: '弹幕："在一起！" "主播答应他！" "这狗粮我吃了！"',
    choices: [
      { id: 'reject_polite', text: '礼貌拒绝', emotion: 'nervous', effects: { followers: -500, kindness: 5 }, response: '"谢谢你的喜欢，但我现在专注事业..."', responseEmotion: 'nervous' },
      { id: 'joke', text: '开玩笑化解', emotion: 'playful', effects: { followers: 500 }, response: '"我的心属于所有粉丝！"', responseEmotion: 'happy' },
      { id: 'ignore', text: '假装没看见', emotion: 'default', effects: { followers: -200 }, response: '我转移话题："今天天气不错哈..."', responseEmotion: 'nervous' },
    ],
  },
  {
    id: 'social_4',
    name: '被认出',
    category: 'social',
    emotion: 'scared',
    monologue: '（看着弹幕）等等，这个人认识我？',
    scene: '直播间有人认出你是大学同学/前同事。',
    dialog: '弹幕："这不是小爱吗？我是你大学同学啊！" "原来你在做主播？"',
    choices: [
      { id: 'admit', text: '承认并打招呼', emotion: 'happy', effects: { followers: 300, integrity: 10 }, response: '"哇！好久不见！没想到在这里遇到你！"', responseEmotion: 'happy' },
      { id: 'deny', text: '否认："你认错人了"', emotion: 'nervous', effects: { followers: -300, integrity: -10 }, response: '"我不是小爱，你认错人了..."（心虚）', responseEmotion: 'scared' },
      { id: 'private', text: '私信联系', emotion: 'nervous', effects: { followers: 100 }, response: '"私聊吧，这里不方便说..."', responseEmotion: 'nervous' },
    ],
  },
  {
    id: 'social_5',
    name: '黑粉攻击',
    category: 'social',
    emotion: 'angry',
    monologue: '（看着恶意弹幕）这些人怎么这么讨厌...',
    scene: '直播间突然出现大量黑粉刷屏攻击。',
    dialog: '弹幕："主播真丑" "唱得难听死了" "滚出直播圈"',
    choices: [
      { id: 'ban', text: '禁言处理', emotion: 'angry', effects: { followers: -100, sanity: -5 }, response: '我默默禁言了几个账号，深呼吸继续直播。', responseEmotion: 'nervous' },
      { id: 'respond', text: '正面回应', emotion: 'angry', effects: { followers: 500, sanity: -10 }, response: '"我知道不是所有人都会喜欢我，但请尊重。"', responseEmotion: 'angry' },
      { id: 'ignore', text: '无视继续', emotion: 'default', effects: { sanity: -15 }, response: '我假装没看到，继续唱歌，但声音有些颤抖...', responseEmotion: 'sad' },
    ],
  },
  {
    id: 'social_6',
    name: '土豪打赏',
    category: 'social',
    emotion: 'happy',
    monologue: '（看着礼物特效）哇！这是...火箭？',
    scene: '突然收到巨额打赏，直播间沸腾。',
    dialog: '弹幕："土豪出现了！" "主播快叫爸爸！" "这是真有钱啊！"',
    choices: [
      { id: 'grateful', text: '真诚感谢', emotion: 'happy', effects: { money: 1000, followers: 1000, kindness: 5 }, response: '"真的太感谢了！我会继续努力的！"', responseEmotion: 'happy' },
      { id: 'joke', text: '开玩笑', emotion: 'playful', effects: { money: 1000, followers: 1500 }, response: '"这位老板，您还缺腿部挂件吗？"', responseEmotion: 'playful' },
      { id: 'refuse', text: '婉拒大额打赏', emotion: 'nervous', effects: { money: 500, followers: 500, integrity: 10 }, response: '"谢谢支持，但请不要过度消费哦。"', responseEmotion: 'happy' },
    ],
  },
];

// ==================== 个人翻车类（6个）====================

const personalEvents: RandomEvent[] = [
  {
    id: 'personal_1',
    name: '情绪崩溃',
    category: 'personal',
    emotion: 'sad',
    monologue: '（眼眶湿润）我真的好累...',
    scene: '直播中突然情绪崩溃，忍不住哭了出来。',
    dialog: '弹幕："主播怎么了？" "别哭啊" "抱抱主播"',
    choices: [
      { id: 'share', text: '倾诉压力', emotion: 'sad', effects: { followers: 2000, sanity: 10, personaIntegrity: 10 }, response: '我哽咽着说："对不起，最近压力太大了..."', responseEmotion: 'sad', hotSearchChance: 0.4 },
      { id: 'apologize', text: '道歉并调整', emotion: 'nervous', effects: { followers: 500, sanity: 5 }, response: '"抱歉，失态了，我去洗把脸。"', responseEmotion: 'nervous' },
      { id: 'end_stream', text: '提前下播', emotion: 'sad', effects: { followers: -500, sanity: 15 }, response: '"对不起，今天先到这里..."', responseEmotion: 'sad' },
    ],
  },
  {
    id: 'personal_2',
    name: '说错话',
    category: 'personal',
    emotion: 'embarrassed',
    monologue: '（说完才意识到）糟了，我说了什么...',
    scene: '不小心说了不合适的话（政治/敏感话题）。',
    dialog: '弹幕："主播这话有问题吧？" "截图了" "要被冲了"',
    choices: [
      { id: 'apologize_immediately', text: '立即道歉', emotion: 'embarrassed', effects: { followers: -1000, integrity: 5 }, response: '"对不起，我说错话了，不是那个意思..."', responseEmotion: 'scared', hotSearchChance: 0.6 },
      { id: 'explain', text: '解释本意', emotion: 'nervous', effects: { followers: -2000, integrity: -5 }, response: '"我的意思是...算了，越描越黑。"', responseEmotion: 'scared', hotSearchChance: 0.8 },
      { id: 'end_quick', text: '紧急下播', emotion: 'panicked', effects: { followers: -3000, sanity: -10 }, response: '我匆忙关掉直播，手心全是汗...', responseEmotion: 'panicked', hotSearchChance: 0.9 },
    ],
  },
  {
    id: 'personal_3',
    name: '身体不适',
    category: 'personal',
    emotion: 'tired',
    monologue: '（捂着肚子）好难受...',
    scene: '直播时突然肚子疼/头疼，坚持不住。',
    dialog: '弹幕："主播脸色好差" "是不是生病了？" "快去休息吧"',
    choices: [
      { id: 'push_through', text: '硬撑', emotion: 'tired', effects: { followers: 500, sanity: -15 }, response: '"没事，我能坚持..."（脸色苍白）', responseEmotion: 'tired' },
      { id: 'rest', text: '去休息', emotion: 'sad', effects: { followers: -300, sanity: 10 }, response: '"对不起，身体不舒服，今天先到这里。"', responseEmotion: 'sad' },
      { id: 'lie', text: '谎称没事', emotion: 'nervous', effects: { followers: -100, integrity: -5, sanity: -20 }, response: '"没事没事，就是有点累..."（强颜欢笑）', responseEmotion: 'nervous' },
    ],
  },
  {
    id: 'personal_4',
    name: '家人闯入',
    category: 'personal',
    emotion: 'embarrassed',
    monologue: '（听到开门声）妈？！',
    scene: '直播时家人突然闯入镜头。',
    dialog: '妈妈："小爱，吃饭了！" 弹幕："是妈妈！" "主播妈妈好年轻！" "社死现场！"',
    choices: [
      { id: 'introduce', text: '介绍妈妈', emotion: 'happy', effects: { followers: 1000, kindness: 5 }, response: '"这是我妈，大家打个招呼！"', responseEmotion: 'happy' },
      { id: 'ask_leave', text: '请妈妈出去', emotion: 'embarrassed', effects: { followers: 300 }, response: '"妈我在直播呢，你先出去..."', responseEmotion: 'embarrassed' },
      { id: 'family_stream', text: '变成家庭直播', emotion: 'playful', effects: { followers: 2000, personaIntegrity: -10 }, response: '"既然来了，妈你也跟大家说两句！"', responseEmotion: 'happy', hotSearchChance: 0.3 },
    ],
  },
  {
    id: 'personal_5',
    name: '豆豆捣乱',
    category: 'personal',
    emotion: 'playful',
    monologue: '（看着跳上桌子的豆豆）豆豆！下去！',
    scene: '豆豆跳上桌子打翻设备，直播中断。',
    dialog: '弹幕："哈哈哈狗狗" "主播的猫好可爱" "直播事故！"',
    choices: [
      { id: 'scold', text: '训斥豆豆', emotion: 'angry', effects: { followers: 200, npcRelation: { npcId: 'doudou', change: -10 } }, response: '"豆豆！坏狗狗！"（豆豆委屈地趴下）', responseEmotion: 'angry' },
      { id: 'show_doudou', text: '展示豆豆', emotion: 'happy', effects: { followers: 1500, npcRelation: { npcId: 'doudou', change: 5 } }, response: '"既然都看到了，给大家介绍一下，这是豆豆！"', responseEmotion: 'happy' },
      { id: 'ignore', text: '无视继续', emotion: 'default', effects: { followers: 500 }, response: '我把豆豆抱下去，继续直播。', responseEmotion: 'nervous' },
    ],
  },
  {
    id: 'personal_6',
    name: '接到催债电话',
    category: 'personal',
    emotion: 'scared',
    monologue: '（看着来电显示）又是催债的...',
    scene: '直播时接到催债电话，声音被直播出去。',
    dialog: '电话："林小爱，你的欠款什么时候还？" 弹幕："主播欠债？" "什么情况？"',
    choices: [
      { id: 'explain', text: '解释是误会', emotion: 'nervous', effects: { followers: -500, integrity: -5 }, response: '"是诈骗电话，大家别信..."（心虚）', responseEmotion: 'scared' },
      { id: 'admit', text: '承认经济困难', emotion: 'sad', effects: { followers: 1000, integrity: 10, personaIntegrity: 10 }, response: '"是的，最近有点困难...但我会努力的！"', responseEmotion: 'sad', hotSearchChance: 0.4 },
      { id: 'mute', text: '静音处理', emotion: 'panicked', effects: { followers: -200 }, response: '我匆忙静音电话，但已经晚了...', responseEmotion: 'panicked' },
    ],
  },
];

// ==================== 内容翻车类（6个）====================

const contentEvents: RandomEvent[] = [
  {
    id: 'content_1',
    name: '唱错歌词',
    category: 'content',
    emotion: 'embarrassed',
    monologue: '（唱着唱着）等等，歌词是什么来着？',
    scene: '唱歌时突然忘词，尴尬地哼过去。',
    dialog: '弹幕："忘词了哈哈哈" "主播在哼什么？" "假唱实锤！"',
    choices: [
      { id: 'admit', text: '承认忘词', emotion: 'embarrassed', effects: { followers: 300, integrity: 5 }, response: '"哎呀忘词了，让我看一眼歌词..."', responseEmotion: 'happy' },
      { id: 'improvise', text: '即兴发挥', emotion: 'playful', effects: { followers: 500 }, response: '"刚才那段是我即兴创作的，好听吗？"', responseEmotion: 'playful' },
      { id: 'restart', text: '重唱', emotion: 'nervous', effects: { followers: 100 }, response: '"重来重来，刚才不算！"', responseEmotion: 'nervous' },
    ],
  },
  {
    id: 'content_2',
    name: '跳错舞步',
    category: 'content',
    emotion: 'embarrassed',
    monologue: '（脚步错乱）哎呀，下一步是什么？',
    scene: '跳舞时动作做错，姿势滑稽。',
    dialog: '弹幕："动作错了哈哈哈" "主播在跳什么？" " freestyle 吗？"',
    choices: [
      { id: 'laugh', text: '自嘲', emotion: 'happy', effects: { followers: 500 }, response: '"这是我独创的舞步，叫乱舞！"', responseEmotion: 'happy' },
      { id: 'correct', text: '纠正重来', emotion: 'nervous', effects: { followers: 200 }, response: '"刚才那个是热身，正式开始了！"', responseEmotion: 'nervous' },
      { id: 'continue', text: '继续跳完', emotion: 'default', effects: { followers: -100 }, response: '我硬着头皮跳完，假装什么都没发生。', responseEmotion: 'embarrassed' },
    ],
  },
  {
    id: 'content_3',
    name: '游戏翻车',
    category: 'content',
    emotion: 'angry',
    monologue: '（摔鼠标）这什么破游戏！',
    scene: '打游戏时连续失误，被对手虐杀。',
    dialog: '弹幕："主播好菜" "下饭操作" "这是我见过最菜的主播"',
    choices: [
      { id: 'rage', text: '暴怒', emotion: 'angry', effects: { followers: 1000, sanity: -10, failCount: 1 }, response: '"这游戏有问题！肯定是bug！"', responseEmotion: 'angry' },
      { id: 'self_deprecate', text: '自嘲', emotion: 'happy', effects: { followers: 500, failCount: 1 }, response: '"好吧，我承认我很菜，但我很快乐！"', responseEmotion: 'happy' },
      { id: 'switch_game', text: '换游戏', emotion: 'nervous', effects: { followers: -200 }, response: '"这游戏不适合我，我们换一个..."', responseEmotion: 'nervous' },
    ],
  },
  {
    id: 'content_4',
    name: '冷场',
    category: 'content',
    emotion: 'nervous',
    monologue: '（看着冷清的弹幕）怎么没人说话...',
    scene: '直播间突然冷场，没人发弹幕。',
    dialog: '弹幕区一片空白，只有偶尔飘过几个"..."',
    choices: [
      { id: 'tell_joke', text: '讲笑话', emotion: 'playful', effects: { followers: 300 }, response: '"给大家讲个笑话...不好笑吗？"', responseEmotion: 'nervous' },
      { id: 'ask_question', text: '提问互动', emotion: 'nervous', effects: { followers: 200 }, response: '"大家今天过得怎么样？在弹幕里告诉我！"', responseEmotion: 'nervous' },
      { id: 'change_content', text: '换内容', emotion: 'default', effects: { followers: 100 }, response: '"看来大家不喜欢这个，我们换个节目。"', responseEmotion: 'nervous' },
    ],
  },
  {
    id: 'content_5',
    name: '设备故障',
    category: 'content',
    emotion: 'nervous',
    monologue: '（看着黑屏）麦克风怎么没声音了？',
    scene: '麦克风/摄像头突然故障，直播中断。',
    dialog: '弹幕："没声音了" "主播掉线了？" "画面黑了"',
    choices: [
      { id: 'fix_quick', text: '快速修复', emotion: 'nervous', effects: { followers: -100 }, response: '"稍等一下，我检查一下设备...好了！"', responseEmotion: 'happy' },
      { id: 'text_chat', text: '文字聊天', emotion: 'default', effects: { followers: 200 }, response: '"麦克风坏了，我们用文字聊天吧！"', responseEmotion: 'happy' },
      { id: 'end_early', text: '提前结束', emotion: 'sad', effects: { followers: -500 }, response: '"设备坏了，今天先到这里吧..."', responseEmotion: 'sad' },
    ],
  },
  {
    id: 'content_6',
    name: '被质疑假唱',
    category: 'content',
    emotion: 'angry',
    monologue: '（看着弹幕）什么？说我假唱？',
    scene: '唱得太好被质疑假唱/放原唱。',
    dialog: '弹幕："这是放的原唱吧？" "假唱实锤" "主播对个口型"',
    choices: [
      { id: 'prove_live', text: '证明是真唱', emotion: 'angry', effects: { followers: 500, integrity: 5 }, response: '"那我清唱一段，你们听听是不是真唱！"', responseEmotion: 'angry' },
      { id: 'ignore', text: '无视', emotion: 'default', effects: { followers: -200 }, response: '我继续唱歌，假装没看到那些弹幕。', responseEmotion: 'nervous' },
      { id: 'joke', text: '开玩笑', emotion: 'playful', effects: { followers: 300 }, response: '"是啊，我是假唱，其实我是AI主播。"', responseEmotion: 'playful' },
    ],
  },
];

// ==================== 道德困境类（6个）====================

const ethicalEvents: RandomEvent[] = [
  {
    id: 'ethical_1',
    name: '虚假宣传',
    category: 'ethical',
    emotion: 'nervous',
    monologue: '（看着广告合同）这个产品我真的用过吗...',
    scene: '接到广告合作，但产品你根本没用过。',
    dialog: '品牌方："只要说用过并且效果好就行，其他的我们处理。"',
    choices: [
      { id: 'refuse', text: '拒绝', emotion: 'default', effects: { money: -5000, integrity: 15 }, response: '"对不起，我不能推荐我没用过的产品。"', responseEmotion: 'happy' },
      { id: 'accept', text: '接受', emotion: 'nervous', effects: { money: 10000, integrity: -20, personaIntegrity: -20 }, response: '"好的，我会好好宣传的..."（心虚）', responseEmotion: 'nervous' },
      { id: 'compromise', text: '要求试用', emotion: 'nervous', effects: { money: 3000, integrity: 5 }, response: '"能让我先试用一周吗？好用我一定推荐。"', responseEmotion: 'nervous' },
    ],
  },
  {
    id: 'ethical_2',
    name: '抄袭争议',
    category: 'ethical',
    emotion: 'scared',
    monologue: '（看着指控）这个创意真的撞了...',
    scene: '被指控抄袭其他主播的创意/内容。',
    dialog: '弹幕："这不是XX主播的梗吗？" "抄袭狗" "原创在这呢！"',
    choices: [
      { id: 'credit', text: '承认借鉴', emotion: 'embarrassed', effects: { followers: -500, integrity: 10 }, response: '"确实是从XX那里学来的，向大家道歉。"', responseEmotion: 'sad' },
      { id: 'deny', text: '否认', emotion: 'angry', effects: { followers: -2000, integrity: -20 }, response: '"这是我原创的，没有抄袭！"', responseEmotion: 'angry', hotSearchChance: 0.6 },
      { id: 'ignore', text: '冷处理', emotion: 'default', effects: { followers: -1000, integrity: -10 }, response: '我继续直播，假装什么都没发生。', responseEmotion: 'nervous' },
    ],
  },
  {
    id: 'ethical_3',
    name: '隐私泄露',
    category: 'ethical',
    emotion: 'panicked',
    monologue: '（看着屏幕）糟了，地址露出来了！',
    scene: '不小心泄露了个人信息（地址/电话等）。',
    dialog: '弹幕："主播地址暴露了！" "快删掉！" "已经截图了..."',
    choices: [
      { id: 'urgent', text: '紧急处理', emotion: 'panicked', effects: { followers: -300, sanity: -15 }, response: '我慌忙删除回放，但已经有人截图了...', responseEmotion: 'scared', hotSearchChance: 0.5 },
      { id: 'move', text: '考虑搬家', emotion: 'sad', effects: { money: -10000, sanity: -10 }, response: '我连夜联系房东，准备搬家...', responseEmotion: 'sad' },
      { id: 'plea', text: '请求不要传播', emotion: 'scared', effects: { followers: 200, integrity: 5 }, response: '"请大家不要传播我的隐私，求求你们了..."', responseEmotion: 'scared' },
    ],
  },
  {
    id: 'ethical_4',
    name: '恶意剪辑',
    category: 'ethical',
    emotion: 'angry',
    monologue: '（看着视频）这根本不是我的意思！',
    scene: '有人恶意剪辑你的直播片段，断章取义。',
    dialog: '视频标题："主播公开辱骂粉丝" 播放量：100万+',
    choices: [
      { id: 'clarify', text: '发视频澄清', emotion: 'angry', effects: { followers: 1000, integrity: 10 }, response: '我发了完整片段："看看完整的上下文！"', responseEmotion: 'angry', hotSearchChance: 0.7 },
      { id: 'legal', text: '法律途径', emotion: 'default', effects: { money: -5000, integrity: 15 }, response: '我联系律师，准备起诉造谣者。', responseEmotion: 'nervous' },
      { id: 'ignore', text: '冷处理', emotion: 'sad', effects: { followers: -3000, sanity: -10 }, response: '我什么都没说，但心里很难受...', responseEmotion: 'sad' },
    ],
  },
  {
    id: 'ethical_5',
    name: '粉丝互撕',
    category: 'ethical',
    emotion: 'nervous',
    monologue: '（看着争吵）我的粉丝怎么打起来了...',
    scene: '两派粉丝在直播间争吵，场面失控。',
    dialog: '弹幕A："XX才是真爱粉！" 弹幕B："你算老几？" 弹幕："主播管管啊！"',
    choices: [
      { id: 'mediate', text: '调解', emotion: 'nervous', effects: { followers: -500, sanity: -5 }, response: '"大家都是我的粉丝，不要吵架好吗？"', responseEmotion: 'nervous' },
      { id: 'ban', text: '禁言处理', emotion: 'angry', effects: { followers: -1000, kindness: -5 }, response: '我禁言了几个带头吵架的账号。', responseEmotion: 'angry' },
      { id: 'ignore', text: '无视', emotion: 'default', effects: { followers: -2000, sanity: -10 }, response: '我继续直播，假装没看到争吵。', responseEmotion: 'nervous' },
    ],
  },
  {
    id: 'ethical_6',
    name: '道德绑架',
    category: 'ethical',
    emotion: 'angry',
    monologue: '（看着私信）这什么要求？',
    scene: '粉丝用"不支持就脱粉"威胁你做某事。',
    dialog: '私信："你不做XX我就脱粉，还要让所有人都脱粉！"',
    choices: [
      { id: 'refuse', text: '拒绝', emotion: 'angry', effects: { followers: -2000, integrity: 10 }, response: '"我不会被威胁的，想脱粉请便。"', responseEmotion: 'angry' },
      { id: 'compromise', text: '妥协', emotion: 'sad', effects: { followers: 500, integrity: -15, personaIntegrity: -15 }, response: '"好吧，我答应你..."（内心很憋屈）', responseEmotion: 'sad' },
      { id: 'explain', text: '解释原因', emotion: 'nervous', effects: { followers: -500, integrity: 5 }, response: '"不是我不想，是真的做不到，希望你能理解。"', responseEmotion: 'nervous' },
    ],
  },
];

// 导出所有随机事件
export const RANDOM_EVENTS: RandomEvent[] = [
  ...techEvents,
  ...socialEvents,
  ...personalEvents,
  ...contentEvents,
  ...ethicalEvents,
];

// 根据类别获取事件
export function getEventsByCategory(category: RandomEvent['category']): RandomEvent[] {
  return RANDOM_EVENTS.filter(e => e.category === category);
}

// 随机获取一个事件
export function getRandomEvent(): RandomEvent {
  return RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
}

// 随机获取多个不重复的事件
export function getRandomEvents(count: number): RandomEvent[] {
  const shuffled = [...RANDOM_EVENTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
