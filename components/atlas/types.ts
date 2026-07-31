export type AtlasLayer = "heritage" | "intangible" | "museum" | "event";

export type AtlasObject = {
  id: string;
  name: string;
  layer: AtlasLayer;
  category?: string;
  level?: string;
  era?: string;
  lat: number;
  lng: number;
  coordinate_system?: "gcj02" | "wgs84" | "bd09" | "unknown";
  intro: string;
  keywords: string[];
  region?: string;
  related_literature?: string[];
  research?: {
    paper_count: number;
    topics: string[];
    scholars: string[];
    keywords: string[];
    trend: string;
  };
  graph?: {
    nodes: string[];
    edges: [string, string, string][];
  };
  literature?: {
    papers: { title: string; id: string; source_path?: string }[];
    gazetteers: string[];
    ancient_books: string[];
    news: { title: string; source_url: string; category: string }[];
    hotspots: string[];
  };
};

export type Region = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  coordinate_system?: "gcj02" | "wgs84" | "bd09" | "unknown";
  level: string;
  area_km2: number;
  population_million: number;
  intro: string;
};
