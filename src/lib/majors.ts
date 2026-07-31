// UTM program areas, taken from the official UTM Academic Calendar course-search
// "Search by Program Area" list. Each major maps to the course prefixes that make
// up its core requirements plus the supporting subjects the program requires.

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
  /** Course prefixes that are core to the program (first is the home subject). */
  core: string[];
  /** Supporting subjects the program commonly requires or recommends. */
  support: string[];
};

export const MAJORS: Major[] = [
  // ── Math, CS & Data ──
  { id: "computer-science", name: "Computer Science", category: "Math, CS & Data", emoji: "💻", core: ["CSC"], support: ["MAT", "STA"] },
  { id: "mathematical-sciences", name: "Mathematical Sciences", category: "Math, CS & Data", emoji: "🧮", core: ["MAT"], support: ["STA", "CSC"] },
  { id: "statistics", name: "Statistics (Applied)", category: "Math, CS & Data", emoji: "📊", core: ["STA"], support: ["MAT", "CSC"] },
  { id: "bioinformatics", name: "Bioinformatics", category: "Math, CS & Data", emoji: "🧬", core: ["BIO", "CSC"], support: ["MAT", "STA", "CHM"] },
  { id: "geospatial-data-science", name: "GeoSpatial Data Science", category: "Math, CS & Data", emoji: "🛰️", core: ["GGR"], support: ["CSC", "STA", "MAT"] },

  // ── Life & Health Sciences ──
  { id: "biology", name: "Biology", category: "Life & Health Sciences", emoji: "🌱", core: ["BIO"], support: ["CHM", "STA", "HSC"] },
  { id: "psychology", name: "Psychology", category: "Life & Health Sciences", emoji: "🧠", core: ["PSY"], support: ["JLP", "JPE", "STA", "BIO"] },
  { id: "neuroscience", name: "Neuroscience", category: "Life & Health Sciences", emoji: "🧑‍🔬", core: ["BIO", "PSY"], support: ["CHM", "STA"] },
  { id: "forensic-science", name: "Forensic Sciences", category: "Life & Health Sciences", emoji: "🔬", core: ["FSC"], support: ["ANT", "CHM", "BIO", "PSY"] },
  { id: "biomedical-communications", name: "Biomedical Communications", category: "Life & Health Sciences", emoji: "🩻", core: ["IMI"], support: ["BIO", "FAS", "HSC"] },
  { id: "exceptionality", name: "Exceptionality in Human Learning", category: "Life & Health Sciences", emoji: "🎓", core: ["EDS"], support: ["PSY", "LIN", "ISP"] },
  { id: "education-studies", name: "Education Studies", category: "Life & Health Sciences", emoji: "🍎", core: ["EDS"], support: ["ISP", "PSY", "LTL"] },

  // ── Physical & Earth Sciences ──
  { id: "chemistry", name: "Chemistry", category: "Physical & Earth Sciences", emoji: "🧪", core: ["CHM"], support: ["MAT", "PHY", "BIO"] },
  { id: "physics", name: "Physics", category: "Physical & Earth Sciences", emoji: "⚛️", core: ["PHY"], support: ["MAT", "AST", "CSC"] },
  { id: "astronomy", name: "Astronomy", category: "Physical & Earth Sciences", emoji: "🌌", core: ["AST"], support: ["PHY", "MAT"] },
  { id: "earth-science", name: "Earth Science", category: "Physical & Earth Sciences", emoji: "🪨", core: ["ERS"], support: ["GGR", "CHM", "BIO"] },
  { id: "environmental-science", name: "Environmental Science", category: "Physical & Earth Sciences", emoji: "🌍", core: ["ENV"], support: ["BIO", "ERS", "CHM", "GGR"] },
  { id: "environmental-management", name: "Environmental Management", category: "Physical & Earth Sciences", emoji: "🌿", core: ["ENV"], support: ["GGR", "POL", "ECO"] },
  { id: "geography", name: "Geography", category: "Physical & Earth Sciences", emoji: "🗺️", core: ["GGR"], support: ["ENV", "ERS"] },

  // ── Business & Economics ──
  { id: "commerce", name: "Commerce", category: "Business & Economics", emoji: "💼", core: ["MGT"], support: ["ECO", "MAT", "STA", "MGM"] },
  { id: "management", name: "Management", category: "Business & Economics", emoji: "📋", core: ["MGT"], support: ["ECO", "MGM", "STA"] },
  { id: "management-innovation", name: "Management and Innovation", category: "Business & Economics", emoji: "🚀", core: ["MGM", "MGD"], support: ["MGT", "ECO", "CCT"] },
  { id: "economics", name: "Economics", category: "Business & Economics", emoji: "💹", core: ["ECO"], support: ["MAT", "STA", "MGT"] },
  { id: "bse", name: "Business, Science and Entrepreneurship", category: "Business & Economics", emoji: "🧑‍💼", core: ["MGM", "MGT"], support: ["BIO", "CHM", "CSC"] },

  // ── Social Sciences ──
  { id: "anthropology", name: "Anthropology", category: "Social Sciences", emoji: "🗿", core: ["ANT"], support: ["SOC", "ARC" ] },
  { id: "sociology", name: "Sociology", category: "Social Sciences", emoji: "👥", core: ["SOC"], support: ["ANT", "WGS", "POL"] },
  { id: "criminology", name: "Criminology, Law and Society", category: "Social Sciences", emoji: "⚖️", core: ["SOC"], support: ["POL", "PHL", "ANT"] },
  { id: "political-science", name: "Political Science", category: "Social Sciences", emoji: "🏛️", core: ["POL"], support: ["ECO", "HIS", "PHL"] },
  { id: "international-affairs", name: "International Affairs", category: "Social Sciences", emoji: "🌐", core: ["POL"], support: ["ECO", "HIS", "GGR"] },
  { id: "ccit", name: "Communication, Culture, Information & Technology", category: "Social Sciences", emoji: "📡", core: ["CCT"], support: ["VCC", "WRI", "CSC"] },
  { id: "diaspora", name: "Diaspora and Transnational Studies", category: "Social Sciences", emoji: "🧳", core: ["DTS"], support: ["HIS", "SOC", "ANT"] },
  { id: "wgs", name: "Women, Gender and Sexuality Studies", category: "Social Sciences", emoji: "♀️", core: ["WGS"], support: ["SOC", "ENG", "HIS"] },
  { id: "canadian-studies", name: "Canadian Studies", category: "Social Sciences", emoji: "🍁", core: ["CBJ"], support: ["HIS", "POL", "GGR", "ENG"] },
  { id: "latam", name: "Latin American and Caribbean Studies", category: "Social Sciences", emoji: "🌴", core: ["SPA"], support: ["HIS", "ANT", "POL"] },

  // ── Humanities ──
  { id: "english", name: "English", category: "Humanities", emoji: "📖", core: ["ENG"], support: ["WRI", "DRE"] },
  { id: "history", name: "History", category: "Humanities", emoji: "🏺", core: ["HIS"], support: ["CLA", "POL", "RLG"] },
  { id: "philosophy", name: "Philosophy", category: "Humanities", emoji: "🤔", core: ["PHL"], support: ["MAT", "POL"] },
  { id: "religion", name: "History of Religions", category: "Humanities", emoji: "🕊️", core: ["RLG"], support: ["HIS", "PHL", "ANT"] },
  { id: "classics", name: "Classical Civilization", category: "Humanities", emoji: "🏛️", core: ["CLA"], support: ["GRK", "LAT", "HIS"] },
  { id: "linguistics", name: "Linguistics", category: "Humanities", emoji: "🗣️", core: ["LIN"], support: ["JAL", "JLP", "LTL"] },
  { id: "writing", name: "Professional Writing & Communication", category: "Humanities", emoji: "✍️", core: ["WRI"], support: ["ENG", "CCT"] },
  { id: "south-asian", name: "South Asian Humanities", category: "Humanities", emoji: "🪷", core: ["SAH"], support: ["HIN", "URD", "RLG", "HIS"] },

  // ── Languages ──
  { id: "french", name: "French", category: "Languages", emoji: "🇫🇷", core: ["FRE", "FSL"], support: ["JFL", "LIN"] },
  { id: "italian", name: "Italian", category: "Languages", emoji: "🇮🇹", core: ["ITA"], support: ["LIN", "CIN"] },
  { id: "spanish", name: "Spanish", category: "Languages", emoji: "🇪🇸", core: ["SPA"], support: ["LIN", "HIS"] },
  { id: "german", name: "German", category: "Languages", emoji: "🇩🇪", core: ["GER"], support: ["LIN", "HIS"] },
  { id: "chinese", name: "Chinese", category: "Languages", emoji: "🇨🇳", core: ["CHI"], support: ["LIN"] },
  { id: "arabic", name: "Arabic", category: "Languages", emoji: "🇸🇦", core: ["ARA"], support: ["LIN", "RLG"] },
  { id: "hindi", name: "Hindi", category: "Languages", emoji: "🇮🇳", core: ["HIN"], support: ["SAH", "LIN"] },
  { id: "urdu", name: "Urdu", category: "Languages", emoji: "📜", core: ["URD"], support: ["SAH", "LIN"] },
  { id: "persian", name: "Persian", category: "Languages", emoji: "🪶", core: ["PRS"], support: ["SAH", "LIN"] },
  { id: "greek", name: "Greek", category: "Languages", emoji: "🏺", core: ["GRK"], support: ["CLA", "LIN"] },
  { id: "latin", name: "Latin", category: "Languages", emoji: "📚", core: ["LAT"], support: ["CLA", "HIS"] },
  { id: "language-studies", name: "Language Studies", category: "Languages", emoji: "🈯", core: ["LTL", "LIN"], support: ["FSL", "JAL"] },
  { id: "language-teaching", name: "Language Teaching and Learning", category: "Languages", emoji: "🧑‍🏫", core: ["LTL"], support: ["LIN", "EDS"] },

  // ── Arts & Media ──
  { id: "art-history", name: "Art History", category: "Arts & Media", emoji: "🖼️", core: ["FAH"], support: ["VCC", "CIN"] },
  { id: "studio-art", name: "Art (Studio)", category: "Arts & Media", emoji: "🎨", core: ["FAS"], support: ["FAH", "VST"] },
  { id: "visual-studies", name: "Visual Studies", category: "Arts & Media", emoji: "👁️", core: ["VST", "FAS"], support: ["FAH", "VCC"] },
  { id: "vcc", name: "Visual Culture and Communication", category: "Arts & Media", emoji: "📐", core: ["VCC"], support: ["FAH", "CCT"] },
  { id: "cinema", name: "Cinema Studies", category: "Arts & Media", emoji: "🎬", core: ["CIN"], support: ["ENG", "VCC"] },
  { id: "theatre", name: "Theatre, Drama and Performance Studies", category: "Arts & Media", emoji: "🎭", core: ["DRE", "DRS"], support: ["ENG", "CIN"] },
];

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
