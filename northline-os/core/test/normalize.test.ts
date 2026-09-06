import { test } from "node:test";
import assert from "node:assert/strict";

import {
  normalizeDetails,
  normalizeEmail,
  normalizeName,
  normalizePartySize,
  normalizePhone,
} from "../src/normalize.ts";

test("Telefonnummern werden nach E.164 normalisiert", () => {
  const cases: [string, string | null][] = [
    ["030 1234567", "+49301234567"],
    ["+49 30 1234567", "+49301234567"],
    ["0049 30 1234567", "+49301234567"],
    ["(030) 123 45-67", "+49301234567"],
    ["+43 1 2345678", "+4312345678"],
    ["30 1234567", "+49301234567"],
    ["123", null],
    ["keine Ahnung", null],
    ["", null],
  ];
  for (const [input, expected] of cases) {
    assert.equal(normalizePhone(input, "+49"), expected, `Eingabe: ${input}`);
  }
});

test("E-Mail-Adressen werden geprüft und kleingeschrieben", () => {
  assert.equal(normalizeEmail("  Anna@Example.COM "), "anna@example.com");
  assert.equal(normalizeEmail("anna@example"), null);
  assert.equal(normalizeEmail("anna at example.com"), null);
  assert.equal(normalizeEmail(42), null);
});

test("Namen werden bereinigt, Platzhalter verworfen", () => {
  assert.equal(normalizeName("  Anna   Weber "), "Anna Weber");
  assert.equal(normalizeName("null"), null);
  assert.equal(normalizeName("Unbekannt"), null);
  assert.equal(normalizeName("   "), null);
});

test("Personenzahl wird auch aus Freitext gelesen", () => {
  assert.equal(normalizePartySize(4), 4);
  assert.equal(normalizePartySize("4 Personen"), 4);
  assert.equal(normalizePartySize("zu zweit"), null);
  assert.equal(normalizePartySize(0), null);
  assert.equal(normalizePartySize(-3), null);
});

test("Details lassen keine Prototype-Pollution durch", () => {
  const hostile = JSON.parse('{"__proto__": {"polluted": true}, "message": "hallo"}');
  const clean = normalizeDetails(hostile);
  assert.equal(clean.message, "hallo");
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
});

test("verschachtelte Objekte aus LLM-Ausgaben bleiben draußen", () => {
  const clean = normalizeDetails({ nested: { a: 1 } } as never);
  assert.equal(clean.nested, undefined);
});

test("Ernährungshinweise werden dedupliziert und begrenzt", () => {
  const clean = normalizeDetails({ dietaryNotes: ["vegan", "vegan", "  glutenfrei "] });
  assert.deepEqual(clean.dietaryNotes, ["vegan", "glutenfrei"]);
});
