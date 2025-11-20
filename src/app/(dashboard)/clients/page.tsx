import { getNeumannClient } from "@/lib/clients";
import { prisma } from "@/lib/prisma";
import { Edit, Calendar, Plus, Mail, Phone, Target } from "lucide-react";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import { deleteClient } from "./actions";

export default async function ClientsPage() {
  const client = getNeumannClient();
  
  // Haal alle klanten op uit de database
  const allClients = await prisma.client.findMany({
    orderBy: { name: "asc" },
  });

  // Bereken statistieken
  const stats = {
    total: allClients.length,
    active: allClients.filter((c) => c.status === "Actief").length,
    completed: allClients.filter((c) => c.status === "Voltooid").length,
    totalValue: allClients.reduce((sum, c) => sum + c.value, 0),
    avgProgress: allClients.length > 0
      ? Math.round(
          allClients.reduce((sum, c) => sum + c.progress, 0) / allClients.length
        )
      : 0,
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <h1>Klanten & Trajecten</h1>
        </div>
        <Link href="/clients/nieuw" className="btn btn--primary">
          <Plus size={16} />
          Nieuwe Klant
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="page-stats">
        <div className="page-stat-card">
          <h3>{stats.total}</h3>
          <p>Totaal Klanten</p>
        </div>
        <div className="page-stat-card page-stat-card--active">
          <h3>{stats.active}</h3>
          <p>Actief</p>
        </div>
        <div className="page-stat-card page-stat-card--completed">
          <h3>{stats.completed}</h3>
          <p>Voltooid</p>
        </div>
        <div className="page-stat-card">
          <h3>{stats.avgProgress}%</h3>
          <p>Gem. Voortgang</p>
        </div>
        <div className="page-stat-card page-stat-card--primary">
          <h3>€{stats.totalValue.toLocaleString("nl-NL")}</h3>
          <p>Totale Waarde</p>
        </div>
      </div>

      {/* Filters */}
      <div className="page-filters">
        <select className="page-filter">
          <option>Alle statussen</option>
          <option>Actief</option>
          <option>Voltooid</option>
          <option>Inactief</option>
        </select>
        <select className="page-filter">
          <option>Alle types</option>
          <option>1-op-1 Training</option>
          <option>Duo Training</option>
          <option>Online coaching</option>
        </select>
        <select className="page-filter">
          <option>Alle pakketten</option>
          <option>Revalidatie pakket</option>
          <option>Performance pakket</option>
          <option>Online pakket</option>
          <option>Duo pakket</option>
        </select>
        <input
          type="search"
          placeholder="Zoek klanten..."
          className="page-search"
        />
      </div>

      {/* Clients Cards Grid */}
      {allClients.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "#64748b", marginBottom: "1rem" }}>Nog geen klanten toegevoegd</p>
          <Link href="/clients/nieuw" className="btn btn--primary">
            <Plus size={16} />
            Eerste Klant Toevoegen
          </Link>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {allClients.map((clientItem) => (
            <Link
              key={clientItem.id}
              href={`/clients/${clientItem.id}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div 
                className="dashboard-card dashboard-card--hoverable"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {/* Card Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--client-border)'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 600, 
                      margin: 0,
                      marginBottom: '0.25rem'
                    }}>
                      {clientItem.name}
                    </h3>
                    <span className={`dashboard-badge dashboard-badge--${clientItem.status.toLowerCase()}`}>
                      {clientItem.status}
                    </span>
                  </div>
                  <div className="dashboard-actions" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/clients/${clientItem.id}`}
                      className="dashboard-action-btn" 
                      title="Bekijken"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Edit size={16} />
                    </Link>
                    <Link
                      href={`/clients/${clientItem.id}`}
                      className="dashboard-action-btn" 
                      title="Agenda"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Calendar size={16} />
                    </Link>
                    <DeleteButton
                      onDelete={() => deleteClient(clientItem.id)}
                      itemName={clientItem.name}
                      redirectPath="/clients"
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <Mail size={14} style={{ color: '#64748b' }} />
                    <a 
                      href={`mailto:${clientItem.email}`} 
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      {clientItem.email}
                    </a>
                  </div>
                  {clientItem.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <Phone size={14} style={{ color: '#64748b' }} />
                      <span>{clientItem.phone}</span>
                    </div>
                  )}
                </div>

                {/* Goal */}
                {clientItem.goal && (
                  <div style={{ 
                    padding: '0.75rem', 
                    background: 'var(--client-surface)', 
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Target size={16} style={{ color: 'var(--client-brand)' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{clientItem.goal}</span>
                  </div>
                )}

                {/* Progress Bar */}
                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>
                      Voortgang
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {clientItem.progress}%
                    </span>
                  </div>
                  <div className="dashboard-progress" style={{ height: '8px' }}>
                    <div 
                      className="dashboard-progress__bar" 
                      style={{ 
                        width: `${clientItem.progress}%`,
                        height: '100%'
                      }}
                    ></div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginTop: '0.5rem',
                    fontSize: '0.85rem',
                    color: '#64748b'
                  }}>
                    <span>{clientItem.sessionsCompleted} van {clientItem.totalSessions} sessies voltooid</span>
                    <span>{clientItem.totalSessions - clientItem.sessionsCompleted} resterend</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '0.75rem',
                  marginTop: '0.5rem'
                }}>
                  <div style={{
                    padding: '0.75rem',
                    background: 'var(--client-surface)',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Type</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{clientItem.type}</span>
                  </div>
                  {clientItem.package && (
                    <div style={{
                      padding: '0.75rem',
                      background: 'var(--client-surface)',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Pakket</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{clientItem.package}</span>
                    </div>
                  )}
                </div>

                {/* Footer Info */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--client-border)',
                  marginTop: 'auto'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Startdatum</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                      {clientItem.startDate.toLocaleDateString("nl-NL")}
                    </span>
                  </div>
                  {clientItem.nextSession && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Volgende sessie</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--client-brand)' }}>
                        {clientItem.nextSession.toLocaleDateString("nl-NL")}
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Waarde</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--client-brand)' }}>
                      €{clientItem.value.toLocaleString("nl-NL")}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
