const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const env = require("../config/env");
const { PRIMARY_ADMIN_ID, PRIMARY_ADMIN_EMAIL } = require("../utils/adminAccess");

const run = async () => {
  if (!env.adminSeedPassword) {
    throw new Error("ADMIN_PASSWORD is required in .env");
  }

  const email = PRIMARY_ADMIN_EMAIL.toLowerCase().trim();
  const existingUser = await prisma.user.findUnique({ where: { email } });
  const passwordHash = await bcrypt.hash(env.adminSeedPassword, 10);

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        id: PRIMARY_ADMIN_ID,
        name: env.adminSeedName,
        email,
        passwordHash,
        role: "ADMIN",
        isActive: true,
      },
    });
    // eslint-disable-next-line no-console
    console.log("Primary admin user updated successfully.");
    return;
  }

  await prisma.user.create({
    data: {
      id: PRIMARY_ADMIN_ID,
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
