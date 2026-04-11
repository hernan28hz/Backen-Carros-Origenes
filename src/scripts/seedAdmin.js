const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const env = require("../config/env");

const run = async () => {
  if (!env.adminSeedEmail || !env.adminSeedPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required in .env");
  }

  const email = env.adminSeedEmail.toLowerCase().trim();
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    // eslint-disable-next-line no-console
    console.log("Admin user already exists.");
    return;
  }

  const passwordHash = await bcrypt.hash(env.adminSeedPassword, 10);

  await prisma.user.create({
    data: {
      name: env.adminSeedName,
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  // eslint-disable-next-line no-console
  console.log("Admin user created successfully.");
};

run()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
