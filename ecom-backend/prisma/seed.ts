import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password,
      role: 'ADMIN',
      name: 'Super Admin',
    },
  });
}

main()
  .then(() => console.log('✅ Admin user seeded'))
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
