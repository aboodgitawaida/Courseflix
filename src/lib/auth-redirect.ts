export function safeAuthRedirect(path?: string) {
  return path && path.startsWith("/") && !path.startsWith("//") ? path : "/";
}
