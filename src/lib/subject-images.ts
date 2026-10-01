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
  | "FSC";

const UNSPLASH_PARAMS = "?auto=format&fit=crop&w=400&q=80";

export const FALLBACK_SUBJECT_IMAGE = `https://images.unsplash.com/photo-1451187580459-43490279c0fa${UNSPLASH_PARAMS}`;

export const SUBJECT_IMAGES: Record<string, string> = {
  CSC: `https://images.unsplash.com/photo-1555066931-4365d14bab8c${UNSPLASH_PARAMS}`,
  CS: `https://images.unsplash.com/photo-1517694712202-14dd9538aa97${UNSPLASH_PARAMS}`,
  MAT: `https://images.unsplash.com/photo-1635070041078-e363dbe005cb${UNSPLASH_PARAMS}`,
  MATH: `https://images.unsplash.com/photo-1509228468518-180dd4864904${UNSPLASH_PARAMS}`,
  STA: `https://images.unsplash.com/photo-1551288049-bebda4e38f71${UNSPLASH_PARAMS}`,
  ANT: `https://images.unsplash.com/photo-1591110316205-0f855d04f53f${UNSPLASH_PARAMS}`,
  POL: `https://images.unsplash.com/photo-1573164713988-8665fc963095${UNSPLASH_PARAMS}`,
  HIS: `https://images.unsplash.com/photo-1461360370896-922624d12aa1${UNSPLASH_PARAMS}`,
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
  WGS: `https://images.unsplash.com/photo-1524504388940-b1c1722653e1${UNSPLASH_PARAMS}`,
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
  LIN: `https://images.unsplash.com/photo-1457369804613-52c61a468e7d${UNSPLASH_PARAMS}`,
  RLG: `https://images.unsplash.com/photo-1548625149-fc4a29cf7092${UNSPLASH_PARAMS}`,
  CLA: `https://images.unsplash.com/photo-1554244593-8f8735377b21${UNSPLASH_PARAMS}`,
  WRI: `https://images.unsplash.com/photo-1455390582262-044cdead277a${UNSPLASH_PARAMS}`,
  FAH: `https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5${UNSPLASH_PARAMS}`,
  FAS: `https://images.unsplash.com/photo-1577083552431-6e5fd01988a5${UNSPLASH_PARAMS}`,
  VST: `https://images.unsplash.com/photo-1547891654-e66ed7ebb968${UNSPLASH_PARAMS}`,
  EDS: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b${UNSPLASH_PARAMS}`,
  FSC: `https://images.unsplash.com/photo-1576091160399-112ba8d25d1d${UNSPLASH_PARAMS}`,
};

export function getCourseImage(subjectCode: string): string {
  return SUBJECT_IMAGES[subjectCode.trim().toUpperCase()] ?? FALLBACK_SUBJECT_IMAGE;
}
