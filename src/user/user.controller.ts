// src/user/user.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, Req, Query, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../generated/prisma/client';

import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OwnerOrAdminGuard } from '../auth/owner-or-admin.guard';
import { Interval } from '../common/analytics.helper';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() userData: { email: string; name?: string; password: string }): Promise<User> {
    return this.userService.createUser(userData);
  }

  @Get('me')
  async getMe(@Req() req: any) {
    const user = req.user;
    return this.userService.getUserById(user.userId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('analytics')
  async getAnalytics(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('interval') interval: string,
  ) {
    if (!start || !end || !interval) {
      throw new BadRequestException('start, end, and interval are required');
    }
    const validIntervals = ['day', 'week', 'month'];
    if (!validIntervals.includes(interval)) {
      throw new BadRequestException('interval must be one of: day, week, month');
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('start and end must be valid dates (YYYY-MM-DD)');
    }
    return this.userService.getAnalytics(startDate, endDate, interval as Interval);
  }

  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.userService.getUserById(id);
  }

  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string): Promise<User | null> {
    return this.userService.getUserByEmail(email);
  }

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @UseGuards(OwnerOrAdminGuard)
  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() userData: { email?: string; name?: string; password?: string },
  ): Promise<User> {
    return this.userService.updateUser(id, userData);
  }

  @UseGuards(OwnerOrAdminGuard)
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.deleteUser(id);
  }
}
