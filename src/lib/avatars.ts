import hmalc from "@/assets/avatars/hmalc.jpg";
import kaneff from "@/assets/avatars/kaneff.jpg";
import deerfield from "@/assets/avatars/deerfield.jpg";
import cntower from "@/assets/avatars/cntower.jpg";
import library from "@/assets/avatars/library.jpg";
import coffee from "@/assets/avatars/coffee.jpg";

export type AvatarOption = { id: string; label: string; src: string };

export const AVATARS: AvatarOption[] = [
  { id: "hmalc", label: "Hazel McCallion ALC", src: hmalc },
  { id: "kaneff", label: "Kaneff Centre", src: kaneff },
  { id: "deerfield", label: "Deerfield Hall", src: deerfield },
  { id: "cntower", label: "CN Tower", src: cntower },
  { id: "library", label: "Library grind", src: library },
  { id: "coffee", label: "Second Cup run", src: coffee },
];

export const getAvatar = (id: string | null | undefined) =>
  AVATARS.find((a) => a.id === id) ?? AVATARS[0]!;
