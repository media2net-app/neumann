export type ClientSidebarLink = {
  label: string;
  href: string;
  description?: string;
};

type ClientDefinition = {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  summary: string;
  contact: {
    phone?: string;
    email?: string;
    address?: string;
  };
  highlights: string[];
  quickStats: { label: string; value: string }[];
  sidebarLinks: ClientSidebarLink[];
  resources?: { label: string; href: string }[];
};

const clientDefinitions: ClientDefinition[] = [
  {
    id: "neumann",
    name: "Neumann Personal Training",
    tagline: "Van liggen voor de buis naar personal training aan huis!",
    logo: "/clients/neumann/Neumann-PT-logo.png",
    summary:
      "Nick Neumann, 30 jaar en woonachtig in Hoogeveen, helpt klanten met effectieve en gevarieerde trainingen, op maat gemaakte voedingsschema's en de juiste coaching om hun doelen te behalen.",
    contact: {
      phone: "06 8360 9297",
      email: "info@neumannpt.nl",
      address: "Hoogeveen",
    },
    highlights: [
      "Personal training aan huis in Hoogeveen en omgeving",
      "Op maat gemaakte voedingsschema's en online coaching",
      "Ervaring met revalidatie na blessures (hernia, artrose, knie- en schouderklachten)",
      "Aangesloten bij Bedrijfsfitness Nederland",
    ],
    quickStats: [
      { label: "Coach", value: "Nick Neumann" },
      { label: "Ervaring", value: "Sinds 2018" },
      { label: "Regio", value: "Hoogeveen e.o." },
    ],
    sidebarLinks: [
      { label: "Dashboard", href: "/dashboard" },
      {
        label: "Klanten",
        href: "/clients",
        description: "Klanten & trajecten",
      },
      {
        label: "Voedingsplannen",
        href: "/voeding",
        description: "Voedingsadvisering & schema's",
      },
      {
        label: "Ingrediënten",
        href: "/ingredienten",
        description: "Ingrediënten database",
      },
      {
        label: "Recepten",
        href: "/recepten",
        description: "Recepten database",
      },
    ],
  },
];

export type ClientConfig = (typeof clientDefinitions)[number];
export type ClientId = ClientConfig["id"];

export const clients: readonly ClientConfig[] = clientDefinitions;

export function listClients(): readonly ClientConfig[] {
  return clients;
}

export function findClient(clientId: string): ClientConfig | undefined {
  return clients.find((client) => client.id === clientId);
}

export function getClient(clientId: string): ClientConfig {
  const client = findClient(clientId);

  if (!client) {
    throw new Error(`Onbekende klant: ${clientId}`);
  }

  return client;
}

export function isClientId(clientId: string): clientId is ClientId {
  return clients.some((client) => client.id === clientId);
}

export function clientDashboardPath(clientId: ClientId): string {
  return `/dashboard`;
}

export function getNeumannClient(): ClientConfig {
  return getClient("neumann");
}

