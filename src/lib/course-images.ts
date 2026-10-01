import { FALLBACK_MAJOR_IMAGE } from "./major-images";

const IMAGE_PARAMS = "?auto=format&fit=crop&w=800&q=80";

const SUBJECT_IMAGES: Record<string, string> = {
  ANT: `https://images.unsplash.com/photo-1591110316205-0f855d04f53f${IMAGE_PARAMS}`,
  AST: `https://images.unsplash.com/photo-1462331940025-496dfbfc7564${IMAGE_PARAMS}`,
  BIO: `https://images.unsplash.com/photo-1530026405186-ed1f139313f8${IMAGE_PARAMS}`,
  CHM: `https://images.unsplash.com/photo-1532094349884-543bc11b234d${IMAGE_PARAMS}`,
  CIN: `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba${IMAGE_PARAMS}`,
  CSC: `https://images.unsplash.com/photo-1518770660439-4636190af475${IMAGE_PARAMS}`,
  ECO: `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3${IMAGE_PARAMS}`,
  ENG: `https://images.unsplash.com/photo-1481627834876-b7833e8f5570${IMAGE_PARAMS}`,
  FAH: `https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5${IMAGE_PARAMS}`,
  GGR: `https://images.unsplash.com/photo-1451187580459-43490279c0fa${IMAGE_PARAMS}`,
  HIS: `https://images.unsplash.com/photo-1461360370896-922624d12aa1${IMAGE_PARAMS}`,
  MAT: `https://images.unsplash.com/photo-1635070041078-e363dbe005cb${IMAGE_PARAMS}`,
  MGT: `https://images.unsplash.com/photo-1556761175-b413da4baf72${IMAGE_PARAMS}`,
  MGM: `https://images.unsplash.com/photo-1497366754035-f200968a6e72${IMAGE_PARAMS}`,
  PHY: `https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa${IMAGE_PARAMS}`,
  PHL: `https://images.unsplash.com/photo-1535905557558-afc4877a26fc${IMAGE_PARAMS}`,
  POL: `https://images.unsplash.com/photo-1573164713988-8665fc963095${IMAGE_PARAMS}`,
  PSY: `https://images.unsplash.com/photo-1559757175-0eb30cd8c063${IMAGE_PARAMS}`,
  RLG: `https://images.unsplash.com/photo-1548625149-fc4a29cf7092${IMAGE_PARAMS}`,
  SOC: `https://images.unsplash.com/photo-1511632765486-a01980e01a18${IMAGE_PARAMS}`,
  STA: `https://images.unsplash.com/photo-1551288049-bebda4e38f71${IMAGE_PARAMS}`,
  WRI: `https://images.unsplash.com/photo-1455390582262-044cdead277a${IMAGE_PARAMS}`,
};

export function getCourseImage(subject: string) {
  return SUBJECT_IMAGES[subject] ?? FALLBACK_MAJOR_IMAGE;
}
