import type { MajorId } from "./majors";

const UNSPLASH_PARAMS = "?auto=format&fit=crop&w=400&q=80";

export const FALLBACK_MAJOR_IMAGE =
  `https://images.unsplash.com/photo-1564981797816-1043664bf78d${UNSPLASH_PARAMS}`;

export const MAJOR_IMAGES = {
  anthropology: `https://images.unsplash.com/photo-1594736797933-d0501ba2fe65${UNSPLASH_PARAMS}`,
  "applied-mathematics": `https://images.unsplash.com/photo-1509228468518-180dd4864904${UNSPLASH_PARAMS}`,
  "applied-statistics": `https://images.unsplash.com/photo-1551288049-bebda4e38f71${UNSPLASH_PARAMS}`,
  "art-art-history": `https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5${UNSPLASH_PARAMS}`,
  "art-history": `https://images.unsplash.com/photo-1544967082-d9d25d867d66${UNSPLASH_PARAMS}`,
  astronomy: `https://images.unsplash.com/photo-1462331940025-496dfbfc7564${UNSPLASH_PARAMS}`,
  biology: `https://images.unsplash.com/photo-1530026405186-ed1f139313f8${UNSPLASH_PARAMS}`,
  "biology-health-sciences": `https://images.unsplash.com/photo-1576091160399-112ba8d25d1d${UNSPLASH_PARAMS}`,
  "canadian-studies": `https://images.unsplash.com/photo-1503614472-8c93d56e92ce${UNSPLASH_PARAMS}`,
  chemistry: `https://images.unsplash.com/photo-1532094349884-543bc11b234d${UNSPLASH_PARAMS}`,
  cinema: `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba${UNSPLASH_PARAMS}`,
  classics: `https://images.unsplash.com/photo-1554244593-8f8735377b21${UNSPLASH_PARAMS}`,
  commerce: `https://images.unsplash.com/photo-1556761175-b413da4baf72${UNSPLASH_PARAMS}`,
  ccit: `https://images.unsplash.com/photo-1522071820081-009f0129c71c${UNSPLASH_PARAMS}`,
  "computer-science": `https://images.unsplash.com/photo-1518770660439-4636190af475${UNSPLASH_PARAMS}`,
  criminology: `https://images.unsplash.com/photo-1589829545856-d10d557cf95f${UNSPLASH_PARAMS}`,
  diaspora: `https://images.unsplash.com/photo-1529156069898-49953e39b3ac${UNSPLASH_PARAMS}`,
  dramaturgy: `https://images.unsplash.com/photo-1503095396549-807759245b35${UNSPLASH_PARAMS}`,
  "earth-science": `https://images.unsplash.com/photo-1506905925346-21bda4d32df4${UNSPLASH_PARAMS}`,
  economics: `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3${UNSPLASH_PARAMS}`,
  english: `https://images.unsplash.com/photo-1481627834876-b7833e8f5570${UNSPLASH_PARAMS}`,
  "environmental-management": `https://images.unsplash.com/photo-1497250681960-ef046c08a56e${UNSPLASH_PARAMS}`,
  "environmental-science": `https://images.unsplash.com/photo-1542601906990-b4d3fb778b09${UNSPLASH_PARAMS}`,
  "forensic-science": `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b${UNSPLASH_PARAMS}`,
  french: `https://images.unsplash.com/photo-1502602898657-3e91760cbb34${UNSPLASH_PARAMS}`,
  "geospatial-data-science": `https://images.unsplash.com/photo-1451187580459-43490279c0fa${UNSPLASH_PARAMS}`,
  geography: `https://images.unsplash.com/photo-1470770841072-f978cf4d019e${UNSPLASH_PARAMS}`,
  history: `https://images.unsplash.com/photo-1461360370896-922624d12aa1${UNSPLASH_PARAMS}`,
  religion: `https://images.unsplash.com/photo-1548625149-fc4a29cf7092${UNSPLASH_PARAMS}`,
  italian: `https://images.unsplash.com/photo-1523531294919-4bcd7c65e216${UNSPLASH_PARAMS}`,
  "language-teaching-french": `https://images.unsplash.com/photo-1503676260728-1c00da094a0b${UNSPLASH_PARAMS}`,
  "language-teaching-italian": `https://images.unsplash.com/photo-1523240795612-9a054b0db644${UNSPLASH_PARAMS}`,
  linguistics: `https://images.unsplash.com/photo-1516979187457-637abb4f9353${UNSPLASH_PARAMS}`,
  management: `https://images.unsplash.com/photo-1497366754035-f200968a6e72${UNSPLASH_PARAMS}`,
  "mathematical-sciences": `https://images.unsplash.com/photo-1635070041078-e363dbe005cb${UNSPLASH_PARAMS}`,
  paleontology: `https://images.unsplash.com/photo-1596394516093-501ba68a0ba6${UNSPLASH_PARAMS}`,
  philosophy: `https://images.unsplash.com/photo-1535905557558-afc4877a26fc${UNSPLASH_PARAMS}`,
  physics: `https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa${UNSPLASH_PARAMS}`,
  "political-science": `https://images.unsplash.com/photo-1573164713988-8665fc963095${UNSPLASH_PARAMS}`,
  writing: `https://images.unsplash.com/photo-1455390582262-044cdead277a${UNSPLASH_PARAMS}`,
  psychology: `https://images.unsplash.com/photo-1559757175-0eb30cd8c063${UNSPLASH_PARAMS}`,
  sociology: `https://images.unsplash.com/photo-1511632765486-a01980e01a18${UNSPLASH_PARAMS}`,
  "tech-coding": `https://images.unsplash.com/photo-1515879218367-8466d910aaa4${UNSPLASH_PARAMS}`,
  wgs: `https://images.unsplash.com/photo-1532629345422-7515f3d16bb6${UNSPLASH_PARAMS}`,
} satisfies Record<MajorId, string>;

export const getMajorImage = (majorId: MajorId) => MAJOR_IMAGES[majorId];
