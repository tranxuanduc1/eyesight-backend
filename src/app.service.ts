import { Injectable } from '@nestjs/common';
import prisma  from '../lib/db'
@Injectable()
export class AppService {

  getHello(): string {
    return 'Hello World! v1';
  }

  async getDatabaseStatus(): Promise<string> {
    try {
      const users = await prisma.user.findMany();
      console.log(users);
      return 'Database connection successful !';
    } catch (error) {
      return 'Database connection failed: ' + error.message;
    }
  }
}