'use server';

import { UserRepo } from '@/repository/user.repo';
import {
  SignUpSchema,
  SignUpValues,
} from '@/resolvers/forms/sign-up-form.resolver';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function registerUser(body: SignUpValues) {
  const validatedFields = SignUpSchema.safeParse(body);

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.errors
      .map((error) => error.message)
      .join(', ');
    return NextResponse.json(
      { error: errorMessages },
      { status: 400 } // 400 Bad Request
    );
  }

  const { email, password, username } = validatedFields.data;

  try {
    const existsUser = await UserRepo.findUnique({
      where: {
        email: email,
      },
    });

    if (existsUser) {
      return { error: 'This user already exists' };
    }
    const hashedPass = await bcrypt.hash(password, 10);

    await UserRepo.create({
      data: {
        email,
        password: hashedPass,
        username,
      },
    });
  } catch (error) {
    console.log(error);
    return { error: 'Error accured while creating user' };
  }
}
