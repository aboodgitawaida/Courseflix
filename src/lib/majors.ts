
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
  core: string[];
  support: string[];
};

export const MAJORS: Major[] = [
  // Math, CS & Data
  { id: "computer-science", name: "Computer Science", category: "Math, CS & Data", emoji: "💻", core: ["CSC"], support: ["MAT", "STA"] },
  { id: "mathematical-sciences", name: "Mathematical Sciences", category: "Math, CS & Data", emoji: "🧮", core: ["MAT"], support: ["STA", "CSC"] },
  { id: "applied-mathematics", name: "Applied Mathematics", category: "Math, CS & Data", emoji: "🧮", core: ["MAT"], support: ["STA", "CSC"] },
  { id: "applied-statistics", name: "Applied Statistics", category: "Math, CS & Data", emoji: "📊", core: ["STA"], support: ["MAT", "CSC"] },
  { id: "geospatial-data-science", name: "GeoSpatial Data Science", category: "Math, CS & Data", emoji: "🛰️", core: ["GGR"], support: ["CSC", "STA", "MAT"] },
  { id: "information-security", name: "Information Security", category: "Math, CS & Data", emoji: "🔐", core: ["CSC"], support: ["MAT", "STA"] },

  // Life & Health Sciences
  { id: "biology", name: "Biology", category: "Life & Health Sciences", emoji: "🌱", core: ["BIO"], support: ["CHM", "STA", "HSC"] },
  { id: "biological-chemistry", name: "Biological Chemistry", category: "Life & Health Sciences", emoji: "🧪", core: ["BIO", "CHM"], support: ["MAT", "STA"] },
  { id: "biology-health-sciences", name: "Biology For Health Sciences", category: "Life & Health Sciences", emoji: "🏥", core: ["BIO"], support: ["CHM", "HSC"] },
  { id: "biophysics", name: "Biophysics", category: "Life & Health Sciences", emoji: "⚛️", core: ["BIO", "PHY"], support: ["CHM", "MAT"] },
  { id: "biotechnology", name: "Biotechnology", category: "Life & Health Sciences", emoji: "🧬", core: ["BIO", "CHM"], support: ["MAT", "STA"] },
  { id: "molecular-biology", name: "Molecular Biology", category: "Life & Health Sciences", emoji: "🔬", core: ["BIO", "CHM"], support: ["MAT", "STA"] },
  { id: "neuroscience", name: "Neuroscience", category: "Life & Health Sciences", emoji: "�", core: ["BIO", "PSY"], support: ["CHM", "STA"] },
  { id: "psychology", name: "Psychology", category: "Life & Health Sciences", emoji: "🧠", core: ["PSY"], support: ["JLP", "JPE", "STA", "BIO"] },
  { id: "comparative-physiology", name: "Comparative Physiology", category: "Life & Health Sciences", emoji: "🔬", core: ["BIO"], support: ["CHM", "PHY"] },
  { id: "biomedical-communications", name: "Biomedical Communications", category: "Life & Health Sciences", emoji: "🧬", core: ["BIO"], support: ["CHM", "VCC"] },

  // Physical & Earth Sciences
  { id: "chemistry", name: "Chemistry", category: "Physical & Earth Sciences", emoji: "🧪", core: ["CHM"], support: ["MAT", "PHY", "BIO"] },
  { id: "physics", name: "Physics", category: "Physical & Earth Sciences", emoji: "⚛️", core: ["PHY"], support: ["MAT", "AST", "CSC"] },
  { id: "astronomy", name: "Astronomy", category: "Physical & Earth Sciences", emoji: "🌌", core: ["AST"], support: ["PHY", "MAT"] },
  { id: "astronomical-sciences", name: "Astronomical Sciences", category: "Physical & Earth Sciences", emoji: "🌌", core: ["AST"], support: ["PHY", "MAT"] },
  { id: "earth-science", name: "Earth Science", category: "Physical & Earth Sciences", emoji: "🪨", core: ["ERS"], support: ["GGR", "CHM", "BIO"] },
  { id: "ecology-evolution", name: "Ecology and Evolution", category: "Physical & Earth Sciences", emoji: "🌿", core: ["BIO"], support: ["CHM", "ENV"] },
  { id: "environmental-science", name: "Environmental Science", category: "Physical & Earth Sciences", emoji: "🌍", core: ["ENV"], support: ["BIO", "ERS", "CHM", "GGR"] },
  { id: "geography", name: "Geography", category: "Physical & Earth Sciences", emoji: "🗺️", core: ["GGR"], support: ["ENV", "ERS"] },
  { id: "paleontology", name: "Paleontology", category: "Physical & Earth Sciences", emoji: "🦕", core: ["BIO"], support: ["ERS", "CHM"] },

  // Business & Economics
  { id: "accounting-finance", name: "Accounting and Finance", category: "Business & Economics", emoji: "💰", core: ["MGT"], support: ["ECO", "MAT", "STA"] },
  { id: "commerce", name: "Commerce", category: "Business & Economics", emoji: "💼", core: ["MGT"], support: ["ECO", "MAT", "STA", "MGM"] },
  { id: "commerce-accounting", name: "Commerce: Accounting", category: "Business & Economics", emoji: "💰", core: ["MGT"], support: ["ECO", "MAT", "STA"] },
  { id: "commerce-finance", name: "Commerce: Finance", category: "Business & Economics", emoji: "💰", core: ["MGT"], support: ["ECO", "MAT", "STA"] },
  { id: "commerce-marketing", name: "Commerce: Marketing", category: "Business & Economics", emoji: "📢", core: ["MGT"], support: ["ECO", "CCT"] },
  { id: "management", name: "Management", category: "Business & Economics", emoji: "📋", core: ["MGT"], support: ["ECO", "MGM", "STA"] },
  { id: "digital-enterprise", name: "Digital Enterprise Management", category: "Business & Economics", emoji: "💻", core: ["CCT", "MGT"], support: ["ECO", "CSC"] },
  { id: "economics", name: "Economics", category: "Business & Economics", emoji: "📈", core: ["ECO"], support: ["MAT", "STA", "MGT"] },
  { id: "economics-political", name: "Economics & Political Science", category: "Business & Economics", emoji: "🏛️", core: ["ECO", "POL"], support: ["MAT", "STA", "HIS"] },
  { id: "financial-economics", name: "Financial Economics", category: "Business & Economics", emoji: "💰", core: ["ECO"], support: ["MAT", "STA", "MGT"] },
  { id: "global-leadership", name: "Global Leadership", category: "Business & Economics", emoji: "🌐", core: ["MGT"], support: ["CCT", "POL", "ECO"] },

  // Social Sciences
  { id: "anthropology", name: "Anthropology", category: "Social Sciences", emoji: "🗿", core: ["ANT"], support: ["SOC", "ARC"] },
  { id: "sociology", name: "Sociology", category: "Social Sciences", emoji: "👥", core: ["SOC"], support: ["ANT", "WGS", "POL"] },
  { id: "criminology", name: "Criminology, Law & Society", category: "Social Sciences", emoji: "⚖️", core: ["SOC"], support: ["POL", "PHL", "ANT"] },
  { id: "political-science", name: "Political Science", category: "Social Sciences", emoji: "🏛️", core: ["POL"], support: ["ECO", "HIS", "PHL"] },
  { id: "history-political", name: "History & Political Science", category: "Social Sciences", emoji: "🏛️", core: ["HIS", "POL"], support: ["ECO", "CLA", "RLG"] },
  { id: "international-affairs", name: "International Affairs", category: "Social Sciences", emoji: "🌐", core: ["POL"], support: ["ECO", "HIS", "GGR"] },
  { id: "ccit", name: "Communication, Culture, Information & Technology", category: "Social Sciences", emoji: "📡", core: ["CCT"], support: ["VCC", "WRI", "CSC"] },
  { id: "diaspora", name: "Diaspora and Transnational Studies", category: "Social Sciences", emoji: "🧳", core: ["DTS"], support: ["HIS", "SOC", "ANT"] },
  { id: "wgs", name: "Women, Gender and Sexuality Studies", category: "Social Sciences", emoji: "♀️", core: ["WGS"], support: ["SOC", "ENG", "HIS"] },
  { id: "canadian-studies", name: "Canadian Studies", category: "Social Sciences", emoji: "🍁", core: ["CBJ"], support: ["HIS", "POL", "GGR", "ENG"] },
  { id: "latam", name: "Latin American and Caribbean Studies", category: "Social Sciences", emoji: "🌴", core: ["HIS"], support: ["POL", "ANT", "ENG"] },
  { id: "environmental-management", name: "Environmental Management", category: "Social Sciences", emoji: "🌍", core: ["ENV"], support: ["BIO", "ERS", "CHM", "GGR"] },
  { id: "health-environments", name: "Health, Environments, and Society", category: "Social Sciences", emoji: "🌍", core: ["ENV"], support: ["SOC", "BIO"] },
  { id: "sustainability", name: "Sustainability", category: "Social Sciences", emoji: "♻️", core: ["ENV"], support: ["BIO", "GGR", "POL"] },
  { id: "south-asian-humanities", name: "South Asian Humanities", category: "Social Sciences", emoji: "🕌", core: ["HIS"], support: ["ENG", "REL"] },

  // Humanities
  { id: "english", name: "English", category: "Humanities", emoji: "📖", core: ["ENG"], support: ["WRI", "DRE"] },
  { id: "english-language-linguistics", name: "English Language Linguistics", category: "Humanities", emoji: "🗣️", core: ["ENG"], support: ["LIN", "WRI"] },
  { id: "history", name: "History", category: "Humanities", emoji: "🏺", core: ["HIS"], support: ["CLA", "POL", "RLG"] },
  { id: "philosophy", name: "Philosophy", category: "Humanities", emoji: "🤔", core: ["PHL"], support: ["MAT", "POL"] },
  { id: "philosophy-science", name: "Philosophy of Science", category: "Humanities", emoji: "🔬", core: ["PHL"], support: ["SCI", "HIS"] },
  { id: "religion", name: "History of Religions", category: "Humanities", emoji: "🕊️", core: ["RLG"], support: ["HIS", "PHL", "ANT"] },
  { id: "classics", name: "Classical Civilization", category: "Humanities", emoji: "🏛️", core: ["CLA"], support: ["GRK", "LAT", "HIS"] },
  { id: "linguistics", name: "Linguistic Studies", category: "Humanities", emoji: "🗣️", core: ["LIN"], support: ["JAL", "JLP", "LTL"] },
  { id: "writing", name: "Professional Writing & Communication", category: "Humanities", emoji: "✍️", core: ["WRI"], support: ["ENG", "CCT"] },
  { id: "creative-writing", name: "Creative Writing", category: "Humanities", emoji: "✍️", core: ["ENG"], support: ["WRI", "DRE"] },
  { id: "ethics-law", name: "Ethics, Law and Society", category: "Humanities", emoji: "⚖️", core: ["PHL"], support: ["POL", "SOC"] },
  { id: "logic", name: "Logic", category: "Humanities", emoji: "🧠", core: ["PHL"], support: ["MAT", "CSC"] },
  { id: "education-studies", name: "Education Studies", category: "Humanities", emoji: "🍎", core: ["EDS"], support: ["ISP", "PSY", "LTL"] },

  // Languages
  { id: "french", name: "French Studies", category: "Languages", emoji: "🇫🇷", core: ["FRE"], support: ["FSL", "LIN"] },
  { id: "functional-french", name: "Functional French", category: "Languages", emoji: "🇫🇷", core: ["FSL"], support: ["FRE", "LIN"] },
  { id: "italian", name: "Italian", category: "Languages", emoji: "🇮🇹", core: ["ITA"], support: ["LIN", "CIN"] },
  { id: "italian-culture", name: "Italian Language and Culture", category: "Languages", emoji: "🇮🇹", core: ["ITA"], support: ["LIN", "HIS"] },
  { id: "chinese", name: "Chinese Language & Culture", category: "Languages", emoji: "🇨🇳", core: ["CHI"], support: ["LIN", "HIS"] },
  { id: "language-teaching-french", name: "Language Teaching & Learning: French", category: "Languages", emoji: "🧑‍🏫", core: ["LTL", "FSL"], support: ["EDS", "LIN"] },
  { id: "language-teaching-italian", name: "Language Teaching & Learning: Italian", category: "Languages", emoji: "🧑‍🏫", core: ["LTL"], support: ["EDS", "LIN"] },
  { id: "language-teaching", name: "Language Teaching & Learning: French & Italian", category: "Languages", emoji: "🧑‍🏫", core: ["LTL", "FSL", "ITA"], support: ["EDS", "LIN"] },
  { id: "latin", name: "Latin", category: "Languages", emoji: "📚", core: ["LAT"], support: ["CLA", "HIS"] },

  // Arts & Media
  { id: "art-history", name: "Art History", category: "Arts & Media", emoji: "🖼️", core: ["FAH"], support: ["VCC", "CIN"] },
  { id: "art-art-history", name: "Art and Art History", category: "Arts & Media", emoji: "🎨", core: ["FAH"], support: ["VCC", "CIN"] },
  { id: "cinema", name: "Cinema Studies", category: "Arts & Media", emoji: "🎬", core: ["CIN"], support: ["ENG", "VCC"] },
  { id: "dramaturgy", name: "Dramaturgy and Drama Studies", category: "Arts & Media", emoji: "🎭", core: ["DRE"], support: ["ENG", "CIN"] },
  { id: "theatre", name: "Theatre and Drama Studies", category: "Arts & Media", emoji: "🎭", core: ["DRE", "DRS"], support: ["ENG", "CIN"] },
  { id: "vcc", name: "Visual Culture & Communication", category: "Arts & Media", emoji: "📐", core: ["VCC"], support: ["FAH", "CCT"] },
  { id: "visual-culture", name: "Visual Culture", category: "Arts & Media", emoji: "👁️", core: ["VCC"], support: ["FAH", "CIN"] },
  { id: "game-studies", name: "Game Studies", category: "Arts & Media", emoji: "🎮", core: ["CCT"], support: ["CSC", "VCC"] },
  { id: "tech-coding", name: "Technology, Coding & Society", category: "Arts & Media", emoji: "💻", core: ["CCT"], support: ["SOC", "CSC"] },

  // Life & Health Sciences (continued)
  { id: "exceptionality", name: "Exceptionality in Human Learning", category: "Life & Health Sciences", emoji: "🧠", core: ["EDS"], support: ["PSY", "LIN", "ISP"] },

  // Forensic Sciences
  { id: "forensic-science", name: "Forensic Science", category: "Life & Health Sciences", emoji: "🔬", core: ["FSC"], support: ["ANT", "CHM", "BIO", "PSY"] },
  { id: "forensic-anthropology", name: "Forensic Anthropology", category: "Life & Health Sciences", emoji: "🦴", core: ["ANT"], support: ["BIO", "CHM", "SOC"] },
  { id: "forensic-biology", name: "Forensic Biology", category: "Life & Health Sciences", emoji: "🧬", core: ["BIO"], support: ["CHM", "ANT"] },
  { id: "forensic-chemistry", name: "Forensic Chemistry", category: "Life & Health Sciences", emoji: "⚗️", core: ["CHM"], support: ["BIO", "PHY"] },
  { id: "forensic-psychology", name: "Forensic Psychology", category: "Life & Health Sciences", emoji: "🧠", core: ["PSY"], support: ["BIO", "SOC"] },
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
