import type { DagMenu } from "./weekmenu";

export type PlanNotesPayload = {
  v: 1;
  notes: string;
  weekMenu: DagMenu[] | null;
};

function isDagMenuArray(value: unknown): value is DagMenu[] {
  return Array.isArray(value) && value.every((item) => item && typeof item === "object" && "dag" in item);
}

/** Decode notes field. Legacy plain text → { v:1, notes: raw, weekMenu: null }. */
export function decodePlanNotes(raw: string | null | undefined): PlanNotesPayload {
  if (raw == null || raw === "") {
    return { v: 1, notes: "", weekMenu: null };
  }

  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) {
    return { v: 1, notes: raw, weekMenu: null };
  }

  try {
    const parsed = JSON.parse(trimmed) as Partial<PlanNotesPayload> & { weekMenu?: unknown };
    if (parsed && typeof parsed === "object" && (parsed.v === 1 || parsed.weekMenu !== undefined || typeof parsed.notes === "string")) {
      return {
        v: 1,
        notes: typeof parsed.notes === "string" ? parsed.notes : "",
        weekMenu: isDagMenuArray(parsed.weekMenu) ? parsed.weekMenu : null,
      };
    }
  } catch {
    // fall through to legacy plain text
  }

  return { v: 1, notes: raw, weekMenu: null };
}

export function encodePlanNotes(payload: {
  notes?: string;
  weekMenu?: DagMenu[] | null;
  existing?: PlanNotesPayload;
}): string {
  const base = payload.existing ?? { v: 1 as const, notes: "", weekMenu: null };
  const next: PlanNotesPayload = {
    v: 1,
    notes: payload.notes !== undefined ? payload.notes : base.notes,
    weekMenu: payload.weekMenu !== undefined ? payload.weekMenu : base.weekMenu,
  };
  return JSON.stringify(next);
}
