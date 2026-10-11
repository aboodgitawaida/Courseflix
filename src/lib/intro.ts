export const INTRO_SESSION_KEY = "courseflix.intro.played";
export const INTRO_PLAYED_CLASS = "intro-played";

/**
 * Runs in <head> before first paint. The overlay is part of the server HTML (so the
 * page never flashes before the intro), and this hides it when it already played this
 * session. Storage that throws counts as "already played".
 */
export const INTRO_HEAD_SCRIPT = `try{if(sessionStorage.getItem("${INTRO_SESSION_KEY}"))document.documentElement.classList.add("${INTRO_PLAYED_CLASS}")}catch(e){document.documentElement.classList.add("${INTRO_PLAYED_CLASS}")}`;
