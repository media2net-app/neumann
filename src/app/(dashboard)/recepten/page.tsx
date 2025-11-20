import { prisma } from "@/lib/prisma";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";

export default async function ReceptenPage() {
  const recipes = await prisma.recipe.findMany({
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Calculate totals for each recipe
  const recipesWithTotals = recipes.map((recipe) => {
    const totals = recipe.ingredients.reduce(
      (acc, ri) => {
        const factor = ri.amount / 100; // Convert to per 100g basis
        return {
          kcal: acc.kcal + ri.ingredient.kcal * factor,
          protein: acc.protein + ri.ingredient.protein * factor,
          carbs: acc.carbs + ri.ingredient.carbs * factor,
          fats: acc.fats + ri.ingredient.fats * factor,
        };
      },
      { kcal: 0, protein: 0, carbs: 0, fats: 0 }
    );

    return {
      ...recipe,
      totals: {
        kcal: Math.round(totals.kcal),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fats: Math.round(totals.fats * 10) / 10,
      },
    };
  });

  const stats = {
    total: recipes.length,
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <h1>Recepten Database</h1>
        <Link href="/recepten/nieuw" className="btn btn--primary">
          <Plus size={16} />
          Nieuw Recept
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="page-stats">
        <div className="page-stat-card">
          <h3>{stats.total}</h3>
          <p>Totaal Recepten</p>
        </div>
      </div>

      {/* Recipes Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem'
      }}>
        {recipesWithTotals.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recepten/${recipe.id}`}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'block',
            }}
          >
            <div
              className="dashboard-card dashboard-card--hoverable"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                cursor: 'pointer',
              }}
            >
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
                  {recipe.name}
                </h3>
                {recipe.description && (
                  <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                    {recipe.description}
                  </p>
                )}
              </div>
            </div>

            {/* Recipe Info */}
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
              {recipe.time && (
                <span>⏱️ {recipe.time}</span>
              )}
              <span>🍽️ {recipe.portions} {recipe.portions === 1 ? 'portie' : 'porties'}</span>
            </div>

            {/* Totals */}
            <div style={{
              padding: '1rem',
              background: 'var(--client-surface)',
              borderRadius: '0.75rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.75rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--client-brand)' }}>
                  {recipe.totals.kcal}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>kcal</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6' }}>
                  {recipe.totals.protein}g
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Eiwit</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>
                  {recipe.totals.carbs}g
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Koolhydraten</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>
                  {recipe.totals.fats}g
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Vetten</div>
              </div>
            </div>

            {/* Ingredients List */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#64748b' }}>
                Ingrediënten:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#64748b' }}>
                {recipe.ingredients.map((ri, idx) => (
                  <li key={idx}>
                    {ri.ingredient.name} {ri.portion && `(${ri.portion})`}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

