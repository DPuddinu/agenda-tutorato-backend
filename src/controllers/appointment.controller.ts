import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '#controllers/lib/prisma';
import { z } from 'zod';
import jwt from '#utils/jwt';

const appointmentSchema = z.object({
  completed: z.string(),
  description: z.string().min(1, 'Description is required'),
  creationDate: z.string(),
  updateDate: z.string(),
  dueDate: z.string().optional().nullable(),
  categoryId: z.number().int().optional(),
  authorId: z.number().int().optional()
});

const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  sortBy: z
    .string()
    .default('creationDate')
    .refine((val) => ['description', 'creationDate', 'updateDate', 'dueDate', 'categoryId'].includes(val), {
      message: 'sortBy must be one of description, creationDate, updateDate, dueDate or categoryId'
    }),
  order: z.enum(['asc', 'desc']).optional()
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

      const { description, creationDate, updateDate, dueDate, categoryId, authorId, completed } = parsed.data;
      const appointment = await prisma.appointment.create({
        data: {
          completed,
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

  async getByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return next({ status: StatusCodes.UNAUTHORIZED, message: 'Authorization token is required' });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return next({ status: StatusCodes.UNAUTHORIZED, message: 'Token not provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      const parsed = paginationSchema.safeParse(req.query);
      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map((issue) => issue.message).join(', ');
        return next({
          status: StatusCodes.BAD_REQUEST,
          message: errorMessages
        });
      }

      const { page = '1', limit = '10', sortBy = 'creationDate', order = 'asc' } = parsed.data;

      const orderBy: { [key: string]: 'asc' | 'desc' } = {};
      orderBy[sortBy as string] = order as 'asc' | 'desc';

      const appointments = await prisma.appointment.findMany({
        where: { authorId: userId },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy
      });

      const totalAppointments = await prisma.appointment.count({
        where: { authorId: userId }
      });

      res.status(StatusCodes.OK).json({
        total: totalAppointments,
        page: Number(page),
        limit: Number(limit),
        data: appointments
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = paginationSchema.safeParse(req.query);
      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map((issue) => issue.message).join(', ');
        return next({
          status: StatusCodes.BAD_REQUEST,
          message: errorMessages
        });
      }

      const { page = '1', limit = '10', sortBy = 'creationDate', order = 'asc' } = parsed.data;

      const orderBy: { [key: string]: 'asc' | 'desc' } = {};
      orderBy[sortBy as string] = order as 'asc' | 'desc';

      const appointments = await prisma.appointment.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy
      });

      const totalAppointments = await prisma.appointment.count();

      res.status(StatusCodes.OK).json({
        total: totalAppointments,
        page: Number(page),
        limit: Number(limit),
        data: appointments
      });
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

      const { description, updateDate, dueDate, categoryId, authorId, completed } = parsed.data;
      const appointment = await prisma.appointment.update({
        where: { id: Number(req.params.id) },
        data: {
          completed,
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
