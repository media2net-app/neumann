import type { DagMenu } from "./weekmenu";
import { parsePortieGrams } from "./weekmenu";

export type ShoppingItem = {
  naam: string;
  /** Totale gram als porties optelbaar zijn, anders null */
  totaalGrams: number | null;
  portieLabel: string;
  categorie: ShoppingCategory;
  dagen: string[];
};

export type ShoppingCategory =
  | "Vlees & vis"
  | "Zuivel & eieren"
  | "Groente & fruit"
  | "Koolhydraten"
  | "Noten & vetten"
  | "Overig";

function categorize(naam: string): ShoppingCategory {
  const n = naam.toLowerCase();
  if (
    /kip|rund|varken|kalkoen|zalm|tonijn|makreel|kabeljauw|garnaal|gehakt|vis|tempeh|tofu/.test(n)
  ) {
    return "Vlees & vis";
  }
  if (/kwark|yoghurt|skyr|melk|ei |eieren|cottage|kaas|feta|mozzarella/.test(n)) {
    return "Zuivel & eieren";
  }
  if (
    /broccoli|spinazie|paprika|courgette|tomaat|komkommer|bloemkool|boerenkool|wortel|aardbei|banaan|appel|bes|avocado|bonen|linzen|kikkererwt|paksoi|groente/.test(
      n
    )
  ) {
    return "Groente & fruit";
  }
  if (/rijst|pasta|havermout|brood|quinoa|aardappel|zoete/.test(n)) {
    return "Koolhydraten";
  }
  if (/olie|amandel|walnoot|cashew|pinda|noten/.test(n)) {
    return "Noten & vetten";
  }
  return "Overig";
}

function normalizeName(naam: string): string {
  return naam.trim().replace(/\s+/g, " ");
}

function formatTotal(grams: number | null, samples: string[]): string {
  if (grams != null && grams > 0) {
    if (grams >= 1000) return `${(grams / 1000).toFixed(grams % 1000 === 0 ? 0 : 1)} kg`;
    return `${Math.round(grams)}g`;
  }
  // Unieke portie-labels
  const unique = [...new Set(samples.map((s) => s.trim()).filter(Boolean))];
  if (unique.length === 1) return unique[0];
  if (unique.length <= 3) return unique.join(" + ");
  return `${unique.length} porties`;
}

/** Bouw weekboodschappenlijst uit weekmenu (samengevoegd per product). */
export function buildShoppingList(weekMenu: DagMenu[]): ShoppingItem[] {
  const map = new Map<
    string,
    { naam: string; grams: number; hasAllGrams: boolean; samples: string[]; dagen: Set<string> }
  >();

  for (const dag of weekMenu) {
    for (const meal of dag.maaltijden) {
      for (const ing of meal.ingrediënten) {
        const key = normalizeName(ing.naam).toLowerCase();
        const existing = map.get(key);
        const grams = parsePortieGrams(ing.portie);
        if (!existing) {
          map.set(key, {
            naam: normalizeName(ing.naam),
            grams: grams ?? 0,
            hasAllGrams: grams != null,
            samples: [ing.portie],
            dagen: new Set([dag.dag]),
          });
        } else {
          existing.dagen.add(dag.dag);
          existing.samples.push(ing.portie);
          if (grams == null) {
            existing.hasAllGrams = false;
          } else if (existing.hasAllGrams) {
            existing.grams += grams;
          }
        }
      }
    }
  }

  const items: ShoppingItem[] = [...map.values()].map((item) => {
    const totaalGrams = item.hasAllGrams ? item.grams : null;
    return {
      naam: item.naam,
      totaalGrams,
      portieLabel: formatTotal(totaalGrams, item.samples),
      categorie: categorize(item.naam),
      dagen: [...item.dagen],
    };
  });

  const order: ShoppingCategory[] = [
    "Vlees & vis",
    "Zuivel & eieren",
    "Groente & fruit",
    "Koolhydraten",
    "Noten & vetten",
    "Overig",
  ];

  items.sort((a, b) => {
    const ca = order.indexOf(a.categorie);
    const cb = order.indexOf(b.categorie);
    if (ca !== cb) return ca - cb;
    return a.naam.localeCompare(b.naam, "nl");
  });

  return items;
}

export function groupShoppingList(items: ShoppingItem[]): { categorie: ShoppingCategory; items: ShoppingItem[] }[] {
  const order: ShoppingCategory[] = [
    "Vlees & vis",
    "Zuivel & eieren",
    "Groente & fruit",
    "Koolhydraten",
    "Noten & vetten",
    "Overig",
  ];
  return order
    .map((categorie) => ({
      categorie,
      items: items.filter((i) => i.categorie === categorie),
    }))
    .filter((g) => g.items.length > 0);
}
