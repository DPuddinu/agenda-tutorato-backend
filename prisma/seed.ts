import bcrypt from 'bcryptjs';
import prisma from '../src/controllers/lib/prisma';

async function main() {
  await prisma.user.upsert({
    where: { email: 'alice@prisma.io' },
    update: {},
    create: {
      email: 'alice@prisma.io',
      password: bcrypt.hashSync('password', 8),
      appointments: {
        create: {
          completed: 'false',
          description: 'Bench 220 pounds',
          creationDate: new Date(),
          updateDate: new Date(),
          dueDate: undefined,
          category: {
            create: {
              name: 'Gym'
            }
          }
        }
      }
    }
  });

  await prisma.user.upsert({
    where: { email: 'bob@prisma.io' },
    update: {},
    create: {
      email: 'bob@prisma.io',
      password: bcrypt.hashSync('password', 8),
      appointments: {
        create: {
          completed: 'true',
          description: 'Go to the dentist',
          creationDate: new Date(),
          updateDate: new Date(),
          dueDate: undefined,
          category: {
            create: {
              name: 'Health'
            }
          }
        }
      }
    }
  });
  await prisma.user.upsert({
    where: { email: 'bob@prisma.io' },
    update: {},
    create: {
      email: 'danielemura99@gmail.com',
      password: bcrypt.hashSync('password', 8),
      appointments: {
        create: {
          completed: 'true',
          description: 'Go to the gym',
          creationDate: new Date(),
          updateDate: new Date(),
          dueDate: undefined,
          category: {
            create: {
              name: 'Health'
            }
          }
        }
      }
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
