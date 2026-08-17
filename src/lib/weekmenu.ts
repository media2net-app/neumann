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

export type WeekmenuOptions = {
  exclusions?: string[];
  /** Geselecteerde eiwitbronnen uit de AI-generator, bv. Kip, Rundvlees, Eieren */
  preferredProteins?: string[];
  /** bv. Eiwitrijk, Low-carb */
  styles?: string[];
  mealCount?: number;
  /** 0–6 offset zodat opnieuw genereren andere combinaties geeft */
  varietySeed?: number;
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
    totaleKcal: Math.round(totals.kcal),
    eiwit: round1(totals.eiwit),
    koolhydraten: round1(totals.koolhydraten),
    vetten: round1(totals.vetten),
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
    dagTotaal: {
      kcal: Math.round(dagTotaal.kcal),
      eiwit: round1(dagTotaal.eiwit),
      koolhydraten: round1(dagTotaal.koolhydraten),
      vetten: round1(dagTotaal.vetten),
    },
    percentages: {
      eiwit: Math.round((dagTotaal.eiwit / Math.max(1, targets.eiwit)) * 100) || 0,
      koolhydraten:
        Math.round((dagTotaal.koolhydraten / Math.max(1, targets.koolhydraten)) * 100) || 0,
      vetten: Math.round((dagTotaal.vetten / Math.max(1, targets.vetten)) * 100) || 0,
      kcal: Math.round((dagTotaal.kcal / Math.max(1, targets.doelKcal)) * 100) || 0,
    },
    nogNodig: {
      eiwit: Math.max(0, round1(targets.eiwit - dagTotaal.eiwit)),
      koolhydraten: Math.max(0, round1(targets.koolhydraten - dagTotaal.koolhydraten)),
      vetten: Math.max(0, round1(targets.vetten - dagTotaal.vetten)),
      kcal: Math.max(0, Math.round(targets.doelKcal - dagTotaal.kcal)),
    },
  };
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

type MealTemplate = Omit<Maaltijd, "totaleKcal" | "eiwit" | "koolhydraten" | "vetten" | "id">;

/** Per 100g referentie voor swaps / schalen */
type ProteinRef = {
  key: string;
  labels: string[];
  naam: string;
  kcal: number;
  eiwit: number;
  koolhydraten: number;
  vetten: number;
  warm: boolean;
};

const PROTEIN_REFS: ProteinRef[] = [
  {
    key: "kip",
    labels: ["kip", "kipfilet", "kippendij"],
    naam: "Kipfilet",
    kcal: 165,
    eiwit: 31,
    koolhydraten: 0,
    vetten: 3.6,
    warm: true,
  },
  {
    key: "rundvlees",
    labels: ["rund", "rundergehakt", "rundvlees"],
    naam: "Rundvlees (mager)",
    kcal: 250,
    eiwit: 26,
    koolhydraten: 0,
    vetten: 15,
    warm: true,
  },
  {
    key: "varkensvlees",
    labels: ["varken", "varkenshaas", "varkensvlees"],
    naam: "Varkenshaas",
    kcal: 143,
    eiwit: 22,
    koolhydraten: 0,
    vetten: 6,
    warm: true,
  },
  {
    key: "kalkoen",
    labels: ["kalkoen"],
    naam: "Kalkoenfilet",
    kcal: 135,
    eiwit: 30,
    koolhydraten: 0,
    vetten: 1,
    warm: true,
  },
  {
    key: "zalm",
    labels: ["zalm"],
    naam: "Zalm",
    kcal: 208,
    eiwit: 20,
    koolhydraten: 0,
    vetten: 13,
    warm: true,
  },
  {
    key: "makreel",
    labels: ["makreel"],
    naam: "Makreel",
    kcal: 205,
    eiwit: 19,
    koolhydraten: 0,
    vetten: 14,
    warm: true,
  },
  {
    key: "tonijn",
    labels: ["tonijn"],
    naam: "Tonijn (vers)",
    kcal: 144,
    eiwit: 30,
    koolhydraten: 0,
    vetten: 1,
    warm: true,
  },
  {
    key: "kabeljauw",
    labels: ["kabeljauw"],
    naam: "Kabeljauw",
    kcal: 82,
    eiwit: 18,
    koolhydraten: 0,
    vetten: 0.7,
    warm: true,
  },
  {
    key: "garnalen",
    labels: ["garnaal", "garnalen"],
    naam: "Garnalen",
    kcal: 99,
    eiwit: 24,
    koolhydraten: 0,
    vetten: 0.3,
    warm: true,
  },
  {
    key: "eieren",
    labels: ["ei", "eieren"],
    naam: "Ei (heel)",
    kcal: 155,
    eiwit: 13,
    koolhydraten: 1.1,
    vetten: 11,
    warm: true,
  },
  {
    key: "tofu",
    labels: ["tofu"],
    naam: "Tofu",
    kcal: 76,
    eiwit: 8,
    koolhydraten: 1.9,
    vetten: 4.8,
    warm: true,
  },
  {
    key: "tempeh",
    labels: ["tempeh"],
    naam: "Tempeh",
    kcal: 193,
    eiwit: 19,
    koolhydraten: 9,
    vetten: 11,
    warm: true,
  },
  {
    key: "kwark",
    labels: ["kwark"],
    naam: "Kwark (mager)",
    kcal: 57,
    eiwit: 10,
    koolhydraten: 3.5,
    vetten: 0.2,
    warm: false,
  },
  {
    key: "yoghurt",
    labels: ["yoghurt", "skyr"],
    naam: "Skyr",
    kcal: 59,
    eiwit: 11,
    koolhydraten: 4,
    vetten: 0.2,
    warm: false,
  },
];

const VIS_KEYS = ["zalm", "makreel", "tonijn", "kabeljauw", "garnalen"];

function normalizePreference(pref: string): string {
  const p = pref.toLowerCase().trim();
  if (p === "vis") return "vis";
  if (p.startsWith("ei")) return "eieren";
  if (p.includes("kip")) return "kip";
  if (p.includes("rund")) return "rundvlees";
  if (p.includes("varken")) return "varkensvlees";
  if (p.includes("kalkoen")) return "kalkoen";
  if (p.includes("zalm")) return "zalm";
  if (p.includes("makreel")) return "makreel";
  if (p.includes("tonijn")) return "tonijn";
  if (p.includes("kabeljauw")) return "kabeljauw";
  if (p.includes("garnaal")) return "garnalen";
  if (p.includes("tofu")) return "tofu";
  if (p.includes("tempeh")) return "tempeh";
  return p;
}

function resolvePreferredKeys(preferred: string[]): string[] {
  const keys: string[] = [];
  for (const pref of preferred) {
    const n = normalizePreference(pref);
    if (n === "vis") {
      keys.push(...VIS_KEYS);
    } else if (PROTEIN_REFS.some((r) => r.key === n)) {
      keys.push(n);
    }
  }
  return [...new Set(keys)];
}

function findProteinRef(ingredientName: string): ProteinRef | null {
  const name = ingredientName.toLowerCase();
  // Prefer longer/more specific labels first
  const ranked = [...PROTEIN_REFS].sort(
    (a, b) => Math.max(...b.labels.map((l) => l.length)) - Math.max(...a.labels.map((l) => l.length))
  );
  for (const ref of ranked) {
    for (const label of ref.labels) {
      if (label.length <= 2) {
        // Short labels like "ei" must be whole words — not "aardbeien"
        const re = new RegExp(`(^|[^a-z])${label}(en)?([^a-z]|$)`, "i");
        if (re.test(name)) return ref;
      } else if (name === label || name.includes(label)) {
        return ref;
      }
    }
  }
  return null;
}

function isMainProteinIngredient(ing: Ingredient): boolean {
  const ref = findProteinRef(ing.naam);
  if (!ref) return false;
  // Havermout/fruit etc. are not main proteins even if somehow matched
  return ref.warm || ref.key === "kwark" || ref.key === "yoghurt" || ref.key === "eieren";
}

function proteinFromGrams(ref: ProteinRef, grams: number): Ingredient {
  let useGrams = grams;
  if (ref.key === "eieren") {
    // Max ~4 eieren per maaltijd (≈200g), anders onrealistisch
    useGrams = Math.min(200, Math.max(50, grams));
  } else {
    useGrams = Math.min(350, Math.max(80, grams));
  }
  const f = useGrams / 100;
  const portie =
    ref.key === "eieren"
      ? `${Math.max(1, Math.round(useGrams / 50))} stuks`
      : `${Math.round(useGrams)}g`;
  return {
    naam: ref.naam,
    portie,
    kcal: Math.round(ref.kcal * f),
    eiwit: round1(ref.eiwit * f),
    koolhydraten: round1(ref.koolhydraten * f),
    vetten: round1(ref.vetten * f),
  };
}

function estimateGrams(ing: Ingredient, ref: ProteinRef | null): number {
  if (ref && ref.eiwit > 0 && ing.eiwit > 0) {
    return Math.max(40, Math.round((ing.eiwit / ref.eiwit) * 100));
  }
  const m = ing.portie.match(/(\d+(?:[.,]\d+)?)\s*g/i);
  if (m) return Math.round(parseFloat(m[1].replace(",", ".")));
  const stuks = ing.portie.match(/(\d+)\s*stuk/i);
  if (stuks && ref?.key === "eieren") return parseInt(stuks[1], 10) * 50;
  return 120;
}

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
  {
    naam: "Lunch",
    tijd: "12:30",
    bereidingswijze: "Wraps met kip, paprika en cottage cheese.",
    ingrediënten: [
      { naam: "Kipfilet", portie: "140g", kcal: 231, eiwit: 43, koolhydraten: 0, vetten: 5 },
      { naam: "Brood (volkoren)", portie: "2 sneden", kcal: 160, eiwit: 8, koolhydraten: 26, vetten: 2 },
      { naam: "Paprika (rood)", portie: "100g", kcal: 31, eiwit: 1, koolhydraten: 7, vetten: 0 },
      { naam: "Cottage cheese", portie: "100g", kcal: 98, eiwit: 11, koolhydraten: 3.4, vetten: 4.3 },
    ],
  },
  {
    naam: "Lunch",
    tijd: "12:30",
    bereidingswijze: "Zalm salade met volkoren pasta en komkommer.",
    ingrediënten: [
      { naam: "Zalm", portie: "130g", kcal: 270, eiwit: 38, koolhydraten: 0, vetten: 12 },
      { naam: "Volkoren pasta (gekookt)", portie: "140g", kcal: 174, eiwit: 7, koolhydraten: 35, vetten: 1.5 },
      { naam: "Komkommer", portie: "100g", kcal: 16, eiwit: 1, koolhydraten: 4, vetten: 0 },
    ],
  },
  {
    naam: "Lunch",
    tijd: "12:30",
    bereidingswijze: "Linzen stoofpot met mager rundvlees en wortelen.",
    ingrediënten: [
      { naam: "Rundvlees (mager)", portie: "120g", kcal: 300, eiwit: 31, koolhydraten: 0, vetten: 18 },
      { naam: "Linzen (gekookt)", portie: "150g", kcal: 174, eiwit: 14, koolhydraten: 30, vetten: 0.6 },
      { naam: "Wortelen (rauw)", portie: "100g", kcal: 41, eiwit: 0.9, koolhydraten: 10, vetten: 0.2 },
    ],
  },
  {
    naam: "Lunch",
    tijd: "12:30",
    bereidingswijze: "Tofu roerbak met bruine rijst en paksoi.",
    ingrediënten: [
      { naam: "Tofu", portie: "180g", kcal: 137, eiwit: 14, koolhydraten: 3.4, vetten: 8.6 },
      { naam: "Bruine rijst (gekookt)", portie: "150g", kcal: 167, eiwit: 4, koolhydraten: 35, vetten: 1 },
      { naam: "Paksoi", portie: "150g", kcal: 20, eiwit: 2, koolhydraten: 3, vetten: 0.3 },
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
  {
    naam: "Diner",
    tijd: "18:00",
    bereidingswijze: "Roer roerbak met kip, paprika en volkoren rijst.",
    ingrediënten: [
      { naam: "Kipfilet", portie: "150g", kcal: 248, eiwit: 46, koolhydraten: 0, vetten: 5 },
      { naam: "Bruine rijst (gekookt)", portie: "150g", kcal: 167, eiwit: 4, koolhydraten: 35, vetten: 1 },
      { naam: "Paprika (rood)", portie: "120g", kcal: 37, eiwit: 1, koolhydraten: 8, vetten: 0 },
      { naam: "Olijfolie", portie: "1 el", kcal: 120, eiwit: 0, koolhydraten: 0, vetten: 14 },
    ],
  },
  {
    naam: "Diner",
    tijd: "18:00",
    bereidingswijze: "Pasta met mager rundergehakt en courgette.",
    ingrediënten: [
      { naam: "Rundergehakt (mager)", portie: "130g", kcal: 325, eiwit: 34, koolhydraten: 0, vetten: 20 },
      { naam: "Volkoren pasta (gekookt)", portie: "150g", kcal: 186, eiwit: 7.5, koolhydraten: 37, vetten: 1.5 },
      { naam: "Courgette", portie: "150g", kcal: 26, eiwit: 2, koolhydraten: 5, vetten: 0 },
    ],
  },
  {
    naam: "Diner",
    tijd: "18:00",
    bereidingswijze: "Tonijn salade met quinoa en spinazie.",
    ingrediënten: [
      { naam: "Tonijn (vers)", portie: "150g", kcal: 216, eiwit: 45, koolhydraten: 0, vetten: 1.5 },
      { naam: "Quinoa (gekookt)", portie: "140g", kcal: 168, eiwit: 6, koolhydraten: 31, vetten: 2.7 },
      { naam: "Spinazie (rauw)", portie: "100g", kcal: 23, eiwit: 3, koolhydraten: 4, vetten: 0 },
      { naam: "Olijfolie", portie: "1 el", kcal: 120, eiwit: 0, koolhydraten: 0, vetten: 14 },
    ],
  },
  {
    naam: "Diner",
    tijd: "18:00",
    bereidingswijze: "Omelet met groenten en volkoren brood.",
    ingrediënten: [
      { naam: "Ei (heel)", portie: "3 stuks", kcal: 233, eiwit: 20, koolhydraten: 1.5, vetten: 16 },
      { naam: "Broccoli", portie: "150g", kcal: 51, eiwit: 4, koolhydraten: 10, vetten: 1 },
      { naam: "Brood (volkoren)", portie: "2 sneden", kcal: 160, eiwit: 8, koolhydraten: 26, vetten: 2 },
    ],
  },
  {
    naam: "Diner",
    tijd: "18:00",
    bereidingswijze: "Varkenshaas met zoete aardappel en boerenkool.",
    ingrediënten: [
      { naam: "Varkenshaas", portie: "160g", kcal: 229, eiwit: 35, koolhydraten: 0, vetten: 10 },
      { naam: "Zoete aardappel", portie: "180g", kcal: 162, eiwit: 3, koolhydraten: 37, vetten: 0 },
      { naam: "Boerenkool", portie: "120g", kcal: 59, eiwit: 5, koolhydraten: 11, vetten: 1 },
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

function pick<T>(items: T[], dayIndex: number, salt: number, varietySeed = 0): T {
  return items[(dayIndex + salt + varietySeed) % items.length];
}

function mealHasPreferredProtein(template: MealTemplate, preferredKeys: string[]): boolean {
  if (preferredKeys.length === 0) return true;
  return template.ingrediënten.some((ing) => {
    const ref = findProteinRef(ing.naam);
    return ref ? preferredKeys.includes(ref.key) : false;
  });
}

function pickPreferred(
  options: MealTemplate[],
  dayIndex: number,
  salt: number,
  preferredKeys: string[],
  varietySeed = 0
): MealTemplate {
  if (preferredKeys.length === 0) return pick(options, dayIndex, salt, varietySeed);
  const matching = options.filter((o) => mealHasPreferredProtein(o, preferredKeys));
  if (matching.length === 0) return pick(options, dayIndex, salt, varietySeed);
  return pick(matching, dayIndex, salt, varietySeed);
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
  const ex = normalizePreference(exclusion);
  if (ex === "vis") {
    return VIS_NAMEN.some((vis) => name.includes(vis));
  }
  if (ex === "eieren") {
    return /\bei\b|eieren|eiwit\b/i.test(name) && !name.includes("eiwitrijk");
  }
  if (ex === "kip") return name.includes("kip");
  if (ex === "rundvlees") return name.includes("rund");
  if (ex === "varkensvlees") return name.includes("varken");
  return name.includes(exclusion.toLowerCase());
}

function replaceProteinIngredient(
  ing: Ingredient,
  preferredKeys: string[],
  dayIndex: number,
  slot: number
): Ingredient {
  const warmKeys = preferredKeys.filter((k) => {
    const ref = PROTEIN_REFS.find((r) => r.key === k);
    return ref?.warm;
  });
  const pool = warmKeys.length > 0 ? warmKeys : preferredKeys;
  if (pool.length === 0) return ing;

  const key = pool[(dayIndex + slot) % pool.length];
  const ref = PROTEIN_REFS.find((r) => r.key === key);
  if (!ref) return ing;

  const oldRef = findProteinRef(ing.naam);
  const grams = estimateGrams(ing, oldRef);
  const targetProtein = Math.max(Math.min(ing.eiwit, 45), 28);
  const gramsForProtein = Math.round((targetProtein / Math.max(0.1, ref.eiwit)) * 100);
  const useGrams =
    ref.key === "eieren"
      ? Math.min(200, Math.max(100, gramsForProtein))
      : Math.min(280, Math.max(120, Math.round((grams + gramsForProtein) / 2)));

  return proteinFromGrams(ref, useGrams);
}

export function applyExclusionsToMaaltijden(
  maaltijden: Maaltijd[],
  exclusions: string[],
  preferredProteins: string[] = []
): Maaltijd[] {
  const preferredKeys = resolvePreferredKeys(preferredProteins);

  return maaltijden.map((maaltijd, mealIndex) => {
    let bereidingswijze = maaltijd.bereidingswijze || "";
    let replacedProtein = false;
    const ingrediënten: Ingredient[] = [];

    for (const ing of maaltijd.ingrediënten) {
      const excluded = exclusions.some((ex) => ingredientMatchesExclusion(ing.naam, ex));
      if (!excluded) {
        ingrediënten.push(ing);
        continue;
      }

      bereidingswijze = cleanBereidingswijze(bereidingswijze, ing.naam);

      if (isMainProteinIngredient(ing) && preferredKeys.length > 0 && !replacedProtein) {
        const replacement = replaceProteinIngredient(ing, preferredKeys, mealIndex, mealIndex);
        ingrediënten.push(replacement);
        bereidingswijze = `${bereidingswijze} Gebruik ${replacement.naam} als eiwitbron.`.trim();
        replacedProtein = true;
      }
    }

    // Warm meal without any preferred protein → inject one
    const isWarmMeal = /lunch|diner/i.test(maaltijd.naam);
    const hasWarmProtein = ingrediënten.some((ing) => findProteinRef(ing.naam)?.warm);
    if (isWarmMeal && preferredKeys.length > 0 && !hasWarmProtein) {
      const warmKeys = preferredKeys.filter((k) => PROTEIN_REFS.find((r) => r.key === k)?.warm);
      const key = (warmKeys.length ? warmKeys : preferredKeys)[mealIndex % Math.max(1, (warmKeys.length || preferredKeys.length))];
      const ref = PROTEIN_REFS.find((r) => r.key === key);
      if (ref) {
        const injected = proteinFromGrams(ref, 160);
        ingrediënten.unshift(injected);
        bereidingswijze = `Bereid ${injected.naam}. ${bereidingswijze}`.trim();
      }
    }

    return withMealTotals({ ...maaltijd, ingrediënten, bereidingswijze });
  });
}

function classifyMacroRole(ing: Ingredient): "protein" | "carb" | "fat" | "mixed" {
  const name = ing.naam.toLowerCase();
  if (
    name.includes("olie") ||
    name.includes("avocado") ||
    name.includes("amandel") ||
    name.includes("walnoot") ||
    name.includes("pinda")
  ) {
    return "fat";
  }
  const ref = findProteinRef(ing.naam);
  if (ref && (ref.warm || ref.key === "kwark" || ref.key === "yoghurt" || ref.key === "eieren")) {
    return "protein";
  }
  if (
    name.includes("rijst") ||
    name.includes("pasta") ||
    name.includes("aardappel") ||
    name.includes("havermout") ||
    name.includes("brood") ||
    name.includes("quinoa") ||
    name.includes("banaan") ||
    name.includes("appel") ||
    name.includes("aardbei") ||
    name.includes("bes") ||
    name.includes("fruit")
  ) {
    return "carb";
  }
  if (ing.eiwit >= 8 && ing.eiwit >= ing.koolhydraten && ing.eiwit >= ing.vetten) return "protein";
  if (ing.koolhydraten >= 8 && ing.koolhydraten >= ing.eiwit) return "carb";
  if (ing.vetten >= 8 && ing.vetten >= ing.eiwit) return "fat";
  return "mixed";
}

/** Parse portie string naar gram-equivalent voor herberekening */
export function parsePortieGrams(portie: string): number | null {
  const trimmed = portie.trim();
  const gramMatch = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*g\b/i);
  if (gramMatch) return parseFloat(gramMatch[1].replace(",", "."));

  const mlMatch = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*ml\b/i);
  if (mlMatch) return parseFloat(mlMatch[1].replace(",", "."));

  const stukMatch = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*stuk/i);
  if (stukMatch) return parseFloat(stukMatch[1].replace(",", ".")) * 50;

  if (/1\/2\s*stuk/i.test(trimmed)) return 50;
  if (/1\s*middelgroot/i.test(trimmed)) return 120;

  const elMatch = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*el\b/i);
  if (elMatch) return parseFloat(elMatch[1].replace(",", ".")) * 15;

  const snedenMatch = trimmed.match(/^(\d+)\s*sneden/i);
  if (snedenMatch) return parseInt(snedenMatch[1], 10) * 35;

  return null;
}

export function formatPortieGrams(grams: number): string {
  return `${Math.round(grams)}g`;
}

export function scaleIngredient(ing: Ingredient, factor: number): Ingredient {
  const f = Math.max(0.15, Math.min(4.5, factor));
  if (Math.abs(f - 1) < 0.02) return ing;

  let portie = ing.portie;
  const gramMatch = portie.match(/^(\d+(?:[.,]\d+)?)\s*g\b(.*)$/i);
  if (gramMatch) {
    const grams = Math.max(10, Math.round(parseFloat(gramMatch[1].replace(",", ".")) * f));
    portie = `${grams}g${gramMatch[2] || ""}`;
  } else {
    const stukMatch = portie.match(/^(\d+)\s*(stuks?|sneden)\b(.*)$/i);
    if (stukMatch) {
      const n = Math.max(1, Math.round(parseInt(stukMatch[1], 10) * f));
      portie = `${n} ${stukMatch[2]}${stukMatch[3] || ""}`;
    } else {
      const mlMatch = portie.match(/^(\d+(?:[.,]\d+)?)\s*ml\b(.*)$/i);
      if (mlMatch) {
        const ml = Math.max(20, Math.round(parseFloat(mlMatch[1].replace(",", ".")) * f));
        portie = `${ml}ml${mlMatch[2] || ""}`;
      } else if (/^\d+\s*el\b/i.test(portie)) {
        const el = Math.max(0.5, Math.round(parseFloat(portie) * f * 2) / 2);
        portie = `${el} el`;
      }
    }
  }

  return {
    ...ing,
    portie,
    kcal: Math.round(ing.kcal * f),
    eiwit: round1(ing.eiwit * f),
    koolhydraten: round1(ing.koolhydraten * f),
    vetten: round1(ing.vetten * f),
  };
}

/** Herbereken macros wanneer portie (in gram) wijzigt */
export function rescaleIngredientPortion(ing: Ingredient, newGrams: number): Ingredient {
  const oldGrams = parsePortieGrams(ing.portie);
  if (oldGrams && oldGrams > 0) {
    return scaleIngredient(ing, newGrams / oldGrams);
  }
  const factor = newGrams / 100;
  return {
    ...ing,
    portie: formatPortieGrams(newGrams),
    kcal: Math.round(ing.kcal * factor),
    eiwit: round1(ing.eiwit * factor),
    koolhydraten: round1(ing.koolhydraten * factor),
    vetten: round1(ing.vetten * factor),
  };
}

function scaleMealsToTargets(
  meals: Maaltijd[],
  targets: MacroTargets,
  styles: string[] = []
): Maaltijd[] {
  const eiwitrijk = styles.some((s) => /eiwitrijk/i.test(s));
  const lowCarb = styles.some((s) => /low-?carb|keto/i.test(s));

  let working = meals.map((m) => ({
    ...m,
    ingrediënten: m.ingrediënten.map((i) => ({ ...i })),
  }));

  const totalsOf = () => {
    const all = working.flatMap((m) => m.ingrediënten);
    return sumIngredients(all);
  };

  // Prefer lean proteins when fat budget is tight relative to protein
  const fatBudgetTight = targets.vetten > 0 && targets.eiwit / targets.vetten > 3.5;

  // 1) Scale protein ingredients toward target
  let totals = totalsOf();
  if (totals.eiwit > 0) {
    let proteinFactor = targets.eiwit / totals.eiwit;
    if (eiwitrijk) proteinFactor *= 1.02;
    proteinFactor = Math.max(0.7, Math.min(3.2, proteinFactor));
    working = working.map((meal) => ({
      ...meal,
      ingrediënten: meal.ingrediënten.map((ing) => {
        if (classifyMacroRole(ing) !== "protein") return ing;
        // Cap egg scaling harder when fat budget is tight
        const ref = findProteinRef(ing.naam);
        let f = proteinFactor;
        if (ref?.key === "eieren" && fatBudgetTight) f = Math.min(f, 1.15);
        if (ref?.key === "rundvlees" && fatBudgetTight) f = Math.min(f, 1.4);
        return scaleIngredient(ing, f);
      }),
    }));
  }

  // 2) Scale carbs (aggressive when over target)
  totals = totalsOf();
  if (totals.koolhydraten > 0) {
    let carbFactor = targets.koolhydraten / totals.koolhydraten;
    if (lowCarb || eiwitrijk) carbFactor = Math.min(carbFactor, 0.95);
    carbFactor = Math.max(0.15, Math.min(2.2, carbFactor));
    working = working.map((meal) => ({
      ...meal,
      ingrediënten: meal.ingrediënten.map((ing) =>
        classifyMacroRole(ing) === "carb" ? scaleIngredient(ing, carbFactor) : ing
      ),
    }));
  }

  // 3) Scale pure fats (olie/noten/avocado)
  totals = totalsOf();
  if (totals.vetten > 0) {
    const fatFactor = Math.max(0.15, Math.min(2.5, targets.vetten / totals.vetten));
    working = working.map((meal) => ({
      ...meal,
      ingrediënten: meal.ingrediënten.map((ing) =>
        classifyMacroRole(ing) === "fat" ? scaleIngredient(ing, fatFactor) : ing
      ),
    }));
  }

  // 4) Protein still short → boost lean proteins (kip/kalkoen/kwark/skyr), not eggs/rund
  totals = totalsOf();
  if (totals.eiwit < targets.eiwit * 0.92) {
    const boost = Math.min(2.0, targets.eiwit / Math.max(1, totals.eiwit));
    working = working.map((meal) => ({
      ...meal,
      ingrediënten: meal.ingrediënten.map((ing) => {
        if (classifyMacroRole(ing) !== "protein") return ing;
        const ref = findProteinRef(ing.naam);
        if (ref?.key === "eieren" || (ref?.key === "rundvlees" && fatBudgetTight)) {
          return scaleIngredient(ing, Math.min(1.1, boost));
        }
        return scaleIngredient(ing, boost);
      }),
    }));
  }

  // 5) Carbs still over → cut again
  totals = totalsOf();
  if (totals.koolhydraten > targets.koolhydraten * 1.1) {
    const cut = Math.max(0.15, targets.koolhydraten / totals.koolhydraten);
    working = working.map((meal) => ({
      ...meal,
      ingrediënten: meal.ingrediënten.map((ing) =>
        classifyMacroRole(ing) === "carb" ? scaleIngredient(ing, cut) : ing
      ),
    }));
  }

  // 6) Fat still over → cut oils/noten and shrink fattiest proteins harder
  totals = totalsOf();
  if (totals.vetten > targets.vetten * 1.1) {
    const cut = Math.max(0.15, targets.vetten / totals.vetten);
    working = working.map((meal) => ({
      ...meal,
      ingrediënten: meal.ingrediënten.map((ing) => {
        const role = classifyMacroRole(ing);
        if (role === "fat") return scaleIngredient(ing, cut);
        const ref = findProteinRef(ing.naam);
        if (ref?.key === "eieren") return scaleIngredient(ing, Math.max(0.35, cut));
        if (ref?.key === "rundvlees" || (ref && ref.vetten >= 10)) {
          return scaleIngredient(ing, Math.max(0.45, cut + 0.1));
        }
        if (ref?.key === "kwark" && /vol/i.test(ing.naam)) {
          // Swap full-fat quark macros toward leaner by shrinking
          return scaleIngredient(ing, Math.max(0.6, cut + 0.2));
        }
        return ing;
      }),
    }));
  }

  // 6b) Second fat pass if still over — strip oils entirely-ish
  totals = totalsOf();
  if (totals.vetten > targets.vetten * 1.2) {
    const cut = Math.max(0.1, (targets.vetten * 0.95) / totals.vetten);
    working = working.map((meal) => ({
      ...meal,
      ingrediënten: meal.ingrediënten.map((ing) => {
        if (classifyMacroRole(ing) === "fat") return scaleIngredient(ing, cut);
        const ref = findProteinRef(ing.naam);
        if (ref?.key === "eieren" || ref?.key === "rundvlees") {
          return scaleIngredient(ing, Math.max(0.4, cut + 0.15));
        }
        return ing;
      }),
    }));
  }

  // 7) Hard-cap eieren op max 4 stuks per maaltijd vóór eiwit-top-up
  working = working.map((meal) => ({
    ...meal,
    ingrediënten: meal.ingrediënten.map((ing) => {
      const ref = findProteinRef(ing.naam);
      if (ref?.key !== "eieren") return ing;
      const stuksMatch = ing.portie.match(/(\d+)/);
      const stuks = stuksMatch ? parseInt(stuksMatch[1], 10) : Math.round(estimateGrams(ing, ref) / 50);
      if (stuks <= 4) return ing;
      return proteinFromGrams(ref, 200);
    }),
  }));

  // 8) Final protein top-up with magere kwark if still short
  totals = totalsOf();
  if (totals.eiwit < targets.eiwit * 0.92) {
    const deficit = targets.eiwit - totals.eiwit;
    const kwark = PROTEIN_REFS.find((r) => r.key === "kwark")!;
    const extraGrams = Math.min(500, Math.max(100, Math.round((deficit / kwark.eiwit) * 100)));
    const extra = proteinFromGrams(kwark, extraGrams);
    const snackIdx = working.findIndex((m) => /tussendoortje ochtend|ontbijt/i.test(m.naam));
    const idx = snackIdx >= 0 ? snackIdx : 0;
    working[idx] = {
      ...working[idx],
      ingrediënten: [...working[idx].ingrediënten, extra],
      bereidingswijze: `${working[idx].bereidingswijze || ""} Extra ${extra.naam} voor eiwittarget.`.trim(),
    };
  }

  // 9) Warm meals without enough protein → inject kipfilet
  working = working.map((meal) => {
    if (!/lunch|diner/i.test(meal.naam)) return meal;
    const mealProtein = sumIngredients(meal.ingrediënten).eiwit;
    if (mealProtein >= 35) return meal;
    const kip = PROTEIN_REFS.find((r) => r.key === "kip")!;
    const need = Math.max(40, 55 - mealProtein);
    const extra = proteinFromGrams(kip, Math.round((need / kip.eiwit) * 100));
    return {
      ...meal,
      ingrediënten: [extra, ...meal.ingrediënten],
      bereidingswijze: `Bereid ${extra.naam}. ${meal.bereidingswijze || ""}`.trim(),
    };
  });

  // One more kwark top-up if inject still left us short
  totals = totalsOf();
  if (totals.eiwit < targets.eiwit * 0.9) {
    const deficit = targets.eiwit - totals.eiwit;
    const kwark = PROTEIN_REFS.find((r) => r.key === "kwark")!;
    const extra = proteinFromGrams(
      kwark,
      Math.min(450, Math.round((deficit / kwark.eiwit) * 100))
    );
    working[0] = {
      ...working[0],
      ingrediënten: [...working[0].ingrediënten, extra],
    };
  }

  return working.map((m) => withMealTotals(m));
}

function trimMeals(meals: Maaltijd[], count: number): Maaltijd[] {
  if (count <= 3) return [meals[0], meals[2], meals[4]];
  if (count === 4) return [meals[0], meals[2], meals[3], meals[4]];
  return meals;
}

function buildDayMeals(
  dayIndex: number,
  preferredKeys: string[],
  exclusions: string[],
  preferredProteins: string[],
  mealCount: number,
  varietySeed = 0
): Maaltijd[] {
  const ontbijt = pick(ONTBIJT_OPTIES, dayIndex, 0, varietySeed);
  const lunch = pickPreferred(LUNCH_OPTIES, dayIndex, 1 + varietySeed, preferredKeys, varietySeed);
  const diner = pickPreferred(DINER_OPTIES, dayIndex, 2 + varietySeed, preferredKeys, varietySeed);
  const snack1 = pick(SNACK_OPTIES, dayIndex, 3, varietySeed);
  const snack2 = pick(SNACK_OPTIES, dayIndex, 5 + varietySeed, varietySeed);

  let meals: Maaltijd[] = [
    withMealTotals({ ...ontbijt, id: `${dayIndex}-1` }),
    withMealTotals({
      ...snack1,
      id: `${dayIndex}-2`,
      naam: "Tussendoortje ochtend",
      tijd: "10:00",
    }),
    withMealTotals({ ...lunch, id: `${dayIndex}-3` }),
    withMealTotals({
      ...snack2,
      id: `${dayIndex}-4`,
      naam: "Tussendoortje middag",
      tijd: "15:00",
    }),
    withMealTotals({ ...diner, id: `${dayIndex}-5` }),
  ];

  // Force preferred protein rotation on lunch/dinner when preferences set
  if (preferredKeys.length > 0) {
    const warmKeys = preferredKeys.filter((k) => PROTEIN_REFS.find((r) => r.key === k)?.warm);
    // Main warm protein: never eggs alone (te vet / te weinig eiwit na schalen)
    const mainPool = warmKeys.filter((k) => k !== "eieren");
    const pool =
      mainPool.length > 0
        ? mainPool
        : warmKeys.length > 0
          ? warmKeys
          : preferredKeys.filter((k) => k !== "eieren");
    const effectivePool = pool.length > 0 ? pool : ["kip"];

    meals = meals.map((meal, idx) => {
      if (!/lunch|diner/i.test(meal.naam)) return meal;
      const key = effectivePool[(dayIndex + idx) % effectivePool.length];
      const ref = PROTEIN_REFS.find((r) => r.key === key) ?? PROTEIN_REFS.find((r) => r.key === "kip")!;

      let replaced = false;
      const ings = meal.ingrediënten.map((ing) => {
        if (!replaced && isMainProteinIngredient(ing) && findProteinRef(ing.naam)?.warm) {
          replaced = true;
          return replaceProteinIngredient(ing, [ref.key], dayIndex, idx);
        }
        return ing;
      });
      if (!replaced) {
        ings.unshift(proteinFromGrams(ref, 160));
      }
      // Eieren als extra (max 2) op lunch van sommige dagen, niet als hoofdeiwit
      if (warmKeys.includes("eieren") && /lunch/i.test(meal.naam) && dayIndex % 2 === 0) {
        const eggRef = PROTEIN_REFS.find((r) => r.key === "eieren")!;
        ings.push(proteinFromGrams(eggRef, 100));
      }
      return withMealTotals({
        ...meal,
        ingrediënten: ings,
        bereidingswijze: `Bereid ${ref.naam}. ${meal.bereidingswijze || ""}`.trim(),
      });
    });
  }

  meals = applyExclusionsToMaaltijden(meals, exclusions, preferredProteins);
  return trimMeals(meals, mealCount);
}

export function buildWeekmenu(
  targets: MacroTargets,
  exclusionsOrOptions: string[] | WeekmenuOptions = [],
  mealCountArg = 5
): DagMenu[] {
  const options: WeekmenuOptions = Array.isArray(exclusionsOrOptions)
    ? { exclusions: exclusionsOrOptions, mealCount: mealCountArg }
    : exclusionsOrOptions;

  const exclusions = options.exclusions ?? [];
  const preferredProteins = options.preferredProteins ?? [];
  const styles = options.styles ?? [];
  const mealCount = Math.min(6, Math.max(3, options.mealCount ?? mealCountArg ?? 5));
  const preferredKeys = resolvePreferredKeys(preferredProteins);
  const varietySeed = Math.max(0, Math.min(6, options.varietySeed ?? 0));

  return DAGEN.map((dagNaam, dayIndex) => {
    const base = buildDayMeals(
      dayIndex,
      preferredKeys,
      exclusions,
      preferredProteins,
      mealCount,
      varietySeed
    );
    const scaled = scaleMealsToTargets(base, targets, styles);
    return buildDagMenu(dagNaam, scaled, targets);
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
