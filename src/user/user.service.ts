// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { User } from '../../generated/prisma/client';
import prisma from '../../lib/db';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  async createUser(data: { email: string; name?: string; password: string }): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  return user;
  }

  async getUserById(id: number): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        chats: true,
      },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        chats: true,
      },
    });
  }

  async getAllUsers(): Promise<User[]> {
    return await prisma.user.findMany({
      include: {
        chats: true,
      },
    });
  }

  async updateUser(id: number, data: { email?: string; name?: string; password?: string }): Promise<User> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: number): Promise<User> {
    return await prisma.user.delete({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }


  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);

    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    const { password: _, ...safeUser } = user;
    return safeUser;
  }
}