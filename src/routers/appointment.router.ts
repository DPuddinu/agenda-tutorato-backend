import { Router } from 'express';
import rescue from 'express-rescue';
import appointmentController from '@/controllers/appointment.controller';
import authMiddleware from '@/middlewares/auth';

const appointmentRouter = Router();

appointmentRouter.route('/').post(authMiddleware, rescue(appointmentController.create));

appointmentRouter.route('/').get(authMiddleware, rescue(appointmentController.getAll));

appointmentRouter.route('/:id').get(authMiddleware, rescue(appointmentController.getById));

appointmentRouter.route('/:id').put(authMiddleware, rescue(appointmentController.update));

appointmentRouter.route('/:id').delete(authMiddleware, rescue(appointmentController.delete));

export default appointmentRouter;
