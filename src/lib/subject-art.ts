import cscImg from "@/assets/subjects/csc.jpg";
import matImg from "@/assets/subjects/mat.jpg";
import antImg from "@/assets/subjects/ant.jpg";
import polImg from "@/assets/subjects/pol.jpg";
import engImg from "@/assets/subjects/eng.jpg";
import bioImg from "@/assets/subjects/bio.jpg";
import psyImg from "@/assets/subjects/psy.jpg";
import ecoImg from "@/assets/subjects/eco.jpg";
import chmImg from "@/assets/subjects/chm.jpg";
import socImg from "@/assets/subjects/soc.jpg";
import mgtImg from "@/assets/subjects/mgt.jpg";
import defaultImg from "@/assets/subjects/default.jpg";

const BY_SUBJECT: Record<string, string> = {
  CSC: cscImg,
  CCT: cscImg,
  ISP: cscImg,
  MAT: matImg,
  STA: matImg,
  ANT: antImg,
  ARH: antImg,
  CLA: antImg,
  POL: polImg,
  HIS: polImg,
  LAW: polImg,
  ENG: engImg,
  PHL: engImg,
  RLG: engImg,
  WRI: engImg,
  DRE: engImg,
  FAH: engImg,
  CIN: engImg,
  BIO: bioImg,
  EEB: bioImg,
  HSC: bioImg,
  BIU: bioImg,
  PSY: psyImg,
  JLP: psyImg,
  ECO: ecoImg,
  MGT: mgtImg,
  MGM: mgtImg,
  MGD: mgtImg,
  MGS: mgtImg,
  SOC: socImg,
  WGS: socImg,
  GGR: socImg,
  ENV: socImg,
  CHM: chmImg,
  PHY: chmImg,
  AST: chmImg,
  JCP: chmImg,
};

export const getSubjectImage = (subject: string) => BY_SUBJECT[subject] ?? defaultImg;
