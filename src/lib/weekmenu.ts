import {
  ONTBIJT_OPTIES,
  LUNCH_OPTIES,
  DINER_OPTIES,
  SNACK_OPTIES,
} from "./meal-library";

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

export type MealTemplate = Omit<Maaltijd, "totaleKcal" | "eiwit" | "koolhydraten" | "vetten" | "id">;

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

function pick<T>(items: T[], dayIndex: number, salt: number, varietySeed = 0): T {
  return items[(dayIndex + salt + varietySeed) % items.length];
}

function pickUnused(
  options: MealTemplate[],
  used: Set<string>,
  dayIndex: number,
  salt: number,
  varietySeed: number
): MealTemplate {
  const unused = options.filter((o) => !used.has(o.naam));
  const pool = unused.length > 0 ? unused : options;
  const chosen = pick(pool, dayIndex, salt, varietySeed);
  used.add(chosen.naam);
  return chosen;
}

function isVegetarianMeal(template: MealTemplate): boolean {
  const blocked = ["kip", "rundvlees", "varkensvlees", "vis", "kalkoen", "zalm", "makreel", "tonijn", "kabeljauw", "garnalen"];
  return !template.ingrediënten.some((ing) =>
    blocked.some((ex) => ingredientMatchesExclusion(ing.naam, ex))
  );
}

function isVeganMeal(template: MealTemplate): boolean {
  if (!isVegetarianMeal(template)) return false;
  const dairyEgg = ["eieren", "kwark", "yoghurt", "skyr", "melk", "kaas", "feta", "cottage"];
  return !template.ingrediënten.some((ing) =>
    dairyEgg.some((ex) => ing.naam.toLowerCase().includes(ex) || ingredientMatchesExclusion(ing.naam, ex))
  );
}

function mealHasPreferredProtein(template: MealTemplate, preferredKeys: string[]): boolean {
  if (preferredKeys.length === 0) return true;
  return template.ingrediënten.some((ing) => {
    const ref = findProteinRef(ing.naam);
    return ref ? preferredKeys.includes(ref.key) : false;
  });
}

function filterByStyles(options: MealTemplate[], styles: string[]): MealTemplate[] {
  const vegetarian = styles.some((s) => /vegetarisch/i.test(s));
  const vegan = styles.some((s) => /vegan/i.test(s));
  if (vegan) {
    const filtered = options.filter(isVeganMeal);
    return filtered.length > 0 ? filtered : options.filter(isVegetarianMeal);
  }
  if (vegetarian) {
    const filtered = options.filter(isVegetarianMeal);
    return filtered.length > 0 ? filtered : options;
  }
  return options;
}

function pickPreferred(
  options: MealTemplate[],
  dayIndex: number,
  salt: number,
  preferredKeys: string[],
  varietySeed = 0,
  used?: Set<string>
): MealTemplate {
  const matching =
    preferredKeys.length === 0
      ? options
      : options.filter((o) => mealHasPreferredProtein(o, preferredKeys));
  const pool = matching.length > 0 ? matching : options;
  if (used) return pickUnused(pool, used, dayIndex, salt, varietySeed);
  return pick(pool, dayIndex, salt, varietySeed);
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
  if (count === 5) return meals.slice(0, 5);
  return meals;
}

function mealAlreadyHasPreferredProtein(meal: Maaltijd, preferredKeys: string[]): boolean {
  return meal.ingrediënten.some((ing) => {
    const ref = findProteinRef(ing.naam);
    return Boolean(ref?.warm && preferredKeys.includes(ref.key));
  });
}

function buildDayMeals(
  dayIndex: number,
  preferredKeys: string[],
  exclusions: string[],
  preferredProteins: string[],
  mealCount: number,
  varietySeed = 0,
  used?: { ontbijt: Set<string>; lunch: Set<string>; diner: Set<string>; snack: Set<string> },
  styles: string[] = []
): Maaltijd[] {
  const ontbijt = pickUnused(
    filterByStyles(ONTBIJT_OPTIES, styles),
    used?.ontbijt ?? new Set(),
    dayIndex,
    0,
    varietySeed
  );
  const lunch = pickPreferred(
    filterByStyles(LUNCH_OPTIES, styles),
    dayIndex,
    1 + varietySeed,
    preferredKeys,
    varietySeed,
    used?.lunch
  );
  const diner = pickPreferred(
    filterByStyles(DINER_OPTIES, styles),
    dayIndex,
    2 + varietySeed,
    preferredKeys,
    varietySeed,
    used?.diner
  );
  const snackPool = filterByStyles(SNACK_OPTIES, styles);
  const snack1 = pickUnused(snackPool, used?.snack ?? new Set(), dayIndex, 3, varietySeed);
  const snack2 = pickUnused(snackPool, used?.snack ?? new Set(), dayIndex, 5, varietySeed);
  const snack3 = pickUnused(snackPool, used?.snack ?? new Set(), dayIndex, 7, varietySeed);

  let meals: Maaltijd[] = [
    withMealTotals({ ...ontbijt, id: `${dayIndex}-1` }),
    withMealTotals({
      ...snack1,
      id: `${dayIndex}-2`,
      naam: snack1.naam.replace("Tussendoortje", "Tussendoortje ochtend"),
      tijd: "10:00",
    }),
    withMealTotals({ ...lunch, id: `${dayIndex}-3` }),
    withMealTotals({
      ...snack2,
      id: `${dayIndex}-4`,
      naam: snack2.naam.replace("Tussendoortje", "Tussendoortje middag"),
      tijd: "15:00",
    }),
    withMealTotals({ ...diner, id: `${dayIndex}-5` }),
    withMealTotals({
      ...snack3,
      id: `${dayIndex}-6`,
      naam: snack3.naam.replace("Tussendoortje", "Tussendoortje avond"),
      tijd: "20:00",
    }),
  ];

  // Alleen eiwitbron vervangen als de maaltijd nog geen gekozen bron heeft
  if (preferredKeys.length > 0) {
    meals = meals.map((meal) => {
      if (!/lunch|diner/i.test(meal.naam)) return meal;
      if (mealAlreadyHasPreferredProtein(meal, preferredKeys)) return meal;

      const warmKeys = preferredKeys.filter((k) => PROTEIN_REFS.find((r) => r.key === k)?.warm);
      const mainPool = warmKeys.filter((k) => k !== "eieren");
      const pool = mainPool.length > 0 ? mainPool : warmKeys.length > 0 ? warmKeys : ["kip"];
      const key = pool[dayIndex % pool.length];
      const ref = PROTEIN_REFS.find((r) => r.key === key) ?? PROTEIN_REFS.find((r) => r.key === "kip")!;

      let replaced = false;
      const ings = meal.ingrediënten.map((ing) => {
        if (!replaced && isMainProteinIngredient(ing) && findProteinRef(ing.naam)?.warm) {
          replaced = true;
          return replaceProteinIngredient(ing, [ref.key], dayIndex, 0);
        }
        return ing;
      });
      if (!replaced) ings.unshift(proteinFromGrams(ref, 150));
      return withMealTotals({
        ...meal,
        ingrediënten: ings,
        bereidingswijze: `${meal.bereidingswijze} Gebruik ${ref.naam} als eiwitbron.`.trim(),
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
  const varietySeed = Math.max(0, Math.min(20, options.varietySeed ?? 0));
  const used = {
    ontbijt: new Set<string>(),
    lunch: new Set<string>(),
    diner: new Set<string>(),
    snack: new Set<string>(),
  };

  return DAGEN.map((dagNaam, dayIndex) => {
    const base = buildDayMeals(
      dayIndex,
      preferredKeys,
      exclusions,
      preferredProteins,
      mealCount,
      varietySeed,
      used,
      styles
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
