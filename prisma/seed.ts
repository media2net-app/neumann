import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  accelerateUrl: process.env.PRISMA_ACCELERATE_URL || 
    "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19HdWIyYXhtanZ1NUd4X0JQSUtneDIiLCJhcGlfa2V5IjoiMDFLQUg1VlJETjhEWDZIUE01QTc4SjJGUlgiLCJ0ZW5hbnRfaWQiOiJkOTlkMDhiNGMyM2NhZjJhOGZkMDZmYjc4NzVkYWIyN2UxN2ZiZTQ4YzQ5NmRhY2I1YTI1NmY5M2E4OWRjNzQyIiwiaW50ZXJuYWxfc2VjcmV0IjoiNDBhNjVmNzctMjJmMC00MjY5LTlmODctMDVkNTNkYjkyMGU2In0.VldrPdx_V3sZ20vKNzNJXAoL7rA1VCSzXyI-2JP3kBU",
});

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.ingredient.deleteMany();
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

  // Seed Ingredients
  console.log("🥬 Seeding ingredients...");
  const ingredientsData = [
    // Vlees & Vis
    { name: "Kipfilet", category: "Vlees & Vis", preparation: "Gebakken", kcal: 165, protein: 31, carbs: 0, fats: 3.6, source: "NEVO" },
    { name: "Kippendij", category: "Vlees & Vis", preparation: "Gebakken", kcal: 209, protein: 26, carbs: 0, fats: 10.9, source: "NEVO" },
    { name: "Rundvlees (mager)", category: "Vlees & Vis", preparation: "Gebakken", kcal: 250, protein: 26, carbs: 0, fats: 15, source: "NEVO" },
    { name: "Zalm", category: "Vlees & Vis", preparation: "Gebakken", kcal: 208, protein: 20, carbs: 0, fats: 13, source: "NEVO" },
    { name: "Tonijn (vers)", category: "Vlees & Vis", preparation: "Rauw", kcal: 144, protein: 30, carbs: 0, fats: 1, source: "NEVO" },
    { name: "Kabeljauw", category: "Vlees & Vis", preparation: "Gebakken", kcal: 82, protein: 18, carbs: 0, fats: 0.7, source: "NEVO" },
    // Eieren & Zuivel
    { name: "Ei (heel)", category: "Eieren & Zuivel", preparation: "Gekookt", kcal: 155, protein: 13, carbs: 1.1, fats: 11, source: "NEVO" },
    { name: "Griekse yoghurt (vol)", category: "Eieren & Zuivel", preparation: null, kcal: 97, protein: 10, carbs: 3.6, fats: 5, source: "NEVO" },
    { name: "Griekse yoghurt (mager)", category: "Eieren & Zuivel", preparation: null, kcal: 59, protein: 10, carbs: 3.6, fats: 0.4, source: "NEVO" },
    { name: "Kwark (vol)", category: "Eieren & Zuivel", preparation: null, kcal: 98, protein: 12, carbs: 3.5, fats: 4.3, source: "NEVO" },
    { name: "Feta", category: "Eieren & Zuivel", preparation: null, kcal: 250, protein: 14, carbs: 2, fats: 20, source: "NEVO" },
    // Granen & Zetmeel
    { name: "Havermout", category: "Granen & Zetmeel", preparation: "Droog", kcal: 389, protein: 17, carbs: 66, fats: 7, source: "NEVO", notes: "Ongekookt, per 100g droog" },
    { name: "Havermout", category: "Granen & Zetmeel", preparation: "Gekookt", kcal: 68, protein: 2.4, carbs: 12, fats: 1.4, source: "NEVO", notes: "Gekookt, per 100g gekookt" },
    { name: "Quinoa", category: "Granen & Zetmeel", preparation: "Droog", kcal: 368, protein: 14, carbs: 64, fats: 6, source: "NEVO", notes: "Ongekookt, per 100g droog" },
    { name: "Quinoa", category: "Granen & Zetmeel", preparation: "Gekookt", kcal: 120, protein: 4.4, carbs: 22, fats: 1.9, source: "NEVO", notes: "Gekookt, per 100g gekookt" },
    { name: "Rijst (wit)", category: "Granen & Zetmeel", preparation: "Droog", kcal: 365, protein: 7.1, carbs: 80, fats: 0.7, source: "NEVO", notes: "Ongekookt, per 100g droog" },
    { name: "Rijst (wit)", category: "Granen & Zetmeel", preparation: "Gekookt", kcal: 130, protein: 2.7, carbs: 28, fats: 0.3, source: "NEVO", notes: "Gekookt, per 100g gekookt" },
    { name: "Rijst (bruin)", category: "Granen & Zetmeel", preparation: "Droog", kcal: 363, protein: 7.5, carbs: 76, fats: 2.7, source: "NEVO", notes: "Ongekookt, per 100g droog" },
    { name: "Rijst (bruin)", category: "Granen & Zetmeel", preparation: "Gekookt", kcal: 111, protein: 2.6, carbs: 23, fats: 0.9, source: "NEVO", notes: "Gekookt, per 100g gekookt" },
    { name: "Pasta (volkoren)", category: "Granen & Zetmeel", preparation: "Droog", kcal: 348, protein: 13, carbs: 71, fats: 2.5, source: "NEVO", notes: "Ongekookt, per 100g droog" },
    { name: "Pasta (volkoren)", category: "Granen & Zetmeel", preparation: "Gekookt", kcal: 124, protein: 4.6, carbs: 25, fats: 0.9, source: "NEVO", notes: "Gekookt, per 100g gekookt" },
    { name: "Pasta (wit)", category: "Granen & Zetmeel", preparation: "Droog", kcal: 371, protein: 13, carbs: 75, fats: 1.5, source: "NEVO", notes: "Ongekookt, per 100g droog" },
    { name: "Pasta (wit)", category: "Granen & Zetmeel", preparation: "Gekookt", kcal: 131, protein: 5, carbs: 26, fats: 0.5, source: "NEVO", notes: "Gekookt, per 100g gekookt" },
    { name: "Zoete aardappel", category: "Granen & Zetmeel", preparation: "Rauw", kcal: 86, protein: 1.6, carbs: 20, fats: 0.1, source: "NEVO", notes: "Rauw, per 100g" },
    { name: "Zoete aardappel", category: "Granen & Zetmeel", preparation: "Gekookt", kcal: 86, protein: 1.6, carbs: 20, fats: 0.1, source: "NEVO", notes: "Gekookt, per 100g gekookt" },
    { name: "Aardappel", category: "Granen & Zetmeel", preparation: "Rauw", kcal: 77, protein: 2, carbs: 17, fats: 0.1, source: "NEVO", notes: "Rauw, per 100g" },
    { name: "Aardappel", category: "Granen & Zetmeel", preparation: "Gekookt", kcal: 87, protein: 2, carbs: 20, fats: 0.1, source: "NEVO", notes: "Gekookt, per 100g gekookt" },
    // Groenten
    { name: "Broccoli", category: "Groenten", preparation: "Rauw", kcal: 34, protein: 2.8, carbs: 7, fats: 0.4, source: "NEVO" },
    { name: "Broccoli", category: "Groenten", preparation: "Gekookt", kcal: 35, protein: 2.8, carbs: 7, fats: 0.4, source: "NEVO" },
    { name: "Spinazie", category: "Groenten", preparation: "Rauw", kcal: 23, protein: 2.9, carbs: 3.6, fats: 0.4, source: "NEVO" },
    { name: "Spinazie", category: "Groenten", preparation: "Gekookt", kcal: 23, protein: 2.9, carbs: 3.6, fats: 0.4, source: "NEVO" },
    { name: "Tomaten", category: "Groenten", preparation: "Rauw", kcal: 18, protein: 0.9, carbs: 3.9, fats: 0.2, source: "NEVO" },
    { name: "Komkommer", category: "Groenten", preparation: "Rauw", kcal: 16, protein: 0.7, carbs: 4, fats: 0.1, source: "NEVO" },
    // Fruit
    { name: "Banaan", category: "Fruit", preparation: "Rauw", kcal: 89, protein: 1.1, carbs: 23, fats: 0.3, source: "NEVO" },
    { name: "Appel", category: "Fruit", preparation: "Rauw", kcal: 52, protein: 0.3, carbs: 14, fats: 0.2, source: "NEVO" },
    { name: "Blauwe bessen", category: "Fruit", preparation: "Rauw", kcal: 57, protein: 0.7, carbs: 14, fats: 0.3, source: "NEVO" },
    // Vetten & Oliën
    { name: "Olijfolie", category: "Vetten & Oliën", preparation: null, kcal: 884, protein: 0, carbs: 0, fats: 100, source: "NEVO" },
    { name: "Avocado", category: "Vetten & Oliën", preparation: "Rauw", kcal: 160, protein: 2, carbs: 9, fats: 15, source: "NEVO" },
    // Overig
    { name: "Eiwitpoeder (wei)", category: "Overig", preparation: null, kcal: 400, protein: 80, carbs: 8, fats: 4, source: "Fabrikant" },
  ];

  const createdIngredients: Record<string, string> = {};
  for (const ing of ingredientsData) {
    const created = await prisma.ingredient.create({
      data: ing,
    });
    // Store with key: name|preparation for easy lookup
    const key = `${ing.name}|${ing.preparation || 'null'}`;
    createdIngredients[key] = created.id;
  }

  // Seed Recipes
  console.log("🍳 Seeding recipes...");
  const recipesData = [
    {
      name: "Havermout met bessen",
      description: "Gezond en voedzaam ontbijt",
      time: "10 min",
      portions: 1,
      ingredients: [
        { name: "Havermout", preparation: "Droog", amount: 50, portion: "50g" },
        { name: "Banaan", preparation: "Rauw", amount: 120, portion: "1 middelgroot" },
        { name: "Blauwe bessen", preparation: "Rauw", amount: 50, portion: "50g" },
      ],
    },
    {
      name: "Griekse salade met kip",
      description: "Eiwitrijke lunch",
      time: "20 min",
      portions: 1,
      ingredients: [
        { name: "Kipfilet", preparation: "Gebakken", amount: 150, portion: "150g" },
        { name: "Komkommer", preparation: "Rauw", amount: 100, portion: "100g" },
        { name: "Tomaten", preparation: "Rauw", amount: 100, portion: "100g" },
        { name: "Feta", preparation: null, amount: 50, portion: "50g" },
      ],
    },
    {
      name: "Zalm met groenten",
      description: "Gezond diner met omega-3",
      time: "25 min",
      portions: 1,
      ingredients: [
        { name: "Zalm", preparation: "Gebakken", amount: 150, portion: "150g" },
        { name: "Broccoli", preparation: "Gekookt", amount: 150, portion: "150g" },
        { name: "Zoete aardappel", preparation: "Gekookt", amount: 200, portion: "200g" },
      ],
    },
    {
      name: "Eiwitrijke smoothie",
      description: "Snelle post-workout shake",
      time: "5 min",
      portions: 1,
      ingredients: [
        { name: "Griekse yoghurt (vol)", preparation: null, amount: 200, portion: "200g" },
        { name: "Banaan", preparation: "Rauw", amount: 120, portion: "1 middelgroot" },
        { name: "Eiwitpoeder (wei)", preparation: null, amount: 30, portion: "30g" },
      ],
    },
  ];

  for (const recipe of recipesData) {
    const createdRecipe = await prisma.recipe.create({
      data: {
        name: recipe.name,
        description: recipe.description,
        time: recipe.time,
        portions: recipe.portions,
      },
    });

    // Add ingredients to recipe
    for (const ing of recipe.ingredients) {
      // Find ingredient by name and preparation
      const ingredientKey = `${ing.name}|${ing.preparation || 'null'}`;
      const ingredientId = createdIngredients[ingredientKey];
      if (ingredientId) {
        await prisma.recipeIngredient.create({
          data: {
            recipeId: createdRecipe.id,
            ingredientId: ingredientId,
            amount: ing.amount,
            portion: ing.portion,
          },
        });
      }
    }
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

