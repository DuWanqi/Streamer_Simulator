/**
 * 默认内容 - 无AI模式下的预设文本
 */

import { randomPick, randomInt } from '../utils/helpers';
import type { AttributeType, StreamCategory } from '../game/GameConfig';

const UPGRADE_TEXTS: Record<AttributeType, string[][]> = {
  appearance: [
    ['你花1000块钱买了件新衣服，感觉好极了！', '你在某宝买了一套化妆品，涂完之后室友都认不出你了', '你去理了个新发型，Tony老师说你是他最满意的作品'],
    ['你花2000块钱升级了摄像头，拍出来美才是真的美嘛！', '你请了化妆师来教你上镜技巧', '你买了一套LED补光灯，开了之后直播间亮得像太阳'],
    ['你花5000元从某宝神秘商家买了一个超强美颜软件，开了之后感觉自己能当颜值区Top1', '你找了专业造型师做了个形象改造', '你买了一套专业直播间装修'],
    ['你花10000元雇佣了私人健身教练，感觉身体可以穿越鳌太线', '你做了牙齿美白，笑起来blingbling的', '你请了专业摄影团队拍了一套写真'],
    ['你花20000请了国际造型师，出门被认成明星，签了三个名才脱身', '你去做了医美微调，效果太自然了', '你定制了一套直播间全息投影系统'],
  ],
  knowledge: [
    ['你参加了朋友推荐的最强大脑培训班，感觉大脑都被翻新了', '你买了一本《如何成为知识主播》，翻了两页就困了', '你看完了一季TED演讲合集'],
    ['你趁双十一购入大量书籍，前往了知识的荒原旅行', '你报了一个在线课程', '你去参加了一个读书会'],
    ['你报名了主播人才速成班，感觉知识从光滑的大脑皮层滑过', '你请了一位教授来给你补课', '你买了一套百科全书'],
    ['你参加了名校的MOOC课程，学完之后可以跟弹幕对线了', '你雇了一个智囊团帮你准备直播话题', '你去参加了知识竞赛'],
    ['你请了诺贝尔奖得主来当顾问', '你去牛津大学做了交流访问', '你出了一本书《从零到顶流》'],
  ],
  fame: [
    ['你花了100元买了平台的推广，主页视频播放量大幅增加了', '你在朋友圈发了直播链接，七大姑八大姨都来看了', '你给自己做了一个短视频'],
    ['你花1000元雇了软文写手把你吹上了天', '你蹭了一波热门话题的热度', '你跟其他小主播互推'],
    ['你上了一个综艺节目，虽然只是路人镜头', '你花钱买了一波热搜', '你跟一个百万粉丝的博主合拍了视频'],
    ['你被邀请参加了年度盛典', '你接了一个品牌代言', '你上了微博热搜'],
    ['你登上了Times杂志封面——亚洲版的小角落里', '你被邀请去海外直播节做嘉宾', '你的名字出现在了年度互联网人物榜单上'],
  ],
  talent: [
    ['你花了5000元学了门才艺，一位大师教你学动物叫，你学得太像把家里的狗吓了一跳', '你报了一个吉他速成班', '你学了一个魔术'],
    ['你花10000元找了声乐老师，现在唱歌至少不跑调了', '你去学了街舞', '你学了单口喜剧'],
    ['你参加了才艺大赛，虽然没进决赛但人气投票第一', '你找了专业老师学了一个月的乐器', '你苦练了一个月的绝活'],
    ['你请了国家级表演艺术家来教你', '你去国外参加了大师班', '你开发了一个独创的才艺表演'],
    ['你跟世界级大师学艺半年，现在被称为"直播界的艺术家"', '你的才艺视频被转发到国外', '你创造了一种全新的表演形式'],
  ],
};

const DEFAULT_DANMAKU: Record<string, string[]> = {
  general: ['来了来了！', '冲冲冲！', '主播好！', '打卡签到~', '终于等到你直播了', '搬好小板凳', '前排占座', '刚来，发生了什么？', '直播间人好多啊', '主播今天状态不错', '哈哈哈哈哈', '笑死我了', '太逗了吧', '666666', '牛牛牛', '厉害了我的哥', 'YYDS', '已关注', '粉丝团加了'],
  music: ['好听！', '再来一首！', '单曲循环了', '太好听了吧', '主播唱歌真好听', '鸡皮疙瘩都起来了', '耳朵怀孕了'],
  dance: ['跳得好！', '舞姿太美了', '这个编舞太帅了', '学到了学到了', '身体协调性好强', '跳得太好了吧'],
  gaming: ['操作好秀', 'MVP！', '这波太强了', '输出爆表', '带带我', '大佬666', '这个走位绝了'],
  variety: ['哈哈哈哈笑死', '太搞笑了', '肚子笑疼了', '这个梗太好了', '主播你是喜剧人吧', '综艺感拉满'],
};

const DEFAULT_COMMENTS = [
  { user: '忠实粉丝001', text: '主播今天好帅/好美啊！' },
  { user: '路人甲', text: '第一次来，这里什么情况？' },
  { user: '氪金大佬', text: '小的给主播请安了' },
  { user: '深夜游民', text: '失眠了来看看直播' },
  { user: '学生党', text: '偷偷在被窝里看直播' },
  { user: '社畜打工人', text: '下班了，终于可以看直播了' },
  { user: '老粉1号', text: '从第一天就关注了，见证主播成长' },
  { user: '弹幕侠', text: '弹幕发射！' },
  { user: '潜水党', text: '我一般不说话的，但今天必须冒个泡' },
  { user: '吃瓜群众', text: '搬好小板凳看热闹' },
];

const BIG_SPENDER_NAMES = ['煤老板张总', '神秘富二代', '不差钱的王哥', '低调的李总', '匿名土豪', '宇宙无敌刷客', '一掷千金哥', '榜一大佬'];

const GIFT_NAMES = [
  { name: '超级跑车', emoji: '🏎️' },
  { name: '火箭', emoji: '🚀' },
  { name: '城堡', emoji: '🏰' },
  { name: '钻石', emoji: '💎' },
  { name: '皇冠', emoji: '👑' },
];

const PK_OPPONENTS = [
  { name: '土味情话王', desc: '靠土味情话从0涨到100万粉丝的传奇主播', level: 0 },
  { name: '游戏小王子', desc: '游戏区头部主播，自称"手速全网第一"', level: 0 },
  { name: '尬舞达人', desc: '舞蹈区黑马，风格独特到让人不敢直视', level: 0 },
  { name: '知识区一哥', desc: '据说考过清华但没去，选择了直播', level: 0 },
  { name: '吃播巨无霸', desc: '一顿能吃十碗饭的传奇吃播', level: 0 },
];

// 按分区分类的突发事件文本 - 包含中国互联网梗
const SUDDEN_EVENTS: Record<string, Record<string, Array<{ title: string; text: string; positive: boolean }>>> = {
  // 音乐区
  music: {
    big_streamer_raid: [
      { title: '大主播查房！', text: '百万粉丝音乐区唱见大佬突然查房，连麦让你清唱《花海》，你稳得住发挥，对方直播间粉丝狂刷"去对面关注"', positive: true },
      { title: '古风大佬来了！', text: '古风圈顶流主播查房，听你唱戏腔后直接刷了个小礼物，你的古风翻唱瞬间被圈內人转发', positive: true },
      { title: '声卡大师指导！', text: '声卡调试界大主播查房，看你设备简陋直接远程教你调声卡，粉丝直呼"大佬宠粉，对面血赚"', positive: true },
      { title: '合唱出圈！', text: '抖音热歌翻唱一哥查房，连麦和你合唱当下热曲，合唱片段被剪进他的视频，你的关注量小涨', positive: true },
    ],
    rival_attack: [
      { title: '声卡党互撕！', text: '同分区小主播发视频阴阳你"全靠声卡修音，原音比鬼哭还难听"，弹幕开始互撕"声卡党vs原音党"', positive: false },
      { title: '版权风波！', text: '隔壁翻唱主播买水军刷你"翻唱没版权，纯纯蹭热度"，评论区被带节奏', positive: false },
      { title: '喊麦PK！', text: '同平台喊麦主播连麦diss你"唱的歌没一点劲，不如喊麦有排面"，双方粉丝在弹幕掐架', positive: false },
      { title: '国风联动！', text: '隔壁国风歌手主播私信你联动直播，一起唱古风串烧，直播切片被平台推流', positive: true },
      { title: '原创合作！', text: '小众原创歌手主播找你翻唱他的原创歌，承诺帮你在粉丝群推流，你的粉丝团人数小幅上涨', positive: true },
      { title: '喊麦混搭！', text: '同平台喊麦主播一改风格找你合作"喊麦+唱歌"混搭曲目，效果意外搞笑出圈', positive: true },
    ],
    mcn_offer: [
      { title: 'MCN画大饼！', text: '本地小型音乐MCN机构私信你，想签独家约，给出的条件是"包设备但抽成50%"，纯纯画大饼', positive: false },
      { title: '网红MCN！', text: '做网红翻唱的MCN找你谈合作，承诺帮你对接商演，但要求你以后只唱他们指定的热歌', positive: false },
      { title: '国风MCN！', text: '国风音乐MCN向你抛橄榄枝，愿意免费帮你做歌曲后期，只要求挂机构的合作标识，无抽成', positive: true },
    ],
    slander: [
      { title: '数据造假风波！', text: '有人在某音发视频造谣你"翻唱赚的钱全是刷的，粉丝都是买的"，虽然没人信但还是掉了点粉', positive: false },
      { title: '鬼畜翻车！', text: '黑粉扒出你早期跑调的直播片段，做成鬼畜视频发在B站，弹幕刷"翻车现场"', positive: false },
      { title: '抄袭风波！', text: '有营销号造谣你"抄袭某小众歌手的歌词，还倒打一耙"，虽然你及时澄清，但还是被带了波节奏', positive: false },
      { title: '假唱实锤？', text: '黑粉在评论区造谣你"直播唱歌时假唱，嘴型都对不上"，甚至发了拼接的"实锤"视频', positive: false },
    ],
  },
  // 舞蹈区
  dance: {
    big_streamer_raid: [
      { title: '韩舞女王来了！', text: '百万粉丝韩舞翻跳女主播查房，看你跳《New Jeans》后直呼"卡点超准"，给你刷了礼物还让粉丝去关注', positive: true },
      { title: '广场舞一姐！', text: '广场舞直播一姐查房，看你跳民族舞后连麦求联动，说要带你和大妈们一起跳广场版民族舞', positive: true },
      { title: '卡点天花板！', text: '卡点舞蹈天花板主播查房，对你的卡点舞蹈进行现场指导，弹幕刷"专业指导，学到了"', positive: true },
      { title: '国风顶流！', text: '国风舞蹈顶流查房，看你跳古典舞后，在自己的粉丝群推荐了你，你的古风舞蹈粉瞬间增加', positive: true },
    ],
    rival_attack: [
      { title: '擦边争议！', text: '同分区跳擦边舞的主播阴阳你"跳的舞太死板，没看点，难怪没人看"，她的粉丝跑来直播间刷差评', positive: false },
      { title: '韩舞正宗之争！', text: '隔壁翻跳韩舞的主播买水军刷你"东施效颦，跳的韩舞没一点灵魂"，弹幕开始互撕', positive: false },
      { title: '广场舞diss！', text: '同平台广场舞主播diss你"跳的舞花里胡哨，不如广场舞接地气"，双方粉丝在评论区掐架', positive: false },
      { title: 'CP炒作！', text: '一位同行主播私下联系你，计划和你炒作"CP"，你俩在直播间上演甜蜜互动，收获一波粉丝关注', positive: true },
      { title: '只因你太美！', text: '弹幕希望你表演"只因你太美"舞蹈，你出色地完成了任务，获得大量打赏', positive: true },
      { title: '鬼畜登顶！', text: 'B站的鬼畜UP主用你的切片制作了一个爆款鬼畜视频，登顶排行榜第一，这下关注量大涨！', positive: true },
    ],
    mcn_offer: [
      { title: '舞蹈MCN！', text: '做舞蹈网红的MCN找你签约，承诺帮你对接品牌商演，但要求你以后多跳热门韩舞，禁止跳原创', positive: false },
      { title: '文旅MCN！', text: '本地文旅MCN向你抛橄榄枝，想让你跳本地特色舞蹈拍短视频，包流量推广但无底薪', positive: false },
      { title: '国风舞蹈MCN！', text: '国风舞蹈MCN找你谈合作，愿意免费帮你做舞蹈布景和拍摄，只要求你的国风舞蹈视频挂机构logo', positive: true },
    ],
    slander: [
      { title: '擦边风波！', text: '黑粉发视频造谣你"舞蹈动作擦边，还买通超管不封号"，虽然超管没找你，但还是掉了些粉丝', positive: false },
      { title: '代跳风波！', text: '有人在贴吧造谣你"翻跳的舞蹈全是找代跳，直播时放录屏"，还贴了拼接的"实锤"图', positive: false },
      { title: '背后说人！', text: '同分区主播的粉丝造谣你"背后说其他舞蹈主播跳得差"，被人造谣截图发在粉丝群', positive: false },
    ],
  },
  // 游戏区
  gaming: {
    big_streamer_raid: [
      { title: '原神头部来了！', text: '原神头部主播查房看你抽卡，你80抽歪了迪卢克，对方直播间粉丝全跑来你这刷"垫刀成功"', positive: true },
      { title: 'LPL解说来了！', text: 'LPL官方解说查房看你打英雄联盟，你一波丝滑操作被解说夸"有职业潜力"', positive: true },
      { title: 'KPL职业选手！', text: '王者荣耀KPL职业选手查房，和你双排打巅峰赛，你辅助玩得超溜，选手粉丝狂刷"辅助神了"', positive: true },
      { title: '人皇来了！', text: '第五人格人皇主播查房看你溜鬼，你溜了监管者五台机，对方直接刷礼物', positive: true },
    ],
    rival_attack: [
      { title: '圣遗物争议！', text: '同平台原神主播发视频阴阳你"玩原神连圣遗物都不会配，纯纯云玩家"，他的粉丝跑来你直播间刷"退游吧"', positive: false },
      { title: '米哈游孝子风波！', text: '隔壁鸣潮主播买水军刷你"踩鸣潮吹原神，纯纯米哈游孝子"，评论区被原神/鸣潮粉丝互撕占领', positive: false },
      { title: '菜得抠脚！', text: '王者荣耀主播连麦diss你"玩打野只会刷野，不会抓人，菜得抠脚"，双方粉丝在弹幕掐架', positive: false },
      { title: '开挂风波！', text: '你直播玩三角洲行动刚拿了冠军，同平台主播造谣你"开科技开挂"，还发了模糊的视频当"证据"', positive: false },
      { title: '鬼畜登顶！', text: 'B站的鬼畜UP主用你的切片制作了一个爆款鬼畜视频，登顶排行榜第一，这下关注量大涨！', positive: true },
    ],
    mcn_offer: [
      { title: '游戏MCN！', text: '游戏直播头部MCN找你签约，承诺帮你对接游戏厂商试玩资源，但抽成高达60%，还要求每天直播10小时', positive: false },
      { title: '米哈游合作！', text: '米哈游合作的小众MCN向你抛橄榄枝，愿意免费给你原神周边福利，让你多直播原神内容，无抽成', positive: true },
      { title: '王者官方！', text: '王者荣耀官方合作MCN找你谈合作，承诺帮你上KPL二路解说，但要求你以后只直播王者荣耀', positive: true },
    ],
    slander: [
      { title: '买内幕风波！', text: '黑粉在NGA造谣你"直播打LPL预测全是买的内部消息，根本不懂游戏"，还贴了拼接的聊天记录', positive: false },
      { title: '收钱踩原神！', text: '有人发视频造谣你"玩鸣潮收了库洛的钱，故意踩原神"，被原神粉丝跑来直播间刷差评', positive: false },
      { title: '演员风波！', text: '营销号造谣你"直播三角洲行动时，和队友合伙演粉丝，故意送人头"，虽然无实锤，但还是被带了波节奏', positive: false },
      { title: '剪辑怪！', text: '同平台第五人格主播的粉丝造谣你"溜鬼全是靠剪辑，直播实际菜得很"，弹幕被刷"剪辑怪"', positive: false },
    ],
  },
  // 整活搞笑区
  variety: {
    big_streamer_raid: [
      { title: '虎哥来了！', text: '东北整活顶流虎哥突然查房，连麦和你整"东北往事名场面"，你一句"杀马特团长申请出战"直接戳中笑点', positive: true },
      { title: '宇将军来了！', text: '宇将军连麦查房，和你一起整"社会摇名场面"，你青海摇跳得有模有样，对方直播间粉丝狂刷"对面整活比宇将军还狠"', positive: true },
      { title: '灵异大佬！', text: '灵异直播头部主播查房，和你一起连麦做灵异整活，你假装被"脏东西"吓到的样子超逼真', positive: true },
      { title: '牢大空降！', text: 'AI主播"牢大"空降直播间，关注量大涨', positive: true },
    ],
    rival_attack: [
      { title: '缝合怪！', text: '同分区整活主播发视频阴阳你"整活全是抄虎哥刀哥的，没一点原创，纯纯缝合怪"', positive: false },
      { title: '演员争议！', text: '隔壁灵异直播主播买水军刷你"灵异直播全是请演员，道具一眼假"，评论区被互撕占领', positive: false },
      { title: '青海摇之争！', text: '宇将军的粉丝连麦diss你"青海摇跳得四不像，还敢称整活区新人，配吗"', positive: false },
      { title: '土味情话PK！', text: '隔壁搞笑主播连麦和你比拼"土味情话整活"，双方粉丝友好刷"尬到抠脚但好笑"', positive: true },
      { title: '双人灵异探险！', text: '灵异整活主播邀你联动做"双人灵异探险"，全程搞笑无恐怖，双方粉丝互相串门', positive: true },
      { title: '路人奇葩采访！', text: '街头整活主播找你合作做"路人奇葩采访"，你的神提问笑翻网友，平台推流小热门', positive: true },
      { title: '鬼畜登顶！', text: 'B站的鬼畜UP主用你的切片制作了一个爆款鬼畜视频，登顶排行榜第一，这下关注量大涨！', positive: true },
    ],
    mcn_offer: [
      { title: '整活MCN！', text: '整活直播头部MCN找你签约，承诺帮你对接线下商演整活资源，但抽成55%，还要求你每天整不同的狠活', positive: false },
      { title: '搞笑MCN！', text: '短视频搞笑MCN向你抛橄榄枝，愿意免费帮你剪辑整活视频，让你多更短视频，直播抽成仅20%', positive: true },
      { title: '东北MCN！', text: '东北整活本地MCN找你谈合作，承诺帮你和虎哥刀哥连麦整活，要求你以后多整东北风格整活', positive: true },
    ],
    slander: [
      { title: '劈叉摔断腿？', text: '黑粉在快手上造谣你"青海摇跳劈叉摔断腿，直播都是录屏"，还贴了拼接的医院照片', positive: false },
      { title: '被虎哥约谈？', text: '有人发视频造谣你"整东北往事名场面，被虎哥刀哥线下约谈，差点挨打"', positive: false },
      { title: '吓到路人！', text: '营销号造谣你"灵异直播时吓到路人，被路人报警投诉"，虽然无实锤，但还是被一些路人取关', positive: false },
      { title: '两面三刀！', text: '同平台整活主播的粉丝造谣你"连麦宇将军时，背后说宇将军的社会摇太拉胯"，弹幕被刷"两面三刀"', positive: false },
    ],
  },
};

// 通用突发事件（兼容旧代码）
const SUDDEN_EVENTS_GENERIC = {
  big_streamer_raid: [
    { title: '大主播查房！', text: '百万粉丝大佬突然闯进你的直播间，带来了一大波观众！', positive: true },
    { title: '大主播连线！', text: '顶流主播在直播中提到了你，说"这个小主播挺有意思的"', positive: true },
  ],
  rival_attack: [
    { title: '同行互动！', text: '同区主播找你连麦，虽然有点尴尬，但也增加了曝光', positive: true },
    { title: '被人蹭热度！', text: '一个小主播故意碰瓷你，虽然很烦，但也算变相给你打了广告', positive: true },
  ],
  mcn_offer: [
    { title: 'MCN来了！', text: 'XX娱乐旗下的经纪人私信你，说要签你做旗下主播', positive: true },
    { title: '品牌合作！', text: '某品牌想跟你合作做一期广告，钱给的不少', positive: true },
  ],
  slander: [
    { title: '舆论风波！', text: '有人在论坛发帖说你"直播数据全是刷的"，引起了一波讨论', positive: false },
    { title: '黑料风波！', text: '有人P了你的截图在网上传播，虽然很快被证实是假的', positive: false },
  ],
};

const DAILY_SUMMARIES = [
  '今天的直播相当精彩！观众们都很开心，数据稳步增长。',
  '虽然今天没什么大事发生，但稳定输出也是一种实力。',
  '今天的互动特别好，弹幕几乎没停过！',
  '今天翻了个小车，但总体来说还是正向的。',
  '今天的直播效果炸裂！老粉带新粉，数据飞涨！',
];

const FUTURE_PREDICTIONS = [
  '退役后，你意外地成为了一名美食博主，专门教人做黑暗料理。你的"番茄炒月饼"成为了全网热搜第一。',
  '你在直播生涯的巅峰期突然宣布隐退，去山里修行。三年后你带着一身仙气回归，开创了"禅修直播"新品类。',
  '你的直播风格被写进了传媒学教材，成为"新时代网络文化现象"的经典案例。',
  '退休后你用攒下的钱买了一座小岛，每天直播钓鱼看日落。没想到这种"退休式直播"反而更火了。',
];

export function getUpgradeText(type: AttributeType, stageIndex: number): string {
  const texts = UPGRADE_TEXTS[type][stageIndex] || UPGRADE_TEXTS[type][0];
  return randomPick(texts);
}

export function getDanmaku(category: StreamCategory | null): string {
  const pool = [...DEFAULT_DANMAKU.general];
  if (category && DEFAULT_DANMAKU[category]) {
    pool.push(...DEFAULT_DANMAKU[category]);
  }
  return randomPick(pool);
}

export function getRandomComment(): { user: string; text: string } {
  return randomPick(DEFAULT_COMMENTS);
}

export function getBigSpenderName(): string {
  return randomPick(BIG_SPENDER_NAMES);
}

export function getRandomGift(): { name: string; emoji: string } {
  return randomPick(GIFT_NAMES);
}

export function getPKOpponent(stageId: number): { name: string; desc: string; level: number } {
  const opponent = { ...randomPick(PK_OPPONENTS) };
  opponent.level = Math.max(1, (stageId - 1) * 20 + randomInt(1, 30));
  return opponent;
}

export function getSuddenEvent(type: string, category?: StreamCategory | null): { title: string; text: string; positive: boolean } {
  // 如果有分区，优先使用分区特定的事件
  if (category && SUDDEN_EVENTS[category] && SUDDEN_EVENTS[category][type]) {
    return randomPick(SUDDEN_EVENTS[category][type]);
  }
  // 回退到通用事件
  const events = SUDDEN_EVENTS_GENERIC[type as keyof typeof SUDDEN_EVENTS_GENERIC];
  if (!events) return { title: '突发事件', text: '发生了一件奇怪的事...', positive: true };
  return randomPick(events);
}

export function getDailySummary(): string {
  return randomPick(DAILY_SUMMARIES);
}

export function getFuturePrediction(): string {
  return randomPick(FUTURE_PREDICTIONS);
}
