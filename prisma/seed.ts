import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  accelerateUrl: process.env.PRISMA_ACCELERATE_URL || 
    "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19HdWIyYXhtanZ1NUd4X0JQSUtneDIiLCJhcGlfa2V5IjoiMDFLQUg1VlJETjhEWDZIUE01QTc4SjJGUlgiLCJ0ZW5hbnRfaWQiOiJkOTlkMDhiNGMyM2NhZjJhOGZkMDZmYjc4NzVkYWIyN2UxN2ZiZTQ4YzQ5NmRhY2I1YTI1NmY5M2E4OWRjNzQyIiwiaW50ZXJuYWxfc2VjcmV0IjoiNDBhNjVmNzctMjJmMC00MjY5LTlmODctMDVkNTNkYjkyMGU2In0.VldrPdx_V3sZ20vKNzNJXAoL7rA1VCSzXyI-2JP3kBU",
});

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await prisma.review.deleteMany();
  await prisma.session.deleteMany();
  await prisma.nutritionPlan.deleteMany();
  await prisma.client.deleteMany();

  // Seed Clients
  console.log("👥 Seeding clients...");
  const clients = [
    {
      id: "1",
      name: "Marijn Besseler",
      email: "marijn@example.nl",
      phone: "06-12345678",
      status: "Actief",
      goal: "Revalidatie knieblessure",
      startDate: new Date("2024-03-01"),
      nextSession: new Date("2024-12-18"),
      type: "1-op-1 Training",
      sessionsCompleted: 42,
      totalSessions: 50,
      progress: 84,
      package: "Revalidatie pakket",
      value: 3250,
    },
    {
      id: "2",
      name: "Kristel Kwant",
      email: "kristel@example.nl",
      phone: "06-23456789",
      status: "Actief",
      goal: "Hernia revalidatie & core stability",
      startDate: new Date("2024-01-15"),
      nextSession: new Date("2024-12-19"),
      type: "1-op-1 Training",
      sessionsCompleted: 58,
      totalSessions: 60,
      progress: 97,
      package: "Revalidatie pakket",
      value: 3900,
    },
    {
      id: "3",
      name: "Heather Court",
      email: "heather@example.nl",
      phone: "06-34567890",
      status: "Voltooid",
      goal: "Afvallen & kracht opbouwen",
      startDate: new Date("2024-06-01"),
      nextSession: null,
      type: "Online coaching",
      sessionsCompleted: 24,
      totalSessions: 24,
      progress: 100,
      package: "Online pakket",
      value: 1200,
    },
    {
      id: "4",
      name: "Fadil Deniz",
      email: "fadil@example.nl",
      phone: "06-45678901",
      status: "Actief",
      goal: "Explosiviteit voor kickboksen",
      startDate: new Date("2024-08-10"),
      nextSession: new Date("2024-12-20"),
      type: "1-op-1 Training",
      sessionsCompleted: 18,
      totalSessions: 30,
      progress: 60,
      package: "Performance pakket",
      value: 1950,
    },
    {
      id: "5",
      name: "Sarah de Vries",
      email: "sarah@example.nl",
      phone: "06-56789012",
      status: "Actief",
      goal: "Afvallen & conditie opbouwen",
      startDate: new Date("2024-10-01"),
      nextSession: new Date("2024-12-21"),
      type: "Duo Training",
      sessionsCompleted: 10,
      totalSessions: 20,
      progress: 50,
      package: "Duo pakket",
      value: 1200,
    },
    {
      id: "6",
      name: "Mark Jansen",
      email: "mark@example.nl",
      phone: "06-67890123",
      status: "Actief",
      goal: "Spieropbouw & kracht",
      startDate: new Date("2024-09-15"),
      nextSession: new Date("2024-12-22"),
      type: "1-op-1 Training",
      sessionsCompleted: 15,
      totalSessions: 30,
      progress: 50,
      package: "Performance pakket",
      value: 1950,
    },
    {
      id: "7",
      name: "Emma Bakker",
      email: "emma@example.nl",
      phone: "06-78901234",
      status: "Voltooid",
      goal: "Revalidatie schouderblessure",
      startDate: new Date("2024-05-01"),
      nextSession: null,
      type: "1-op-1 Training",
      sessionsCompleted: 20,
      totalSessions: 20,
      progress: 100,
      package: "Revalidatie pakket",
      value: 1300,
    },
  ];

  for (const client of clients) {
    await prisma.client.create({
      data: client,
    });
  }

  // Seed Sessions
  console.log("📅 Seeding sessions...");
  const sessions = [
    {
      clientId: "1",
      date: new Date("2024-12-18"),
      time: "10:00",
      type: "1-op-1 Training",
      location: "Thuis",
      status: "Gepland",
    },
    {
      clientId: "2",
      date: new Date("2024-12-19"),
      time: "14:00",
      type: "1-op-1 Training",
      location: "Thuis",
      status: "Gepland",
    },
    {
      clientId: "4",
      date: new Date("2024-12-20"),
      time: "16:00",
      type: "1-op-1 Training",
      location: "Thuis",
      status: "Gepland",
    },
    {
      clientId: "5",
      date: new Date("2024-12-21"),
      time: "09:00",
      type: "Duo Training",
      location: "Park",
      status: "Gepland",
    },
  ];

  for (const session of sessions) {
    await prisma.session.create({
      data: session,
    });
  }

  // Seed Nutrition Plans
  console.log("🍎 Seeding nutrition plans...");
  const nutritionPlans = [
    {
      clientId: "1",
      name: "Revalidatie Schema - Zachte Start",
      type: "Revalidatie",
      kcal: 2000,
      protein: 120,
      carbs: 200,
      fats: 60,
      status: "Actief",
      aangemaakt: new Date("2024-11-10"),
    },
    {
      clientId: "2",
      name: "Revalidatie Schema - Zachte Start",
      type: "Revalidatie",
      kcal: 1800,
      protein: 110,
      carbs: 180,
      fats: 55,
      status: "Actief",
      aangemaakt: new Date("2024-10-15"),
    },
    {
      clientId: "3",
      name: "Afval Schema - 1500 kcal",
      type: "Gewichtsverlies",
      kcal: 1500,
      protein: 100,
      carbs: 150,
      fats: 50,
      status: "Voltooid",
      aangemaakt: new Date("2024-06-01"),
    },
    {
      clientId: "4",
      name: "Spiermassa Opbouw - 2500 kcal",
      type: "Bulk",
      kcal: 2500,
      protein: 150,
      carbs: 300,
      fats: 80,
      status: "Actief",
      aangemaakt: new Date("2024-08-10"),
    },
    {
      clientId: "5",
      name: "Afval Schema - 1800 kcal",
      type: "Gewichtsverlies",
      kcal: 1800,
      protein: 115,
      carbs: 180,
      fats: 60,
      status: "Actief",
      aangemaakt: new Date("2024-10-01"),
    },
    {
      clientId: "6",
      name: "Spieropbouw - Gevorderd",
      type: "Spieropbouw",
      kcal: 2800,
      protein: 170,
      carbs: 320,
      fats: 90,
      status: "Actief",
      aangemaakt: new Date("2024-09-15"),
    },
    {
      clientId: "7",
      name: "Revalidatie Schema - Schouder",
      type: "Revalidatie",
      kcal: 1900,
      protein: 115,
      carbs: 190,
      fats: 58,
      status: "Voltooid",
      aangemaakt: new Date("2024-05-01"),
    },
  ];

  for (const plan of nutritionPlans) {
    await prisma.nutritionPlan.create({
      data: plan,
    });
  }

  // Seed Reviews
  console.log("⭐ Seeding reviews...");
  const reviews = [
    {
      clientId: "1",
      name: "Marijn Besseler",
      text: "Door een blessure aan mijn knie is het niet altijd makkelijk om te trainen maar Nick weet me altijd te motiveren om door te gaan.",
      rating: 5,
      date: new Date("2024-11-20"),
    },
    {
      clientId: "1",
      name: "Erwin Altena",
      text: "De afgelopen 5 jaar heb ik Nick leren kennen als een enthousiaste jonge Personal Trainer die goed luistert naar de persoon die hij traint.",
      rating: 5,
      date: new Date("2024-11-15"),
    },
  ];

  for (const review of reviews) {
    await prisma.review.create({
      data: review,
    });
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

