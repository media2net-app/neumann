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
}) {
  try {
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
        notes: formData.notes,
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

