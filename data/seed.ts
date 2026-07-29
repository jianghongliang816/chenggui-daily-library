export type VideoStatus = "待拍" | "已拍" | "放弃";

export type VideoRecord = {
  id: string;
  rank: number;
  date: string;
  title: string;
  posterText: string;
  author: string;
  sourceUrl: string;
  mediaUrl: string | null;
  category: "军旅文案" | "军旅情感" | "个人成长" | "军营轻内容";
  accent: string;
  likes: number;
  comments: number;
  favorites: number;
  shares: number;
  viralLine: string;
  commentQuote: string;
  whyItWorks: string;
  insight: string;
  script: string;
  status: VideoStatus;
};

export const seedVideos: VideoRecord[] = [
  {
    id: "7660827758671713785",
    rank: 1,
    date: "2026-07-29",
    title: "穿了四十二年军装，最后一句还是“祖国需要，我随时出发”",
    posterText: "四十二载\n铸军魂",
    author: "战友3000",
    sourceUrl: "https://www.douyin.com/video/7660827758671713785",
    mediaUrl: null,
    category: "军旅文案",
    accent: "#667052",
    likes: 32000,
    comments: 5881,
    favorites: 2632,
    shares: 2538,
    viralLine: "只要祖国需要，我随时出发。",
    commentQuote: "评论区很多老兵没有喊口号，只是在报自己当年的津贴数字。",
    whyItWorks: "四十二年履历与老人平静讲述形成反差。观众先被资历吸引，最后被“退休不退心”击中。",
    insight: "真正留下来的不是军装，而是没人检查以后依然不愿糊弄自己的标准。",
    script: "我今天看到一位穿了四十二年军装的老兵。\n\n最打动我的，是老人最后那句：“只要祖国需要，我随时出发。”\n\n我退伍以后越来越明白，军旅真正留给人的，不是一张照片，也不是别人喊你一声老兵。它是你离开很多年以后，遇到难事还会下意识地挺一下腰；是没人检查了，你依然不愿意糊弄自己。\n\n真正的军魂，不是穿过多少年军装。\n\n而是脱下军装以后，祖国一声需要，你心里还会回答：到。",
    status: "待拍",
  },
  {
    id: "7658278917916216617",
    rank: 2,
    date: "2026-07-29",
    title: "这次我们不说一路生花，我们说一生平安",
    posterText: "不说生花\n只说平安",
    author: "紫腚能火bb酱",
    sourceUrl: "https://www.douyin.com/video/7658278917916216617",
    mediaUrl: null,
    category: "军旅文案",
    accent: "#a74f32",
    likes: 407000,
    comments: 15000,
    favorites: 15000,
    shares: 14000,
    viralLine: "这次我们不说一路生花，我们说一生平安。",
    commentQuote: "今天不说别的，今天说平安。",
    whyItWorks: "只改两个字，就把普通毕业祝福转成了职业命运。满屏“一生平安”让观众从观看者变成送行的人。",
    insight: "有些职业最好的祝福，不是走得多远，而是每一次出发，都有人等你回来。",
    script: "我今天看到一句毕业祝福，只有十六个字：\n\n“这次我们不说一路生花，我们说一生平安。”\n\n视频里，是云南警官学院禁毒学专业的学生。评论区没有人在夸他们帅，满屏都只有四个字：一生平安。\n\n当过兵以后我才懂，有些职业最好的祝福，不是升得多快，不是走得多远，而是每一次出发，都有人等你回来。\n\n愿你前程有光，也愿你归来有门。\n\n这次不说一路生花，只说一生平安。",
    status: "待拍",
  },
  {
    id: "7664065385179778356",
    rank: 3,
    date: "2026-07-29",
    title: "你守护海岸，我守护你",
    posterText: "你守海岸\n我守着你",
    author: "新兵噜噜⭕",
    sourceUrl: "https://www.douyin.com/video/7664065385179778356",
    mediaUrl: null,
    category: "军旅情感",
    accent: "#496f76",
    likes: 1049,
    comments: 48,
    favorites: 111,
    shares: 1177,
    viralLine: "海的那边有你真好。你守护海岸，我守护你。",
    commentQuote: "这首曲子写的是离别，却一直是欢快的调调，因为分开时最先想到的是对方的优点。",
    whyItWorks: "分享数高于点赞，说明它是一条典型的情侣互相转发、替自己说话的内容。",
    insight: "军人守的是岗位，爱他的人守的是日常。好的感情不是比较谁更辛苦，而是替对方把那一边的日子过好。",
    script: "我今天看到一句很适合军恋的话：\n\n“你守护海岸，我守护你。”\n\n当过兵的人都知道，一段军恋最难的，从来不是少见几次面。是你最需要他的时候，他可能正在值班；是很多委屈不能立刻解释。\n\n你守的是海岸，我守的是我们。\n\n真正长久的爱，不是永远不分开。是隔着很远，依然愿意替对方把那一边的日子过好。",
    status: "待拍",
  },
  {
    id: "7662044267984789986",
    rank: 4,
    date: "2026-07-29",
    title: "先欠着，等你翻身再去也不迟",
    posterText: "先把今天\n打赢",
    author: "子杭",
    sourceUrl: "https://www.douyin.com/video/7662044267984789986",
    mediaUrl: null,
    category: "个人成长",
    accent: "#7e683e",
    likes: 1336000,
    comments: 53000,
    favorites: 80000,
    shares: 225000,
    viralLine: "318最动人的，是出发的勇气。",
    commentQuote: "没事，先欠着，等你翻身再去也不迟。",
    whyItWorks: "评论区把旅行改写成低谷期的自救投票，作者的克制回复又让热血多了一层成年人的体谅。",
    insight: "真正的勇敢不一定是立刻远走，也可以是承认暂时走不了，然后把眼前这段最难的路走完。",
    script: "我今天看到一句话：“318最动人的，是出发的勇气。”\n\n评论区有个人说，自己正在人生最低谷，如果有一万个人点赞，他就马上出发。\n\n作者只说：“没事，先欠着，等你翻身再去也不迟。”\n\n我们太容易把勇敢理解成立刻辞职、立刻远走。可真正的勇敢，有时候不是现在就走，而是把眼前这段最难的路一步一步走完。\n\n想看的世界不会跑。你可以先把今天打赢，再去兑现远方。",
    status: "待拍",
  },
  {
    id: "7657761023562206510",
    rank: 5,
    date: "2026-07-29",
    title: "舍弃小家团圆，只为身后万家灯火",
    posterText: "小家团圆\n万家灯火",
    author: "2米饭桶",
    sourceUrl: "https://www.douyin.com/video/7657761023562206510",
    mediaUrl: null,
    category: "军旅情感",
    accent: "#596845",
    likes: 676000,
    comments: 24000,
    favorites: 32000,
    shares: 17000,
    viralLine: "舍弃小家团圆，只为身后万家灯火。",
    commentQuote: "这是我见过最好看的衣服。",
    whyItWorks: "边防子女、退伍战友和军嫂从三个视角补完了故事，让抽象的守边变成具体生活。",
    insight: "守边的不只是一名战士，还有一个家庭共同承担的缺席。",
    script: "我今天看到一个戍边视频。里面有句话说：“舍弃小家团圆，只为身后万家灯火。”\n\n评论区最高的一句话特别简单：“这是我见过最好看的衣服。”\n\n当过兵以后我才知道，万家灯火这四个字，不是诗。它背后是有人缺席了孩子的生日，有人把团圆一拖再拖。\n\n最好看的从来不是那身衣服本身。是有人穿上它以后，愿意把别人的平安，排在自己的团圆前面。",
    status: "待拍",
  },
  {
    id: "7661945216278738917",
    rank: 6,
    date: "2026-07-29",
    title: "每个单位都有一种“班长感应”",
    posterText: "队里真的\n有 Bug",
    author: "邦邦消画",
    sourceUrl: "https://www.douyin.com/video/7661945216278738917",
    mediaUrl: null,
    category: "军营轻内容",
    accent: "#355c73",
    likes: 1105,
    comments: 56,
    favorites: 166,
    shares: 66,
    viralLine: "有时候真觉得在队里有Bug，特别是“班长感应”的时候。",
    commentQuote: "后脑勺还没接触到枕头，警铃就响了。",
    whyItWorks: "用年轻人熟悉的“系统Bug”包装军营巧合，没有宏大叙事，靠真实细节让经历过集体生活的人秒懂。",
    insight: "适合调节账号情绪浓度，让乘归既保留军旅人设，也显得年轻、松弛、真实。",
    script: "我今天看到有人总结：在队里待久了，你会发现单位真的有Bug。\n\n第一种，东西越找越没有。刚说一句“算了不要了”，它就在最显眼的地方出现。\n\n但最离谱的还得是“班长感应”。你本来聊得正开心，突然空气安静两秒，所有人同时有一种不祥的预感。下一秒，班长从门口出现。\n\n青春有时候不是一件大事。就是很多当时想逃、后来想笑、如今再也回不去的小Bug。",
    status: "待拍",
  },
];
