import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ schemaId: string }> }
) {
  try {
    const { schemaId } = await params;

    const plan = await prisma.nutritionPlan.findUnique({
      where: { id: schemaId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Voedingsplan niet gevonden" }, { status: 404 });
    }

    return NextResponse.json({
      id: plan.id,
      naam: plan.name,
      type: plan.type,
      calorieën: plan.kcal,
      eiwit: plan.protein || 0,
      koolhydraten: plan.carbs || 0,
      vetten: plan.fats || 0,
      klantNaam: plan.client.name,
      clientId: plan.client.id,
      status: plan.status,
      aangemaakt: plan.aangemaakt.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Error fetching nutrition plan:", error);
    return NextResponse.json({ error: "Failed to fetch nutrition plan" }, { status: 500 });
  }
}

