import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '#controllers/lib/prisma';
import { z } from 'zod';

const appointmentSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  creationDate: z.string(),
  updateDate: z.string(),
  dueDate: z.string().optional().nullable(),
  categoryId: z.number().int().optional(),
  authorId: z.number().int().optional()
});

class AppointmentController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = appointmentSchema.safeParse(req.body);
      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map((issue) => issue.message).join(', ');
        return next({
          status: StatusCodes.BAD_REQUEST,
          message: errorMessages
        });
      }

      const { description, creationDate, updateDate, dueDate, categoryId, authorId } = parsed.data;
      const appointment = await prisma.appointment.create({
        data: {
          description,
          creationDate: new Date(creationDate),
          updateDate: new Date(updateDate),
          dueDate: dueDate ? new Date(dueDate) : null,
          categoryId,
          authorId
        }
      });
      res.status(StatusCodes.CREATED).json(appointment);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: Number(req.params.id) }
      });

      if (!appointment) {
        return next({ status: StatusCodes.NOT_FOUND, message: 'Appointment not found' });
      }

      res.status(StatusCodes.OK).json(appointment);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = appointmentSchema.safeParse(req.body);
      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map((issue) => issue.message).join(', ');
        return next({
          status: StatusCodes.BAD_REQUEST,
          message: errorMessages
        });
      }

      const { description, updateDate, dueDate, categoryId, authorId } = parsed.data;
      const appointment = await prisma.appointment.update({
        where: { id: Number(req.params.id) },
        data: {
          description,
          updateDate: new Date(updateDate),
          dueDate: dueDate ? new Date(dueDate) : null,
          categoryId,
          authorId
        }
      });

      if (!appointment) {
        return next({ status: StatusCodes.NOT_FOUND, message: 'Appointment not found' });
      }

      res.status(StatusCodes.OK).json(appointment);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await prisma.appointment.delete({
        where: { id: Number(req.params.id) }
      });

      if (!appointment) {
        return next({ status: StatusCodes.NOT_FOUND, message: 'Appointment not found' });
      }

      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new AppointmentController();
