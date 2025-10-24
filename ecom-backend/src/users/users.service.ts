// src/users/users.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  private prisma = new PrismaClient();

  // Create user
  // src/users/users.service.ts
  async create(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: Role;
    address?: string; // <-- add address
  }) {
    // Create the user first

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
        role: data.role ?? Role.CUSTOMER,
      },
    });

    // If an address is provided, add it to the Address table
    if (data.address) {
      await this.prisma.address.create({
        data: {
          address: data.address,
          userId: user.id,
        },
      });
    }

    return user;
  }

  // Find user by email
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // Delete user by ID
  async deleteUser(requestingUserId: number, targetUserId: number) {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUser) throw new NotFoundException('User not found');

    const requestingUser = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
    });

    if (!requestingUser) throw new ForbiddenException('Invalid user');

    // ❌ Prevent deleting SUPER_ADMIN
    if (targetUser.role === 'SUPER_ADMIN') {
      throw new ForbiddenException('Cannot delete the main admin!');
    }

    // ❌ Prevent regular admins deleting other admins
    if (requestingUser.role !== 'SUPER_ADMIN' && targetUser.role === 'ADMIN') {
      throw new ForbiddenException(
        'Only the main admin can delete another admin.',
      );
    }

    return this.prisma.user.delete({ where: { id: targetUserId } });
  }

  // Get all users (optional, useful for admin)
  async findAll() {
    try {
      return await this.prisma.user.findMany();
    } catch (err) {
      console.error('Prisma findAll error:', err);
      throw err; // rethrow so NestJS still sends 500
    }
  }

  update(id: number, data: any) {
    const { address, ...userData } = data;

    return this.prisma.user.update({
      where: { id },
      data: {
        ...userData,
        addresses: address
          ? {
              upsert: {
                where: { id: data.addressId ?? 0 }, // if editing existing
                update: { address },
                create: { address },
              },
            }
          : undefined,
      },
      include: { addresses: true },
    });
  }

  async updatePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    if (!user.password) {
      throw new ForbiddenException('Guest users cannot update password');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new ForbiddenException('Old Password is Incorrect');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        orders: true,
        addresses: true, // if you have an orders relation
      },
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
  async updateAddress(userId: number, data: { address: string }) {
    const existing = await this.prisma.address.findFirst({ where: { userId } });

    if (existing) {
      return this.prisma.address.update({
        where: { id: existing.id },
        data: { address: data.address },
      });
    }

    return this.prisma.address.create({
      data: { address: data.address, userId },
    });
  }

  async getAddress(userId: number) {
    return this.prisma.address.findFirst({ where: { userId } });
  }
  async deleteAddress(userId: number, addressId: number) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== userId) {
      throw new ForbiddenException('Cannot delete this address');
    }

    return this.prisma.address.delete({
      where: { id: addressId },
    });
  }
}
