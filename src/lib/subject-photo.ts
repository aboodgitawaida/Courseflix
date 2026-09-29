// Real subject images from Unsplash - optimized for fast loading (400px width, quality 70)
const UNSPLASH_IMAGES: Record<string, string> = {
  // Computer Science & Information
  CSC: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=70",
  ISP: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=70",
  
  // Mathematics & Statistics
  MAT: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=70",
  STA: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=70",
  
  // Anthropology & Archaeology
  ANT: "https://images.unsplash.com/photo-1591110316205-0f855d04f53f?auto=format&fit=crop&w=400&q=70",
  ARH: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=400&q=70",
  ARC: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=400&q=70",
  
  // Political Science & History
  POL: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=400&q=70",
  HIS: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=400&q=70",
  
  // Biology, Chemistry, Physics, Environment, Geography, Earth Science, Astronomy
  BIO: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=70",
  CHM: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=70",
  PHY: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=70",
  ENV: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=400&q=70",
  GGR: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=400&q=70",
  ERS: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=70",
  AST: "https://images.unsplash.com/photo-5SqTxWX-IRw?auto=format&fit=crop&w=400&q=70",
  
  // Psychology, Sociology, Women's Studies, Communication
  PSY: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=400&q=70",
  SOC: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=70",
  WGS: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=400&q=70",
  CCT: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=70",
  
  // Economics & Management
  ECO: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=70",
  MGT: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=70",
  MGM: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=70",
  MGD: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=400&q=70",
  MGS: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=70",
  
  // English, Philosophy, Drama, Visual Studies, Cinema, French, Linguistics, Religion, Classics, Writing
  ENG: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&q=70",
  PHL: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&w=400&q=70",
  DRE: "https://images.unsplash.com/photo-1740867650660-e1a0a677e666?auto=format&fit=crop&w=400&q=70",
  DRS: "https://images.unsplash.com/photo-1740867650660-e1a0a677e666?auto=format&fit=crop&w=400&q=70",
  VCC: "https://images.unsplash.com/photo-1758522275190-83da0bfd87e3?auto=format&fit=crop&w=400&q=70",
  CIN: "https://images.unsplash.com/photo-1762028895833-59a751ccf89e?auto=format&fit=crop&w=400&q=70",
  FRE: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=70",
  FSL: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=70",
  LIN: "https://images.unsplash.com/photo-1769755409608-e61191208f91?auto=format&fit=crop&w=400&q=70",
  RLG: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&w=400&q=70",
  CLA: "https://images.unsplash.com/photo-1554244593-8f8735377b21?auto=format&fit=crop&w=400&q=70",
  WRI: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=70",
  
  // Languages
  GER: "https://images.unsplash.com/photo-jwBhwtkCW6w?auto=format&fit=crop&w=400&q=70",
  ITA: "https://images.unsplash.com/photo-BalxybtjJ5Y?auto=format&fit=crop&w=400&q=70",
  SPA: "https://images.unsplash.com/photo-1768341396547-0b6584cc4d85?auto=format&fit=crop&w=400&q=70",
  CHI: "https://images.unsplash.com/photo-ykBrcEgXYQc?auto=format&fit=crop&w=400&q=70",
  ARA: "https://images.unsplash.com/photo-EWtprB5HAL0?auto=format&fit=crop&w=400&q=70",
  HIN: "https://images.unsplash.com/photo-1604608671912-2630ce6e9c56?auto=format&fit=crop&w=400&q=70",
  URD: "https://images.unsplash.com/photo-1604608671912-2630ce6e9c56?auto=format&fit=crop&w=400&q=70",
  PRS: "https://images.unsplash.com/photo-1604608671912-2630ce6e9c56?auto=format&fit=crop&w=400&q=70",
  GRK: "https://images.unsplash.com/photo-1554244593-8f8735377b21?auto=format&fit=crop&w=400&q=70",
  LAT: "https://images.unsplash.com/photo-1554244593-8f8735377b21?auto=format&fit=crop&w=400&q=70",
  
  // Art & Visual Studies
  FAH: "https://images.unsplash.com/photo-eSd-1QetQeM?auto=format&fit=crop&w=400&q=70",
  FAS: "https://images.unsplash.com/photo-1758522275190-83da0bfd87e3?auto=format&fit=crop&w=400&q=70",
  VST: "https://images.unsplash.com/photo-1758522275190-83da0bfd87e3?auto=format&fit=crop&w=400&q=70",
  
  // Health Sciences & Education
  FSC: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=70",
  IMI: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=70",
  HSC: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=70",
  EDS: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=70",
  
  // Linguistics & Language Studies
  JAL: "https://images.unsplash.com/photo-1769755409608-e61191208f91?auto=format&fit=crop&w=400&q=70",
  JLP: "https://images.unsplash.com/photo-1769755409608-e61191208f91?auto=format&fit=crop&w=400&q=70",
  JPE: "https://images.unsplash.com/photo-1769755409608-e61191208f91?auto=format&fit=crop&w=400&q=70",
  JFL: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=70",
  LTL: "https://images.unsplash.com/photo-1769755409608-e61191208f91?auto=format&fit=crop&w=400&q=70",
  
  // Social Sciences & Humanities
  CBJ: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=400&q=70",
  DTS: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=400&q=70",
  SAH: "https://images.unsplash.com/photo-1604608671912-2630ce6e9c56?auto=format&fit=crop&w=400&q=70",
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=70";

export const subjectPhoto = (subject: string) => UNSPLASH_IMAGES[subject] ?? FALLBACK_IMAGE;
