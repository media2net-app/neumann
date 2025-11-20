import { prisma } from "@/lib/prisma";
import { ArrowLeft, Clock, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

interface RecipeDetailPageProps {
  params: Promise<{ recipeId: string }>;
}

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const resolvedParams = await params;
  const recipeId = resolvedParams.recipeId;

  // Fetch recipe with all ingredients
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  if (!recipe) {
    notFound();
  }

  // Sort ingredients by name
  const sortedIngredients = [...recipe.ingredients].sort((a, b) => 
    a.ingredient.name.localeCompare(b.ingredient.name)
  );

  // Calculate totals for the recipe
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

  const recipeTotals = {
    kcal: Math.round(totals.kcal),
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fats: Math.round(totals.fats * 10) / 10,
  };

  // Calculate per portion
  const perPortion = {
    kcal: Math.round(recipeTotals.kcal / recipe.portions),
    protein: Math.round((recipeTotals.protein / recipe.portions) * 10) / 10,
    carbs: Math.round((recipeTotals.carbs / recipe.portions) * 10) / 10,
    fats: Math.round((recipeTotals.fats / recipe.portions) * 10) / 10,
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <div>
          <Link href="/recepten" className="dashboard-card__link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ArrowLeft size={16} />
            Terug naar Recepten
          </Link>
          <h1>{recipe.name}</h1>
          {recipe.description && (
            <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1.1rem' }}>
              {recipe.description}
            </p>
          )}
        </div>
      </div>

      {/* Recipe Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {recipe.time && (
          <div className="page-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <Clock size={24} style={{ color: 'var(--client-brand)', marginBottom: '0.5rem' }} />
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#64748b', fontWeight: 500 }}>Bereidingstijd</h3>
            <p style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{recipe.time}</p>
          </div>
        )}
        <div className="page-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <UtensilsCrossed size={24} style={{ color: 'var(--client-brand)', marginBottom: '0.5rem' }} />
          <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#64748b', fontWeight: 500 }}>Porties</h3>
          <p style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{recipe.portions} {recipe.portions === 1 ? 'portie' : 'porties'}</p>
        </div>
      </div>

      {/* Nutrition Totals */}
      <div className="page-section">
        <h2 className="page-section__title">Voedingswaarden</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {/* Total Recipe */}
          <div className="page-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 600 }}>Totaal Recept</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Kcal</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--client-brand)' }}>
                  {recipeTotals.kcal}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Eiwit</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>
                  {recipeTotals.protein}g
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Koolhydraten</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                  {recipeTotals.carbs}g
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Vetten</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>
                  {recipeTotals.fats}g
                </div>
              </div>
            </div>
          </div>

          {/* Per Portion */}
          <div className="page-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 600 }}>Per Portie</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Kcal</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--client-brand)' }}>
                  {perPortion.kcal}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Eiwit</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>
                  {perPortion.protein}g
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Koolhydraten</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                  {perPortion.carbs}g
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Vetten</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>
                  {perPortion.fats}g
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients Table */}
      <div className="page-section">
        <h2 className="page-section__title">Ingrediënten</h2>
        <div className="page-card">
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Ingrediënt</th>
                  <th>Bereiding</th>
                  <th>Hoeveelheid</th>
                  <th>Kcal</th>
                  <th>Eiwit (g)</th>
                  <th>Koolhydraten (g)</th>
                  <th>Vetten (g)</th>
                </tr>
              </thead>
              <tbody>
                {sortedIngredients.map((ri) => {
                  const ingredientKcal = Math.round((ri.ingredient.kcal * ri.amount) / 100);
                  const ingredientProtein = Math.round(((ri.ingredient.protein * ri.amount) / 100) * 10) / 10;
                  const ingredientCarbs = Math.round(((ri.ingredient.carbs * ri.amount) / 100) * 10) / 10;
                  const ingredientFats = Math.round(((ri.ingredient.fats * ri.amount) / 100) * 10) / 10;

                  return (
                    <tr key={ri.id}>
                      <td>
                        <strong>{ri.ingredient.name}</strong>
                        {ri.ingredient.notes && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                            {ri.ingredient.notes}
                          </div>
                        )}
                      </td>
                      <td>
                        {ri.ingredient.preparation ? (
                          <span className="dashboard-badge dashboard-badge--active">
                            {ri.ingredient.preparation}
                          </span>
                        ) : (
                          <span style={{ color: '#64748b' }}>-</span>
                        )}
                      </td>
                      <td>
                        {ri.portion || `${ri.amount}g`}
                      </td>
                      <td>{ingredientKcal}</td>
                      <td>{ingredientProtein}</td>
                      <td>{ingredientCarbs}</td>
                      <td>{ingredientFats}</td>
                    </tr>
                  );
                })}
                {/* Total Row */}
                <tr style={{ borderTop: '2px solid var(--client-border)', fontWeight: 'bold', background: 'rgba(0,0,0,0.02)' }}>
                  <td colSpan={3}>Totaal</td>
                  <td>{recipeTotals.kcal}</td>
                  <td>{recipeTotals.protein}g</td>
                  <td>{recipeTotals.carbs}g</td>
                  <td>{recipeTotals.fats}g</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

