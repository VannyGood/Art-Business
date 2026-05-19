/** Read env var; strips whitespace and optional surrounding quotes. */
export function envString(key: string): string | undefined {
  const raw = process.env[key];
  if (raw == null || raw === "") return undefined;
  const v = raw.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1);
  }
  return v;
}
