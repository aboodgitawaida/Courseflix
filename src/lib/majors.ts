export type Major = {
  id: string;
  name: string;
  category: "Sciences" | "Math & CS" | "Life Sciences" | "Social Sciences" | "Humanities" | "Commerce" | "Languages" | "Arts & Media";
  emoji: string;
};

// Seeded from UTM undergraduate programs. Covers the majors students actually pick.
export const MAJORS: Major[] = [
  // Math & CS
  { id: "cs", name: "Computer Science", category: "Math & CS", emoji: "💻" },
  { id: "math", name: "Mathematics", category: "Math & CS", emoji: "🧮" },
  { id: "stats", name: "Statistics", category: "Math & CS", emoji: "📊" },
  { id: "actsci", name: "Actuarial Science", category: "Math & CS", emoji: "📈" },
  { id: "bioinfo", name: "Bioinformatics", category: "Math & CS", emoji: "🧬" },
  { id: "datasci", name: "Data Science", category: "Math & CS", emoji: "🤖" },

  // Life Sciences
  { id: "bio", name: "Biology", category: "Life Sciences", emoji: "🌱" },
  { id: "biochem", name: "Biochemistry", category: "Life Sciences", emoji: "⚗️" },
  { id: "biotech", name: "Biotechnology", category: "Life Sciences", emoji: "🧫" },
  { id: "neuro", name: "Neuroscience", category: "Life Sciences", emoji: "🧠" },
  { id: "psych", name: "Psychology", category: "Life Sciences", emoji: "🧑‍⚕️" },
  { id: "health", name: "Health Sciences", category: "Life Sciences", emoji: "🩺" },
  { id: "forensic", name: "Forensic Science", category: "Life Sciences", emoji: "🔬" },
  { id: "exceptional", name: "Exceptionality in Human Learning", category: "Life Sciences", emoji: "🎓" },
  { id: "physiology", name: "Physiology", category: "Life Sciences", emoji: "🫀" },
  { id: "hmb", name: "Human Biology", category: "Life Sciences", emoji: "🧍" },
  { id: "pharm", name: "Pharmacology", category: "Life Sciences", emoji: "💊" },
  { id: "immuno", name: "Immunology", category: "Life Sciences", emoji: "🦠" },

  // Sciences
  { id: "chem", name: "Chemistry", category: "Sciences", emoji: "🧪" },
  { id: "physics", name: "Physics", category: "Sciences", emoji: "⚛️" },
  { id: "astro", name: "Astronomy", category: "Sciences", emoji: "🌌" },
  { id: "earth", name: "Earth Sciences", category: "Sciences", emoji: "🪨" },
  { id: "envsci", name: "Environmental Science", category: "Sciences", emoji: "🌍" },
  { id: "envmgmt", name: "Environmental Management", category: "Sciences", emoji: "🌿" },
  { id: "geog", name: "Geography", category: "Sciences", emoji: "🗺️" },

  // Commerce (UTM Commerce / Management)
  { id: "commerce", name: "Commerce", category: "Commerce", emoji: "💼" },
  { id: "mgmt", name: "Management", category: "Commerce", emoji: "📋" },
  { id: "finance", name: "Finance", category: "Commerce", emoji: "💰" },
  { id: "marketing", name: "Marketing", category: "Commerce", emoji: "📣" },
  { id: "hrm", name: "Human Resource Management", category: "Commerce", emoji: "🤝" },
  { id: "econ", name: "Economics", category: "Commerce", emoji: "💹" },
  { id: "dem", name: "Digital Enterprise Management", category: "Commerce", emoji: "📱" },

  // Social Sciences
  { id: "polsci", name: "Political Science", category: "Social Sciences", emoji: "🏛️" },
  { id: "socio", name: "Sociology", category: "Social Sciences", emoji: "👥" },
  { id: "anthro", name: "Anthropology", category: "Social Sciences", emoji: "🗿" },
  { id: "crim", name: "Criminology", category: "Social Sciences", emoji: "⚖️" },
  { id: "ccit", name: "Communication, Culture, Info & Tech (CCIT)", category: "Social Sciences", emoji: "📡" },
  { id: "wgs", name: "Women & Gender Studies", category: "Social Sciences", emoji: "♀️" },
  { id: "diaspora", name: "Diaspora & Transnational Studies", category: "Social Sciences", emoji: "🌐" },

  // Humanities
  { id: "eng", name: "English", category: "Humanities", emoji: "📖" },
  { id: "history", name: "History", category: "Humanities", emoji: "🏺" },
  { id: "philo", name: "Philosophy", category: "Humanities", emoji: "🤔" },
  { id: "religion", name: "Religion", category: "Humanities", emoji: "🕊️" },
  { id: "classics", name: "Classical Civilization", category: "Humanities", emoji: "🏛️" },
  { id: "profwriting", name: "Professional Writing & Communication", category: "Humanities", emoji: "✍️" },
  { id: "ling", name: "Linguistics", category: "Humanities", emoji: "🗣️" },

  // Languages
  { id: "french", name: "French", category: "Languages", emoji: "🇫🇷" },
  { id: "italian", name: "Italian", category: "Languages", emoji: "🇮🇹" },
  { id: "spanish", name: "Spanish", category: "Languages", emoji: "🇪🇸" },
  { id: "portuguese", name: "Portuguese", category: "Languages", emoji: "🇵🇹" },
  { id: "german", name: "German", category: "Languages", emoji: "🇩🇪" },
  { id: "chinese", name: "Chinese", category: "Languages", emoji: "🇨🇳" },

  // Arts & Media
  { id: "art", name: "Art History", category: "Arts & Media", emoji: "🎨" },
  { id: "visual", name: "Visual Studies", category: "Arts & Media", emoji: "🖼️" },
  { id: "cinema", name: "Cinema Studies", category: "Arts & Media", emoji: "🎬" },
  { id: "theatre", name: "Theatre & Drama Studies", category: "Arts & Media", emoji: "🎭" },
  { id: "music", name: "Music", category: "Arts & Media", emoji: "🎵" },
  { id: "media", name: "Digital Media", category: "Arts & Media", emoji: "📺" },
];

export const MAJOR_CATEGORIES = [
  "Math & CS",
  "Life Sciences",
  "Sciences",
  "Commerce",
  "Social Sciences",
  "Humanities",
  "Languages",
  "Arts & Media",
] as const;

export const getMajor = (id: string | null) => MAJORS.find((m) => m.id === id);
