"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { createClient } from "../actions";

export default function NewClientPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Actief",
    goal: "",
    startDate: new Date().toISOString().split("T")[0],
    nextSession: "",
    type: "1-op-1 Training",
    sessionsCompleted: "0",
    totalSessions: "0",
    progress: "0",
    package: "",
    value: "0",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validatie
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Naam en e-mail zijn verplicht");
      return;
    }

    // Email validatie
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Ongeldig e-mailadres");
      return;
    }

    startTransition(async () => {
      const result = await createClient({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        status: formData.status,
        goal: formData.goal.trim() || undefined,
        startDate: new Date(formData.startDate),
        nextSession: formData.nextSession ? new Date(formData.nextSession) : null,
        type: formData.type,
        sessionsCompleted: parseInt(formData.sessionsCompleted) || 0,
        totalSessions: parseInt(formData.totalSessions) || 0,
        progress: parseInt(formData.progress) || 0,
        package: formData.package.trim() || undefined,
        value: parseFloat(formData.value) || 0,
      });

      if (result.success && result.client) {
        router.push(`/clients/${result.client.id}`);
      } else {
        setError(result.error || "Er is een fout opgetreden");
      }
    });
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <Link
            href="/clients"
            className="dashboard-card__link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <ArrowLeft size={16} />
            Terug naar Klanten
          </Link>
          <h1>Nieuwe Klant Toevoegen</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            Voeg een nieuwe klant toe aan het systeem
          </p>
        </div>
      </div>

      <div className="page-section">
        <div className="dashboard-card">
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  padding: "1rem",
                  background: "#fee2e2",
                  border: "1px solid #fca5a5",
                  borderRadius: "0.5rem",
                  color: "#dc2626",
                  marginBottom: "1.5rem",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: "grid", gap: "1.5rem" }}>
              {/* Basis Informatie */}
              <div>
                <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600 }}>
                  Basis Informatie
                </h3>
                <div style={{ display: "grid", gap: "1rem" }}>
                  <div>
                    <label
                      htmlFor="name"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                      }}
                    >
                      Naam *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="page-filter"
                      style={{ width: "100%" }}
                      placeholder="Bijv. Jan Jansen"
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label
                        htmlFor="email"
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 500,
                        }}
                      >
                        E-mail *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="page-filter"
                        style={{ width: "100%" }}
                        placeholder="jan@example.nl"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 500,
                        }}
                      >
                        Telefoon
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="page-filter"
                        style={{ width: "100%" }}
                        placeholder="06-12345678"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Traject Informatie */}
              <div>
                <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600 }}>
                  Traject Informatie
                </h3>
                <div style={{ display: "grid", gap: "1rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label
                        htmlFor="status"
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 500,
                        }}
                      >
                        Status *
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                        className="page-filter"
                        style={{ width: "100%" }}
                      >
                        <option value="Actief">Actief</option>
                        <option value="Voltooid">Voltooid</option>
                        <option value="Inactief">Inactief</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="type"
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 500,
                        }}
                      >
                        Type Training *
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        className="page-filter"
                        style={{ width: "100%" }}
                      >
                        <option value="1-op-1 Training">1-op-1 Training</option>
                        <option value="Duo Training">Duo Training</option>
                        <option value="Online coaching">Online coaching</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="goal"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                      }}
                    >
                      Doel
                    </label>
                    <input
                      type="text"
                      id="goal"
                      name="goal"
                      value={formData.goal}
                      onChange={handleInputChange}
                      className="page-filter"
                      style={{ width: "100%" }}
                      placeholder="Bijv. Afvallen & conditie opbouwen"
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label
                        htmlFor="startDate"
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 500,
                        }}
                      >
                        Startdatum *
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                        className="page-filter"
                        style={{ width: "100%" }}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="nextSession"
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 500,
                        }}
                      >
                        Volgende Sessie
                      </label>
                      <input
                        type="date"
                        id="nextSession"
                        name="nextSession"
                        value={formData.nextSession}
                        onChange={handleInputChange}
                        className="page-filter"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sessies & Voortgang */}
              <div>
                <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600 }}>
                  Sessies & Voortgang
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                  <div>
                    <label
                      htmlFor="sessionsCompleted"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                      }}
                    >
                      Voltooide Sessies
                    </label>
                    <input
                      type="number"
                      id="sessionsCompleted"
                      name="sessionsCompleted"
                      value={formData.sessionsCompleted}
                      onChange={handleInputChange}
                      min="0"
                      className="page-filter"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="totalSessions"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                      }}
                    >
                      Totaal Sessies
                    </label>
                    <input
                      type="number"
                      id="totalSessions"
                      name="totalSessions"
                      value={formData.totalSessions}
                      onChange={handleInputChange}
                      min="0"
                      className="page-filter"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="progress"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                      }}
                    >
                      Voortgang (%)
                    </label>
                    <input
                      type="number"
                      id="progress"
                      name="progress"
                      value={formData.progress}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="page-filter"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Financieel */}
              <div>
                <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600 }}>
                  Financieel
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label
                      htmlFor="package"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                      }}
                    >
                      Pakket
                    </label>
                    <input
                      type="text"
                      id="package"
                      name="package"
                      value={formData.package}
                      onChange={handleInputChange}
                      className="page-filter"
                      style={{ width: "100%" }}
                      placeholder="Bijv. Revalidatie pakket"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="value"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                      }}
                    >
                      Waarde (€)
                    </label>
                    <input
                      type="number"
                      id="value"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="page-filter"
                      style={{ width: "100%" }}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={isPending}
                  style={{ flex: 1 }}
                >
                  <Save size={16} />
                  {isPending ? "Aanmaken..." : "Klant Aanmaken"}
                </button>
                <Link href="/clients" className="btn btn--secondary">
                  Annuleren
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

