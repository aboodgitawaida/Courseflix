import offlineImage from "@/assets/subjects/default.jpg";

export type SubjectCode =
  | "CSC"
  | "CS"
  | "MAT"
  | "MATH"
  | "STA"
  | "ANT"
  | "POL"
  | "HIS"
  | "BIO"
  | "CHM"
  | "CHEM"
  | "PHY"
  | "ENV"
  | "GGR"
  | "ERS"
  | "AST"
  | "PSY"
  | "SOC"
  | "WGS"
  | "CCT"
  | "ECO"
  | "MGT"
  | "MGM"
  | "ENG"
  | "PHL"
  | "DRE"
  | "VCC"
  | "CIN"
  | "FRE"
  | "LIN"
  | "RLG"
  | "CLA"
  | "WRI"
  | "FAH"
  | "FAS"
  | "VST"
  | "EDS"
  | "ARA"
  | "CBJ"
  | "CHI"
  | "CPS"
  | "DRS"
  | "DTS"
  | "FSL"
  | "GER"
  | "GLB"
  | "GRK"
  | "HIN"
  | "HSC"
  | "IMI"
  | "ISP"
  | "ITA"
  | "JAL"
  | "JBC"
  | "JBH"
  | "JCB"
  | "JCP"
  | "JEG"
  | "JFL"
  | "JGE"
  | "JLP"
  | "JPE"
  | "LAT"
  | "LTL"
  | "MGD"
  | "PRS"
  | "PUN"
  | "SAH"
  | "SAN"
  | "SPA"
  | "URD"
  | "UTM";

const UNSPLASH_PARAMS = "?auto=format&fit=crop&w=400&q=80";

// Shown when a remote photo fails to load (offline, slow or blocked network),
// so cards never fall back to broken-image alt text.
export const OFFLINE_SUBJECT_IMAGE = offlineImage;

export const FALLBACK_SUBJECT_IMAGE = `https://images.unsplash.com/photo-1451187580459-43490279c0fa${UNSPLASH_PARAMS}`;

export const SUBJECT_IMAGES: Record<string, string> = {
  CSC: `https://images.unsplash.com/photo-1555066931-4365d14bab8c${UNSPLASH_PARAMS}`,
  CS: `https://images.unsplash.com/photo-1517694712202-14dd9538aa97${UNSPLASH_PARAMS}`,
  MAT: `https://images.unsplash.com/photo-1635070041078-e363dbe005cb${UNSPLASH_PARAMS}`,
  MATH: `https://images.unsplash.com/photo-1509228468518-180dd4864904${UNSPLASH_PARAMS}`,
  STA: `https://images.unsplash.com/photo-1551288049-bebda4e38f71${UNSPLASH_PARAMS}`,
  ANT: `https://images.unsplash.com/photo-1461360370896-922624d12aa1${UNSPLASH_PARAMS}`,
  POL: `https://images.unsplash.com/photo-1573164713988-8665fc963095${UNSPLASH_PARAMS}`,
  HIS: `https://images.unsplash.com/photo-1507475380673-1246fa72eeea${UNSPLASH_PARAMS}`,
  BIO: `https://images.unsplash.com/photo-1532094349884-543bc11b234d${UNSPLASH_PARAMS}`,
  CHM: `https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6${UNSPLASH_PARAMS}`,
  CHEM: `https://images.unsplash.com/photo-1532094349884-543bc11b234d${UNSPLASH_PARAMS}`,
  PHY: `https://images.unsplash.com/photo-1446776811953-b23d57bd21aa${UNSPLASH_PARAMS}`,
  ENV: `https://images.unsplash.com/photo-1472214103451-9374bd1c798e${UNSPLASH_PARAMS}`,
  GGR: `https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1${UNSPLASH_PARAMS}`,
  ERS: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4${UNSPLASH_PARAMS}`,
  AST: `https://images.unsplash.com/photo-1462331940025-496dfbfc7564${UNSPLASH_PARAMS}`,
  PSY: `https://images.unsplash.com/photo-1559757175-0eb30cd8c063${UNSPLASH_PARAMS}`,
  SOC: `https://images.unsplash.com/photo-1529156069898-49953e39b3ac${UNSPLASH_PARAMS}`,
  WGS: `https://images.unsplash.com/photo-1529107386315-e1a2ed48a620${UNSPLASH_PARAMS}`,
  CCT: `https://images.unsplash.com/photo-1522071820081-009f0129c71c${UNSPLASH_PARAMS}`,
  ECO: `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3${UNSPLASH_PARAMS}`,
  MGT: `https://images.unsplash.com/photo-1454165804606-c3d57bc86b40${UNSPLASH_PARAMS}`,
  MGM: `https://images.unsplash.com/photo-1507679799987-c73779587ccf${UNSPLASH_PARAMS}`,
  ENG: `https://images.unsplash.com/photo-1481627834876-b7833e8f5570${UNSPLASH_PARAMS}`,
  PHL: `https://images.unsplash.com/photo-1535905557558-afc4877a26fc${UNSPLASH_PARAMS}`,
  DRE: `https://images.unsplash.com/photo-1503095396549-807759245b35${UNSPLASH_PARAMS}`,
  VCC: `https://images.unsplash.com/photo-1549490349-8643362247b5${UNSPLASH_PARAMS}`,
  CIN: `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba${UNSPLASH_PARAMS}`,
  FRE: `https://images.unsplash.com/photo-1502602898657-3e91760cbb34${UNSPLASH_PARAMS}`,
  LIN: `https://images.unsplash.com/photo-1585255366830-8697e9c7d263${UNSPLASH_PARAMS}`,
  RLG: `https://images.unsplash.com/photo-1548625149-fc4a29cf7092${UNSPLASH_PARAMS}`,
  CLA: `https://images.unsplash.com/photo-1522442676585-c751dab71864${UNSPLASH_PARAMS}`,
  WRI: `https://images.unsplash.com/photo-1455390582262-044cdead277a${UNSPLASH_PARAMS}`,
  FAH: `https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5${UNSPLASH_PARAMS}`,
  FAS: `https://images.unsplash.com/photo-1577083552431-6e5fd01988a5${UNSPLASH_PARAMS}`,
  VST: `https://images.unsplash.com/photo-1547891654-e66ed7ebb968${UNSPLASH_PARAMS}`,
  EDS: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b${UNSPLASH_PARAMS}`,
  FSC: `https://images.unsplash.com/photo-1576091160399-112ba8d25d1d${UNSPLASH_PARAMS}`,
  ARA: `https://images.unsplash.com/photo-1593773331124-4ff9f002f833${UNSPLASH_PARAMS}`,
  CBJ: `https://images.unsplash.com/photo-1529579134665-75dfc9c5ccef${UNSPLASH_PARAMS}`,
  CHI: `https://images.unsplash.com/photo-1533757751343-978d1ebc2d6a${UNSPLASH_PARAMS}`,
  CPS: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3${UNSPLASH_PARAMS}`,
  DRS: `https://images.unsplash.com/photo-1513106580091-1d82408b8cd6${UNSPLASH_PARAMS}`,
  DTS: `https://images.unsplash.com/photo-1562577309-4932fdd64cd1${UNSPLASH_PARAMS}`,
  FSL: `https://images.unsplash.com/photo-1462289120039-eb38de447c9a${UNSPLASH_PARAMS}`,
  GER: `https://images.unsplash.com/photo-1467269204594-9661b134dd2b${UNSPLASH_PARAMS}`,
  GLB: `https://images.unsplash.com/photo-1521292270410-a8c4d716d518${UNSPLASH_PARAMS}`,
  GRK: `https://images.unsplash.com/photo-1467688695332-6b486449d78f${UNSPLASH_PARAMS}`,
  HIN: `https://images.unsplash.com/photo-1760162693478-4c96b6c99d55${UNSPLASH_PARAMS}`,
  HSC: `https://images.unsplash.com/photo-1511174511562-5f7f18b874f8${UNSPLASH_PARAMS}`,
  IMI: `https://images.unsplash.com/photo-1562789233-495f52b583dd${UNSPLASH_PARAMS}`,
  ISP: `https://images.unsplash.com/photo-1517694712202-14dd9538aa97${UNSPLASH_PARAMS}`,
  ITA: `https://images.unsplash.com/photo-1523531294919-4bcd7c65e216${UNSPLASH_PARAMS}`,
  JAL: `https://images.unsplash.com/photo-1457369804613-52c61a468e7d${UNSPLASH_PARAMS}`,
  JBC: `https://images.unsplash.com/photo-1511342802705-a7b79a427eb5${UNSPLASH_PARAMS}`,
  JBH: `https://images.unsplash.com/photo-1512580526143-1f24419088a3${UNSPLASH_PARAMS}`,
  JCB: `https://images.unsplash.com/photo-1545968340-848cddd981ea${UNSPLASH_PARAMS}`,
  JCP: `https://images.unsplash.com/photo-1554799607-a79266f47374${UNSPLASH_PARAMS}`,
  JEG: `https://images.unsplash.com/photo-1567526977394-a5816c70679e${UNSPLASH_PARAMS}`,
  JFL: `https://images.unsplash.com/photo-1431274172761-fca41d930114${UNSPLASH_PARAMS}`,
  JGE: `https://images.unsplash.com/photo-1571498664957-fde285d79857${UNSPLASH_PARAMS}`,
  JLP: `https://images.unsplash.com/photo-1610792472360-75c15db37d5e${UNSPLASH_PARAMS}`,
  JPE: `https://images.unsplash.com/photo-1624467719740-bb101d8869ed${UNSPLASH_PARAMS}`,
  LAT: `https://images.unsplash.com/photo-1546476841-39bd0f13a38f${UNSPLASH_PARAMS}`,
  LTL: `https://images.unsplash.com/photo-1665562011653-e8bfc3ca6602${UNSPLASH_PARAMS}`,
  MGD: `https://images.unsplash.com/photo-1552664730-d307ca884978${UNSPLASH_PARAMS}`,
  PRS: `https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e${UNSPLASH_PARAMS}`,
  PUN: `https://images.unsplash.com/photo-1599661046289-e31897846e41${UNSPLASH_PARAMS}`,
  SAH: `https://images.unsplash.com/photo-1761124739031-9db4207f67c2${UNSPLASH_PARAMS}`,
  SAN: `https://images.unsplash.com/photo-1605781231474-f60dea478e8a${UNSPLASH_PARAMS}`,
  SPA: `https://images.unsplash.com/photo-1768341396547-0b6584cc4d85${UNSPLASH_PARAMS}`,
  URD: `https://images.unsplash.com/photo-1532102522784-9e4d4d9a533c${UNSPLASH_PARAMS}`,
  UTM: `https://images.unsplash.com/photo-1497633762265-9d179a990aa6${UNSPLASH_PARAMS}`,
};

export function getCourseImage(subjectCode: string): string {
  return SUBJECT_IMAGES[subjectCode.trim().toUpperCase()] ?? FALLBACK_SUBJECT_IMAGE;
}
