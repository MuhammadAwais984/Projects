import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard) // ✅ only check JWT globally
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ✅ Only ADMIN & SUPER_ADMIN can see all users
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get()
  async getAllUsers() {
    return this.usersService.findAll();
  }

  // ✅ Only ADMIN & SUPER_ADMIN can delete
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  // ✅ Any logged-in user can update themselves
  @Patch('me')
  async updateMe(@Req() req, @Body() data: any) {
    return this.usersService.update(req.user.userId, data);
  }

  // ✅ Only ADMIN & SUPER_ADMIN can update others
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(+id, data);
  }

  // ✅ Any logged-in user can update their password
  @Patch('me/password')
  async updatePassword(
    @Req() req,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.usersService.updatePassword(
      req.user.userId,
      body.oldPassword,
      body.newPassword,
    );
  }

  // ✅ Any logged-in user can fetch their profile
  @Get('me')
  async getMe(@Req() req) {
    return this.usersService.findById(req.user.userId);
  }
  // PATCH /users/me/address
  @Patch('me/address')
  async updateMyAddress(
    @Req() req,
    @Body()
    body: { address: string },
  ) {
    return this.usersService.updateAddress(req.user.userId, body);
  }

  // GET /users/me/address
  @Get('me/address')
  async getMyAddress(@Req() req) {
    return this.usersService.getAddress(req.user.userId);
  }
  @Delete('me/address/:id')
  async deleteAddress(@Req() req, @Param('id') id: string) {
    return this.usersService.deleteAddress(req.user.userId, +id);
  }
}
