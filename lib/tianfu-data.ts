import { BookOpen, Bot, BrainCircuit, Map, Network, ScrollText } from "lucide-react";

export type LayerKey = "heritage" | "architecture" | "intangible" | "event" | "scholar" | "literature";

export const stats = [
  { label: "文献数量", value: "12,860" },
  { label: "文化遗产数量", value: "2,341" },
  { label: "古建数量", value: "1,128" },
  { label: "非遗数量", value: "673" },
  { label: "历史事件数量", value: "916" }
];

export const entries = [
  { title: "文脉梳理", desc: "理论源流、主题谱系、方法谱系与研究缺口分析", icon: Network, href: "#lineage" },
  { title: "研究框架构建", desc: "从研究想法自动生成理论基础、变量设计和框架图", icon: BrainCircuit, href: "#framework" },
  { title: "天府学研究舆图", desc: "四川省真实行政区划地图上的文化知识图谱", icon: Map, href: "#atlas" }
];

export const themes = ["天府文化", "川菜", "蜀学", "三星堆", "都江堰", "巴蜀文化", "成都城市文化"];

export const methods = ["内容分析", "文本挖掘", "主题模型", "情感分析", "GIS分析", "数字人文"];

export const agents = [
  { name: "文献研究Agent", icon: BookOpen },
  { name: "文脉分析Agent", icon: Network },
  { name: "研究设计Agent", icon: BrainCircuit },
  { name: "天府学专家Agent", icon: Bot },
  { name: "知识图谱Agent", icon: ScrollText },
  { name: "地图分析Agent", icon: Map }
];

export const timeline = ["公元前", "秦汉", "三国", "唐宋", "元明清", "民国", "现代"];

export const layerLabels: Record<LayerKey, string> = {
  heritage: "文化遗产",
  architecture: "古建筑",
  intangible: "非遗",
  event: "历史事件",
  scholar: "学者研究",
  literature: "文献分布"
};

export const mapPoints = [
  {
    id: "sanxingdui",
    name: "三星堆遗址",
    layer: "heritage" as LayerKey,
    era: "公元前",
    position: [31.007, 104.205] as [number, number],
    summary: "古蜀文明核心遗址，青铜器、玉器与祭祀坑构成天府文化早期谱系的重要节点。",
    keywords: ["古蜀文明", "青铜器", "考古传播"],
    references: ["《三星堆与古蜀文明研究》", "Sanxingdui Archaeology Review"],
    related: ["文化记忆", "博物馆传播", "短视频叙事"]
  },
  {
    id: "dujiangyan",
    name: "都江堰水利工程",
    layer: "heritage" as LayerKey,
    era: "秦汉",
    position: [30.991, 103.618] as [number, number],
    summary: "战国时期大型水利工程，塑造成都平原农业、城市与地方文化结构。",
    keywords: ["水利文明", "李冰", "成都平原"],
    references: ["《都江堰水利史》", "UNESCO World Heritage"],
    related: ["生态治理", "工程遗产", "地方认同"]
  },
  {
    id: "wuhou",
    name: "成都武侯祠",
    layer: "architecture" as LayerKey,
    era: "三国",
    position: [30.642, 104.046] as [number, number],
    summary: "三国文化记忆和城市公共文化空间的重要载体。",
    keywords: ["三国文化", "祠庙建筑", "城市旅游"],
    references: ["《成都武侯祠文化研究》"],
    related: ["文化景观", "历史叙事", "文旅融合"]
  },
  {
    id: "sichuan-opera",
    name: "川剧",
    layer: "intangible" as LayerKey,
    era: "元明清",
    position: [30.657, 104.066] as [number, number],
    summary: "四川代表性戏曲形态，涵盖声腔、表演程式与民间审美。",
    keywords: ["非遗", "戏曲", "变脸"],
    references: ["《川剧艺术史》"],
    related: ["非遗传播", "短视频平台", "青年认同"]
  },
  {
    id: "ba-shu-literature",
    name: "巴蜀文学研究群",
    layer: "literature" as LayerKey,
    era: "现代",
    position: [30.563, 103.999] as [number, number],
    summary: "以高校和研究机构为中心的天府学文献生产与知识聚合区域。",
    keywords: ["巴蜀文学", "学术共同体", "知识生产"],
    references: ["CNKI巴蜀文化主题文献集"],
    related: ["文献计量", "主题模型", "学术网络"]
  },
  {
    id: "kangding-route",
    name: "茶马古道康定节点",
    layer: "event" as LayerKey,
    era: "唐宋",
    position: [30.052, 101.964] as [number, number],
    summary: "连接川西高原与多民族交流网络的历史通道节点。",
    keywords: ["茶马古道", "民族交流", "商贸传播"],
    references: ["《川藏茶马古道研究》"],
    related: ["路线GIS", "边疆社会", "文化交流"]
  }
];

export const frameworkMermaid = `flowchart LR
  A[研究想法] --> B[理论基础]
  B --> C[核心概念]
  C --> D[研究问题]
  D --> E[变量设计]
  E --> F[数据来源]
  F --> G[方法组合]
  G --> H[天府学解释框架]`;
