import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard) // Protect routes
export class CartController {
  constructor(private cartService: CartService) {}

  // ➕ Add to cart
  @Post()
  addToCart(
    @Req() req,
    @Body() body: { productId: number; quantity?: number },
  ) {
    const quantity = body.quantity ?? 1;
    return this.cartService.addToCart(
      req.user.userId,
      body.productId,
      quantity,
    );
  }
  // 📦 Get user cart
  @Get()
  getCart(@Req() req) {
    return this.cartService.getCart(req.user.userId);
  }

  // ❌ Remove item
  @Delete(':productId')
  removeFromCart(@Req() req, @Param('productId') productId: string) {
    return this.cartService.removeFromCart(req.user.userId, Number(productId));
  }

  // 🔄 Update quantity
  @Patch(':productId')
  updateQuantity(
    @Req() req,
    @Param('productId') productId: string,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateQuantity(
      req.user.userId,
      Number(productId),
      body.quantity,
    );
  }
}
