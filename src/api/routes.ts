import { Router } from 'express';
import authRouter from '#routers/auth.router';
import userRouter from '#routers/user.router';
import appointmentRouter from '#routers/appointment.router';

const router = Router();

router.use('/users', userRouter);
router.use('/auth', authRouter);
router.use('/appointments', appointmentRouter);

router.get('/', (req, res) => {
  res.send('Welcome to the API!');
});


export default router;
