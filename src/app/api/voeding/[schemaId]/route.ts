import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { decodePlanNotes, encodePlanNotes } from "@/lib/plan-notes";
import { buildWeekmenu, type DagMenu } from "@/lib/weekmenu";

function clientLinkPath(planId: string) {
  return `/my-plan/${planId}`;
}

function serializePlan(
  plan: {
    id: string;
    name: string;
    type: string;
    kcal: number;
    protein: number | null;
    carbs: number | null;
    fats: number | null;
    status: string;
    notes: string | null;
    aangemaakt: Date;
    client: { id: string; name: string; email: string };
  },
  options?: { weekMenu?: DagMenu[]; notesText?: string; weekMenuPersisted?: boolean }
) {
  const decoded = decodePlanNotes(plan.notes);
  const targets = {
    eiwit: plan.protein || 0,
    koolhydraten: plan.carbs || 0,
    vetten: plan.fats || 0,
    doelKcal: plan.kcal,
  };

  const weekMenuPersisted =
    options?.weekMenuPersisted ?? Boolean(decoded.weekMenu && decoded.weekMenu.length > 0);

  const weekMenu =
    options?.weekMenu ??
    decoded.weekMenu ??
    buildWeekmenu(targets);

  return {
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
    notes: options?.notesText ?? decoded.notes,
    weekMenu,
    weekMenuPersisted,
    clientLink: clientLinkPath(plan.id),
  };
}

export async function GET(
  _request: Request,
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

    return NextResponse.json(serializePlan(plan));
  } catch (error) {
    console.error("Error fetching nutrition plan:", error);
    return NextResponse.json({ error: "Failed to fetch nutrition plan" }, { status: 500 });
  }
}

async function updatePlanNotes(
  schemaId: string,
  body: { weekMenu?: DagMenu[] | null; notes?: string }
) {
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
    return null;
  }

  const existing = decodePlanNotes(plan.notes);
  const encoded = encodePlanNotes({
    existing,
    notes: body.notes,
    weekMenu: body.weekMenu,
  });

  const updated = await prisma.nutritionPlan.update({
    where: { id: schemaId },
    data: { notes: encoded },
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

  const decoded = decodePlanNotes(updated.notes);
  return serializePlan(updated, {
    weekMenu: decoded.weekMenu ?? undefined,
    notesText: decoded.notes,
    weekMenuPersisted: Boolean(decoded.weekMenu && decoded.weekMenu.length > 0),
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ schemaId: string }> }
) {
  try {
    const { schemaId } = await params;
    const body = await request.json();

    if (body.weekMenu === undefined && body.notes === undefined) {
      return NextResponse.json(
        { error: "Geef weekMenu en/of notes mee" },
        { status: 400 }
      );
    }

    const result = await updatePlanNotes(schemaId, {
      weekMenu: body.weekMenu,
      notes: body.notes,
    });

    if (!result) {
      return NextResponse.json({ error: "Voedingsplan niet gevonden" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating nutrition plan notes:", error);
    return NextResponse.json({ error: "Failed to update nutrition plan" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ schemaId: string }> }
) {
  return PATCH(request, context);
}
