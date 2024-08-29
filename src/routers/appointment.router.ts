import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import rescue from 'express-rescue';

const prisma = new PrismaClient();
const router = Router();


router.post(
  '/',
  rescue(async (req, res) => {
    const { description, authorId, categoryId, dueDate } = req.body;
    const appointment = await prisma.appointment.create({
      data: {
        description,
        authorId,
        categoryId,
        dueDate,
        creationDate: new Date(),
        updateDate: new Date()
      }
    });
    res.json(appointment);
  })
);


router.get(
  '/',
  rescue(async (req, res) => {
    const appointments = await prisma.appointment.findMany();
    res.json(appointments);
  })
);


router.put(
  '/:id',
  rescue(async (req, res) => {
    const { id } = req.params;
    const { description, published, dueDate, categoryId } = req.body;
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        description,
        published,
        dueDate,
        categoryId,
        updateDate: new Date()
      }
    });
    res.json(appointment);
  })
);


router.delete(
  '/:id',
  rescue(async (req, res) => {
    const { id } = req.params;
    await prisma.appointment.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Appointment deleted' });
  })
);

export default router;
