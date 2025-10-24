import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import cloudinary from '../cloudinary/cloudinary.provider';
import streamifier from 'streamifier';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // Create product with multiple images
  async create(
    data: {
      name: string;
      description?: string;
      price: number;
      categoryName: string;
    },
    files: Express.Multer.File[],
  ) {
    const category = await this.prisma.category.findUnique({
      where: { name: data.categoryName },
    });
    if (!category)
      throw new NotFoundException(`Category "${data.categoryName}" not found`);

    // Upload all images
    const uploadResults = await Promise.all(
      files.map(
        (file) =>
          new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'products' },
              (err, result) => {
                if (err || !result) reject(err || new Error('Upload failed'));
                resolve(result);
              },
            );
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
          }),
      ),
    );

    // Create product + all images
    const product = await this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        categoryId: category.id,
        images: {
          create: uploadResults.map((res) => ({
            url: res.secure_url,
          })),
        },
      },
      include: { images: true },
    });

    return product;
  }

  // Add single image later
  async addProductImage(productId: number, url: string) {
    return this.prisma.productImage.create({
      data: { productId, url },
    });
  }

  // Find single product with category + images
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: Number(id) },
      include: { category: true, images: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  // Get all products with images
  findAll(search?: string) {
    if (search) {
      return this.prisma.product.findMany({
        where: {
          name: { contains: search, mode: 'insensitive' },
        },
        include: { images: true, category: true },
      });
    }

    return this.prisma.product.findMany({
      include: { category: true, images: true },
    });
  }

  // Update product + allow new images
  async update(
    id: number,
    data: {
      name?: string;
      description?: string;
      price?: number;
      categoryName?: string;
    },
    files: Express.Multer.File[],
  ) {
    // 1️⃣ Handle category
    let categoryId: number | undefined;
    if (data.categoryName) {
      const category = await this.prisma.category.findUnique({
        where: { name: data.categoryName },
      });
      if (!category)
        throw new NotFoundException(
          `Category "${data.categoryName}" not found`,
        );
      categoryId = category.id;
    }

    const { categoryName, price, ...rest } = data;

    // 2️⃣ Update product fields
    const product = await this.prisma.product.update({
      where: { id: Number(id) },
      data: {
        ...rest,
        ...(price !== undefined && { price: Number(price) }),
        ...(categoryId && { categoryId }),
      },
      include: { images: true },
    });

    // 3️⃣ Handle new images
    if (files && files.length > 0) {
      const uploadedUrls = await Promise.all(
        files.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'products' },
                (err, result) => {
                  if (err) return reject(err);
                  if (!result || !result.secure_url)
                    return reject(err || new Error('Upload failed'));
                  resolve(result.secure_url);
                },
              );
              streamifier.createReadStream(file.buffer).pipe(uploadStream);
            }),
        ),
      );

      await Promise.all(
        uploadedUrls.map((url) =>
          this.prisma.productImage.create({ data: { productId: id, url } }),
        ),
      );
    }

    // 4️⃣ Return updated product with all images
    return this.prisma.product.findUnique({
      where: { id: Number(id) },
      include: { images: true },
    });
  }

  async findProductsByCategory(categoryId: number) {
    return this.prisma.product.findMany({
      where: {
        categoryId: Number(categoryId), // 👈 ensure it's a number
      },
      include: {
        images: true, // 👈 include related images
      },
    });
  }

  // Delete product
  async remove(id: number) {
    await this.prisma.cartItem.deleteMany({ where: { productId: id } });
    await this.prisma.orderItem.deleteMany({ where: { productId: id } });
    await this.prisma.productImage.deleteMany({ where: { productId: id } });
    return this.prisma.product.delete({ where: { id } });
  }
  // products.service.ts
  async removeProductImage(id: number) {
    // delete from database
    const deleted = await this.prisma.productImage.delete({
      where: { id },
    });
    return deleted;
  }
}
