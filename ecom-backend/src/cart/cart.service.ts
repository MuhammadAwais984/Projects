import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // ➕ Add to cart
  async addToCart(userId: number, productId: number, quantity: number = 1) {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Check if already in cart → update quantity
    const existingItem = await this.prisma.cartItem.findFirst({
      where: { userId, productId },
    });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    }

    // Otherwise create new
    return this.prisma.cartItem.create({
      data: {
        quantity,
        user: { connect: { id: userId } }, // connect existing user
        product: { connect: { id: productId } },
      },
    });
  }

  // 📦 Get user cart
  // src/cart/cart.service.ts
  async getCart(userId: number) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true, // ✅ include all product images
          },
        },
      },
    });
  }

  // ❌ Remove item
  async removeFromCart(userId: number, productId: number) {
    return this.prisma.cartItem.deleteMany({
      where: { userId, productId },
    });
  }

  // 🔄 Update quantity
  async updateQuantity(userId: number, productId: number, quantity: number) {
    const item = await this.prisma.cartItem.findFirst({
      where: { userId, productId },
    });
    if (!item) throw new NotFoundException('Item not found in cart');

    return this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });
  }
}
