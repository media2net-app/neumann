"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getClients() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { name: "asc" },
    });
    return clients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

export async function createNutritionPlan(formData: {
  clientId: string;
  name: string;
  type: string;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  notes?: string;
  mealCount?: number;
}) {
  try {
    const { encodePlanNotes } = await import("@/lib/plan-notes");
    const { buildWeekmenu } = await import("@/lib/weekmenu");

    const weekMenu = buildWeekmenu(
      {
        eiwit: formData.protein,
        koolhydraten: formData.carbs,
        vetten: formData.fats,
        doelKcal: formData.kcal,
      },
      [],
      formData.mealCount || 5
    );

    const plan = await prisma.nutritionPlan.create({
      data: {
        clientId: formData.clientId,
        name: formData.name,
        type: formData.type,
        kcal: formData.kcal,
        protein: formData.protein,
        carbs: formData.carbs,
        fats: formData.fats,
        status: "Actief",
        notes: encodePlanNotes({
          existing: { v: 1, notes: formData.notes || "", weekMenu: null },
          notes: formData.notes || "",
          weekMenu,
        }),
      },
    });

    revalidatePath("/voeding");
    revalidatePath(`/voeding/${plan.id}`);
    
    return { success: true, plan };
  } catch (error) {
    console.error("Error creating nutrition plan:", error);
    return { success: false, error: "Er is een fout opgetreden bij het aanmaken van het plan" };
  }
}

export async function deleteNutritionPlan(planId: string) {
  try {
    await prisma.nutritionPlan.delete({
      where: { id: planId },
    });

    revalidatePath("/voeding");
    revalidatePath("/clients");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting nutrition plan:", error);
    return { success: false, error: "Er is een fout opgetreden bij het verwijderen van het voedingsplan" };
  }
}

