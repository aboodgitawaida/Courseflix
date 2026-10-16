/**
 * On/off switches for features that are built but not shown yet. Switching one
 * off hides its links and makes its page a 404; the code and any database
 * tables stay in place, so turning it back on is a one-word change.
 */
export const FEATURES: { wrapped: boolean; bracket: boolean } = {
  // Course Wrapped (/wrapped): the shortlist recap and story image.
  wrapped: false,
  // Hardest-course bracket (/bracket) and its home-page banner.
  bracket: false,
};
