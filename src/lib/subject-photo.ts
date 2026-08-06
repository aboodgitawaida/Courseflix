import csc from "@/assets/subjects/csc.jpg";
import mat from "@/assets/subjects/mat.jpg";
import ant from "@/assets/subjects/ant.jpg";
import pol from "@/assets/subjects/pol.jpg";
import bio from "@/assets/subjects/bio.jpg";
import psy from "@/assets/subjects/psy.jpg";
import eco from "@/assets/subjects/eco.jpg";
import hum from "@/assets/subjects/hum.jpg";
import fallback from "@/assets/subjects/default.jpg";

const MAP: Record<string, string> = {
  CSC: csc,
  ISP: csc,
  MAT: mat,
  STA: mat,
  ANT: ant,
  ARH: ant,
  POL: pol,
  HIS: pol,
  BIO: bio,
  CHM: bio,
  PHY: bio,
  ENV: bio,
  GGR: bio,
  PSY: psy,
  SOC: psy,
  WGS: psy,
  CCT: psy,
  ECO: eco,
  MGT: eco,
  MGM: eco,
  MGD: eco,
  MGS: eco,
  ENG: hum,
  PHL: hum,
  DRE: hum,
  VCC: hum,
  CIN: hum,
  FRE: hum,
  FSL: hum,
  LIN: hum,
  RLG: hum,
  CLA: hum,
  WRI: hum,
};

export const subjectPhoto = (subject: string) => MAP[subject] ?? fallback;
