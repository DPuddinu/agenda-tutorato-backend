import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from '@/utils/jwt';
import prisma from '@/controllers/lib/prisma';
import { z } from 'zod';

export const PasswordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be more than 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[?!@%$£])[A-Za-z\d?!@%$£]+$/,
    'Password must contain at least one letter, one number, one special character'
  );

const RegisterSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email' }),
    password: PasswordSchema,
    confirmPassword: PasswordSchema
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

class AuthController {
  async authenticate(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    if (!email || !password) {
      return next({
        status: StatusCodes.BAD_REQUEST,
        message: 'Some required fields are missing'
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return next({
        status: StatusCodes.NOT_FOUND,
        message: 'User not found'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return next({
        status: StatusCodes.UNAUTHORIZED,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email });

    res.status(StatusCodes.OK).json({ token });
  }

  async register(req: Request, res: Response, next: NextFunction) {
    const { email, password, confirmPassword } = req.body;

    const parsed = RegisterSchema.safeParse({
      email,
      password,
      confirmPassword
    });

    if (!parsed.success) {
      return next({
        status: StatusCodes.BAD_REQUEST,
        message: parsed.error.issues[0].message
      });
    }

    if (await prisma.user.findUnique({ where: { email } })) {
      return next({
        status: StatusCodes.CONFLICT,
        message: 'User already exists'
      });
    }

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        password: bcrypt.hashSync(parsed.data.password, 8)
      }
    });

    const token = jwt.sign({ id: user.id, email: user.email });

    res.status(StatusCodes.OK).json({ token });
  }
}

export default new AuthController();
