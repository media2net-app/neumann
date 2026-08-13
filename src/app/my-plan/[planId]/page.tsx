"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { useParams } from "next/navigation";
import type { DagMenu } from "@/lib/weekmenu";
import { DAGEN } from "@/lib/weekmenu";

type PlanResponse = {
  id: string;
  naam: string;
  type: string;
  calorieën: number;
  eiwit: number;
  koolhydraten: number;
  vetten: number;
  klantNaam: string;
  weekMenu: DagMenu[];
  notes: string;
};

export default function MyPlanPage() {
  const params = useParams();
  const planId = params.planId as string;

  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "notfound" | "error">("loading");
  const [actieveDag, setActieveDag] = useState<string>(DAGEN[0]);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch(`/api/voeding/${planId}`);
      if (res.status === 404) {
        setStatus("notfound");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const data = (await res.json()) as PlanResponse;
      setPlan(data);
      if (data.weekMenu?.length) {
        setActieveDag(data.weekMenu[0].dag);
      }
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [planId]);

  useEffect(() => {
    load();
  }, [load]);

  if (status === "notfound") {
    return (
      <div data-client="neumann" style={styles.shell}>
        <div style={styles.inner}>
          <header style={styles.header}>
            <p style={styles.brand}>Neumann</p>
            <h1 style={styles.title}>Plan niet gevonden</h1>
          </header>
          <div style={styles.emptyCard}>
            <p style={{ margin: 0, fontWeight: 600 }}>Deze link is niet (meer) geldig</p>
            <p style={styles.muted}>
              Vraag je coach om een nieuwe persoonlijke link naar je voedingsplan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div data-client="neumann" style={styles.shell}>
        <div style={styles.inner}>
          <p style={styles.muted}>Je voedingsplan wordt geladen…</p>
        </div>
      </div>
    );
  }

  if (status === "error" || !plan) {
    return (
      <div data-client="neumann" style={styles.shell}>
        <div style={styles.inner}>
          <header style={styles.header}>
            <p style={styles.brand}>Neumann</p>
            <h1 style={styles.title}>Jouw voedingsplan</h1>
          </header>
          <div style={styles.emptyCard}>
            <p style={{ margin: 0, fontWeight: 600 }}>Er ging iets mis</p>
            <p style={styles.muted}>
              We konden je plan nu niet ophalen. Controleer je verbinding en probeer opnieuw.
            </p>
            <button type="button" onClick={load} style={styles.button}>
              Opnieuw proberen
            </button>
          </div>
        </div>
      </div>
    );
  }

  const geselecteerdeDag =
    plan.weekMenu.find((d) => d.dag === actieveDag) || plan.weekMenu[0];

  return (
    <div data-client="neumann" style={styles.shell}>
      <style>{`
        @media (min-width: 640px) {
          .my-plan-day-full { display: inline !important; }
          .my-plan-day-short { display: none !important; }
          .my-plan-macros { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
        }
      `}</style>
      <div style={styles.inner}>
        <header style={styles.header}>
          <p style={styles.brand}>Neumann</p>
          <h1 style={styles.title}>Jouw voedingsplan</h1>
          <p style={styles.subtitle}>
            Voor {plan.klantNaam}
            {plan.naam ? ` · ${plan.naam}` : ""}
          </p>
        </header>

        <section className="my-plan-macros" style={styles.macroGrid}>
          <div style={styles.macroCard}>
            <span style={styles.macroLabel}>Calorieën</span>
            <strong style={{ ...styles.macroValue, color: "var(--client-brand)" }}>
              {plan.calorieën} kcal
            </strong>
          </div>
          <div style={styles.macroCard}>
            <span style={styles.macroLabel}>Eiwit</span>
            <strong style={{ ...styles.macroValue, color: "#3b82f6" }}>{plan.eiwit}g</strong>
          </div>
          <div style={styles.macroCard}>
            <span style={styles.macroLabel}>Koolhydraten</span>
            <strong style={{ ...styles.macroValue, color: "#10b981" }}>{plan.koolhydraten}g</strong>
          </div>
          <div style={styles.macroCard}>
            <span style={styles.macroLabel}>Vetten</span>
            <strong style={{ ...styles.macroValue, color: "#f59e0b" }}>{plan.vetten}g</strong>
          </div>
        </section>

        {!geselecteerdeDag ? (
          <div style={styles.emptyCard}>
            <p style={{ margin: 0, fontWeight: 600 }}>Nog geen weekmenu</p>
            <p style={styles.muted}>
              Je coach is nog bezig met dit plan. Kom later terug of neem contact op met Neumann.
            </p>
          </div>
        ) : (
          <>
            <div style={styles.dayTabs} role="tablist" aria-label="Dagen van de week">
              {DAGEN.map((dag) => {
                const active = actieveDag === dag;
                return (
                  <button
                    key={dag}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActieveDag(dag)}
                    style={{
                      ...styles.dayTab,
                      background: active ? "var(--client-brand)" : "transparent",
                      color: active ? "#0f2d1f" : "#64748b",
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    <span className="my-plan-day-full" style={{ display: "none" }}>
                      {dag}
                    </span>
                    <span className="my-plan-day-short">{dag.slice(0, 2)}</span>
                  </button>
                );
              })}
            </div>

            <div style={styles.daySummary}>
              <h2 style={{ margin: 0, fontSize: "1.25rem" }}>{geselecteerdeDag.dag}</h2>
              <p style={{ ...styles.muted, margin: "0.35rem 0 0" }}>
                {geselecteerdeDag.dagTotaal.kcal} kcal · E {geselecteerdeDag.dagTotaal.eiwit}g · K{" "}
                {geselecteerdeDag.dagTotaal.koolhydraten}g · V {geselecteerdeDag.dagTotaal.vetten}g
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {geselecteerdeDag.maaltijden.map((maaltijd) => (
                <article key={maaltijd.id} style={styles.mealCard}>
                  <div style={styles.mealHeader}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{maaltijd.naam}</h3>
                      <p style={{ ...styles.muted, margin: "0.2rem 0 0" }}>{maaltijd.tijd}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, color: "var(--client-brand)" }}>
                        {maaltijd.totaleKcal} kcal
                      </div>
                      <div style={{ ...styles.muted, fontSize: "0.8rem" }}>
                        E {maaltijd.eiwit}g · K {maaltijd.koolhydraten}g · V {maaltijd.vetten}g
                      </div>
                    </div>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Ingrediënt</th>
                          <th style={styles.th}>Portie</th>
                          <th style={styles.th}>Kcal</th>
                          <th style={styles.th}>E</th>
                          <th style={styles.th}>K</th>
                          <th style={styles.th}>V</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maaltijd.ingrediënten.map((ing, idx) => (
                          <tr key={`${maaltijd.id}-${ing.naam}-${idx}`}>
                            <td style={styles.td}>
                              <strong>{ing.naam}</strong>
                            </td>
                            <td style={styles.td}>{ing.portie}</td>
                            <td style={styles.td}>{ing.kcal}</td>
                            <td style={styles.td}>{ing.eiwit}</td>
                            <td style={styles.td}>{ing.koolhydraten}</td>
                            <td style={styles.td}>{ing.vetten}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {maaltijd.bereidingswijze?.trim() && (
                    <div style={styles.prep}>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: "#64748b",
                          marginBottom: "0.35rem",
                        }}
                      >
                        Bereidingswijze
                      </div>
                      <p style={{ margin: 0, fontSize: "0.9rem", color: "#334155", lineHeight: 1.5 }}>
                        {maaltijd.bereidingswijze}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </>
        )}

        <footer style={styles.footer}>
          <p style={{ margin: 0 }}>Neumann Personal Training</p>
        </footer>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  shell: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 40%)",
    color: "#0f2d1f",
  },
  inner: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "1.5rem 1rem 3rem",
  },
  header: {
    marginBottom: "1.5rem",
  },
  brand: {
    margin: 0,
    fontSize: "0.85rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "var(--client-brand)",
  },
  title: {
    margin: "0.35rem 0 0",
    fontSize: "1.75rem",
    fontWeight: 700,
  },
  subtitle: {
    margin: "0.4rem 0 0",
    color: "#64748b",
    fontSize: "0.95rem",
  },
  muted: {
    color: "#64748b",
    fontSize: "0.9rem",
    lineHeight: 1.5,
  },
  macroGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "0.75rem",
    marginBottom: "1.25rem",
  },
  macroCard: {
    background: "#fff",
    border: "1px solid var(--client-border)",
    borderRadius: "0.75rem",
    padding: "0.9rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  macroLabel: {
    fontSize: "0.8rem",
    color: "#64748b",
  },
  macroValue: {
    fontSize: "1.2rem",
  },
  dayTabs: {
    display: "flex",
    gap: "0.35rem",
    overflowX: "auto",
    paddingBottom: "0.5rem",
    marginBottom: "1rem",
    borderBottom: "1px solid var(--client-border)",
    WebkitOverflowScrolling: "touch",
  },
  dayTab: {
    flex: "1 0 auto",
    border: "none",
    borderRadius: "0.5rem",
    padding: "0.55rem 0.65rem",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  daySummary: {
    marginBottom: "1rem",
  },
  mealCard: {
    background: "#fff",
    border: "1px solid var(--client-border)",
    borderRadius: "0.75rem",
    padding: "1rem",
  },
  mealHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    marginBottom: "0.75rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.85rem",
  },
  th: {
    textAlign: "left",
    padding: "0.4rem 0.35rem",
    borderBottom: "1px solid var(--client-border)",
    color: "#64748b",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "0.45rem 0.35rem",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "top",
  },
  prep: {
    marginTop: "0.75rem",
    padding: "0.75rem 0.9rem",
    background: "var(--client-surface)",
    borderRadius: "0.5rem",
    border: "1px solid var(--client-border)",
  },
  emptyCard: {
    background: "#fff",
    border: "1px solid var(--client-border)",
    borderRadius: "0.75rem",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  button: {
    alignSelf: "flex-start",
    background: "var(--client-brand)",
    color: "#0f2d1f",
    border: "none",
    borderRadius: "0.5rem",
    padding: "0.65rem 1rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  footer: {
    marginTop: "2.5rem",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "0.8rem",
  },
};
