import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // Create category
  create(data: { name: string; slug: string }) {
    return this.prisma.category.create({ data });
  }

  // Get all categories
  // Get all categories with product count
  findAll() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  // Get single category
  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) throw new NotFoundException('Category not found');
    return category;
  }
  async findProductsByCategory(categoryId: number) {
    return this.prisma.product.findMany({
      where: { categoryId: categoryId },
      include: { images: true }, // if you want product images
    });
  }
  // Update category
  async update(id: number, data: { name?: string; slug?: string }) {
    const category = await this.prisma.category.update({
      where: { id },
      data,
    });
    return category;
  }

  // Delete category
  async remove(id: number) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
