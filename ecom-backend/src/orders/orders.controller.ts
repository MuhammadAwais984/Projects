import {
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  Delete,
  Param,
  Patch,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrderStatus } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // -------------------
  // 🟢 Guest checkout (no login required)
  // -------------------
  @Post('guest')
  async placeGuestOrder(
    @Body()
    body: {
      name: string;
      email: string;
      phone: string;
      address: string;
      items: { productId: number; quantity: number }[];
    },
  ) {
    return this.ordersService.createGuestOrder(body);
  }
  @Get('guest/orders/:guestToken')
  async getGuestOrder(@Param('guestToken') guestToken: string) {
    return this.ordersService.getGuestOrdersByToken(guestToken);
  }

  @Patch('guest/:orderId/cancel')
  async cancelGuestOrder(
    @Param('orderId') orderId: string,
    @Body('guestToken') guestToken: string,
  ) {
    return this.ordersService.cancelGuestOrder(Number(orderId), guestToken);
  }

  // -------------------
  // 🔒 Admin routes
  // -------------------

  // Place order from user's cart
  @UseGuards(JwtAuthGuard)
  @Post()
  placeOrder(@Req() req, @Body('address') address: string) {
    console.log('Place order called', req.user.userId, address);
    return this.ordersService.createOrder(req.user.userId, address);
  }

  // Get all orders of logged-in user
  @UseGuards(JwtAuthGuard)
  @Get()
  getOrders(@Req() req) {
    return this.ordersService.getUserOrders(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/:id')
  deleteOrder(@Req() req, @Param('id') orderId: string) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only admins can delete orders');
    }
    return this.ordersService.deleteOrder(req.user.userId, parseInt(orderId));
  }
  // orders.controller.ts
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  async getAllOrders(@Req() req) {
    // Optionally, you can add role-check here
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only admins can view all orders');
    }
    return this.ordersService.getAllOrders();
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  cancelOrder(@Req() req, @Param('id') orderId: string) {
    return this.ordersService.cancelOrder(req.user.userId, parseInt(orderId));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id/status')
  updateStatus(
    @Req() req,
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only admins can update order status');
    }
    return this.ordersService.updateStatus(Number(id), status);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getOrderById(@Req() req, @Param('id') orderId: string) {
    return this.ordersService.getOrderById(req.user.userId, parseInt(orderId));
  }
}
