"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createClient(formData: {
  name: string;
  email: string;
  phone?: string;
  status: string;
  goal?: string;
  startDate: Date;
  nextSession?: Date | null;
  type: string;
  sessionsCompleted?: number;
  totalSessions?: number;
  progress?: number;
  package?: string;
  value?: number;
}) {
  try {
    const client = await prisma.client.create({
      data: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        status: formData.status,
        goal: formData.goal || null,
        startDate: formData.startDate,
        nextSession: formData.nextSession || null,
        type: formData.type,
        sessionsCompleted: formData.sessionsCompleted || 0,
        totalSessions: formData.totalSessions || 0,
        progress: formData.progress || 0,
        package: formData.package || null,
        value: formData.value || 0,
      },
    });

    revalidatePath("/clients");
    revalidatePath(`/clients/${client.id}`);
    
    return { success: true, client };
  } catch (error: any) {
    console.error("Error creating client:", error);
    
    // Check if it's a unique constraint violation (duplicate email)
    if (error.code === "P2002") {
      return { success: false, error: "Een klant met dit e-mailadres bestaat al" };
    }
    
    return { success: false, error: "Er is een fout opgetreden bij het aanmaken van de klant" };
  }
}

export async function deleteClient(clientId: string) {
  try {
    // Delete client (cascade will delete related sessions, nutrition plans, and reviews)
    await prisma.client.delete({
      where: { id: clientId },
    });

    revalidatePath("/clients");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting client:", error);
    return { success: false, error: "Er is een fout opgetreden bij het verwijderen van de klant" };
  }
}

