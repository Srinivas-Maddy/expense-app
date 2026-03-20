import { PrismaClient } from "@prisma/client";

const DEFAULT_CATEGORIES = [
  { name: "Food", icon: "🍔", color: "#FF6B6B" },
  { name: "Travel", icon: "✈️", color: "#4ECDC4" },
  { name: "Bills", icon: "📄", color: "#45B7D1" },
  { name: "Shopping", icon: "🛍️", color: "#96CEB4" },
];

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  for (const cat of DEFAULT_CATEGORIES) {
    // Check if default category already exists (userId IS NULL)
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, userId: null },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          isDefault: true,
          userId: null,
        },
      });
      console.log(`  Created category: ${cat.name}`);
    } else {
      console.log(`  Category already exists: ${cat.name}`);
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
