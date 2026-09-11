"use client";

import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Check, RotateCcw } from "lucide-react";
import type { DagMenu } from "@/lib/weekmenu";
import { buildShoppingList, groupShoppingList } from "@/lib/shopping-list";

type Props = {
  weekMenu: DagMenu[];
  /** Compact styling for client portal */
  variant?: "coach" | "client";
  /** Persist checkmarks locally (plan id) */
  storageKey?: string;
};

function listSignature(names: string[]) {
  return [...names].sort((a, b) => a.localeCompare(b, "nl")).join("|");
}

function loadChecked(key: string, signature: string): Set<string> {
  if (typeof window === "undefined" || !key) return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as { signature?: string; checked?: string[] };
    if (parsed.signature !== signature || !Array.isArray(parsed.checked)) return new Set();
    return new Set(parsed.checked);
  } catch {
    return new Set();
  }
}

function saveChecked(key: string, signature: string, checked: Set<string>) {
  if (typeof window === "undefined" || !key) return;
  try {
    localStorage.setItem(
      key,
      JSON.stringify({ signature, checked: [...checked] })
    );
  } catch {
    // ignore quota / private mode
  }
}

export function ShoppingListPanel({
  weekMenu,
  variant = "coach",
  storageKey,
}: Props) {
  const [copied, setCopied] = useState(false);
  const items = useMemo(() => buildShoppingList(weekMenu), [weekMenu]);
  const signature = useMemo(() => listSignature(items.map((i) => i.naam)), [items]);
  const persistKey = storageKey ? `neumann-shop:${storageKey}` : "";

  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setChecked(loadChecked(persistKey, signature));
    setHydrated(true);
  }, [persistKey, signature]);

  useEffect(() => {
    if (!hydrated || !persistKey) return;
    saveChecked(persistKey, signature, checked);
  }, [checked, hydrated, persistKey, signature]);

  const groups = useMemo(() => {
    const base = groupShoppingList(items);
    // Unchecked first within each category (easier while shopping)
    return base.map((g) => ({
      ...g,
      items: [...g.items].sort((a, b) => {
        const ac = checked.has(a.naam) ? 1 : 0;
        const bc = checked.has(b.naam) ? 1 : 0;
        return ac - bc;
      }),
    }));
  }, [items, checked]);

  if (!weekMenu.length || items.length === 0) return null;

  const doneCount = items.filter((i) => checked.has(i.naam)).length;
  const allDone = doneCount === items.length && items.length > 0;

  const toggle = (naam: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(naam)) next.delete(naam);
      else next.add(naam);
      return next;
    });
  };

  const resetChecks = () => setChecked(new Set());

  const copyList = async () => {
    const text = groups
      .map(
        (g) =>
          `${g.categorie}\n` +
          g.items
            .map((i) => `${checked.has(i.naam) ? "☑" : "☐"} ${i.naam} — ${i.portieLabel}`)
            .join("\n")
      )
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Kopieer boodschappenlijst:", text);
    }
  };

  const isClient = variant === "client";
  const brand = "var(--client-brand, #22c55e)";

  return (
    <div
      className={isClient ? undefined : "page-card"}
      style={
        isClient
          ? {
              background: "#fff",
              borderRadius: "1rem",
              border: "1px solid #d1fae5",
              padding: "1.25rem",
              boxShadow: "0 1px 2px rgba(15,45,31,0.04)",
            }
          : undefined
      }
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "0.75rem",
          marginBottom: "0.85rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0 }}>
          <ShoppingCart size={20} style={{ color: brand, flexShrink: 0 }} />
          <div>
            <h2 style={{ margin: 0, fontSize: isClient ? "1.15rem" : undefined }}>
              Boodschappenlijst
            </h2>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
              Tik om af te vinken · {doneCount}/{items.length} gedaan
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {doneCount > 0 && (
            <button
              type="button"
              onClick={resetChecks}
              aria-label="Vinkjes wissen"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.55rem 0.75rem",
                minHeight: 44,
                borderRadius: "0.6rem",
                border: "1px solid #e2e8f0",
                background: "#fff",
                color: "#475569",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              <RotateCcw size={15} />
              Reset
            </button>
          )}
          <button
            type="button"
            className={isClient ? undefined : "btn btn--secondary"}
            onClick={copyList}
            style={
              isClient
                ? {
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.55rem 0.85rem",
                    minHeight: 44,
                    borderRadius: "0.6rem",
                    border: "1px solid #a7f3d0",
                    background: "#ecfdf5",
                    color: "#065f46",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }
                : { minHeight: 44 }
            }
          >
            {copied ? <Check size={16} /> : <ShoppingCart size={16} />}
            {copied ? "Gekopieerd" : "Kopieer"}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: "#e2e8f0",
          overflow: "hidden",
          marginBottom: "1rem",
        }}
        aria-hidden
      >
        <div
          style={{
            height: "100%",
            width: `${items.length ? (doneCount / items.length) * 100 : 0}%`,
            background: allDone ? "#16a34a" : brand,
            transition: "width 0.2s ease",
          }}
        />
      </div>

      {allDone && (
        <p
          style={{
            margin: "0 0 1rem",
            padding: "0.65rem 0.85rem",
            borderRadius: "0.6rem",
            background: "#ecfdf5",
            color: "#065f46",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          Alles afgevinkt — klaar met boodschappen.
        </p>
      )}

      <div style={{ display: "grid", gap: "1.1rem" }}>
        {groups.map((group) => {
          const remaining = group.items.filter((i) => !checked.has(i.naam)).length;
          if (remaining === 0 && group.items.every((i) => checked.has(i.naam))) {
            // Still show category so user can uncheck; collapsed label
          }
          return (
            <div key={group.categorie}>
              <h3
                style={{
                  margin: "0 0 0.35rem",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                {group.categorie}
                <span style={{ fontWeight: 500, marginLeft: "0.4rem", opacity: 0.8 }}>
                  ({remaining} open)
                </span>
              </h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {group.items.map((item) => {
                  const isDone = checked.has(item.naam);
                  return (
                    <li key={item.naam} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <button
                        type="button"
                        onClick={() => toggle(item.naam)}
                        aria-pressed={isDone}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.7rem 0.15rem",
                          minHeight: 48,
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          textAlign: "left",
                          WebkitTapHighlightColor: "transparent",
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 8,
                            flexShrink: 0,
                            border: isDone ? `2px solid ${brand}` : "2px solid #cbd5e1",
                            background: isDone ? brand : "#fff",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#0f2d1f",
                          }}
                        >
                          {isDone ? <Check size={16} strokeWidth={3} /> : null}
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <strong
                            style={{
                              display: "block",
                              fontSize: "0.98rem",
                              color: isDone ? "#94a3b8" : "#0f172a",
                              textDecoration: isDone ? "line-through" : "none",
                            }}
                          >
                            {item.naam}
                          </strong>
                        </span>
                        <span
                          style={{
                            color: isDone ? "#94a3b8" : "#475569",
                            whiteSpace: "nowrap",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            textDecoration: isDone ? "line-through" : "none",
                          }}
                        >
                          {item.portieLabel}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
