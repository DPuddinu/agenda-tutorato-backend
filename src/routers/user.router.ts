import { Router } from 'express';
import rescue from 'express-rescue';
import userController from '@/controllers/user.controller';
import authMiddleware from '@/middlewares/auth';

const userRouter = Router();

userRouter.route('/:id').get(authMiddleware, rescue(userController.getUserById));
userRouter.route('/me').get(authMiddleware, rescue(userController.getCurrentUser));

export default userRouter;
