export type ProfessorRating = {
  name: string;
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
    rating: 4.5,
    reviewCount: 37,
    profileUrl: "https://www.ratemyprofessors.com/professor/2609859",
    source: "Rate My Professors",
    retrievedAt: "2026-10-02",
  },
  "Madeleine Mant": {
    name: "Madeleine Mant",
    rating: 5,
    reviewCount: 11,
    profileUrl: "https://www.ratemyprofessors.com/professor/2686170",
    source: "Rate My Professors",
    retrievedAt: "2026-10-02",
  },
  "Esteban Parra": {
    name: "Esteban Parra",
    rating: 4.3,
    reviewCount: 35,
    profileUrl: "https://www.ratemyprofessors.com/professor/405525",
    source: "Rate My Professors",
    retrievedAt: "2026-10-02",
  },
  "Firat Bozcali": {
    name: "Firat Bozcali",
    rating: 3.8,
    reviewCount: 8,
    profileUrl: "https://www.ratemyprofessors.com/professor/2886720",
    source: "Rate My Professors",
    retrievedAt: "2026-10-02",
  },
};

export const getProfessorRating = (name: string) => VERIFIED_PROFESSOR_RATINGS[name];
