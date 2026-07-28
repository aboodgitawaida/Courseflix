export type Course = {
  code: string;
  title: string;
  description: string;
  area: "AI" | "Systems" | "Theory" | "HCI" | "Web" | "Math" | "Stats" | "Breadth";
  credits: number;
  prereqs: string[];
  tags: Array<"Bird" | "Easy" | "Heavy" | "Interesting" | "Math-Heavy" | "Project" | "Hidden Gem">;
  rating: number; // /5
  difficulty: number; // /5
  workload: number; // /5
  wouldTakeAgain: number; // % 0-100
  vibe: string;
  topProfs: Array<{ name: string; rmp: number; tags: string[] }>;
  reviews: Array<{ source: "reddit" | "rmp"; quote: string }>;
  poster: [string, string]; // gradient stops
};

const g = {
  mint: ["#0d1b2a", "#1b4332"] as [string, string],
  neon: ["#0f3d2e", "#2dd4a8"] as [string, string],
  indigo: ["#141432", "#4f46e5"] as [string, string],
  teal: ["#0c2340", "#2d8a9e"] as [string, string],
  slate: ["#1a1a2e", "#334155"] as [string, string],
  ember: ["#1a1a1a", "#e85d3a"] as [string, string],
  gold: ["#0d0d0d", "#c9a84c"] as [string, string],
  forest: ["#052e16", "#22c55e"] as [string, string],
};

export const COURSES: Course[] = [
  {
    code: "CSC110",
    title: "Foundations of Computer Science I",
    description: "Rigorous intro to CS through Python and math. Proofs, functions, sequences, and running-time analysis.",
    area: "Theory", credits: 1, prereqs: [],
    tags: ["Heavy", "Math-Heavy", "Interesting"],
    rating: 4.2, difficulty: 4.1, workload: 4.3, wouldTakeAgain: 78,
    vibe: "Rigorous, proof-heavy, life-changing if you actually do the psets.",
    topProfs: [{ name: "David Liu", rmp: 4.8, tags: ["clear", "caring"] }, { name: "Michelle Craig", rmp: 4.6, tags: ["organized"] }],
    reviews: [
      { source: "reddit", quote: "Hardest first-year course but I actually learned to think." },
      { source: "rmp", quote: "David Liu is a god. Notes are gold." },
      { source: "reddit", quote: "Psets take 15h/week. Worth it." },
    ],
    poster: g.neon,
  },
  {
    code: "CSC111", title: "Foundations of Computer Science II",
    description: "Data structures, recursion, graphs, and program correctness — the sequel to CSC110.",
    area: "Theory", credits: 1, prereqs: ["CSC110"],
    tags: ["Heavy", "Interesting", "Project"],
    rating: 4.4, difficulty: 4.0, workload: 4.2, wouldTakeAgain: 82,
    vibe: "The final project is legendary. Pick something you love.",
    topProfs: [{ name: "Mario Badr", rmp: 4.7, tags: ["engaging"] }, { name: "Tom Fairgrieve", rmp: 4.3, tags: ["fair"] }],
    reviews: [
      { source: "reddit", quote: "The CSP project slaps. I built a Wordle solver." },
      { source: "rmp", quote: "Mario's lectures feel like a TED talk." },
    ],
    poster: g.indigo,
  },
  {
    code: "CSC148", title: "Introduction to Computer Science",
    description: "OOP, recursion, linked lists, trees, and abstract data types in Python.",
    area: "Theory", credits: 0.5, prereqs: ["CSC108"],
    tags: ["Interesting", "Project"],
    rating: 4.0, difficulty: 3.5, workload: 3.6, wouldTakeAgain: 74,
    vibe: "The gateway. Once you get recursion here, everything else clicks.",
    topProfs: [{ name: "Diane Horton", rmp: 4.5, tags: ["legend"] }, { name: "Jacqueline Smith", rmp: 4.6, tags: ["kind"] }],
    reviews: [
      { source: "reddit", quote: "Trees will haunt you but in a good way." },
      { source: "rmp", quote: "Diane cares more about you than you do." },
    ],
    poster: g.mint,
  },
  {
    code: "CSC207", title: "Software Design",
    description: "Java, design patterns, testing, refactoring, building real software as a team.",
    area: "Systems", credits: 0.5, prereqs: ["CSC148"],
    tags: ["Project", "Interesting"],
    rating: 3.8, difficulty: 3.4, workload: 4.0, wouldTakeAgain: 70,
    vibe: "Group project = pain but you'll actually learn Git & testing.",
    topProfs: [{ name: "Lindsey Shorser", rmp: 4.2, tags: ["patient"] }],
    reviews: [
      { source: "reddit", quote: "Java after Python feels weird for 2 weeks then it's fine." },
      { source: "rmp", quote: "The phase 2 pivot is real." },
    ],
    poster: g.slate,
  },
  {
    code: "CSC209", title: "Software Tools & Systems Programming",
    description: "C, shell, processes, pipes, signals, sockets. The class that makes you a programmer.",
    area: "Systems", credits: 0.5, prereqs: ["CSC207"],
    tags: ["Heavy", "Interesting"],
    rating: 4.3, difficulty: 4.2, workload: 4.1, wouldTakeAgain: 85,
    vibe: "You will fight segfaults and win. Then flex about it.",
    topProfs: [{ name: "Karen Reid", rmp: 4.8, tags: ["legendary"] }, { name: "Andi Bergen", rmp: 4.4, tags: ["clear"] }],
    reviews: [
      { source: "reddit", quote: "Karen Reid's notes should be a textbook." },
      { source: "reddit", quote: "The shell A2 broke me and rebuilt me." },
    ],
    poster: g.ember,
  },
  {
    code: "CSC236", title: "Introduction to the Theory of Computation",
    description: "Induction, recursion, correctness proofs, regular languages, DFAs.",
    area: "Theory", credits: 0.5, prereqs: ["CSC148"],
    tags: ["Math-Heavy", "Heavy"],
    rating: 3.6, difficulty: 4.0, workload: 3.5, wouldTakeAgain: 62,
    vibe: "Proofs, proofs, and more proofs. Prof lottery matters a lot.",
    topProfs: [{ name: "François Pitt", rmp: 4.3, tags: ["thorough"] }],
    reviews: [
      { source: "reddit", quote: "If you liked CSC110 proofs you'll like this." },
      { source: "rmp", quote: "Skip lecture, read the notes twice." },
    ],
    poster: g.indigo,
  },
  {
    code: "CSC258", title: "Computer Organization",
    description: "Digital logic, assembly, MIPS, pipelining, memory hierarchy.",
    area: "Systems", credits: 0.5, prereqs: ["CSC148"],
    tags: ["Interesting", "Project"],
    rating: 4.1, difficulty: 3.8, workload: 3.9, wouldTakeAgain: 76,
    vibe: "Building an FPGA game in the lab is peak UofT CS.",
    topProfs: [{ name: "Steve Engels", rmp: 4.9, tags: ["god-tier"] }],
    reviews: [
      { source: "reddit", quote: "Steve Engels for president." },
      { source: "rmp", quote: "Take this ONLY with Engels." },
    ],
    poster: g.gold,
  },
  {
    code: "CSC263", title: "Data Structures and Analysis",
    description: "Amortized analysis, hashing, balanced BSTs, graph algorithms, heaps.",
    area: "Theory", credits: 0.5, prereqs: ["CSC236"],
    tags: ["Math-Heavy", "Interesting"],
    rating: 3.9, difficulty: 4.1, workload: 3.8, wouldTakeAgain: 71,
    vibe: "Suddenly Big-O actually means something.",
    topProfs: [{ name: "Sonya Allin", rmp: 4.5, tags: ["engaging"] }],
    reviews: [
      { source: "reddit", quote: "Amortized analysis felt like magic tricks." },
    ],
    poster: g.teal,
  },
  {
    code: "CSC301", title: "Introduction to Software Engineering",
    description: "Agile, working with a real client, sprints, code review, deployment.",
    area: "Systems", credits: 0.5, prereqs: ["CSC209"],
    tags: ["Project", "Easy"],
    rating: 3.7, difficulty: 2.9, workload: 3.6, wouldTakeAgain: 68,
    vibe: "Group luck determines everything. Pick your team.",
    topProfs: [{ name: "Kuei (Jack) Sun", rmp: 4.2, tags: ["chill"] }],
    reviews: [
      { source: "reddit", quote: "Free A if your team ships. Chaos otherwise." },
    ],
    poster: g.forest,
  },
  {
    code: "CSC311", title: "Introduction to Machine Learning",
    description: "Linear/logistic regression, neural nets, k-means, PCA, bias-variance.",
    area: "AI", credits: 0.5, prereqs: ["CSC263", "MAT223"],
    tags: ["Math-Heavy", "Interesting"],
    rating: 4.4, difficulty: 4.0, workload: 4.0, wouldTakeAgain: 84,
    vibe: "The class every CS student wants. Bring your linear algebra.",
    topProfs: [{ name: "Roger Grosse", rmp: 4.7, tags: ["brilliant"] }, { name: "Rahul Krishnan", rmp: 4.5, tags: ["clear"] }],
    reviews: [
      { source: "reddit", quote: "Roger's lectures are a masterclass." },
      { source: "rmp", quote: "Do the psets by hand. Trust." },
    ],
    poster: g.neon,
  },
  {
    code: "CSC324", title: "Principles of Programming Languages",
    description: "Haskell, Racket, type systems, lambda calculus, evaluation strategies.",
    area: "Theory", credits: 0.5, prereqs: ["CSC236"],
    tags: ["Interesting", "Hidden Gem"],
    rating: 4.5, difficulty: 3.7, workload: 3.4, wouldTakeAgain: 88,
    vibe: "Changes how you think about code. Underrated.",
    topProfs: [{ name: "David Liu", rmp: 4.8, tags: ["clear"] }],
    reviews: [
      { source: "reddit", quote: "Haskell broke my brain in the best way." },
      { source: "reddit", quote: "Sleeper hit. Everyone should take this." },
    ],
    poster: g.indigo,
  },
  {
    code: "CSC343", title: "Introduction to Databases",
    description: "Relational model, SQL, normalization, transactions, a bit of NoSQL.",
    area: "Systems", credits: 0.5, prereqs: ["CSC207"],
    tags: ["Easy", "Bird"],
    rating: 3.8, difficulty: 2.6, workload: 2.8, wouldTakeAgain: 72,
    vibe: "Chill. SQL is a life skill. Take it for the GPA boost.",
    topProfs: [{ name: "Diane Horton", rmp: 4.6, tags: ["kind"] }],
    reviews: [
      { source: "reddit", quote: "Easiest A of my degree." },
    ],
    poster: g.forest,
  },
  {
    code: "CSC369", title: "Operating Systems",
    description: "Threads, scheduling, virtual memory, file systems. Lots of C.",
    area: "Systems", credits: 0.5, prereqs: ["CSC209", "CSC258"],
    tags: ["Heavy", "Interesting"],
    rating: 4.2, difficulty: 4.4, workload: 4.5, wouldTakeAgain: 79,
    vibe: "You will not sleep during the scheduler assignment. Iconic.",
    topProfs: [{ name: "Bogdan Simion", rmp: 4.6, tags: ["engaging"] }],
    reviews: [
      { source: "reddit", quote: "The FS assignment is a rite of passage." },
    ],
    poster: g.ember,
  },
  {
    code: "CSC373", title: "Algorithm Design & Analysis",
    description: "Divide-and-conquer, DP, greedy, network flow, NP-completeness.",
    area: "Theory", credits: 0.5, prereqs: ["CSC263"],
    tags: ["Math-Heavy", "Heavy"],
    rating: 3.5, difficulty: 4.3, workload: 4.0, wouldTakeAgain: 60,
    vibe: "The interview class. Painful but pays off in FAANG loops.",
    topProfs: [{ name: "Nisarg Shah", rmp: 4.4, tags: ["organized"] }],
    reviews: [
      { source: "reddit", quote: "Got my Google offer thanks to this course." },
      { source: "rmp", quote: "Exam questions are brutal. Practice everything." },
    ],
    poster: g.gold,
  },
  {
    code: "CSC384", title: "Introduction to Artificial Intelligence",
    description: "Search, CSPs, game trees, planning, logic, intro to probability in AI.",
    area: "AI", credits: 0.5, prereqs: ["CSC263"],
    tags: ["Interesting", "Project"],
    rating: 4.1, difficulty: 3.6, workload: 3.5, wouldTakeAgain: 80,
    vibe: "Build a Sudoku solver, an Othello AI. Actually fun.",
    topProfs: [{ name: "Sheila McIlraith", rmp: 4.5, tags: ["brilliant"] }, { name: "Fahiem Bacchus", rmp: 4.3, tags: ["clear"] }],
    reviews: [
      { source: "reddit", quote: "The Othello A3 is a whole personality." },
    ],
    poster: g.teal,
  },
  {
    code: "CSC418", title: "Computer Graphics",
    description: "Ray tracing, rasterization, transformations, shaders. Lots of C++.",
    area: "HCI", credits: 0.5, prereqs: ["MAT223", "CSC209"],
    tags: ["Heavy", "Interesting", "Hidden Gem"],
    rating: 4.4, difficulty: 4.2, workload: 4.4, wouldTakeAgain: 86,
    vibe: "You render your first sphere and cry a little. Beautiful class.",
    topProfs: [{ name: "David Levin", rmp: 4.7, tags: ["passionate"] }],
    reviews: [
      { source: "reddit", quote: "The final scene render was worth every hour." },
    ],
    poster: g.indigo,
  },
  {
    code: "CSC420", title: "Introduction to Image Understanding",
    description: "Filters, features, stereo, deep learning for vision, segmentation.",
    area: "AI", credits: 0.5, prereqs: ["CSC311"],
    tags: ["Interesting", "Project"],
    rating: 4.0, difficulty: 3.8, workload: 3.9, wouldTakeAgain: 77,
    vibe: "Modern CV in one semester. Great project freedom.",
    topProfs: [{ name: "Sanja Fidler", rmp: 4.5, tags: ["expert"] }],
    reviews: [
      { source: "reddit", quote: "Built a lane detector. Instant portfolio piece." },
    ],
    poster: g.neon,
  },
  {
    code: "CSC454", title: "The Business of Software",
    description: "Founders, PMF, hiring, fundraising — guest speakers every week.",
    area: "Breadth", credits: 0.5, prereqs: ["CSC301"],
    tags: ["Bird", "Easy", "Hidden Gem"],
    rating: 4.6, difficulty: 2.2, workload: 2.5, wouldTakeAgain: 91,
    vibe: "Best class you can take. Guest founders every week. Zero exam.",
    topProfs: [{ name: "Michael Reid", rmp: 4.9, tags: ["inspiring"] }],
    reviews: [
      { source: "reddit", quote: "Should be mandatory. Networking gold." },
      { source: "reddit", quote: "Bird course that will actually change your career." },
    ],
    poster: g.gold,
  },
  {
    code: "CSC488", title: "Compilers and Interpreters",
    description: "Build a compiler for a small language, front to back.",
    area: "Systems", credits: 0.5, prereqs: ["CSC324"],
    tags: ["Heavy", "Project", "Interesting"],
    rating: 4.3, difficulty: 4.4, workload: 4.6, wouldTakeAgain: 80,
    vibe: "You build a real compiler. Feels illegal. Take with a good team.",
    topProfs: [{ name: "David Liu", rmp: 4.8, tags: ["legend"] }],
    reviews: [
      { source: "reddit", quote: "Wrote a compiler. Immediately got hired." },
    ],
    poster: g.ember,
  },
  {
    code: "CSC494", title: "Computer Science Project",
    description: "Independent research or project under a prof. What you make of it.",
    area: "Breadth", credits: 0.5, prereqs: ["CSC301"],
    tags: ["Project", "Hidden Gem"],
    rating: 4.5, difficulty: 3.2, workload: 3.5, wouldTakeAgain: 89,
    vibe: "Your GPA + your research pitch = your grade. Pick a cool prof.",
    topProfs: [{ name: "Varies", rmp: 4.5, tags: ["depends"] }],
    reviews: [
      { source: "reddit", quote: "Turned my project into a paper. Great use of a slot." },
    ],
    poster: g.forest,
  },
  {
    code: "MAT223", title: "Linear Algebra I",
    description: "Vectors, matrices, subspaces, eigenvalues. Prereq for everything cool.",
    area: "Math", credits: 0.5, prereqs: [],
    tags: ["Math-Heavy"],
    rating: 3.6, difficulty: 3.6, workload: 3.2, wouldTakeAgain: 70,
    vibe: "The prereq gate. Don't skip actually understanding it.",
    topProfs: [{ name: "Tyler Holden", rmp: 4.7, tags: ["clear"] }],
    reviews: [{ source: "reddit", quote: "Tyler Holden on YouTube saved my life." }],
    poster: g.slate,
  },
  {
    code: "STA247", title: "Probability with Computer Applications",
    description: "Probability for CS: distributions, expectation, simulation, MCMC intro.",
    area: "Stats", credits: 0.5, prereqs: [],
    tags: ["Easy", "Interesting"],
    rating: 3.9, difficulty: 3.0, workload: 2.9, wouldTakeAgain: 75,
    vibe: "Painless stats for CS majors. Take before ML.",
    topProfs: [{ name: "Alison Gibbs", rmp: 4.4, tags: ["kind"] }],
    reviews: [{ source: "reddit", quote: "Way more chill than STA257." }],
    poster: g.teal,
  },
];

export type Rail = { title: string; blurb?: string; codes: string[] };

export const RAILS: Rail[] = [
  {
    title: "Trending in CS",
    blurb: "What everyone's picking this term",
    codes: ["CSC311", "CSC209", "CSC454", "CSC148", "CSC384", "CSC207"],
  },
  {
    title: "🐦 Bird Courses",
    blurb: "GPA boosters that don't suck",
    codes: ["CSC454", "CSC343", "CSC301", "STA247"],
  },
  {
    title: "💎 Hidden Gems",
    blurb: "Underrated. Reddit obsessed.",
    codes: ["CSC324", "CSC418", "CSC454", "CSC494"],
  },
  {
    title: "🔥 Highly Rated Profs",
    blurb: "Steve Engels-tier lectures only",
    codes: ["CSC258", "CSC209", "CSC311", "CSC488", "CSC148"],
  },
  {
    title: "🧠 If You Like AI",
    blurb: "The ML track, curated",
    codes: ["CSC311", "CSC384", "CSC420", "MAT223", "STA247"],
  },
  {
    title: "⚙️ Systems Squad",
    blurb: "Low-level, close to metal",
    codes: ["CSC209", "CSC258", "CSC369", "CSC488", "CSC343"],
  },
  {
    title: "🧮 Theory Heads",
    blurb: "Proofs & big-O forever",
    codes: ["CSC236", "CSC263", "CSC324", "CSC373", "CSC110"],
  },
];

export const getCourse = (code: string) => COURSES.find((c) => c.code.toLowerCase() === code.toLowerCase());
