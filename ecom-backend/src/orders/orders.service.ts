import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: number, address: string) {
    // 1️⃣ Fetch all cart items for the user
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw new NotFoundException('Cart is empty');
    }

    if (!address)
      throw new NotFoundException(
        'No address found, please add it in your profile',
      );

    // 2️⃣ Calculate total price
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    // 3️⃣ Create order with order items
    const order = await this.prisma.order.create({
      data: {
        userId,
        totalPrice,
        address,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // 4️⃣ Clear cart
    await this.prisma.cartItem.deleteMany({ where: { userId } });

    return order;
  }

  async getUserOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true }, // <-- include product images
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteOrder(userId: number, orderId: number) {
    // Check if the order belongs to the user
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new NotFoundException('Not your order');

    // Delete order (OrderItems are deleted automatically because of onDelete: Cascade)
    await this.prisma.order.delete({ where: { id: orderId } });

    return { message: 'Order deleted successfully' };
  }
  async getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        user: true, // get user info
        items: {
          include: {
            product: {
              include: { images: true }, // include product images
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async cancelOrder(userId: number, orderId: number) {
    // Check if the order belongs to the user
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new NotFoundException('Not your order');

    // ❌ Instead of deleting → mark as CANCELLED
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELED },
    });

    return updated;
  }
  // orders.service.ts
  async updateStatus(orderId: number, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { user: true, items: { include: { product: true } } },
    });
  }
  async getOrderById(userId: number, orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true }, // ✅ include images here too
            },
          },
        },
      },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found or unauthorized');
    }

    return order;
  }
  async createGuestOrder(body: {
    name: string;
    email: string;
    phone: string;
    address: string;
    items: { productId: number; quantity: number }[];
  }) {
    const guestToken = uuidv4(); // generate token

    // 1️⃣ Find or create guest user
    let guest = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (!guest) {
      guest = await this.prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          phone: body.phone,
          password: '', // guest
          role: 'GUEST',
        },
      });
    }

    // 2️⃣ Fetch product prices
    const products = await this.prisma.product.findMany({
      where: { id: { in: body.items.map((i) => i.productId) } },
    });

    const totalPrice = body.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product?.price ?? 0) * item.quantity;
    }, 0);

    // 3️⃣ Create order with guestToken
    const order = await this.prisma.order.create({
      data: {
        userId: guest.id,
        guestToken, // <-- store token
        totalPrice,
        address: body.address,
        items: {
          create: body.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: { include: { product: true } }, user: true },
    });

    return { order, guestToken }; // return token to frontend
  }
  async getGuestOrdersByToken(guestToken: string) {
    return this.prisma.order.findMany({
      where: { guestToken },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelGuestOrder(orderId: number, guestToken: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.guestToken !== guestToken)
      throw new ForbiddenException('Not authorized');
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELED' },
    });
  }
}
