import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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
          const factor = ri.amount / 100;
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
        id: recipe.id,
        naam: recipe.name,
        tijd: recipe.time,
        porties: recipe.portions,
        ingrediënten: recipe.ingredients.map((ri) => ({
          naam: ri.ingredient.name,
          portie: ri.portion || `${ri.amount}g`,
          kcal: Math.round(ri.ingredient.kcal * (ri.amount / 100)),
          eiwit: Math.round(ri.ingredient.protein * (ri.amount / 100) * 10) / 10,
          koolhydraten: Math.round(ri.ingredient.carbs * (ri.amount / 100) * 10) / 10,
          vetten: Math.round(ri.ingredient.fats * (ri.amount / 100) * 10) / 10,
        })),
        totaal: {
          kcal: Math.round(totals.kcal),
          eiwit: Math.round(totals.protein * 10) / 10,
          koolhydraten: Math.round(totals.carbs * 10) / 10,
          vetten: Math.round(totals.fats * 10) / 10,
        },
      };
    });

    return NextResponse.json(recipesWithTotals);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}

