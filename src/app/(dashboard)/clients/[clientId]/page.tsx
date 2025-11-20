import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, Target, User, Clock, CheckCircle2, UtensilsCrossed, Star, Euro } from "lucide-react";
import Link from "next/link";

type ClientDetailPageProps = {
  params: Promise<{ clientId: string }>;
};

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const resolvedParams = await params;
  const clientId = resolvedParams.clientId;

  // Fetch client with all related data
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      sessions: {
        orderBy: { date: "desc" },
        take: 10,
      },
      nutritionPlans: {
        orderBy: { aangemaakt: "desc" },
      },
      reviews: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!client) {
    notFound();
  }

  // Calculate stats
  const upcomingSessions = client.sessions.filter(
    (s) => s.date >= new Date() && s.status === "Gepland"
  );
  const completedSessions = client.sessions.filter(
    (s) => s.status === "Voltooid"
  );
  const activeNutritionPlans = client.nutritionPlans.filter(
    (p) => p.status === "Actief"
  );

  return (
    <div className="page-admin">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="client-breadcrumb">
            <Link href="/clients" style={{ textDecoration: "none", color: "inherit" }}>
              Neumann • Klanten
            </Link>
            {" • "}
            {client.name}
          </div>
          <h1>{client.name}</h1>
          <p className="client-tagline">
            {client.type} • <span className={`dashboard-badge dashboard-badge--${client.status.toLowerCase()}`}>{client.status}</span>
          </p>
        </div>
        <div className="page-header__actions">
          <Link href={`/clients/${clientId}/edit`} className="btn btn--primary">
            <Edit size={16} />
            Bewerken
          </Link>
          <Link href="/clients" className="btn btn--secondary">
            <ArrowLeft size={16} />
            Terug
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="page-stats">
        <div className="page-stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <Target size={20} color="var(--client-brand)" />
          </div>
          <h3>{client.progress}%</h3>
          <p>Voortgang</p>
          <p style={{ margin: "0.25rem 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
            {client.sessionsCompleted}/{client.totalSessions} sessies
          </p>
        </div>
        <div className="page-stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <Calendar size={20} color="var(--client-brand)" />
          </div>
          <h3>{upcomingSessions.length}</h3>
          <p>Aankomende Sessies</p>
          <p style={{ margin: "0.25rem 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
            {completedSessions.length} voltooid
          </p>
        </div>
        <div className="page-stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <UtensilsCrossed size={20} color="var(--client-brand)" />
          </div>
          <h3>{activeNutritionPlans.length}</h3>
          <p>Actieve Voedingsplannen</p>
          <p style={{ margin: "0.25rem 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
            {client.nutritionPlans.length} totaal
          </p>
        </div>
        <div className="page-stat-card page-stat-card--primary">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <Euro size={20} color="#ffffff" />
          </div>
          <h3>€{client.value.toLocaleString("nl-NL")}</h3>
          <p>Totale Waarde</p>
          <p style={{ margin: "0.25rem 0 0", color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>
            {client.package || "Geen pakket"}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: "1.5rem" }}>
        {/* Main Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Client Details */}
          <section className="dashboard-card">
            <div className="dashboard-card__header">
              <h2>Contactgegevens</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "1rem", background: "var(--client-surface)", borderRadius: "0.75rem", border: "1px solid var(--client-border)" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "40px",
                    height: "40px",
                    background: "rgba(97, 196, 33, 0.1)",
                    borderRadius: "0.5rem",
                    flexShrink: 0,
                  }}
                >
                  <User size={20} style={{ color: "var(--client-brand)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: 500 }}>Naam</div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{client.name}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "1rem", background: "var(--client-surface)", borderRadius: "0.75rem", border: "1px solid var(--client-border)" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "40px",
                    height: "40px",
                    background: "rgba(97, 196, 33, 0.1)",
                    borderRadius: "0.5rem",
                    flexShrink: 0,
                  }}
                >
                  <Mail size={20} style={{ color: "var(--client-brand)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: 500 }}>E-mail</div>
                  <a
                    href={`mailto:${client.email}`}
                    style={{ color: "var(--client-brand)", textDecoration: "none", fontWeight: 600, fontSize: "0.95rem" }}
                  >
                    {client.email}
                  </a>
                </div>
              </div>
              {client.phone && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "1rem", background: "var(--client-surface)", borderRadius: "0.75rem", border: "1px solid var(--client-border)" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "40px",
                      height: "40px",
                      background: "rgba(97, 196, 33, 0.1)",
                      borderRadius: "0.5rem",
                      flexShrink: 0,
                    }}
                  >
                    <Phone size={20} style={{ color: "var(--client-brand)" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: 500 }}>Telefoon</div>
                    <a
                      href={`tel:${client.phone}`}
                      style={{ color: "var(--client-brand)", textDecoration: "none", fontWeight: 600, fontSize: "0.95rem" }}
                    >
                      {client.phone}
                    </a>
                  </div>
                </div>
              )}
              {client.goal && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "1rem", background: "var(--client-surface)", borderRadius: "0.75rem", border: "1px solid var(--client-border)", gridColumn: client.phone ? "span 1" : "span 2" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "40px",
                      height: "40px",
                      background: "rgba(97, 196, 33, 0.1)",
                      borderRadius: "0.5rem",
                      flexShrink: 0,
                    }}
                  >
                    <Target size={20} style={{ color: "var(--client-brand)" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: 500 }}>Doel</div>
                    <div style={{ fontWeight: 500, fontSize: "0.95rem" }}>{client.goal}</div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Sessions */}
          <section className="dashboard-card">
            <div className="dashboard-card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2>Sessies ({client.sessions.length})</h2>
                <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                  {upcomingSessions.length} aankomend • {completedSessions.length} voltooid
                </p>
              </div>
            </div>
            <div className="dashboard-table">
              <table>
                <thead>
                  <tr>
                    <th>Datum</th>
                    <th>Tijd</th>
                    <th>Type</th>
                    <th>Locatie</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {client.sessions.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                        Nog geen sessies
                      </td>
                    </tr>
                  ) : (
                    client.sessions.map((session) => (
                      <tr key={session.id}>
                        <td>{session.date.toLocaleDateString("nl-NL")}</td>
                        <td>{session.time || "-"}</td>
                        <td>{session.type}</td>
                        <td>{session.location || "-"}</td>
                        <td>
                          <span className={`dashboard-badge dashboard-badge--${session.status.toLowerCase()}`}>
                            {session.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Nutrition Plans */}
          <section className="dashboard-card">
            <div className="dashboard-card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2>Voedingsplannen ({client.nutritionPlans.length})</h2>
                <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                  {activeNutritionPlans.length} actief
                </p>
              </div>
              <Link href={`/voeding/nieuw?clientId=${clientId}`} className="btn btn--secondary">
                Nieuw Plan
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {client.nutritionPlans.length === 0 ? (
                <p style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                  Nog geen voedingsplannen
                </p>
              ) : (
                client.nutritionPlans.map((plan) => (
                  <Link
                    key={plan.id}
                    href={`/voeding/${plan.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div
                      className="dashboard-card dashboard-card--hoverable"
                      style={{
                        padding: "1rem",
                        background: "var(--client-surface)",
                        borderRadius: "0.75rem",
                        border: "1px solid var(--client-border)",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>{plan.name}</h3>
                            <span className={`dashboard-badge dashboard-badge--${plan.status.toLowerCase()}`} style={{ fontSize: "0.75rem" }}>
                              {plan.status}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.25rem" }}>{plan.type}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--client-brand)", marginBottom: "0.25rem" }}>
                            {plan.kcal} kcal
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "1rem", fontSize: "0.8125rem", color: "#64748b" }}>
                        {plan.protein && <span>Eiwit: {plan.protein}g</span>}
                        {plan.carbs && <span>Koolhydraten: {plan.carbs}g</span>}
                        {plan.fats && <span>Vetten: {plan.fats}g</span>}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Quick Stats */}
          <section className="dashboard-card">
            <div className="dashboard-card__header">
              <h3 style={{ fontSize: "1rem", margin: 0 }}>Snel Overzicht</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "var(--client-surface)", borderRadius: "0.5rem" }}>
                <span style={{ fontSize: "0.875rem", color: "#64748b" }}>Startdatum</span>
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  {client.startDate.toLocaleDateString("nl-NL")}
                </span>
              </div>
              {client.nextSession && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "var(--client-surface)", borderRadius: "0.5rem" }}>
                  <span style={{ fontSize: "0.875rem", color: "#64748b" }}>Volgende sessie</span>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    {client.nextSession.toLocaleDateString("nl-NL")}
                  </span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "var(--client-surface)", borderRadius: "0.5rem" }}>
                <span style={{ fontSize: "0.875rem", color: "#64748b" }}>Type</span>
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{client.type}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "rgba(97, 196, 33, 0.1)", borderRadius: "0.5rem", border: "1px solid rgba(97, 196, 33, 0.2)" }}>
                <span style={{ fontSize: "0.875rem", color: "#64748b" }}>Status</span>
                <span className={`dashboard-badge dashboard-badge--${client.status.toLowerCase()}`} style={{ fontSize: "0.75rem" }}>
                  {client.status}
                </span>
              </div>
            </div>
          </section>

          {/* Reviews */}
          {client.reviews.length > 0 && (
            <section className="dashboard-card">
              <div className="dashboard-card__header">
                <h3 style={{ fontSize: "1rem", margin: 0 }}>Reviews</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {client.reviews.map((review) => (
                  <div
                    key={review.id}
                    style={{
                      padding: "0.875rem",
                      background: "var(--client-surface)",
                      borderRadius: "0.75rem",
                      border: "1px solid var(--client-border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>{review.name}</h4>
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} size={14} fill="var(--client-brand)" color="var(--client-brand)" />
                        ))}
                      </div>
                    </div>
                    <p style={{ margin: "0 0 0.5rem", fontSize: "0.875rem", lineHeight: 1.6 }}>"{review.text}"</p>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {review.date.toLocaleDateString("nl-NL")}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

