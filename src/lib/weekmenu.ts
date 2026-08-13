export const DAGEN = [
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
  "Zaterdag",
  "Zondag",
] as const;

export type Ingredient = {
  naam: string;
  portie: string;
  kcal: number;
  eiwit: number;
  koolhydraten: number;
  vetten: number;
};

export type Maaltijd = {
  id: string;
  naam: string;
  tijd: string;
  bereidingswijze: string;
  ingrediënten: Ingredient[];
  totaleKcal: number;
  eiwit: number;
  koolhydraten: number;
  vetten: number;
};

export type DagMenu = {
  dag: string;
  maaltijden: Maaltijd[];
  dagTotaal: { kcal: number; eiwit: number; koolhydraten: number; vetten: number };
  percentages: { eiwit: number; koolhydraten: number; vetten: number; kcal: number };
  nogNodig: { eiwit: number; koolhydraten: number; vetten: number; kcal: number };
};

export type MacroTargets = {
  eiwit: number;
  koolhydraten: number;
  vetten: number;
  doelKcal: number;
};

export function cleanBereidingswijze(text: string, ingredientName: string): string {
  if (!text?.trim()) return "";
  const needle = ingredientName.toLowerCase();
  return text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !sentence.toLowerCase().includes(needle))
    .join(" ")
    .trim();
}

export function sumIngredients(ingrediënten: Ingredient[]) {
  return ingrediënten.reduce(
    (sum, ing) => ({
      kcal: sum.kcal + ing.kcal,
      eiwit: sum.eiwit + ing.eiwit,
      koolhydraten: sum.koolhydraten + ing.koolhydraten,
      vetten: sum.vetten + ing.vetten,
    }),
    { kcal: 0, eiwit: 0, koolhydraten: 0, vetten: 0 }
  );
}

export function withMealTotals(
  maaltijd: Omit<Maaltijd, "totaleKcal" | "eiwit" | "koolhydraten" | "vetten"> | Maaltijd
): Maaltijd {
  const totals = sumIngredients(maaltijd.ingrediënten);
  return {
    ...maaltijd,
    bereidingswijze: maaltijd.bereidingswijze || "",
    totaleKcal: totals.kcal,
    eiwit: totals.eiwit,
    koolhydraten: totals.koolhydraten,
    vetten: totals.vetten,
  };
}

export function buildDagMenu(
  dagNaam: string,
  maaltijden: Maaltijd[],
  targets: MacroTargets
): DagMenu {
  const meals = maaltijden.map(withMealTotals);
  const dagTotaal = meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.totaleKcal,
      eiwit: acc.eiwit + m.eiwit,
      koolhydraten: acc.koolhydraten + m.koolhydraten,
      vetten: acc.vetten + m.vetten,
    }),
    { kcal: 0, eiwit: 0, koolhydraten: 0, vetten: 0 }
  );

  return {
    dag: dagNaam,
    maaltijden: meals,
    dagTotaal,
    percentages: {
      eiwit: Math.round((dagTotaal.eiwit / targets.eiwit) * 100) || 0,
      koolhydraten: Math.round((dagTotaal.koolhydraten / targets.koolhydraten) * 100) || 0,
      vetten: Math.round((dagTotaal.vetten / targets.vetten) * 100) || 0,
      kcal: Math.round((dagTotaal.kcal / targets.doelKcal) * 100) || 0,
    },
    nogNodig: {
      eiwit: Math.max(0, targets.eiwit - dagTotaal.eiwit),
      koolhydraten: Math.max(0, targets.koolhydraten - dagTotaal.koolhydraten),
      vetten: Math.max(0, targets.vetten - dagTotaal.vetten),
      kcal: Math.max(0, targets.doelKcal - dagTotaal.kcal),
    },
  };
}

export function buildDefaultMaaltijden(): Maaltijd[] {
  return [
    withMealTotals({
      id: "1",
      naam: "Ontbijt",
      tijd: "08:00",
      bereidingswijze:
        "Kook de havermout met water of melk. Snijd de banaan in plakjes. Serveer met Griekse yoghurt en blauwe bessen.",
      ingrediënten: [
        { naam: "Havermout", portie: "50g", kcal: 180, eiwit: 6, koolhydraten: 30, vetten: 3 },
        { naam: "Banaan", portie: "1 middelgroot", kcal: 105, eiwit: 1, koolhydraten: 27, vetten: 0 },
        { naam: "Griekse yoghurt", portie: "100g", kcal: 130, eiwit: 10, koolhydraten: 9, vetten: 5 },
        { naam: "Blauwe bessen", portie: "50g", kcal: 28, eiwit: 0, koolhydraten: 7, vetten: 0 },
      ],
    }),
    withMealTotals({
      id: "2",
      naam: "Lunch",
      tijd: "12:30",
      bereidingswijze:
        "Bak de kipfilet in een pan met olijfolie. Kook of bak de zoete aardappel. Stoom de broccoli tot hij beetgaar is.",
      ingrediënten: [
        { naam: "Kipfilet", portie: "150g", kcal: 248, eiwit: 46, koolhydraten: 0, vetten: 5 },
        { naam: "Zoete aardappel", portie: "200g", kcal: 180, eiwit: 4, koolhydraten: 41, vetten: 0 },
        { naam: "Broccoli", portie: "150g", kcal: 51, eiwit: 4, koolhydraten: 10, vetten: 1 },
        { naam: "Olijfolie", portie: "1 eetlepel", kcal: 120, eiwit: 0, koolhydraten: 0, vetten: 14 },
      ],
    }),
    withMealTotals({
      id: "3",
      naam: "Diner",
      tijd: "18:00",
      bereidingswijze:
        "Bak de zalm in een pan met olijfolie tot hij gaar is. Kook de quinoa volgens de verpakking. Stoom de groene bonen.",
      ingrediënten: [
        { naam: "Zalm", portie: "150g", kcal: 312, eiwit: 44, koolhydraten: 0, vetten: 14 },
        { naam: "Quinoa", portie: "100g (gekookt)", kcal: 120, eiwit: 4, koolhydraten: 22, vetten: 2 },
        { naam: "Groene bonen", portie: "150g", kcal: 44, eiwit: 2, koolhydraten: 10, vetten: 0 },
        { naam: "Avocado", portie: "50g", kcal: 80, eiwit: 1, koolhydraten: 4, vetten: 7 },
      ],
    }),
    withMealTotals({
      id: "4",
      naam: "Snacks",
      tijd: "10:00 & 15:00",
      bereidingswijze: "Serveer de amandelen en appel als tussendoortje.",
      ingrediënten: [
        { naam: "Amandelen", portie: "20g", kcal: 116, eiwit: 4, koolhydraten: 4, vetten: 10 },
        { naam: "Appel", portie: "1 middelgroot", kcal: 95, eiwit: 0, koolhydraten: 25, vetten: 0 },
      ],
    }),
  ];
}

/** @deprecated Use buildDefaultMaaltijden */
export const genereerMaaltijden = buildDefaultMaaltijden;

const VIS_NAMEN = ["zalm", "tonijn", "kabeljauw", "makreel", "garnalen", "pangasius"];

export function ingredientMatchesExclusion(ingredientName: string, exclusion: string): boolean {
  const name = ingredientName.toLowerCase();
  const ex = exclusion.toLowerCase();
  if (ex === "vis") {
    return VIS_NAMEN.some((vis) => name.includes(vis));
  }
  return name.includes(ex);
}

export function applyExclusionsToMaaltijden(maaltijden: Maaltijd[], exclusions: string[]): Maaltijd[] {
  if (exclusions.length === 0) return maaltijden;
  return maaltijden.map((maaltijd) => {
    let bereidingswijze = maaltijd.bereidingswijze || "";
    const ingrediënten = maaltijd.ingrediënten.filter((ing) => {
      const excluded = exclusions.some((ex) => ingredientMatchesExclusion(ing.naam, ex));
      if (excluded) {
        bereidingswijze = cleanBereidingswijze(bereidingswijze, ing.naam);
      }
      return !excluded;
    });
    return withMealTotals({ ...maaltijd, ingrediënten, bereidingswijze });
  });
}

export function buildWeekmenu(targets: MacroTargets, exclusions: string[] = []): DagMenu[] {
  return DAGEN.map((dagNaam) =>
    buildDagMenu(dagNaam, applyExclusionsToMaaltijden(buildDefaultMaaltijden(), exclusions), targets)
  );
}
