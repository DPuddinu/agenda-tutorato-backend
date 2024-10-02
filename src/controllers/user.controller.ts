import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '@/controllers/lib/prisma';
import jwt from '@/utils/jwt';
import { User } from '@prisma/client';

class UserController {
  async getUserById(req: Request, res: Response, next: NextFunction) {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!user) return next({ status: StatusCodes.NOT_FOUND, message: 'User not found' });

    res.status(StatusCodes.OK).json({ id: user.id, email: user.email });
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return next({ status: StatusCodes.UNAUTHORIZED, message: 'Token not provided' });
    }

    const decoded = jwt.verify(token) as User;
    console.log(decoded);
    const userId = decoded.id;

    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!user) return next({ status: StatusCodes.NOT_FOUND, message: 'User not found' });

    res.status(StatusCodes.OK).json({ id: user.id, email: user.email });
  }
}

export default new UserController();
