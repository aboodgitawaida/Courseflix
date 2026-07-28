export type Course = {
  code: string;
  title: string;
  description: string;
  area: string;
  credits: number;
  prereqs: string[];
  tags: Array<"Bird" | "Easy" | "Heavy" | "Interesting" | "Math-Heavy" | "Project" | "Hidden Gem" | "Lab-Heavy" | "Essay-Heavy" | "Discussion">;
  rating: number;
  difficulty: number;
  workload: number;
  wouldTakeAgain: number;
  vibe: string;
  topProfs: Array<{ name: string; rmp: number; tags: string[] }>;
  reviews: Array<{ source: "reddit" | "rmp"; quote: string }>;
  poster: [string, string];
  majors: string[]; // major ids this course is relevant to
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
  rose: ["#1a0a1a", "#e11d74"] as [string, string],
  sky: ["#0a1628", "#38bdf8"] as [string, string],
  plum: ["#1a0b2e", "#a855f7"] as [string, string],
  sand: ["#1c1917", "#d4a373"] as [string, string],
};

// tiny factory to keep the seed catalog compact
type P = [string, number, string[]];
const mk = (
  code: string, title: string, description: string,
  area: string, prereqs: string[],
  tags: Course["tags"],
  stats: [number, number, number, number], // rating, difficulty, workload, wta
  vibe: string,
  profs: P[],
  reviews: Array<[Course["reviews"][0]["source"], string]>,
  poster: [string, string],
  majors: string[],
  credits = 0.5,
): Course => ({
  code, title, description, area, credits, prereqs, tags,
  rating: stats[0], difficulty: stats[1], workload: stats[2], wouldTakeAgain: stats[3],
  vibe,
  topProfs: profs.map(([name, rmp, t]) => ({ name, rmp, tags: t })),
  reviews: reviews.map(([source, quote]) => ({ source, quote })),
  poster, majors,
});

export const COURSES: Course[] = [
  // ============ COMPUTER SCIENCE + adjacent ============
  mk("CSC110", "Foundations of Computer Science I", "Rigorous intro to CS through Python and math. Proofs, functions, sequences, running-time analysis.", "Theory", [], ["Heavy","Math-Heavy","Interesting"], [4.2,4.1,4.3,78], "Rigorous, proof-heavy, life-changing if you actually do the psets.", [["David Liu",4.8,["clear","caring"]],["Michelle Craig",4.6,["organized"]]], [["reddit","Hardest first-year course but I actually learned to think."],["rmp","David Liu is a god. Notes are gold."]], g.neon, ["cs","datasci","bioinfo","math"], 1),
  mk("CSC111", "Foundations of Computer Science II", "Data structures, recursion, graphs, program correctness — sequel to CSC110.", "Theory", ["CSC110"], ["Heavy","Interesting","Project"], [4.4,4.0,4.2,82], "The final project is legendary. Pick something you love.", [["Mario Badr",4.7,["engaging"]]], [["reddit","The CSP project slaps. I built a Wordle solver."]], g.indigo, ["cs","datasci","bioinfo"], 1),
  mk("CSC108", "Intro to Computer Programming", "First Python course. Loops, functions, files. The friendlier CS gateway.", "Systems", [], ["Easy","Bird"], [4.0,2.5,2.6,80], "Chill intro. If you've coded before it's a bird.", [["Paul Gries",4.6,["kind"]]], [["reddit","Take this if you're new to code, otherwise CSC110."]], g.forest, ["cs","commerce","dem","datasci","bioinfo","stats","math","physics","astro","physiology","hmb","bio","psych"]),
  mk("CSC148", "Introduction to Computer Science", "OOP, recursion, linked lists, trees, and ADTs in Python.", "Theory", ["CSC108"], ["Interesting","Project"], [4.0,3.5,3.6,74], "The gateway. Once you get recursion here, everything clicks.", [["Diane Horton",4.5,["legend"]]], [["reddit","Trees will haunt you but in a good way."]], g.mint, ["cs","datasci","bioinfo","stats"]),
  mk("CSC207", "Software Design", "Java, design patterns, testing, refactoring, building real software as a team.", "Systems", ["CSC148"], ["Project","Interesting"], [3.8,3.4,4.0,70], "Group project = pain but you'll actually learn Git & testing.", [["Lindsey Shorser",4.2,["patient"]]], [["reddit","Java after Python feels weird for 2 weeks then it's fine."]], g.slate, ["cs","dem","datasci"]),
  mk("CSC209", "Software Tools & Systems Programming", "C, shell, processes, pipes, signals, sockets. The class that makes you a programmer.", "Systems", ["CSC207"], ["Heavy","Interesting"], [4.3,4.2,4.1,85], "You will fight segfaults and win. Then flex about it.", [["Karen Reid",4.8,["legendary"]]], [["reddit","Karen Reid's notes should be a textbook."]], g.ember, ["cs"]),
  mk("CSC236", "Intro to the Theory of Computation", "Induction, recursion, correctness proofs, regular languages, DFAs.", "Theory", ["CSC148"], ["Math-Heavy","Heavy"], [3.6,4.0,3.5,62], "Proofs, proofs, and more proofs. Prof lottery matters a lot.", [["François Pitt",4.3,["thorough"]]], [["reddit","If you liked CSC110 proofs you'll like this."]], g.indigo, ["cs","math"]),
  mk("CSC258", "Computer Organization", "Digital logic, assembly, MIPS, pipelining, memory hierarchy.", "Systems", ["CSC148"], ["Interesting","Project"], [4.1,3.8,3.9,76], "Building an FPGA game in the lab is peak UofT CS.", [["Steve Engels",4.9,["god-tier"]]], [["reddit","Steve Engels for president."]], g.gold, ["cs"]),
  mk("CSC263", "Data Structures and Analysis", "Amortized analysis, hashing, balanced BSTs, graph algorithms, heaps.", "Theory", ["CSC236"], ["Math-Heavy","Interesting"], [3.9,4.1,3.8,71], "Suddenly Big-O actually means something.", [["Sonya Allin",4.5,["engaging"]]], [["reddit","Amortized analysis felt like magic tricks."]], g.teal, ["cs","datasci"]),
  mk("CSC311", "Introduction to Machine Learning", "Linear/logistic regression, neural nets, k-means, PCA, bias-variance.", "AI", ["CSC263","MAT223"], ["Math-Heavy","Interesting"], [4.4,4.0,4.0,84], "The class every CS student wants. Bring your linear algebra.", [["Roger Grosse",4.7,["brilliant"]]], [["reddit","Roger's lectures are a masterclass."]], g.neon, ["cs","datasci","stats","bioinfo"]),
  mk("CSC343", "Introduction to Databases", "Relational model, SQL, normalization, transactions, a bit of NoSQL.", "Systems", ["CSC207"], ["Easy","Bird"], [3.8,2.6,2.8,72], "Chill. SQL is a life skill. Take it for the GPA boost.", [["Diane Horton",4.6,["kind"]]], [["reddit","Easiest A of my degree."]], g.forest, ["cs","dem","datasci","bioinfo","commerce","mgmt"]),
  mk("CSC369", "Operating Systems", "Threads, scheduling, virtual memory, file systems. Lots of C.", "Systems", ["CSC209","CSC258"], ["Heavy","Interesting"], [4.2,4.4,4.5,79], "You will not sleep during the scheduler assignment. Iconic.", [["Bogdan Simion",4.6,["engaging"]]], [["reddit","The FS assignment is a rite of passage."]], g.ember, ["cs"]),
  mk("CSC373", "Algorithm Design & Analysis", "Divide-and-conquer, DP, greedy, network flow, NP-completeness.", "Theory", ["CSC263"], ["Math-Heavy","Heavy"], [3.5,4.3,4.0,60], "The interview class. Painful but pays off in FAANG loops.", [["Nisarg Shah",4.4,["organized"]]], [["reddit","Got my Google offer thanks to this course."]], g.gold, ["cs","datasci","math"]),
  mk("CSC384", "Introduction to Artificial Intelligence", "Search, CSPs, game trees, planning, logic, intro to probability in AI.", "AI", ["CSC263"], ["Interesting","Project"], [4.1,3.6,3.5,80], "Build a Sudoku solver, an Othello AI. Actually fun.", [["Sheila McIlraith",4.5,["brilliant"]]], [["reddit","The Othello A3 is a whole personality."]], g.teal, ["cs","datasci"]),
  mk("CSC454", "The Business of Software", "Founders, PMF, hiring, fundraising — guest speakers every week.", "Breadth", ["CSC301"], ["Bird","Easy","Hidden Gem"], [4.6,2.2,2.5,91], "Best class you can take. Guest founders every week. Zero exam.", [["Michael Reid",4.9,["inspiring"]]], [["reddit","Should be mandatory. Networking gold."]], g.gold, ["cs","commerce","mgmt","dem","finance","marketing"]),

  // ============ MATH / STATS ============
  mk("MAT137", "Calculus with Proofs", "The real calculus course. Epsilon-delta, series, all the proofs.", "Math", [], ["Math-Heavy","Heavy","Interesting"], [4.0,4.3,4.2,72], "The math-major filter. Hard but you come out actually understanding calc.", [["Bernardo Galvão-Sousa",4.6,["clear"]]], [["reddit","MAT137 broke me and made me love math."]], g.indigo, ["math","physics","astro","stats","actsci","datasci"], 1),
  mk("MAT223", "Linear Algebra I", "Vectors, matrices, subspaces, eigenvalues.", "Math", [], ["Math-Heavy"], [3.6,3.6,3.2,70], "The prereq gate. Don't skip actually understanding it.", [["Tyler Holden",4.7,["clear"]]], [["reddit","Tyler Holden on YouTube saved my life."]], g.slate, ["math","cs","physics","stats","actsci","datasci","econ","commerce","finance","bioinfo"]),
  mk("MAT224", "Linear Algebra II", "Abstract vector spaces, inner products, Jordan form.", "Math", ["MAT223"], ["Math-Heavy","Interesting"], [3.8,4.0,3.6,74], "Where linear algebra gets real. Gorgeous once it clicks.", [["Tyler Holden",4.7,["clear"]]], [["reddit","MAT224 is when I felt like a math student."]], g.indigo, ["math","stats","actsci","physics"]),
  mk("STA130", "An Intro to Statistical Reasoning & Data Science", "R, hypothesis testing, real datasets. Group project every week.", "Stats", [], ["Easy","Project","Interesting"], [4.1,2.8,3.4,80], "Chill R course with a fun capstone. Great first stats.", [["Nathan Taback",4.5,["kind"]]], [["reddit","Group project heavy but low stakes."]], g.forest, ["stats","datasci","cs","actsci","bioinfo","commerce","econ"]),
  mk("STA247", "Probability with Computer Applications", "Probability for CS: distributions, expectation, simulation.", "Stats", [], ["Easy","Interesting"], [3.9,3.0,2.9,75], "Painless stats for CS majors. Take before ML.", [["Alison Gibbs",4.4,["kind"]]], [["reddit","Way more chill than STA257."]], g.teal, ["cs","stats","datasci"]),
  mk("STA257", "Probability & Statistics I", "Rigorous probability: measure-lite, distributions, CLT.", "Stats", ["MAT137"], ["Math-Heavy","Heavy"], [3.7,4.0,3.8,68], "The real prob course. Painful but everything downstream needs it.", [["Radu Craiu",4.3,["thorough"]]], [["reddit","Do every past exam. Twice."]], g.slate, ["stats","actsci","datasci","math"]),
  mk("STA302", "Methods of Data Analysis I", "Regression, diagnostics, R. The applied stats bread & butter.", "Stats", ["STA257"], ["Interesting","Project"], [4.0,3.4,3.5,79], "Regression forever. Actually useful for internships.", [["Katherine Daignault",4.5,["clear"]]], [["reddit","This class + a Kaggle = job."]], g.forest, ["stats","datasci","actsci","econ","bioinfo"]),
  mk("ACT240", "Mathematics of Investment & Credit", "Interest theory, annuities, bonds. First actuarial exam prep.", "Actuarial", ["MAT137"], ["Math-Heavy"], [3.9,3.7,3.6,76], "Straightforward if you grind past problems. FM exam ready.", [["X. Sheldon Lin",4.3,["organized"]]], [["reddit","This IS the FM exam."]], g.gold, ["actsci","finance","math"]),

  // ============ PSYCHOLOGY / NEURO ============
  mk("PSY100", "Introductory Psychology", "Broad survey — brain, behaviour, memory, disorders, social psych.", "Psychology", [], ["Easy","Interesting"], [4.2,2.8,3.0,84], "The gateway drug to psych. Huge lecture but genuinely fun.", [["Dan Dolderman",4.9,["storyteller"]]], [["reddit","Dolderman turned me into a psych major."]], g.rose, ["psych","neuro","hmb","physiology","health","cs"], 1),
  mk("PSY201", "Statistics I for Psych", "Stats for behavioural data. SPSS, t-tests, ANOVA.", "Psychology", ["PSY100"], ["Math-Heavy"], [3.4,3.5,3.5,60], "The stats course psych majors dread. Not that bad honestly.", [["Christine Burton",4.2,["patient"]]], [["reddit","Do the practice sets, don't wing it."]], g.slate, ["psych","neuro"]),
  mk("PSY210", "Developmental Psychology", "Cradle to grave: attachment, adolescence, aging.", "Psychology", ["PSY100"], ["Essay-Heavy","Interesting"], [4.0,3.0,3.2,78], "Cute course. Baby videos every lecture. Solid GPA course.", [["Jessica Sommerville",4.5,["engaging"]]], [["reddit","Feels like watching Pixar for credit."]], g.rose, ["psych","exceptional","neuro"]),
  mk("PSY220", "Social Psychology", "Conformity, persuasion, prejudice, the self.", "Psychology", ["PSY100"], ["Essay-Heavy","Interesting"], [4.3,3.0,3.2,82], "The 'why do people do that' class. Half your Instagram makes sense after.", [["Jason Plaks",4.7,["witty"]]], [["reddit","Plaks is a comedian who happens to teach."]], g.plum, ["psych","socio","crim","ccit","marketing"]),
  mk("PSY260", "Learning & Plasticity", "Classical/operant conditioning, memory systems, neural bases.", "Neuroscience", ["PSY100"], ["Interesting"], [3.9,3.4,3.3,74], "Bridge between psych and neuro. Solid, well-organized.", [["Andy Lee",4.4,["clear"]]], [["reddit","Great before jumping to PSY397."]], g.plum, ["psych","neuro","hmb"]),
  mk("PSY270", "Cognitive Psychology", "Attention, perception, memory, language.", "Psychology", ["PSY100"], ["Interesting"], [4.1,3.3,3.3,80], "'Why is your brain like that' — semester edition. Highly recommended.", [["Susanne Ferber",4.6,["engaging"]]], [["reddit","Made me want to do a PhD."]], g.plum, ["psych","neuro","cs","ling"]),
  mk("PSY280", "Sensation & Perception", "Vision, hearing, illusions, cross-modal.", "Neuroscience", ["PSY100"], ["Interesting","Hidden Gem"], [4.2,3.2,3.1,82], "Underrated. So many mind-blown moments per lecture.", [["Matthias Niemeier",4.5,["passionate"]]], [["reddit","Optical illusions for 12 weeks. 10/10."]], g.teal, ["psych","neuro","hmb"]),
  mk("PSY311", "Adolescent Development", "Puberty, identity, risk, mental health in teens.", "Psychology", ["PSY210"], ["Essay-Heavy","Easy","Bird"], [4.3,2.6,3.0,86], "Very accessible upper year. Great essay prompts.", [["Marc Lewis",4.6,["kind"]]], [["reddit","Bird course, cool topics."]], g.rose, ["psych","exceptional","socio"]),
  mk("PSY341", "Personality & Abnormal Psychology", "Big Five, disorders, therapy approaches.", "Psychology", ["PSY100"], ["Interesting","Essay-Heavy"], [4.0,3.2,3.4,76], "The DSM class. Everyone diagnoses themselves by week 3.", [["Norman Farb",4.4,["thoughtful"]]], [["reddit","Feels like watching yourself in the mirror."]], g.plum, ["psych","neuro"]),
  mk("NROC34", "Neuroscience of Emotion", "Amygdala, reward, fear, mood disorders.", "Neuroscience", ["PSY260"], ["Interesting","Hidden Gem"], [4.4,3.5,3.4,84], "Peak neuro elective. Papers > textbook.", [["Rutsuko Ito",4.6,["expert"]]], [["reddit","Learn how your emotions actually work."]], g.plum, ["neuro","psych","hmb","physiology"]),

  // ============ BIOLOGY / PHYSIOLOGY / HEALTH ============
  mk("BIO152", "Introductory Biology I", "Cell bio, genetics, molecular basics. First-year bio for life sci.", "Biology", [], ["Heavy","Lab-Heavy"], [3.6,3.6,3.7,64], "Firehose of memorization. Anki is your friend.", [["Fiona Rawle",4.6,["kind","clear"]]], [["reddit","Fiona is the reason I stayed in bio."]], g.forest, ["bio","biochem","biotech","hmb","physiology","health","neuro","pharm","immuno","bioinfo","forensic"]),
  mk("BIO153", "Introductory Biology II", "Evolution, ecology, form & function.", "Biology", ["BIO152"], ["Interesting","Lab-Heavy"], [3.8,3.4,3.6,70], "Nicer than 152. More big-picture, less memorization.", [["Marc Johnson",4.5,["engaging"]]], [["reddit","Ecology labs slap. Cambridge trip if you're lucky."]], g.forest, ["bio","hmb","physiology","health","envsci","biotech"]),
  mk("BIO202", "Introductory Animal Physiology", "Nerves, muscle, cardiac, respiratory — how bodies work.", "Physiology", ["BIO153"], ["Heavy","Interesting"], [4.0,3.9,3.8,76], "The physiology gateway. Dense but very cool.", [["Doug Holmyard",4.4,["thorough"]]], [["reddit","Study the diagrams, not just the text."]], g.rose, ["physiology","hmb","bio","health","neuro","pharm"]),
  mk("BIO205", "Ecology", "Populations, communities, ecosystems, climate.", "Biology", ["BIO153"], ["Interesting","Easy"], [4.1,3.0,3.2,80], "Chill bio elective with real field feel.", [["Marc Cadotte",4.5,["passionate"]]], [["reddit","Best bio elective for GPA + vibes."]], g.forest, ["bio","envsci","envmgmt","health"]),
  mk("HMB265", "General & Human Genetics", "Mendelian to molecular. Pedigrees, linkage, cancer genetics.", "Genetics", ["BIO152"], ["Heavy","Interesting"], [3.9,3.8,3.8,72], "Iconic HMB course. The midterms are hard, the content is gold.", [["Michelle French",4.5,["organized"]]], [["reddit","Everyone in health sci takes this eventually."]], g.forest, ["hmb","bio","biochem","physiology","pharm","health","immuno","bioinfo"]),
  mk("PSL300", "Human Physiology I", "Cellular physiology, nerves, muscle, endocrine.", "Physiology", ["BIO202"], ["Heavy","Interesting"], [4.2,4.2,4.3,78], "THE physiology course. Study daily or die trying.", [["Michelle French",4.7,["god-tier"]]], [["reddit","Michelle French's slides are legendary."],["rmp","Hardest class but I loved every second."]], g.rose, ["physiology","hmb","pharm","neuro","health"]),
  mk("PSL301", "Human Physiology II", "Cardio, respiratory, renal, GI, reproduction.", "Physiology", ["PSL300"], ["Heavy","Interesting"], [4.3,4.3,4.4,80], "The sequel. Even harder. Also even better.", [["Michelle French",4.7,["god-tier"]]], [["reddit","Cardio unit is worth the whole course."]], g.rose, ["physiology","hmb","pharm","health"]),
  mk("ANA300", "Anatomy for Non-Med", "Gross human anatomy without the med school pace.", "Anatomy", ["BIO202"], ["Heavy","Lab-Heavy","Hidden Gem"], [4.5,3.8,4.0,88], "Cadaver labs. Actually. Bucket list course for pre-med.", [["Anne Agur",4.8,["legend"]]], [["reddit","The cadaver lab was surreal in the best way."]], g.rose, ["physiology","hmb","health","neuro","pharm"]),
  mk("PSL440", "Neurophysiology", "Membrane biophysics, synapses, sensory systems.", "Neuroscience", ["PSL300"], ["Math-Heavy","Heavy","Hidden Gem"], [4.3,4.2,4.1,82], "The most rigorous neuro course. Take if you love equations + brains.", [["John Yeomans",4.5,["clear"]]], [["reddit","Best upper year for neuro majors."]], g.plum, ["neuro","physiology","hmb"]),

  // ============ CHEMISTRY / BIOCHEM / PHARM / IMMUNO ============
  mk("CHM135", "Chemistry: Physical Principles", "Thermodynamics, kinetics, equilibria — first-sem chem.", "Chemistry", [], ["Math-Heavy","Lab-Heavy"], [3.4,3.8,3.7,60], "Standard first-year chem. Prof lottery matters.", [["Barb Morra",4.5,["kind"]]], [["reddit","Do the practice problems. All of them."]], g.sky, ["chem","biochem","biotech","hmb","physiology","health","bio","pharm","forensic","physics"]),
  mk("CHM136", "Introductory Organic Chemistry I", "Mechanisms, stereochemistry, functional groups.", "Chemistry", ["CHM135"], ["Heavy","Interesting"], [3.7,4.2,4.1,65], "Orgo. Draw arrows until you dream in them.", [["Andrew Dicks",4.6,["engaging"]]], [["reddit","Dicks makes orgo actually enjoyable."]], g.sky, ["chem","biochem","biotech","hmb","pharm","health","forensic"]),
  mk("CHM242", "Introduction to Chemical Analysis", "Analytical chem, spectroscopy, wet labs.", "Chemistry", ["CHM135"], ["Lab-Heavy"], [3.6,3.4,3.9,68], "Long labs but you learn instrument work that gets internships.", [["Ulrich Fekl",4.4,["thorough"]]], [["reddit","Take good lab notes. Reports are the grade."]], g.sky, ["chem","biochem","forensic","biotech","envsci"]),
  mk("BCH210", "Biochemistry I", "Proteins, enzymes, membranes, metabolism intro.", "Biochemistry", ["CHM136","BIO152"], ["Heavy","Interesting"], [3.9,4.0,3.9,72], "The gateway to biochem. Dense but very cool.", [["Andrew Woolley",4.5,["clear"]]], [["reddit","Metabolism section is a slog. Push through."]], g.forest, ["biochem","biotech","pharm","hmb","physiology","immuno","bioinfo"]),
  mk("IMM250", "Immunology in the Real World", "How your immune system works, vaccines, allergies, HIV.", "Immunology", ["BIO152"], ["Easy","Interesting","Hidden Gem"], [4.5,2.8,3.0,90], "Absolute hidden gem. Bird for bio majors, mind-blowing for everyone.", [["Michael Ratcliffe",4.7,["storyteller"]]], [["reddit","Best bio course I ever took."]], g.forest, ["immuno","hmb","bio","physiology","health","pharm","biochem"]),
  mk("PCL201", "Pharmacology for Non-Pharm", "How drugs work — pharmacokinetics, receptors, side effects.", "Pharmacology", ["BIO202"], ["Interesting","Hidden Gem"], [4.4,3.2,3.3,86], "Every med-school-curious student should take this.", [["David Riddick",4.6,["engaging"]]], [["reddit","Perfect elective for HMB / physiol."]], g.rose, ["pharm","hmb","physiology","health","neuro","immuno"]),

  // ============ PHYSICS / ASTRO / EARTH ============
  mk("PHY131", "Introduction to Physics I", "Mechanics for life-sci majors. Calc-lite.", "Physics", [], ["Math-Heavy","Lab-Heavy"], [3.5,3.6,3.6,65], "Ok if you liked high school physics. Painful if not.", [["Jason Harlow",4.5,["clear"]]], [["reddit","Harlow makes it bearable."]], g.sky, ["physics","astro","bio","hmb","physiology","health","chem"]),
  mk("PHY132", "Introduction to Physics II", "Waves, optics, E&M for life-sci.", "Physics", ["PHY131"], ["Math-Heavy","Lab-Heavy"], [3.4,3.7,3.6,62], "Waves > mechanics tbh. E&M unit is rough.", [["Jason Harlow",4.5,["clear"]]], [["reddit","Buy the clicker, actually use it."]], g.sky, ["physics","astro","bio","hmb","physiology","health","chem"]),
  mk("AST101", "The Sun & Its Neighbours", "Solar system, stars, telescopes — bird astronomy elective.", "Astronomy", [], ["Bird","Easy","Interesting"], [4.5,2.0,2.2,92], "The bird course. Space is cool. Everyone should take this.", [["Michael Reid",4.9,["storyteller"]]], [["reddit","Legendary bird. Michael Reid is a national treasure."]], g.plum, ["astro","physics","envsci","earth","cs","commerce","psych","socio","eng","history","art","philo","music","cinema","hmb","physiology","bio","chem"]),
  mk("AST201", "Stars & Galaxies", "Stellar life cycles, galaxies, cosmology overview.", "Astronomy", [], ["Bird","Easy","Interesting"], [4.4,2.3,2.5,90], "Sequel to AST101. Same energy. Still a bird.", [["Michael Reid",4.9,["storyteller"]]], [["reddit","Take both AST birds. No regrets."]], g.plum, ["astro","physics","envsci","earth","cs","commerce","psych","socio","eng","history","art","philo","music","cinema"]),
  mk("ENV100", "Introduction to Environmental Studies", "Climate, sustainability, policy, ecology basics.", "Environment", [], ["Easy","Essay-Heavy","Interesting"], [4.1,2.6,2.9,82], "Chill breadth course. Care about the planet? Take it.", [["Steve Easterbrook",4.6,["passionate"]]], [["reddit","Great breadth pick outside sci."]], g.forest, ["envsci","envmgmt","geog","bio","health","polsci","socio"]),
  mk("GGR112", "Geographies of Globalization", "Trade, migration, cities, inequality — human geo.", "Geography", [], ["Easy","Essay-Heavy"], [4.0,2.7,3.0,80], "Solid social-sci breadth. Not just maps.", [["Deborah Cowen",4.5,["engaging"]]], [["reddit","Way more interesting than the title sounds."]], g.teal, ["geog","envsci","envmgmt","polsci","socio","commerce","econ"]),

  // ============ COMMERCE / MGMT / ECON / FINANCE / MARKETING / DEM ============
  mk("MGT100", "Introduction to Management", "Strategy, orgs, ops — the UTM commerce foundation.", "Management", [], ["Easy","Interesting"], [3.9,2.8,3.2,76], "Very intro. Group cases every week. Standard.", [["Soo Min Toh",4.4,["clear"]]], [["reddit","Chill start to commerce."]], g.gold, ["commerce","mgmt","finance","marketing","hrm","dem"]),
  mk("MGT120", "Financial Accounting", "Debits, credits, financial statements. The commerce filter.", "Accounting", [], ["Math-Heavy","Heavy"], [3.4,3.8,3.9,60], "The class that filters people out of commerce. Do problem sets daily.", [["Craig Chapman",4.3,["organized"]]], [["reddit","Fall behind for a week and you're cooked."]], g.slate, ["commerce","mgmt","finance","actsci","econ"]),
  mk("MGT201", "Managerial Accounting", "Costing, budgeting, decisions from the inside.", "Accounting", ["MGT120"], ["Math-Heavy"], [3.6,3.5,3.5,68], "Nicer than 120. Feels more like real business.", [["Sandra Iacobelli",4.4,["patient"]]], [["reddit","Actually useful for internships."]], g.slate, ["commerce","mgmt","finance"]),
  mk("MGT262", "Marketing Management", "Segmentation, positioning, 4Ps, brand.", "Marketing", ["MGT100"], ["Easy","Project","Interesting"], [4.2,2.7,3.1,84], "Case-heavy but fun. Great for portfolio projects.", [["Leigh McAlister",4.6,["engaging"]]], [["reddit","Do the group project seriously — recruiters ask."]], g.rose, ["marketing","commerce","mgmt","dem","ccit"]),
  mk("MGT338", "Financial Management", "Time value of money, capital budgeting, valuation.", "Finance", ["MGT120","ECO101"], ["Math-Heavy","Interesting"], [3.8,3.7,3.8,72], "Where finance really starts. DCFs everywhere.", [["Michael Khouw",4.5,["clear"]]], [["reddit","Study the formula sheet cold."]], g.gold, ["finance","commerce","mgmt","actsci","econ"]),
  mk("ECO101", "Principles of Microeconomics", "Supply, demand, market failure, game theory basics.", "Economics", [], ["Math-Heavy","Interesting"], [3.7,3.3,3.3,74], "The one everyone takes. Micro is intuitive once it clicks.", [["Robert Gazzale",4.7,["legend"]]], [["reddit","Gazzale is the Michael Scott of ECO."]], g.gold, ["econ","commerce","mgmt","finance","polsci","actsci","socio","stats","math","dem"]),
  mk("ECO102", "Principles of Macroeconomics", "GDP, inflation, monetary policy, growth.", "Economics", [], ["Math-Heavy"], [3.5,3.4,3.3,70], "Macro. Less intuitive than micro but still solid.", [["Jack Parkinson",4.4,["clear"]]], [["reddit","Do the past exams. That's it."]], g.gold, ["econ","commerce","finance","polsci","actsci"]),
  mk("ECO200", "Microeconomic Theory", "Calculus-based micro. Optimization everywhere.", "Economics", ["ECO101","MAT137"], ["Math-Heavy","Heavy"], [3.8,4.0,3.9,72], "Where econ becomes math. Rigorous but rewarding.", [["Ettore Damiano",4.5,["thoughtful"]]], [["reddit","Bring your calculus. Seriously."]], g.slate, ["econ","math","actsci","stats"]),
  mk("CCT109", "Introduction to Digital Media", "Media theory + hands-on tools. The CCIT gateway.", "Media", [], ["Easy","Project","Interesting"], [4.0,2.6,3.0,80], "Chill and creative. Adobe Suite basics included.", [["Michael Petit",4.5,["kind"]]], [["reddit","Great first CCT. Very doable."]], g.rose, ["ccit","dem","media","marketing","art","visual","cinema"]),
  mk("CCT210", "The Interactive Web", "HTML, CSS, JS, UX — build websites for credit.", "Media", ["CCT109"], ["Project","Interesting","Hidden Gem"], [4.3,3.0,3.5,84], "Hidden gem. Builds an actual portfolio. Do the extra credit.", [["Sarah Sharma",4.6,["engaging"]]], [["reddit","Best CCT for skills that pay."]], g.mint, ["ccit","dem","media","cs","marketing"]),

  // ============ SOCIAL SCIENCES / HUMANITIES / LANG / ARTS ============
  mk("POL101", "Democracy, Dictatorship, War, Peace", "Comparative politics + IR overview. The polsci gateway.", "Politics", [], ["Essay-Heavy","Interesting"], [4.1,3.0,3.4,80], "Big lecture, great TAs. Solid essay practice.", [["Nelson Wiseman",4.5,["storyteller"]]], [["reddit","Way more interesting than expected."]], g.slate, ["polsci","socio","history","philo","crim","econ","commerce"]),
  mk("POL208", "Introduction to International Relations", "Realism, liberalism, war, trade, climate.", "Politics", ["POL101"], ["Essay-Heavy","Interesting"], [4.2,3.1,3.4,82], "The IR classic. Debates in tutorial are gold.", [["Lilach Gilady",4.6,["engaging"]]], [["reddit","Do the readings — tutorial matters."]], g.slate, ["polsci","history","econ","commerce"]),
  mk("SOC100", "Introduction to Sociology", "Class, race, gender, institutions.", "Sociology", [], ["Easy","Essay-Heavy","Interesting"], [4.0,2.8,3.0,80], "Solid social sci breadth. Not just theory.", [["Erik Schneiderhan",4.5,["engaging"]]], [["reddit","Great TA lottery. Pick a fun tutorial."]], g.plum, ["socio","psych","crim","polsci","wgs","health","ccit","anthro"]),
  mk("SOC244", "Gender & Society", "Gender as a social structure. Family, work, media.", "Sociology", ["SOC100"], ["Essay-Heavy","Interesting"], [4.2,2.9,3.1,84], "One of the better upper-social-sci electives.", [["Judith Taylor",4.6,["thoughtful"]]], [["reddit","Great essays. Grading is fair."]], g.plum, ["socio","wgs","psych","crim","health"]),
  mk("CRI205", "Introduction to Criminology", "Theories of crime, deviance, punishment.", "Criminology", [], ["Easy","Essay-Heavy","Interesting"], [4.2,2.9,3.1,84], "The class every crim student loves. Well-organized.", [["Matthew Light",4.6,["engaging"]]], [["reddit","Textbook is actually useful for once."]], g.ember, ["crim","socio","psych","polsci","forensic"]),
  mk("ANT101", "Introduction to Anthropology: Society, Culture & Language", "Culture, kinship, ethnography basics.", "Anthropology", [], ["Easy","Essay-Heavy"], [4.0,2.7,2.9,80], "Chill first anthro. Interesting readings.", [["Andrea Muehlebach",4.5,["storyteller"]]], [["reddit","Very readable, feels like a book club."]], g.sand, ["anthro","socio","history","ling","classics","diaspora"]),
  mk("ENG110", "Narrative", "Novels, film, short stories — how stories work.", "English", [], ["Essay-Heavy","Easy","Interesting"], [4.3,2.9,3.3,84], "The gateway. Great syllabus, tight essay feedback.", [["Alan Bewell",4.6,["thoughtful"]]], [["reddit","Made me an English minor by accident."]], g.plum, ["eng","ling","profwriting","history","philo","cinema","theatre","classics"]),
  mk("PHL101", "Introduction to Philosophy", "Metaphysics, ethics, epistemology — the greatest hits.", "Philosophy", [], ["Essay-Heavy","Interesting"], [4.2,3.2,3.3,80], "Big lecture but the arguments hit hard.", [["Sonia Sedivy",4.5,["clear"]]], [["reddit","This class made me question everything."]], g.slate, ["philo","eng","history","polsci","religion","classics","cs"]),
  mk("PHL245", "Modern Symbolic Logic", "Propositional + predicate logic. Rigorous, math-adjacent.", "Philosophy", [], ["Math-Heavy","Interesting","Hidden Gem"], [4.4,3.6,3.4,86], "Hidden gem for CS/math kids in phil. Feels like a puzzle.", [["Nate Charlow",4.7,["clear"]]], [["reddit","Way easier if you've done CSC110."]], g.indigo, ["philo","cs","math","ling"]),
  mk("HIS101", "The Making of the Modern Age", "1500 to now, global sweep.", "History", [], ["Essay-Heavy","Easy"], [3.9,3.0,3.2,76], "Big lecture, chill tutorials. Solid breadth.", [["Chris Berkowitz",4.4,["engaging"]]], [["reddit","Read the tutorial reading. That's it."]], g.sand, ["history","polsci","eng","classics","philo","religion","diaspora"]),
  mk("LIN100", "Introduction to General Linguistics", "Sounds, morphology, syntax, meaning.", "Linguistics", [], ["Interesting"], [4.2,3.0,3.2,82], "Nerdy in the best way. Great for language + CS folks.", [["Nathan Sanders",4.6,["engaging"]]], [["reddit","IPA charts are surprisingly fun."]], g.mint, ["ling","eng","french","italian","spanish","portuguese","german","chinese","philo","cs","psych"]),
  mk("WRI203", "Expressive Writing", "Personal essays, memoir, style workshop.", "Writing", [], ["Essay-Heavy","Easy","Hidden Gem"], [4.5,2.6,2.9,90], "Small class, warm vibes. Best writing course on campus.", [["Guy Allen",4.9,["legend"]]], [["reddit","Guy Allen is the reason to take this."]], g.rose, ["profwriting","eng","ccit","marketing","cinema","theatre"]),
  mk("FAH101", "Introduction to Art History", "Cave paintings to modernism, global focus.", "Art History", [], ["Easy","Essay-Heavy","Interesting"], [4.1,2.7,2.9,80], "Slideshow lectures. Chill and gorgeous.", [["Elizabeth Legge",4.5,["engaging"]]], [["reddit","Free trip to AGO for an assignment."]], g.sand, ["art","visual","history","classics","cinema","theatre","music"]),
  mk("CIN105", "Introduction to Film Study", "Film form, genre, theory. Weekly screenings.", "Cinema", [], ["Essay-Heavy","Interesting"], [4.3,2.9,3.2,84], "Watch movies for credit. But actually learn to watch them.", [["Bart Testa",4.7,["legend"]]], [["reddit","Bart Testa is a walking Criterion Channel."]], g.ember, ["cinema","art","visual","eng","theatre","media","ccit"]),
  mk("MUS111", "Fundamentals of Music Theory", "Notation, intervals, chords, ear training.", "Music", [], ["Interesting"], [4.0,3.0,3.2,78], "Solid start for anyone playing an instrument.", [["Ryan McClelland",4.5,["patient"]]], [["reddit","Ear training feels like a video game."]], g.sky, ["music","theatre","cinema"]),
  mk("DRE121", "Introduction to Drama", "Play analysis, workshops, stagecraft basics.", "Theatre", [], ["Project","Interesting"], [4.2,3.0,3.3,82], "Actually get on your feet. Community is amazing.", [["Peter Kuling",4.6,["kind"]]], [["reddit","Made my whole friend group."]], g.rose, ["theatre","cinema","eng","music","art","visual"]),
  mk("FRE180", "French Language I", "Actual usable conversational French, level 1.", "French", [], ["Easy"], [4.2,2.8,3.2,84], "Small classes, tons of speaking practice.", [["Marie-Josée Hamel",4.6,["warm"]]], [["reddit","Best language dept on campus."]], g.rose, ["french","ling"]),
  mk("ITA100", "Italian for Beginners", "Grammar + culture. From zero to holiday-Italian.", "Italian", [], ["Easy"], [4.3,2.7,3.1,86], "Wholesome vibe. Instructors are lovely.", [["Teresa Lobalsamo",4.7,["warm"]]], [["reddit","Bird if you speak any Romance language."]], g.gold, ["italian","ling","classics"]),
  mk("SPA100", "Spanish for Beginners", "Basic Spanish, communicative approach.", "Spanish", [], ["Easy"], [4.2,2.8,3.1,84], "Fun small classes. Actually leave speaking Spanish.", [["María Cristina Cuervo",4.6,["engaging"]]], [["reddit","Really doable for a language req."]], g.rose, ["spanish","portuguese","ling"]),
];

export type Rail = { title: string; blurb?: string; codes: string[] };

const byCode = new Map(COURSES.map((c) => [c.code, c]));
export const getCourse = (code: string) => byCode.get(code.toUpperCase()) ?? COURSES.find((c) => c.code.toLowerCase() === code.toLowerCase());

// ============ Per-major rail generator ============
const uniq = (arr: string[]) => Array.from(new Set(arr));

export function getFeaturedForMajor(majorId: string | null): Course {
  const pool = majorId ? COURSES.filter((c) => c.majors.includes(majorId)) : COURSES;
  const sorted = [...pool].sort((a, b) => b.rating * b.wouldTakeAgain - a.rating * a.wouldTakeAgain);
  return sorted[0] ?? COURSES[0];
}

export function getRailsForMajor(majorId: string | null): Rail[] {
  const inMajor = majorId ? COURSES.filter((c) => c.majors.includes(majorId)) : COURSES;
  const notInMajor = majorId ? COURSES.filter((c) => !c.majors.includes(majorId)) : [];

  // If we don't have enough for this major, mix in universal picks so rails aren't empty
  const backfill = (codes: string[], min = 5) => {
    if (codes.length >= min) return codes;
    const extras = notInMajor
      .filter((c) => c.tags.some((t) => t === "Bird" || t === "Easy" || t === "Hidden Gem"))
      .sort((a, b) => b.rating - a.rating)
      .map((c) => c.code);
    return uniq([...codes, ...extras]).slice(0, Math.max(min, codes.length));
  };

  const top = [...inMajor].sort((a, b) => b.rating - a.rating).slice(0, 8).map((c) => c.code);
  const foundation = inMajor
    .filter((c) => {
      const num = parseInt(c.code.replace(/[^0-9]/g, ""), 10);
      return num < 250;
    })
    .sort((a, b) => a.code.localeCompare(b.code))
    .slice(0, 8)
    .map((c) => c.code);
  const upper = inMajor
    .filter((c) => {
      const num = parseInt(c.code.replace(/[^0-9]/g, ""), 10);
      return num >= 300;
    })
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8)
    .map((c) => c.code);
  const birds = inMajor
    .filter((c) => c.tags.includes("Bird") || c.tags.includes("Easy"))
    .sort((a, b) => b.wouldTakeAgain - a.wouldTakeAgain)
    .slice(0, 8)
    .map((c) => c.code);
  const gems = inMajor
    .filter((c) => c.tags.includes("Hidden Gem"))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8)
    .map((c) => c.code);
  const profs = [...inMajor]
    .sort((a, b) => (b.topProfs[0]?.rmp ?? 0) - (a.topProfs[0]?.rmp ?? 0))
    .slice(0, 8)
    .map((c) => c.code);

  const rails: Rail[] = [
    { title: "🎯 Core for your major", blurb: "Where every student in your program starts", codes: backfill(foundation, 4) },
    { title: "🔥 Highly rated in your program", blurb: "Top scores from students like you", codes: backfill(top, 5) },
    { title: "🐦 Bird courses", blurb: "GPA boosters that don't suck", codes: backfill(birds, 4) },
    { title: "💎 Hidden gems", blurb: "Underrated. Reddit obsessed.", codes: backfill(gems, 4) },
    { title: "🚀 Upper-year picks", blurb: "Once you've got the prereqs", codes: backfill(upper, 4) },
    { title: "⭐ Best-rated profs", blurb: "The professor lottery, pre-solved", codes: backfill(profs, 4) },
  ];

  // Universal breadth rail — always fun to browse
  const breadth = COURSES
    .filter((c) => c.majors.length >= 6 && (c.tags.includes("Bird") || c.tags.includes("Easy") || c.tags.includes("Hidden Gem")))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8)
    .map((c) => c.code);
  rails.push({ title: "🌐 Breadth picks everyone loves", blurb: "Outside your major, still worth it", codes: breadth });

  // De-dupe empty
  return rails.filter((r) => r.codes.length > 0);
}
