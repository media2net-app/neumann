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

type MealTemplate = Omit<Maaltijd, "totaleKcal" | "eiwit" | "koolhydraten" | "vetten" | "id">;

const ONTBIJT_OPTIES: MealTemplate[] = [
  {
    naam: "Ontbijt",
    tijd: "08:00",
    bereidingswijze:
      "Meng de havermout met yoghurt of water tot een papje. Top met banaan en blauwe bessen. Geen warm vlees bij het ontbijt.",
    ingrediënten: [
      { naam: "Havermout", portie: "50g", kcal: 180, eiwit: 6, koolhydraten: 30, vetten: 3 },
      { naam: "Griekse yoghurt (mager)", portie: "150g", kcal: 89, eiwit: 15, koolhydraten: 5, vetten: 0.6 },
      { naam: "Banaan", portie: "1 middelgroot", kcal: 105, eiwit: 1, koolhydraten: 27, vetten: 0 },
      { naam: "Blauwe bessen", portie: "50g", kcal: 28, eiwit: 0, koolhydraten: 7, vetten: 0 },
    ],
  },
  {
    naam: "Ontbijt",
    tijd: "08:00",
    bereidingswijze:
      "Schep de kwark in een kom. Roer er havermout door en top met aardbeien en een beetje honing naar smaak.",
    ingrediënten: [
      { naam: "Kwark (mager)", portie: "200g", kcal: 114, eiwit: 20, koolhydraten: 7, vetten: 0.4 },
      { naam: "Havermout", portie: "40g", kcal: 144, eiwit: 5, koolhydraten: 24, vetten: 2 },
      { naam: "Aardbeien", portie: "100g", kcal: 32, eiwit: 1, koolhydraten: 8, vetten: 0 },
    ],
  },
  {
    naam: "Ontbijt",
    tijd: "08:00",
    bereidingswijze:
      "Serveer skyr of yoghurt koud met havermout en appel. Dit is een koud ontbijt, niet bakken.",
    ingrediënten: [
      { naam: "Skyr", portie: "200g", kcal: 118, eiwit: 22, koolhydraten: 8, vetten: 0.4 },
      { naam: "Havermout", portie: "40g", kcal: 144, eiwit: 5, koolhydraten: 24, vetten: 2 },
      { naam: "Appel", portie: "1 middelgroot", kcal: 95, eiwit: 0, koolhydraten: 25, vetten: 0 },
    ],
  },
  {
    naam: "Ontbijt",
    tijd: "08:00",
    bereidingswijze:
      "Roer kwark met een beetje melk tot een romige basis. Voeg havermout en blauwe bessen toe.",
    ingrediënten: [
      { naam: "Kwark (vol)", portie: "175g", kcal: 172, eiwit: 21, koolhydraten: 6, vetten: 7.5 },
      { naam: "Havermout", portie: "35g", kcal: 126, eiwit: 4, koolhydraten: 21, vetten: 2 },
      { naam: "Blauwe bessen", portie: "80g", kcal: 46, eiwit: 1, koolhydraten: 11, vetten: 0 },
    ],
  },
  {
    naam: "Ontbijt",
    tijd: "08:00",
    bereidingswijze:
      "Maak overnight oats: havermout + yoghurt + melk, laat even staan. Serveer koud met banaan.",
    ingrediënten: [
      { naam: "Havermout", portie: "45g", kcal: 162, eiwit: 5, koolhydraten: 27, vetten: 3 },
      { naam: "Griekse yoghurt (vol)", portie: "125g", kcal: 121, eiwit: 12.5, koolhydraten: 4.5, vetten: 6 },
      { naam: "Melk (halfvol)", portie: "100ml", kcal: 50, eiwit: 3, koolhydraten: 5, vetten: 1.6 },
      { naam: "Banaan", portie: "1/2 stuk", kcal: 53, eiwit: 1, koolhydraten: 14, vetten: 0 },
    ],
  },
  {
    naam: "Ontbijt",
    tijd: "08:00",
    bereidingswijze: "Kwark met fruit en een handje havermout. Koud serveren.",
    ingrediënten: [
      { naam: "Kwark (mager)", portie: "200g", kcal: 114, eiwit: 20, koolhydraten: 7, vetten: 0.4 },
      { naam: "Havermout", portie: "30g", kcal: 108, eiwit: 4, koolhydraten: 18, vetten: 2 },
      { naam: "Appel", portie: "1 middelgroot", kcal: 95, eiwit: 0, koolhydraten: 25, vetten: 0 },
    ],
  },
  {
    naam: "Ontbijt",
    tijd: "08:00",
    bereidingswijze: "Yoghurtbowl met havermout en aardbeien. Niet verwarmen.",
    ingrediënten: [
      { naam: "Griekse yoghurt (mager)", portie: "200g", kcal: 118, eiwit: 20, koolhydraten: 7, vetten: 0.8 },
      { naam: "Havermout", portie: "40g", kcal: 144, eiwit: 5, koolhydraten: 24, vetten: 2 },
      { naam: "Aardbeien", portie: "120g", kcal: 38, eiwit: 1, koolhydraten: 10, vetten: 0 },
    ],
  },
];

const LUNCH_OPTIES: MealTemplate[] = [
  {
    naam: "Lunch",
    tijd: "12:30",
    bereidingswijze: "Bak de kipfilet. Serveer met zoete aardappel en broccoli.",
    ingrediënten: [
      { naam: "Kipfilet", portie: "150g", kcal: 248, eiwit: 46, koolhydraten: 0, vetten: 5 },
      { naam: "Zoete aardappel", portie: "200g", kcal: 180, eiwit: 4, koolhydraten: 41, vetten: 0 },
      { naam: "Broccoli", portie: "150g", kcal: 51, eiwit: 4, koolhydraten: 10, vetten: 1 },
      { naam: "Olijfolie", portie: "1 el", kcal: 120, eiwit: 0, koolhydraten: 0, vetten: 14 },
    ],
  },
  {
    naam: "Lunch",
    tijd: "12:30",
    bereidingswijze: "Bak de kalkoenfilet. Serveer met rijst en spinazie.",
    ingrediënten: [
      { naam: "Kalkoenfilet", portie: "150g", kcal: 203, eiwit: 45, koolhydraten: 0, vetten: 1.5 },
      { naam: "Rijst (gekookt)", portie: "150g", kcal: 195, eiwit: 4, koolhydraten: 42, vetten: 0.5 },
      { naam: "Spinazie (rauw)", portie: "100g", kcal: 23, eiwit: 3, koolhydraten: 4, vetten: 0 },
      { naam: "Olijfolie", portie: "1 el", kcal: 120, eiwit: 0, koolhydraten: 0, vetten: 14 },
    ],
  },
  {
    naam: "Lunch",
    tijd: "12:30",
    bereidingswijze: "Tonijn mengen met komkommer en tomaat. Serveer met volkoren brood.",
    ingrediënten: [
      { naam: "Tonijn (vers)", portie: "120g", kcal: 173, eiwit: 36, koolhydraten: 0, vetten: 1 },
      { naam: "Brood (volkoren)", portie: "2 sneden", kcal: 160, eiwit: 8, koolhydraten: 26, vetten: 2 },
      { naam: "Komkommer", portie: "100g", kcal: 16, eiwit: 1, koolhydraten: 4, vetten: 0 },
      { naam: "Tomaten", portie: "100g", kcal: 18, eiwit: 1, koolhydraten: 4, vetten: 0 },
    ],
  },
  {
    naam: "Lunch",
    tijd: "12:30",
    bereidingswijze: "Bak magere rundergehakt. Serveer met pasta en paprika.",
    ingrediënten: [
      { naam: "Rundergehakt (mager)", portie: "120g", kcal: 300, eiwit: 31, koolhydraten: 0, vetten: 18 },
      { naam: "Pasta (gekookt)", portie: "150g", kcal: 197, eiwit: 7.5, koolhydraten: 39, vetten: 1.5 },
      { naam: "Paprika (rood)", portie: "100g", kcal: 31, eiwit: 1, koolhydraten: 7, vetten: 0 },
    ],
  },
  {
    naam: "Lunch",
    tijd: "12:30",
    bereidingswijze: "Kook eieren. Serveer met aardappel en groene bonen.",
    ingrediënten: [
      { naam: "Ei (heel)", portie: "2 stuks", kcal: 155, eiwit: 13, koolhydraten: 1, vetten: 11 },
      { naam: "Aardappel (gekookt)", portie: "200g", kcal: 174, eiwit: 4, koolhydraten: 40, vetten: 0 },
      { naam: "Groene bonen", portie: "150g", kcal: 47, eiwit: 3, koolhydraten: 10, vetten: 0 },
    ],
  },
  {
    naam: "Lunch",
    tijd: "12:30",
    bereidingswijze: "Bak kippendij. Serveer met quinoa en courgette.",
    ingrediënten: [
      { naam: "Kippendij", portie: "140g", kcal: 293, eiwit: 36, koolhydraten: 0, vetten: 15 },
      { naam: "Quinoa (gekookt)", portie: "150g", kcal: 180, eiwit: 6.6, koolhydraten: 33, vetten: 2.9 },
      { naam: "Courgette", portie: "150g", kcal: 26, eiwit: 2, koolhydraten: 5, vetten: 0 },
    ],
  },
  {
    naam: "Lunch",
    tijd: "12:30",
    bereidingswijze: "Kabeljauw bakken of stomen. Serveer met zoete aardappel en bloemkool.",
    ingrediënten: [
      { naam: "Kabeljauw", portie: "160g", kcal: 131, eiwit: 29, koolhydraten: 0, vetten: 1 },
      { naam: "Zoete aardappel", portie: "180g", kcal: 162, eiwit: 3, koolhydraten: 37, vetten: 0 },
      { naam: "Bloemkool", portie: "150g", kcal: 38, eiwit: 3, koolhydraten: 8, vetten: 0 },
      { naam: "Olijfolie", portie: "1 el", kcal: 120, eiwit: 0, koolhydraten: 0, vetten: 14 },
    ],
  },
];

const DINER_OPTIES: MealTemplate[] = [
  {
    naam: "Diner",
    tijd: "18:00",
    bereidingswijze: "Bak de zalm. Kook quinoa. Stoom groene bonen. Serveer met avocado.",
    ingrediënten: [
      { naam: "Zalm", portie: "150g", kcal: 312, eiwit: 44, koolhydraten: 0, vetten: 14 },
      { naam: "Quinoa", portie: "100g (gekookt)", kcal: 120, eiwit: 4, koolhydraten: 22, vetten: 2 },
      { naam: "Groene bonen", portie: "150g", kcal: 44, eiwit: 2, koolhydraten: 10, vetten: 0 },
      { naam: "Avocado", portie: "50g", kcal: 80, eiwit: 1, koolhydraten: 4, vetten: 7 },
    ],
  },
  {
    naam: "Diner",
    tijd: "18:00",
    bereidingswijze: "Bak kipfilet. Serveer met bruine rijst en broccoli.",
    ingrediënten: [
      { naam: "Kipfilet", portie: "160g", kcal: 264, eiwit: 50, koolhydraten: 0, vetten: 6 },
      { naam: "Bruine rijst (gekookt)", portie: "150g", kcal: 167, eiwit: 4, koolhydraten: 35, vetten: 1 },
      { naam: "Broccoli", portie: "150g", kcal: 51, eiwit: 4, koolhydraten: 10, vetten: 1 },
      { naam: "Olijfolie", portie: "1 el", kcal: 120, eiwit: 0, koolhydraten: 0, vetten: 14 },
    ],
  },
  {
    naam: "Diner",
    tijd: "18:00",
    bereidingswijze: "Bak of grill magere rundvlees. Serveer met aardappel en spinazie.",
    ingrediënten: [
      { naam: "Rundvlees (mager)", portie: "140g", kcal: 350, eiwit: 36, koolhydraten: 0, vetten: 21 },
      { naam: "Aardappel (gekookt)", portie: "200g", kcal: 174, eiwit: 4, koolhydraten: 40, vetten: 0 },
      { naam: "Spinazie (gekookt)", portie: "150g", kcal: 35, eiwit: 4.5, koolhydraten: 6, vetten: 0.5 },
    ],
  },
  {
    naam: "Diner",
    tijd: "18:00",
    bereidingswijze: "Bak makreel kort in de pan. Serveer met zoete aardappel en paprika.",
    ingrediënten: [
      { naam: "Makreel", portie: "140g", kcal: 287, eiwit: 27, koolhydraten: 0, vetten: 20 },
      { naam: "Zoete aardappel", portie: "180g", kcal: 162, eiwit: 3, koolhydraten: 37, vetten: 0 },
      { naam: "Paprika (rood)", portie: "120g", kcal: 37, eiwit: 1, koolhydraten: 8, vetten: 0 },
    ],
  },
  {
    naam: "Diner",
    tijd: "18:00",
    bereidingswijze: "Bak garnalen snel. Serveer met pasta en courgette.",
    ingrediënten: [
      { naam: "Garnalen", portie: "150g", kcal: 149, eiwit: 36, koolhydraten: 0, vetten: 0.5 },
      { naam: "Pasta (gekookt)", portie: "150g", kcal: 197, eiwit: 7.5, koolhydraten: 39, vetten: 1.5 },
      { naam: "Courgette", portie: "150g", kcal: 26, eiwit: 2, koolhydraten: 5, vetten: 0 },
      { naam: "Olijfolie", portie: "1 el", kcal: 120, eiwit: 0, koolhydraten: 0, vetten: 14 },
    ],
  },
  {
    naam: "Diner",
    tijd: "18:00",
    bereidingswijze: "Kalkoenfilet bakken. Serveer met quinoa en boerenkool.",
    ingrediënten: [
      { naam: "Kalkoenfilet", portie: "160g", kcal: 216, eiwit: 48, koolhydraten: 0, vetten: 1.6 },
      { naam: "Quinoa (gekookt)", portie: "140g", kcal: 168, eiwit: 6, koolhydraten: 31, vetten: 2.7 },
      { naam: "Boerenkool", portie: "120g", kcal: 59, eiwit: 5, koolhydraten: 11, vetten: 1 },
    ],
  },
  {
    naam: "Diner",
    tijd: "18:00",
    bereidingswijze: "Kabeljauw in de oven of pan. Serveer met rijst en broccoli.",
    ingrediënten: [
      { naam: "Kabeljauw", portie: "170g", kcal: 139, eiwit: 31, koolhydraten: 0, vetten: 1 },
      { naam: "Rijst (gekookt)", portie: "160g", kcal: 208, eiwit: 4, koolhydraten: 45, vetten: 0.5 },
      { naam: "Broccoli", portie: "150g", kcal: 51, eiwit: 4, koolhydraten: 10, vetten: 1 },
      { naam: "Olijfolie", portie: "1 el", kcal: 120, eiwit: 0, koolhydraten: 0, vetten: 14 },
    ],
  },
];

const SNACK_OPTIES: MealTemplate[] = [
  {
    naam: "Tussendoortje",
    tijd: "10:00",
    bereidingswijze: "Kwark met een handje amandelen als tussendoortje.",
    ingrediënten: [
      { naam: "Kwark (mager)", portie: "150g", kcal: 86, eiwit: 15, koolhydraten: 5, vetten: 0.3 },
      { naam: "Amandelen", portie: "15g", kcal: 87, eiwit: 3, koolhydraten: 3, vetten: 7.5 },
    ],
  },
  {
    naam: "Tussendoortje",
    tijd: "15:00",
    bereidingswijze: "Yoghurt met appel.",
    ingrediënten: [
      { naam: "Griekse yoghurt (mager)", portie: "150g", kcal: 89, eiwit: 15, koolhydraten: 5, vetten: 0.6 },
      { naam: "Appel", portie: "1 middelgroot", kcal: 95, eiwit: 0, koolhydraten: 25, vetten: 0 },
    ],
  },
  {
    naam: "Tussendoortje",
    tijd: "10:00",
    bereidingswijze: "Skyr met blauwe bessen.",
    ingrediënten: [
      { naam: "Skyr", portie: "150g", kcal: 89, eiwit: 16.5, koolhydraten: 6, vetten: 0.3 },
      { naam: "Blauwe bessen", portie: "80g", kcal: 46, eiwit: 1, koolhydraten: 11, vetten: 0 },
    ],
  },
  {
    naam: "Tussendoortje",
    tijd: "15:00",
    bereidingswijze: "Havermoutkoekje-vervanger: yoghurt met havermout en aardbei.",
    ingrediënten: [
      { naam: "Griekse yoghurt (vol)", portie: "125g", kcal: 121, eiwit: 12.5, koolhydraten: 4.5, vetten: 6 },
      { naam: "Havermout", portie: "20g", kcal: 72, eiwit: 2.5, koolhydraten: 12, vetten: 1 },
      { naam: "Aardbeien", portie: "80g", kcal: 26, eiwit: 1, koolhydraten: 6, vetten: 0 },
    ],
  },
  {
    naam: "Tussendoortje",
    tijd: "10:00",
    bereidingswijze: "Kwark met walnoten.",
    ingrediënten: [
      { naam: "Kwark (vol)", portie: "125g", kcal: 123, eiwit: 15, koolhydraten: 4, vetten: 5 },
      { naam: "Walnoten", portie: "15g", kcal: 98, eiwit: 2, koolhydraten: 2, vetten: 10 },
    ],
  },
  {
    naam: "Tussendoortje",
    tijd: "15:00",
    bereidingswijze: "Appel met amandelen.",
    ingrediënten: [
      { naam: "Appel", portie: "1 middelgroot", kcal: 95, eiwit: 0, koolhydraten: 25, vetten: 0 },
      { naam: "Amandelen", portie: "20g", kcal: 116, eiwit: 4, koolhydraten: 4, vetten: 10 },
    ],
  },
  {
    naam: "Tussendoortje",
    tijd: "10:00",
    bereidingswijze: "Magere kwark met banaan.",
    ingrediënten: [
      { naam: "Kwark (mager)", portie: "175g", kcal: 100, eiwit: 17.5, koolhydraten: 6, vetten: 0.4 },
      { naam: "Banaan", portie: "1/2 stuk", kcal: 53, eiwit: 1, koolhydraten: 14, vetten: 0 },
    ],
  },
];

function pick<T>(items: T[], dayIndex: number, salt: number): T {
  return items[(dayIndex + salt) % items.length];
}

export function buildDefaultMaaltijden(dayIndex = 0): Maaltijd[] {
  const ontbijt = pick(ONTBIJT_OPTIES, dayIndex, 0);
  const lunch = pick(LUNCH_OPTIES, dayIndex, 1);
  const diner = pick(DINER_OPTIES, dayIndex, 2);
  const snack1 = pick(SNACK_OPTIES, dayIndex, 3);
  const snack2 = pick(SNACK_OPTIES, dayIndex, 5);

  return [
    withMealTotals({ ...ontbijt, id: `${dayIndex}-1` }),
    withMealTotals({ ...snack1, id: `${dayIndex}-2`, naam: "Tussendoortje ochtend", tijd: "10:00" }),
    withMealTotals({ ...lunch, id: `${dayIndex}-3` }),
    withMealTotals({ ...snack2, id: `${dayIndex}-4`, naam: "Tussendoortje middag", tijd: "15:00" }),
    withMealTotals({ ...diner, id: `${dayIndex}-5` }),
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

export function buildWeekmenu(
  targets: MacroTargets,
  exclusions: string[] = [],
  mealCount = 5
): DagMenu[] {
  const count = Math.min(6, Math.max(3, mealCount || 5));
  return DAGEN.map((dagNaam, dayIndex) => {
    let meals = applyExclusionsToMaaltijden(buildDefaultMaaltijden(dayIndex), exclusions);
    // Default is 5 meals: ontbijt, snack ochtend, lunch, snack middag, diner
    if (count <= 3) {
      meals = [meals[0], meals[2], meals[4]];
    } else if (count === 4) {
      meals = [meals[0], meals[2], meals[3], meals[4]];
    }
    return buildDagMenu(dagNaam, meals, targets);
  });
}

/** Detect identical-day menus that were incorrectly auto-saved earlier */
export function isUniformWeekMenu(weekMenu: DagMenu[] | null | undefined): boolean {
  if (!weekMenu || weekMenu.length < 2) return false;
  const signature = (dag: DagMenu) =>
    JSON.stringify(
      dag.maaltijden.map((m) => ({
        naam: m.naam,
        ings: m.ingrediënten.map((i) => i.naam),
      }))
    );
  const first = signature(weekMenu[0]);
  return weekMenu.every((dag) => signature(dag) === first);
}
