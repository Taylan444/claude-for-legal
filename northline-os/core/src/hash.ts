import { createHash } from "node:crypto";

/** JSON mit rekursiv sortierten Schlüsseln — damit gleicht Inhalt sich selbst. */
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = canonicalize((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

/**
 * Inhalts-Hash einer Anfrage. Dient der Unterscheidung zwischen einem echten
 * Duplikat (gleicher Schlüssel, gleicher Inhalt) und einer Wiederverwendung
 * desselben Schlüssels für abweichenden Inhalt.
 */
export function hashPayload(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}
