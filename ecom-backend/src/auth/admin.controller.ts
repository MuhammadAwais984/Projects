import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard) // protect with JWT + role check
export class AdminController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Post('create-admin')
  async createAdmin(
    @Body()
    data: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    },
    @Req() req: any,
  ) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const requestingUserId = req.user.userId;
    // call UsersService to create admin
    return this.usersService.create({
      ...data,
      password: hashedPassword,
      role: 'ADMIN',
    });
  }
}
