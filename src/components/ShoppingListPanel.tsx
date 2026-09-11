"use client";

import { useMemo, useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import type { DagMenu } from "@/lib/weekmenu";
import { buildShoppingList, groupShoppingList } from "@/lib/shopping-list";

type Props = {
  weekMenu: DagMenu[];
  /** Compact styling for client portal */
  variant?: "coach" | "client";
};

export function ShoppingListPanel({ weekMenu, variant = "coach" }: Props) {
  const [copied, setCopied] = useState(false);
  const items = useMemo(() => buildShoppingList(weekMenu), [weekMenu]);
  const groups = useMemo(() => groupShoppingList(items), [items]);

  if (!weekMenu.length || items.length === 0) return null;

  const copyList = async () => {
    const text = groups
      .map(
        (g) =>
          `${g.categorie}\n` +
          g.items.map((i) => `• ${i.naam} — ${i.portieLabel}`).join("\n")
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
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <ShoppingCart size={20} style={{ color: "var(--client-brand)" }} />
          <div>
            <h2 style={{ margin: 0, fontSize: isClient ? "1.15rem" : undefined }}>
              Boodschappenlijst
            </h2>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
              Hele week samengevoegd · {items.length} producten
            </p>
          </div>
        </div>
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
                  padding: "0.5rem 0.85rem",
                  borderRadius: "0.6rem",
                  border: "1px solid #a7f3d0",
                  background: "#ecfdf5",
                  color: "#065f46",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }
              : undefined
          }
        >
          {copied ? <Check size={16} /> : <ShoppingCart size={16} />}
          {copied ? "Gekopieerd" : "Kopieer lijst"}
        </button>
      </div>

      <div style={{ display: "grid", gap: "1.25rem" }}>
        {groups.map((group) => (
          <div key={group.categorie}>
            <h3
              style={{
                margin: "0 0 0.5rem",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            >
              {group.categorie}
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {group.items.map((item) => (
                <li
                  key={item.naam}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    padding: "0.45rem 0",
                    borderBottom: "1px solid #f1f5f9",
                    fontSize: "0.95rem",
                  }}
                >
                  <span>
                    <strong>{item.naam}</strong>
                  </span>
                  <span style={{ color: "#475569", whiteSpace: "nowrap" }}>{item.portieLabel}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
