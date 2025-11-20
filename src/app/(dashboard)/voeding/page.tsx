import { getNeumannClient } from "@/lib/clients";
import { UtensilsCrossed, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/DeleteButton";
import { deleteNutritionPlan } from "./nieuw/actions";

export default async function VoedingPage() {
  const client = getNeumannClient();

  // Fetch all nutrition plans with their clients
  const nutritionPlans = await prisma.nutritionPlan.findMany({
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      laatsteUpdate: "desc",
    },
  });

  // Transform data to match the expected format
  const klantenMetPlannen = nutritionPlans.map((plan) => ({
    klantId: plan.clientId,
    klantNaam: plan.client.name,
    email: plan.client.email,
    voedingsplan: {
      id: plan.id,
      naam: plan.name,
      type: plan.type,
      kcal: plan.kcal,
      status: plan.status,
      aangemaakt: plan.aangemaakt.toISOString().split("T")[0],
      laatsteUpdate: plan.laatsteUpdate.toISOString().split("T")[0],
    },
  }));

  // For now, we'll keep adviezen as empty or remove the section
  // TODO: Add adviezen to database schema if needed
  const adviezen: any[] = [];

  const stats = {
    totalKlanten: await prisma.client.count(),
    actievePlannen: await prisma.nutritionPlan.count({
      where: { status: "Actief" },
    }),
    openstaandeAdviezen: 0, // Placeholder until adviezen are added to database
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <h1>Voedingsplannen</h1>
        <Link href="/voeding/nieuw" className="btn btn--primary">
          <Plus size={16} />
          Nieuw Plan
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="page-stats">
        <div className="page-stat-card">
          <h3>{stats.totalKlanten}</h3>
          <p>Totaal Klanten</p>
        </div>
        <div className="page-stat-card page-stat-card--active">
          <h3>{stats.actievePlannen}</h3>
          <p>Actieve Plannen</p>
        </div>
        <div className="page-stat-card">
          <h3>{stats.openstaandeAdviezen}</h3>
          <p>Openstaande Adviezen</p>
        </div>
      </div>

      {/* Klanten met Voedingsplannen */}
      <div className="page-section">
        <h2 className="page-section__title">Klanten & Voedingsplannen</h2>
        <div className="page-card">
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Klant</th>
                  <th>Voedingsplan</th>
                  <th>Type</th>
                  <th>Kcal</th>
                  <th>Status</th>
                  <th>Laatste Update</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {klantenMetPlannen.map((item) => (
                  <tr key={item.klantId} className="dashboard-table__row--clickable">
                    <td>
                      <Link href={`/voeding/${item.voedingsplan.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <strong>{item.klantNaam}</strong>
                        <span className="dashboard-table__meta">{item.email}</span>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/voeding/${item.voedingsplan.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        {item.voedingsplan.naam}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/voeding/${item.voedingsplan.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <span className="dashboard-table__type">{item.voedingsplan.type}</span>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/voeding/${item.voedingsplan.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        {item.voedingsplan.kcal} kcal
                      </Link>
                    </td>
                    <td>
                      <Link href={`/voeding/${item.voedingsplan.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <span className={`dashboard-badge dashboard-badge--${item.voedingsplan.status.toLowerCase()}`}>
                          {item.voedingsplan.status}
                        </span>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/voeding/${item.voedingsplan.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        {new Date(item.voedingsplan.laatsteUpdate).toLocaleDateString("nl-NL")}
                      </Link>
                    </td>
                    <td>
                      <div className="dashboard-actions">
                        <Link href={`/voeding/${item.voedingsplan.id}`} className="dashboard-action-btn" title="Bekijken">
                          <FileText size={16} />
                        </Link>
                        <button className="dashboard-action-btn" title="Bewerken">
                          <UtensilsCrossed size={16} />
                        </button>
                        <DeleteButton
                          onDelete={() => deleteNutritionPlan(item.voedingsplan.id)}
                          itemName={item.voedingsplan.naam}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recente Adviezen - Temporarily hidden until adviezen are added to database */}
      {adviezen.length > 0 && (
        <div className="page-section">
          <h2 className="page-section__title">Recente Voedingsadviezen</h2>
          <div className="page-card">
            <div className="dashboard-table">
              <table>
                <thead>
                  <tr>
                    <th>Klant</th>
                    <th>Onderwerp</th>
                    <th>Datum</th>
                    <th>Status</th>
                    <th>Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {adviezen.map((advies) => (
                    <tr key={advies.id}>
                      <td>
                        <strong>{advies.klant}</strong>
                      </td>
                      <td>{advies.onderwerp}</td>
                      <td>{new Date(advies.datum).toLocaleDateString("nl-NL")}</td>
                      <td>
                        <span className={`dashboard-badge dashboard-badge--${advies.status.toLowerCase().replace(" ", "-")}`}>
                          {advies.status}
                        </span>
                      </td>
                      <td>
                        <div className="dashboard-actions">
                          <button className="dashboard-action-btn" title="Bekijken">
                            <FileText size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

