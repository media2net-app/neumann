import { prisma } from "@/lib/prisma";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

export default async function IngredientenPage() {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { name: "asc" },
  });

  const categories = Array.from(new Set(ingredients.map((ing) => ing.category).filter((cat): cat is string => cat !== null)));

  const stats = {
    total: ingredients.length,
    categories: categories.length,
  };

  return (
    <div className="page-admin">
      <div className="page-header">
        <h1>Ingrediënten Database</h1>
        <Link href="/ingredienten/nieuw" className="btn btn--primary">
          <Plus size={16} />
          Nieuw Ingrediënt
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="page-stats">
        <div className="page-stat-card">
          <h3>{stats.total}</h3>
          <p>Totaal Ingrediënten</p>
        </div>
        <div className="page-stat-card page-stat-card--active">
          <h3>{stats.categories}</h3>
          <p>Categorieën</p>
        </div>
      </div>

      {/* Filters */}
      <div className="page-filters">
        <input
          type="search"
          placeholder="Zoek ingrediënten..."
          className="page-search"
        />
        <select className="page-filter">
          <option>Alle categorieën</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Ingredients Table */}
      <div className="page-section">
        <div className="page-card">
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Naam</th>
                  <th>Categorie</th>
                  <th>Bereiding</th>
                  <th>Kcal (per 100g)</th>
                  <th>Eiwit (g)</th>
                  <th>Koolhydraten (g)</th>
                  <th>Vetten (g)</th>
                  <th>Bron</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ingredient) => (
                  <tr key={ingredient.id}>
                    <td>
                      <strong>{ingredient.name}</strong>
                      {ingredient.notes && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                          {ingredient.notes}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="dashboard-table__type">{ingredient.category || "-"}</span>
                    </td>
                    <td>
                      {ingredient.preparation ? (
                        <span className="dashboard-badge dashboard-badge--active">
                          {ingredient.preparation}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b' }}>-</span>
                      )}
                    </td>
                    <td>{ingredient.kcal}</td>
                    <td>{ingredient.protein}</td>
                    <td>{ingredient.carbs}</td>
                    <td>{ingredient.fats}</td>
                    <td>
                      {ingredient.source ? (
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          {ingredient.source}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

