"use client";

import { useMemo, useState, useTransition } from "react";
import type { ClientConfig } from "@/lib/clients";

type LoginFormProps = {
  clients: readonly ClientConfig[];
  loginAction: (clientId: string) => Promise<void>;
};

const ADMIN_EMAIL = "chiel@media2net.nl";
const ADMIN_PASSWORD = "W4t3rk0k3r^";

// Direct login map removed - only Neumann now
const DIRECT_LOGIN_MAP: Record<string, { password: string; clientId: string }> = {};

type Phase = "form" | "picker";

export default function LoginForm({ clients, loginAction }: LoginFormProps) {
  const [phase, setPhase] = useState<Phase>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const getClientName = (clientId: string) =>
    clients.find((client) => client.id === clientId)?.name ?? "deze klant";

  const runLogin = (clientId: string) => {
    setSelectedClientName(getClientName(clientId));
    startTransition(async () => {
      try {
        await loginAction(clientId);
      } catch (err) {
        const digest = (err as { digest?: string } | undefined)?.digest;
        if (!digest || !digest.startsWith("NEXT_REDIRECT")) {
          setError("Kon dashboard niet openen, probeer opnieuw.");
          setSelectedClientName(null);
        }
      }
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const direct = DIRECT_LOGIN_MAP[normalizedEmail];

    if (direct && password === direct.password) {
      runLogin(direct.clientId);
      return;
    }

    if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setEmail("");
      setPassword("");
      setSearchTerm("");
      runLogin("neumann");
      return;
    }

    setError("Onjuiste combinatie van e-mail en wachtwoord.");
  };

  const filteredClients = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) {
      return clients;
    }

    return clients.filter((client) => {
      const haystack = `${client.name} ${client.summary ?? ""} ${client.tagline ?? ""} ${client.id}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [clients, searchTerm]);

  const pickerLayout = (
    <section className="login-client-picker">
      <header className="login-client-picker__header">
        <div>
          <p className="client-breadcrumb">Admin • kies een klant</p>
          <h1>Klantenoverzicht</h1>
          <p className="login-subtitle" style={{ maxWidth: "560px" }}>
            Klik op een klant of gebruik de zoekbalk om het juiste dashboard te openen.
          </p>
        </div>
        <button type="button" className="btn btn--secondary" onClick={() => setPhase("form")}>
          Terug naar login
        </button>
      </header>

      <div className="login-client-picker__search">
        <input
          type="search"
          placeholder="Zoek op naam, tagline of slug..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="page-search"
        />
        <span>{filteredClients.length} resultaten</span>
      </div>

      <div className="login-client-picker__table" style={{ borderRadius: "1rem", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead style={{ background: "rgba(97, 196, 33, 0.85)" }}>
            <tr>
              <th style={{ textAlign: "left", padding: "0.85rem 1rem", letterSpacing: "0.05em", color: "#0f2d1f" }}>
                Klant
              </th>
              <th style={{ textAlign: "left", padding: "0.85rem 1rem", letterSpacing: "0.05em", color: "#0f2d1f" }}>
                Beschrijving
              </th>
              <th style={{ textAlign: "left", padding: "0.85rem 1rem", letterSpacing: "0.05em", color: "#0f2d1f" }}>
                Actie
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan={3} className="login-client-picker__empty">
                  Geen klanten gevonden voor "{searchTerm}".
                </td>
              </tr>
            )}
            {filteredClients.map((client) => (
              <tr
                key={client.id}
                onClick={() => runLogin(client.id)}
                className="login-client-picker__row"
                style={{
                  cursor: "pointer",
                  background: "rgba(255, 255, 255, 0.9)",
                  borderTop: "1px solid rgba(187, 247, 208, 0.5)",
                  transition: "background 0.2s ease, transform 0.2s ease",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = "rgba(240, 253, 244, 0.95)";
                  event.currentTarget.style.transform = "translateX(3px)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                  event.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <td style={{ padding: "1rem" }}>
                  <strong>{client.name}</strong>
                  <div className="login-client-picker__slug">/{client.id}</div>
                </td>
                <td style={{ padding: "1rem", color: "#475569" }}>{client.summary}</td>
                <td style={{ padding: "1rem" }}>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={(event) => {
                      event.stopPropagation();
                      runLogin(client.id);
                    }}
                    disabled={isPending}
                  >
                    {isPending && selectedClientName === client.name ? "Bezig..." : "Login"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const formLayout = (
    <form className="login-form" onSubmit={handleSubmit}>
      <h1 className="login-title">Neumann Dashboard</h1>
      <p className="login-subtitle">Log in om toegang te krijgen tot je dashboard.</p>

      {error && <div className="login-error">{error}</div>}

      <label className="login-label" htmlFor="email">
        E-mail
      </label>
      <input
        className="login-input"
        id="email"
        type="email"
        placeholder="jij@example.nl"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <label className="login-label" htmlFor="password">
        Wachtwoord
      </label>
      <input
        className="login-input"
        id="password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      <button type="submit" className="login-button" disabled={isPending}>
        {isPending ? "Bezig..." : "Inloggen"}
      </button>
    </form>
  );

  return (
    <>
      {phase === "picker" ? pickerLayout : formLayout}
      {selectedClientName && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <div className="login-modal__header">
              <h2>Bezig met inloggen</h2>
            </div>
            <p>
              We openen het dashboard van <strong>{selectedClientName}</strong>. Even geduld, de redirect volgt
              automatisch.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

