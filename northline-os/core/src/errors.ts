/** Fehler, die der Aufrufer unterscheiden können muss. */

export class UnknownTenantError extends Error {
  readonly tenantId: string;
  constructor(tenantId: string) {
    super(`Unbekannter oder deaktivierter Mandant: ${tenantId}`);
    this.name = "UnknownTenantError";
    this.tenantId = tenantId;
  }
}

/**
 * Derselbe Idempotenzschlüssel mit anderem Inhalt. Das ist kein Duplikat,
 * sondern ein Fehler beim Aufrufer — stillschweigend die alte Antwort
 * zurückzugeben würde die abweichende Anfrage verschlucken.
 */
export class IdempotencyConflictError extends Error {
  readonly key: string;
  constructor(key: string) {
    super(`Idempotenzschlüssel ${key} wurde mit abweichendem Inhalt erneut verwendet`);
    this.name = "IdempotencyConflictError";
    this.key = key;
  }
}
