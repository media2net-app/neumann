"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Calculator, Save, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getClients, createNutritionPlan } from "./actions";

function KcalCalculatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientIdFromUrl = searchParams.get("clientId");
  
  const [isPending, startTransition] = useTransition();
  const [clients, setClients] = useState<any[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Load clients on mount
  useEffect(() => {
    getClients().then((data) => {
      setClients(data);
      setIsLoadingClients(false);
      
      // If clientId is in URL, set it
      if (clientIdFromUrl) {
        const client = data.find((c: any) => c.id === clientIdFromUrl);
        if (client) {
          setFormData((prev) => ({
            ...prev,
            klantId: clientIdFromUrl,
            klantNaam: client.name,
          }));
        }
      }
    });
  }, [clientIdFromUrl]);

  const [formData, setFormData] = useState({
    klantId: "",
    klantNaam: "",
    geslacht: "man" as "man" | "vrouw",
    leeftijd: "",
    gewicht: "",
    lengte: "",
    activiteitsniveau: "licht" as "licht" | "matig" | "actief" | "zeer_actief",
    doel: "onderhoud" as "onderhoud" | "afvallen" | "aankomen",
  });

  const [resultaat, setResultaat] = useState<{
    bmr: number;
    tdee: number;
    doelKcal: number;
    eiwit: number;
    koolhydraten: number;
    vetten: number;
  } | null>(null);

  // Activiteitsfactoren
  const activiteitsfactoren = {
    licht: 1.2,
    matig: 1.375,
    actief: 1.55,
    zeer_actief: 1.725,
  };

  // Doel aanpassingen
  const doelAanpassingen = {
    afvallen: -500,
    onderhoud: 0,
    aankomen: 300,
  };

  const handleKlantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKlantId = e.target.value;
    const selectedKlant = clients.find((c) => c.id === selectedKlantId);
    setFormData((prev) => ({
      ...prev,
      klantId: selectedKlantId,
      klantNaam: selectedKlant ? selectedKlant.name : "",
    }));
  };

  const berekenKcal = () => {
    const leeftijd = parseFloat(formData.leeftijd);
    const gewicht = parseFloat(formData.gewicht);
    const lengte = parseFloat(formData.lengte);

    if (!leeftijd || !gewicht || !lengte || !formData.klantId || !formData.klantNaam) {
      alert("Vul alle velden in");
      return;
    }

    // Mifflin-St Jeor formule
    let bmr: number;
    if (formData.geslacht === "man") {
      bmr = 10 * gewicht + 6.25 * lengte - 5 * leeftijd + 5;
    } else {
      bmr = 10 * gewicht + 6.25 * lengte - 5 * leeftijd - 161;
    }

    const tdee = Math.round(bmr * activiteitsfactoren[formData.activiteitsniveau]);
    const doelKcal = Math.round(tdee + doelAanpassingen[formData.doel]);

    // Macro's berekenen
    let eiwit: number;
    let koolhydraten: number;
    let vetten: number;

    if (formData.doel === "afvallen") {
      eiwit = Math.round(gewicht * 2.2);
      vetten = Math.round((doelKcal * 0.25) / 9);
      const eiwitKcal = eiwit * 4;
      const vettenKcal = vetten * 9;
      const koolhydratenKcal = doelKcal - eiwitKcal - vettenKcal;
      koolhydraten = Math.round(koolhydratenKcal / 4);
    } else if (formData.doel === "aankomen") {
      eiwit = Math.round(gewicht * 2);
      vetten = Math.round((doelKcal * 0.25) / 9);
      const eiwitKcal = eiwit * 4;
      const vettenKcal = vetten * 9;
      const koolhydratenKcal = doelKcal - eiwitKcal - vettenKcal;
      koolhydraten = Math.round(koolhydratenKcal / 4);
    } else {
      eiwit = Math.round(gewicht * 1.8);
      koolhydraten = Math.round((doelKcal * 0.45) / 4);
      vetten = Math.round((doelKcal * 0.25) / 9);
    }

    setResultaat({
      bmr: Math.round(bmr),
      tdee,
      doelKcal,
      eiwit,
      koolhydraten,
      vetten,
    });

    // Ga naar stap 2
    setCurrentStep(2);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    berekenKcal();
  };

  const handleSavePlan = async () => {
    if (!resultaat || !formData.klantId) {
      alert("Bereken eerst de kcal waarden");
      return;
    }

    const typeMap: { [key: string]: string } = {
      afvallen: "Gewichtsverlies",
      onderhoud: "Onderhoud",
      aankomen: "Spieropbouw",
    };

    const planName = `${typeMap[formData.doel]} Schema - ${resultaat.doelKcal} kcal`;

    startTransition(async () => {
      const result = await createNutritionPlan({
        clientId: formData.klantId,
        name: planName,
        type: typeMap[formData.doel] || "Onderhoud",
        kcal: resultaat.doelKcal,
        protein: resultaat.eiwit,
        carbs: resultaat.koolhydraten,
        fats: resultaat.vetten,
      });

      if (result.success && result.plan) {
        router.push(`/voeding/${result.plan.id}`);
      } else {
        alert(result.error || "Er is een fout opgetreden");
      }
    });
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setResultaat(null);
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <Link
            href="/voeding"
            className="dashboard-card__link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <ArrowLeft size={16} />
            Terug naar Voedingsplannen
          </Link>
          <h1>Nieuw Voedingsplan</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            {currentStep === 1 
              ? "Stap 1: Vul de gegevens in om de caloriebehoefte te berekenen"
              : "Stap 2: Bekijk de berekeningsresultaten en maak het plan aan"}
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "1rem", 
        marginBottom: "2rem",
        padding: "1rem",
        background: "var(--client-surface)",
        borderRadius: "0.75rem",
        border: "1px solid var(--client-border)"
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem",
          flex: 1
        }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: currentStep >= 1 ? "var(--client-brand)" : "#e2e8f0",
            color: currentStep >= 1 ? "#ffffff" : "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: "0.875rem"
          }}>
            {currentStep > 1 ? "✓" : "1"}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.875rem", color: currentStep >= 1 ? "var(--client-brand)" : "#64748b" }}>
              Gegevens Invoeren
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              Vul alle benodigde informatie in
            </div>
          </div>
        </div>
        <ChevronRight size={20} color="#cbd5e1" />
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem",
          flex: 1
        }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: currentStep >= 2 ? "var(--client-brand)" : "#e2e8f0",
            color: currentStep >= 2 ? "#ffffff" : "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: "0.875rem"
          }}>
            2
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.875rem", color: currentStep >= 2 ? "var(--client-brand)" : "#64748b" }}>
              Resultaten
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              Bekijk berekening en maak plan aan
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Input Form */}
      {currentStep === 1 && (
        <div style={{ width: "100%" }}>
          <div style={{ 
            padding: "1.5rem",
            background: "var(--client-card-bg)",
            borderRadius: "1rem",
            border: "1px solid var(--client-border)",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)"
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gap: "1.5rem" }}>
                {/* Klant Selectie */}
                <div>
                  <label
                    htmlFor="klantId"
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 500,
                    }}
                  >
                    Selecteer Klant *
                  </label>
                  {isLoadingClients ? (
                    <div className="page-filter" style={{ width: "100%", padding: "0.75rem" }}>
                      Klanten laden...
                    </div>
                  ) : (
                    <select
                      id="klantId"
                      name="klantId"
                      value={formData.klantId}
                      onChange={handleKlantChange}
                      required
                      className="page-filter"
                      style={{ width: "100%" }}
                    >
                      <option value="">-- Selecteer een klant --</option>
                      {clients.map((klant) => (
                        <option key={klant.id} value={klant.id}>
                          {klant.name} {klant.status === "Actief" ? "✓" : ""}
                        </option>
                      ))}
                    </select>
                  )}
                  {formData.klantNaam && (
                    <span className="dashboard-table__meta" style={{ display: "block", marginTop: "0.5rem" }}>
                      Geselecteerd: {formData.klantNaam}
                    </span>
                  )}
                </div>

                {/* Geslacht en Leeftijd */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label
                      htmlFor="geslacht"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                      }}
                    >
                      Geslacht *
                    </label>
                    <select
                      id="geslacht"
                      name="geslacht"
                      value={formData.geslacht}
                      onChange={handleInputChange}
                      required
                      className="page-filter"
                      style={{ width: "100%" }}
                    >
                      <option value="man">Man</option>
                      <option value="vrouw">Vrouw</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="leeftijd"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                      }}
                    >
                      Leeftijd (jaren) *
                    </label>
                    <input
                      type="number"
                      id="leeftijd"
                      name="leeftijd"
                      value={formData.leeftijd}
                      onChange={handleInputChange}
                      required
                      min="1"
                      max="120"
                      className="page-filter"
                      style={{ width: "100%" }}
                      placeholder="Bijv. 30"
                    />
                  </div>
                </div>

                {/* Gewicht en Lengte */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label
                      htmlFor="gewicht"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                      }}
                    >
                      Gewicht (kg) *
                    </label>
                    <input
                      type="number"
                      id="gewicht"
                      name="gewicht"
                      value={formData.gewicht}
                      onChange={handleInputChange}
                      required
                      min="1"
                      step="0.1"
                      className="page-filter"
                      style={{ width: "100%" }}
                      placeholder="Bijv. 75"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lengte"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                      }}
                    >
                      Lengte (cm) *
                    </label>
                    <input
                      type="number"
                      id="lengte"
                      name="lengte"
                      value={formData.lengte}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="page-filter"
                      style={{ width: "100%" }}
                      placeholder="Bijv. 175"
                    />
                  </div>
                </div>

                {/* Activiteitsniveau */}
                <div>
                  <label
                    htmlFor="activiteitsniveau"
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 500,
                    }}
                  >
                    Activiteitsniveau *
                  </label>
                  <select
                    id="activiteitsniveau"
                    name="activiteitsniveau"
                    value={formData.activiteitsniveau}
                    onChange={handleInputChange}
                    required
                    className="page-filter"
                    style={{ width: "100%" }}
                  >
                    <option value="licht">Licht actief (weinig beweging)</option>
                    <option value="matig">Matig actief (1-3x per week sporten)</option>
                    <option value="actief">Actief (3-5x per week sporten)</option>
                    <option value="zeer_actief">Zeer actief (6-7x per week sporten)</option>
                  </select>
                </div>

                {/* Doel */}
                <div>
                  <label
                    htmlFor="doel"
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 500,
                    }}
                  >
                    Doel *
                  </label>
                  <select
                    id="doel"
                    name="doel"
                    value={formData.doel}
                    onChange={handleInputChange}
                    required
                    className="page-filter"
                    style={{ width: "100%" }}
                  >
                    <option value="afvallen">Afvallen</option>
                    <option value="onderhoud">Onderhoud</option>
                    <option value="aankomen">Aankomen / Spieropbouw</option>
                  </select>
                </div>

                {/* Bereken Button */}
                <button type="submit" className="btn btn--primary" style={{ width: "100%" }}>
                  <Calculator size={16} />
                  Bereken & Ga naar Resultaten
                  <ChevronRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Step 2: Results */}
      {currentStep === 2 && resultaat && (
        <div style={{ width: "100%" }}>
          <div style={{ 
            padding: "1.5rem",
            background: "var(--client-card-bg)",
            borderRadius: "1rem",
            border: "1px solid var(--client-border)",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)"
          }}>
            <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Berekeningsresultaten</h2>
              <button
                onClick={handleBackToStep1}
                className="btn btn--secondary"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <ChevronLeft size={16} />
                Wijzig Gegevens
              </button>
            </div>

            {/* Client Info Summary */}
            <div style={{ 
              padding: "0.75rem", 
              background: "var(--client-surface)", 
              borderRadius: "0.75rem",
              marginBottom: "1.5rem",
              border: "1px solid var(--client-border)"
            }}>
              <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.5rem", fontWeight: 500 }}>
                Klant & Doel
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Klant</div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{formData.klantNaam}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Geslacht</div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{formData.geslacht === "man" ? "Man" : "Vrouw"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Leeftijd</div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{formData.leeftijd} jaar</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Gewicht & Lengte</div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{formData.gewicht} kg / {formData.lengte} cm</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Doel</div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    {formData.doel === "afvallen" ? "Afvallen" : formData.doel === "aankomen" ? "Aankomen / Spieropbouw" : "Onderhoud"}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards - Full Width */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(3, 1fr)", 
              gap: "0.75rem",
              marginBottom: "1.5rem"
            }}>
              <div className="page-stat-card">
                <h3>{resultaat.bmr}</h3>
                <p>BMR (kcal/dag)</p>
                <span className="dashboard-table__meta">Basale stofwisseling</span>
              </div>
              <div className="page-stat-card page-stat-card--active">
                <h3>{resultaat.tdee}</h3>
                <p>TDEE (kcal/dag)</p>
                <span className="dashboard-table__meta">Totaal energieverbruik</span>
              </div>
              <div className="page-stat-card page-stat-card--primary" style={{ color: "#ffffff" }}>
                <h3 style={{ color: "#ffffff" }}>{resultaat.doelKcal}</h3>
                <p style={{ color: "#ffffff" }}>Doel Kcal/dag</p>
                <span className="dashboard-table__meta" style={{ color: "rgba(255, 255, 255, 0.9)" }}>Voor {formData.doel}</span>
              </div>
            </div>

            {/* Macro's - Full Width */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ marginBottom: "0.75rem", fontSize: "1rem" }}>Macronutriënten Verdeling</h3>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(3, 1fr)", 
                gap: "0.75rem"
              }}>
                <div className="page-stat-card">
                  <h3>{resultaat.eiwit}g</h3>
                  <p>Eiwit</p>
                  <span className="dashboard-table__meta">
                    {Math.round((resultaat.eiwit * 4 * 100) / resultaat.doelKcal)}% van kcal
                  </span>
                </div>
                <div className="page-stat-card">
                  <h3>{resultaat.koolhydraten}g</h3>
                  <p>Koolhydraten</p>
                  <span className="dashboard-table__meta">
                    {Math.round((resultaat.koolhydraten * 4 * 100) / resultaat.doelKcal)}% van kcal
                  </span>
                </div>
                <div className="page-stat-card">
                  <h3>{resultaat.vetten}g</h3>
                  <p>Vetten</p>
                  <span className="dashboard-table__meta">
                    {Math.round((resultaat.vetten * 9 * 100) / resultaat.doelKcal)}% van kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Actie Buttons */}
            <div style={{ display: "flex", gap: "1rem", paddingTop: "1.5rem", borderTop: "1px solid var(--client-border)" }}>
              <button
                className="btn btn--primary"
                onClick={handleSavePlan}
                disabled={isPending || !formData.klantId}
                style={{ flex: 1 }}
              >
                <Save size={16} />
                {isPending ? "Aanmaken..." : "Plan Aanmaken met deze Waarden"}
              </button>
              <button
                className="btn btn--secondary"
                onClick={handleBackToStep1}
              >
                <ChevronLeft size={16} />
                Terug
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KcalCalculatorPage() {
  return (
    <Suspense fallback={
      <div className="page-admin">
        <div className="page-header">
          <div>
            <h1>Nieuw Voedingsplan</h1>
            <p style={{ color: "#64748b", marginTop: "0.5rem" }}>Laden...</p>
          </div>
        </div>
      </div>
    }>
      <KcalCalculatorContent />
    </Suspense>
  );
}
