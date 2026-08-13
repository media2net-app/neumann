export default function MyPlanNotFound() {
  return (
    <div
      data-client="neumann"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 40%)",
        color: "#0f2d1f",
        textAlign: "center",
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "0.85rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "var(--client-brand)",
          }}
        >
          Neumann
        </p>
        <h1 style={{ margin: "0.5rem 0", fontSize: "1.5rem" }}>Plan niet gevonden</h1>
        <p style={{ margin: 0, color: "#64748b", maxWidth: "28rem" }}>
          Deze link is ongeldig of het voedingsplan bestaat niet meer. Vraag je coach om een nieuwe
          link.
        </p>
      </div>
    </div>
  );
}
