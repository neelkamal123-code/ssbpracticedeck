import type {
  LecturetteItem,
  SRTItem,
  SsbCategory,
  TATAnchors,
  TATItem,
  WATItem,
} from "@/domain/ssb/types";

type RawDocument = Record<string, unknown>;

function asObject(value: unknown, label: string): RawDocument {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid ${label}: expected object.`);
  }

  return value as RawDocument;
}

function asString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid ${fieldName}: expected non-empty string.`);
  }

  return value;
}

function asStringArray(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Invalid ${fieldName}: expected non-empty array.`);
  }

  return value.map((entry, index) =>
    asString(entry, `${fieldName}[${index}]`),
  );
}

function asCategory<TCategory extends SsbCategory>(
  value: unknown,
  expected: TCategory,
  fieldName: string,
): TCategory {
  const category = asString(value, fieldName) as SsbCategory;
  if (category !== expected) {
    throw new Error(
      `Invalid ${fieldName}: expected "${expected}" but received "${category}".`,
    );
  }

  return category as TCategory;
}

function mapBaseFields<TCategory extends SsbCategory>(
  raw: unknown,
  expected: TCategory,
): { id: string; title: string; icon: string; category: TCategory } {
  const doc = asObject(raw, `${expected} document`);

  return {
    id: asString(doc.id, `${expected}.id`),
    title: asString(doc.title, `${expected}.title`),
    icon: asString(doc.icon, `${expected}.icon`),
    category: asCategory(doc.category, expected, `${expected}.category`),
  };
}

export function mapWATDocument(raw: unknown): WATItem {
  const doc = asObject(raw, "WAT document");
  const base = mapBaseFields(doc, "WAT");

  return {
    ...base,
    suggestions: asStringArray(doc.suggestions, "WAT.suggestions").slice(0, 4),
  };
}

export function mapSRTDocument(raw: unknown): SRTItem {
  const doc = asObject(raw, "SRT document");
  const base = mapBaseFields(doc, "SRT");

  return {
    ...base,
    suggestions: asStringArray(doc.suggestions, "SRT.suggestions").slice(0, 4),
  };
}

function mapAnchors(value: unknown): TATAnchors {
  const anchors = asObject(value, "TAT.anchors");

  return {
    protagonist: asString(anchors.protagonist, "TAT.anchors.protagonist"),
    challenge: asString(anchors.challenge, "TAT.anchors.challenge"),
    action: asString(anchors.action, "TAT.anchors.action"),
    positiveOutcome: asString(
      anchors.positiveOutcome,
      "TAT.anchors.positiveOutcome",
    ),
  };
}

export function mapTATDocument(raw: unknown): TATItem {
  const doc = asObject(raw, "TAT document");
  const base = mapBaseFields(doc, "TAT");

  return {
    ...base,
    anchors: mapAnchors(doc.anchors),
  };
}

export function mapLecturetteDocument(raw: unknown): LecturetteItem {
  const doc = asObject(raw, "LECTURETTE document");
  const base = mapBaseFields(doc, "LECTURETTE");
  const externalLink =
    doc.externalLink === undefined
      ? undefined
      : asString(doc.externalLink, "LECTURETTE.externalLink");

  return {
    ...base,
    facts: asStringArray(doc.facts, "LECTURETTE.facts").slice(0, 4),
    externalLink,
  };
}
