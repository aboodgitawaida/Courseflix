export type ProfessorRating = {
  name: string;
  institution: "University of Toronto at Mississauga";
  rating: number;
  reviewCount: number;
  profileUrl: string;
  source: "Rate My Professors";
  retrievedAt: string;
};

// Only profiles matched to a UTM instructor name and UTM institution are listed.
// Ratings are overall professor ratings, not course-specific ratings.
export const VERIFIED_PROFESSOR_RATINGS: Record<string, ProfessorRating> = {
  "Sarah Marleen Hillewaert": {
    name: "Sarah Marleen Hillewaert",
    institution: "University of Toronto at Mississauga",
    rating: 4.5,
    reviewCount: 37,
    profileUrl: "https://www.ratemyprofessors.com/professor/2609859",
    source: "Rate My Professors",
    retrievedAt: "2026-10-02",
  },
  "Madeleine Mant": {
    name: "Madeleine Mant",
    institution: "University of Toronto at Mississauga",
    rating: 5,
    reviewCount: 11,
    profileUrl: "https://www.ratemyprofessors.com/professor/2686170",
    source: "Rate My Professors",
    retrievedAt: "2026-10-02",
  },
  "Esteban Parra": {
    name: "Esteban Parra",
    institution: "University of Toronto at Mississauga",
    rating: 4.3,
    reviewCount: 35,
    profileUrl: "https://www.ratemyprofessors.com/professor/405525",
    source: "Rate My Professors",
    retrievedAt: "2026-10-02",
  },
  "Firat Bozcali": {
    name: "Firat Bozcali",
    institution: "University of Toronto at Mississauga",
    rating: 3.8,
    reviewCount: 8,
    profileUrl: "https://www.ratemyprofessors.com/professor/2886720",
    source: "Rate My Professors",
    retrievedAt: "2026-10-02",
  },
  "Tyler Holden": {
    name: "Tyler Holden",
    institution: "University of Toronto at Mississauga",
    rating: 2.5,
    reviewCount: 189,
    profileUrl: "https://www.ratemyprofessors.com/professor/2170614",
    source: "Rate My Professors",
    retrievedAt: "2026-10-02",
  },
  "Kenneth Derry": {
    name: "Kenneth Derry",
    institution: "University of Toronto at Mississauga",
    rating: 4.4,
    reviewCount: 128,
    profileUrl: "https://www.ratemyprofessors.com/professor/1553505",
    source: "Rate My Professors",
    retrievedAt: "2026-10-02",
  },
  "Timothy Yusun": {
    name: "Timothy Yusun",
    institution: "University of Toronto at Mississauga",
    rating: 4.2,
    reviewCount: 37,
    profileUrl: "https://www.ratemyprofessors.com/professor/2368873",
    source: "Rate My Professors",
    retrievedAt: "2026-10-02",
  },
  "Ali Mousavidehshikh": {
    name: "Ali Mousavidehshikh",
    institution: "University of Toronto at Mississauga",
    rating: 3.2,
    reviewCount: 71,
    profileUrl: "https://www.ratemyprofessors.com/professor/1969952",
    source: "Rate My Professors",
    retrievedAt: "2026-10-02",
  },
  "Romina Piunno": {
    name: "Romina Piunno",
    institution: "University of Toronto at Mississauga",
    rating: 2,
    reviewCount: 3,
    profileUrl: "https://www.ratemyprofessors.com/professor/3109233",
    source: "Rate My Professors",
    retrievedAt: "2026-10-02",
  },
};

export const getProfessorRating = (name: string) => VERIFIED_PROFESSOR_RATINGS[name];
