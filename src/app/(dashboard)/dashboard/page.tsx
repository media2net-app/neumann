import { prisma } from "@/lib/prisma";
import { Users, Euro, Star, Home, Users2, Laptop, UserCog, MapPin, Clock } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  // Fetch all data in parallel
  const [clients, sessions] = await Promise.all([
    prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      take: 10, // Top 10 voor dashboard
    }),
    prisma.session.findMany({
      where: {
        date: { gte: new Date() },
        status: "Gepland",
      },
      orderBy: { date: "asc" },
      take: 4,
      include: {
        client: true,
      },
    }),
  ]);

  // Calculate stats
  const totalClients = await prisma.client.count();
  const activeClients = await prisma.client.count({
    where: { status: "Actief" },
  });
  
  // Count sessions this year
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const totalSessions = await prisma.session.count({
    where: {
      date: { gte: startOfYear },
      status: "Voltooid",
    },
  });

  // Calculate revenue
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const startOfYearDate = new Date(now.getFullYear(), 0, 1);

  const thisMonthRevenue = await prisma.client.aggregate({
    _sum: { value: true },
    where: {
      createdAt: { gte: startOfMonth },
    },
  });

  const lastMonthRevenue = await prisma.client.aggregate({
    _sum: { value: true },
    where: {
      createdAt: {
        gte: startOfLastMonth,
        lte: endOfLastMonth,
      },
    },
  });

  const monthlyRevenue = thisMonthRevenue._sum.value || 0;
  const growth = lastMonthRevenue._sum.value || 0 > 0 
    ? (((monthlyRevenue - (lastMonthRevenue._sum.value || 0)) / (lastMonthRevenue._sum.value || 1)) * 100).toFixed(1)
    : "0";

  // Calculate average satisfaction rate
  const avgRating = await prisma.review.aggregate({
    _avg: { rating: true },
  });
  const satisfactionRate = avgRating._avg.rating?.toFixed(1) || "0";

  // Calculate services performance
  const serviceTypes = ["1-op-1 Training", "Duo Training", "Online coaching"];
  const services = await Promise.all(
    serviceTypes.map(async (type) => {
      const activeClientsForService = await prisma.client.count({
        where: {
          type,
          status: "Actief",
        },
      });

      // Calculate monthly revenue for this service type
      const serviceRevenue = await prisma.client.aggregate({
        _sum: { value: true },
        where: {
          type,
          status: "Actief",
          createdAt: { gte: startOfMonth },
        },
      });

      // Count sessions this month for this service type
      const sessionsThisMonth = await prisma.session.count({
        where: {
          type,
          date: { gte: startOfMonth },
        },
      });

      return {
        id: type === "1-op-1 Training" ? "1" : type === "Duo Training" ? "2" : "3",
        name: type === "1-op-1 Training" ? "1-op-1 Training aan huis" : type === "Duo Training" ? "Duo Personal Training" : "Online coaching & voeding",
        activeClients: activeClientsForService,
        monthlyRevenue: serviceRevenue._sum.value || 0,
        sessionsThisMonth,
      };
    })
  );

  return (
    <div className="dashboard-admin">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="client-breadcrumb">Neumann • Dashboard</div>
          <h1>Dashboard</h1>
          <p className="client-tagline">
            Overzicht van klanten, sessies, financiën en prestaties.
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="dashboard-metrics">
        <div className="dashboard-metric-card">
          <div className="dashboard-metric__icon">
            <Users size={32} />
          </div>
          <div className="dashboard-metric__content">
            <h3>{totalClients}</h3>
            <p>Klanten</p>
            <span className="dashboard-metric__sub">{activeClients} actief</span>
          </div>
        </div>
        <div className="dashboard-metric-card">
          <div className="dashboard-metric__icon">
            <UserCog size={32} />
          </div>
          <div className="dashboard-metric__content">
            <h3>{totalSessions}</h3>
            <p>Sessies</p>
            <span className="dashboard-metric__sub">Dit jaar</span>
          </div>
        </div>
        <div className="dashboard-metric-card dashboard-metric-card--primary">
          <div className="dashboard-metric__icon">
            <Euro size={32} />
          </div>
          <div className="dashboard-metric__content">
            <h3>€{monthlyRevenue.toLocaleString("nl-NL")}</h3>
            <p>Maandomzet</p>
            <span className="dashboard-metric__sub">+{growth}% vs vorige maand</span>
          </div>
        </div>
        <div className="dashboard-metric-card">
          <div className="dashboard-metric__icon">
            <Star size={32} />
          </div>
          <div className="dashboard-metric__content">
            <h3>{satisfactionRate}</h3>
            <p>Tevredenheid</p>
            <span className="dashboard-metric__sub">Gemiddeld</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Klanten/Trajecten Overzicht */}
        <section className="dashboard-card dashboard-card--large">
          <div className="dashboard-card__header">
            <h2>Klanten & Trajecten</h2>
            <Link href="/clients" className="dashboard-card__link">
              Bekijk alle →
            </Link>
          </div>
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Klant</th>
                  <th>Doel</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Voortgang</th>
                  <th>Waarde</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td data-label="Klant">
                      <strong>{client.name}</strong>
                      <span className="dashboard-table__meta">{client.email}</span>
                    </td>
                    <td data-label="Doel">{client.goal || "-"}</td>
                    <td data-label="Status">
                      <span className={`dashboard-badge dashboard-badge--${client.status.toLowerCase()}`}>
                        {client.status}
                      </span>
                    </td>
                    <td data-label="Type">{client.type}</td>
                    <td data-label="Voortgang">
                      <div className="dashboard-progress">
                        <div className="dashboard-progress__bar" style={{ width: `${client.progress}%` }}></div>
                        <span>{client.progress}%</span>
                      </div>
                      <span className="dashboard-table__meta">{client.sessionsCompleted}/{client.totalSessions} sessies</span>
                    </td>
                    <td data-label="Waarde">€{client.value.toLocaleString("nl-NL")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Aankomende Sessies */}
        <section className="dashboard-card">
          <div className="dashboard-card__header">
            <h2>Aankomende Sessies</h2>
            <Link href="/agenda" className="dashboard-card__link">
              Bekijk agenda →
            </Link>
          </div>
          <div className="dashboard-sessions">
            {sessions.map((session) => (
              <div key={session.id} className="dashboard-session">
                <div className="dashboard-session__date">
                  <span className="dashboard-session__day">{session.date.toLocaleDateString("nl-NL", { day: "numeric" })}</span>
                  <span className="dashboard-session__month">{session.date.toLocaleDateString("nl-NL", { month: "short" })}</span>
                </div>
                <div className="dashboard-session__content">
                  <h4>{session.client.name}</h4>
                  <p>{session.type}</p>
                  <span className="dashboard-session__meta">
                    {session.location && (
                      <>
                        <MapPin size={12} />
                        {session.location} • 
                      </>
                    )}
                    {session.time && (
                      <>
                        <Clock size={12} />
                        {session.time}
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <p style={{ padding: "1rem", color: "#64748b", textAlign: "center" }}>
                Geen aankomende sessies
              </p>
            )}
          </div>
        </section>

        {/* Diensten Performance */}
        <section className="dashboard-card">
          <div className="dashboard-card__header">
            <h2>Diensten Performance</h2>
          </div>
          <div className="dashboard-services-grid">
            {services.map((service) => {
              const iconMap: Record<string, React.ReactNode> = {
                "1": <Home size={24} />,
                "2": <Users2 size={24} />,
                "3": <Laptop size={24} />,
              };
              return (
                <div key={service.id} className="dashboard-service-card">
                  <div className="dashboard-service-card__icon">{iconMap[service.id]}</div>
                  <h4>{service.name}</h4>
                  <div className="dashboard-service-card__stats">
                    <div>
                      <span className="dashboard-service-card__value">{service.activeClients}</span>
                      <span className="dashboard-service-card__label">Actieve klanten</span>
                    </div>
                    <div>
                      <span className="dashboard-service-card__value">€{service.monthlyRevenue.toLocaleString("nl-NL")}</span>
                      <span className="dashboard-service-card__label">Maandomzet</span>
                    </div>
                    <div>
                      <span className="dashboard-service-card__value">{service.sessionsThisMonth}</span>
                      <span className="dashboard-service-card__label">Sessies deze maand</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
