
export type Major = {
  id: string;
  name: string;
  category:
    | "Math, CS & Data"
    | "Life & Health Sciences"
    | "Physical & Earth Sciences"
    | "Business & Economics"
    | "Social Sciences"
    | "Humanities"
    | "Languages"
    | "Arts & Media";
  emoji: string;
  core: readonly string[];
  support: readonly string[];
};

export const MAJORS: Major[] = [
  { id: "anthropology", name: "Anthropology", category: "Social Sciences", emoji: "🗿", core: ["ANT"], support: ["SOC", "ARC"] },
  { id: "applied-mathematics", name: "Applied Mathematics", category: "Math, CS & Data", emoji: "🧮", core: ["MAT"], support: ["STA", "CSC"] },
  { id: "applied-statistics", name: "Applied Statistics", category: "Math, CS & Data", emoji: "📊", core: ["STA"], support: ["MAT", "CSC"] },
  { id: "art-art-history", name: "Art and Art History", category: "Arts & Media", emoji: "🎨", core: ["FAH"], support: ["VCC", "CIN"] },
  { id: "art-history", name: "Art History", category: "Arts & Media", emoji: "🖼️", core: ["FAH"], support: ["VCC", "CIN"] },
  { id: "astronomy", name: "Astronomy", category: "Physical & Earth Sciences", emoji: "🌌", core: ["AST"], support: ["PHY", "MAT"] },
  { id: "biology", name: "Biology", category: "Life & Health Sciences", emoji: "🌱", core: ["BIO"], support: ["CHM", "STA", "HSC"] },
  { id: "biology-health-sciences", name: "Biology For Health Sciences", category: "Life & Health Sciences", emoji: "🏥", core: ["BIO"], support: ["CHM", "HSC"] },
  { id: "canadian-studies", name: "Canadian Studies", category: "Social Sciences", emoji: "🍁", core: ["CBJ"], support: ["HIS", "POL", "GGR", "ENG"] },
  { id: "chemistry", name: "Chemistry", category: "Physical & Earth Sciences", emoji: "🧪", core: ["CHM"], support: ["MAT", "PHY", "BIO"] },
  { id: "cinema", name: "Cinema Studies", category: "Arts & Media", emoji: "🎬", core: ["CIN"], support: ["ENG", "VCC"] },
  { id: "classics", name: "Classical Civilization", category: "Humanities", emoji: "🏛️", core: ["CLA"], support: ["GRK", "LAT", "HIS"] },
  { id: "commerce", name: "Commerce", category: "Business & Economics", emoji: "💼", core: ["MGT"], support: ["ECO", "MAT", "STA", "MGM"] },
  { id: "ccit", name: "Communication, Culture, Information & Technology", category: "Social Sciences", emoji: "📡", core: ["CCT"], support: ["VCC", "WRI", "CSC"] },
  { id: "computer-science", name: "Computer Science", category: "Math, CS & Data", emoji: "💻", core: ["CSC"], support: ["MAT", "STA"] },
  { id: "criminology", name: "Criminology, Law & Society", category: "Social Sciences", emoji: "⚖️", core: ["SOC"], support: ["POL", "PHL", "ANT"] },
  { id: "diaspora", name: "Diaspora and Transnational Studies", category: "Social Sciences", emoji: "🧳", core: ["DTS"], support: ["HIS", "SOC", "ANT"] },
  { id: "dramaturgy", name: "Dramaturgy and Drama Studies", category: "Arts & Media", emoji: "🎭", core: ["DRE"], support: ["ENG", "CIN"] },
  { id: "earth-science", name: "Earth Science", category: "Physical & Earth Sciences", emoji: "🪨", core: ["ERS"], support: ["GGR", "CHM", "BIO"] },
  { id: "economics", name: "Economics", category: "Business & Economics", emoji: "📈", core: ["ECO"], support: ["MAT", "STA", "MGT"] },
  { id: "english", name: "English", category: "Humanities", emoji: "📖", core: ["ENG"], support: ["WRI", "DRE"] },
  { id: "environmental-management", name: "Environmental Management", category: "Social Sciences", emoji: "🌍", core: ["ENV"], support: ["BIO", "ERS", "CHM", "GGR"] },
  { id: "environmental-science", name: "Environmental Science", category: "Physical & Earth Sciences", emoji: "🌍", core: ["ENV"], support: ["BIO", "ERS", "CHM", "GGR"] },
  { id: "forensic-science", name: "Forensic Science", category: "Life & Health Sciences", emoji: "🔬", core: ["FSC"], support: ["ANT", "CHM", "BIO", "PSY"] },
  { id: "french", name: "French Studies", category: "Languages", emoji: "🇫🇷", core: ["FRE"], support: ["FSL", "LIN"] },
  { id: "geospatial-data-science", name: "GeoSpatial Data Science", category: "Math, CS & Data", emoji: "🛰️", core: ["GGR"], support: ["CSC", "STA", "MAT"] },
  { id: "geography", name: "Geography", category: "Physical & Earth Sciences", emoji: "🗺️", core: ["GGR"], support: ["ENV", "ERS"] },
  { id: "history", name: "History", category: "Humanities", emoji: "🏺", core: ["HIS"], support: ["CLA", "POL", "RLG"] },
  { id: "religion", name: "History of Religions", category: "Humanities", emoji: "🕊️", core: ["RLG"], support: ["HIS", "PHL", "ANT"] },
  { id: "italian", name: "Italian", category: "Languages", emoji: "🇮🇹", core: ["ITA"], support: ["LIN", "CIN"] },
  { id: "language-teaching-french", name: "Language Teaching & Learning: French", category: "Languages", emoji: "🧑‍🏫", core: ["LTL", "FSL"], support: ["EDS", "LIN"] },
  { id: "language-teaching-italian", name: "Language Teaching & Learning: Italian", category: "Languages", emoji: "🧑‍🏫", core: ["LTL"], support: ["EDS", "LIN"] },
  { id: "linguistics", name: "Linguistic Studies", category: "Humanities", emoji: "🗣️", core: ["LIN"], support: ["JAL", "JLP", "LTL"] },
  { id: "management", name: "Management", category: "Business & Economics", emoji: "📋", core: ["MGT"], support: ["ECO", "MGM", "STA"] },
  { id: "mathematical-sciences", name: "Mathematical Sciences", category: "Math, CS & Data", emoji: "🧮", core: ["MAT"], support: ["STA", "CSC"] },
  { id: "paleontology", name: "Paleontology", category: "Physical & Earth Sciences", emoji: "🦕", core: ["BIO"], support: ["ERS", "CHM"] },
  { id: "philosophy", name: "Philosophy", category: "Humanities", emoji: "🤔", core: ["PHL"], support: ["MAT", "POL"] },
  { id: "physics", name: "Physics", category: "Physical & Earth Sciences", emoji: "⚛️", core: ["PHY"], support: ["MAT", "AST", "CSC"] },
  { id: "political-science", name: "Political Science", category: "Social Sciences", emoji: "🏛️", core: ["POL"], support: ["ECO", "HIS", "PHL"] },
  { id: "writing", name: "Professional Writing & Communication", category: "Humanities", emoji: "✍️", core: ["WRI"], support: ["ENG", "CCT"] },
  { id: "psychology", name: "Psychology", category: "Life & Health Sciences", emoji: "🧠", core: ["PSY"], support: ["JLP", "JPE", "STA", "BIO"] },
  { id: "sociology", name: "Sociology", category: "Social Sciences", emoji: "👥", core: ["SOC"], support: ["ANT", "WGS", "POL"] },
  { id: "tech-coding", name: "Technology, Coding & Society", category: "Arts & Media", emoji: "💻", core: ["CCT"], support: ["SOC", "CSC"] },
  { id: "wgs", name: "Women, Gender and Sexuality Studies", category: "Social Sciences", emoji: "♀️", core: ["WGS"], support: ["SOC", "ENG", "HIS"] },
];

const MAJOR_IDS = [
  "anthropology",
  "applied-mathematics",
  "applied-statistics",
  "art-art-history",
  "art-history",
  "astronomy",
  "biology",
  "biology-health-sciences",
  "canadian-studies",
  "chemistry",
  "cinema",
  "classics",
  "commerce",
  "ccit",
  "computer-science",
  "criminology",
  "diaspora",
  "dramaturgy",
  "earth-science",
  "economics",
  "english",
  "environmental-management",
  "environmental-science",
  "forensic-science",
  "french",
  "geospatial-data-science",
  "geography",
  "history",
  "religion",
  "italian",
  "language-teaching-french",
  "language-teaching-italian",
  "linguistics",
  "management",
  "mathematical-sciences",
  "paleontology",
  "philosophy",
  "physics",
  "political-science",
  "writing",
  "psychology",
  "sociology",
  "tech-coding",
  "wgs",
] as const;

export type MajorId = (typeof MAJOR_IDS)[number];

export const MAJOR_CATEGORIES = [
  "Math, CS & Data",
  "Life & Health Sciences",
  "Physical & Earth Sciences",
  "Business & Economics",
  "Social Sciences",
  "Humanities",
  "Languages",
  "Arts & Media",
] as const;

export const getMajor = (id: string | null) => MAJORS.find((m) => m.id === id);
