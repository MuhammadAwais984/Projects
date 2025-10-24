import {
  UploadedFile,
  Body,
  Post,
  Controller,
  UseInterceptors,
  Get,
  Patch,
  Param,
  UploadedFiles,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import streamifier from 'streamifier';
import cloudinary from '../cloudinary/cloudinary.provider';
import { ProductsService } from './products.service';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ➕ Upload product with multiple images
  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadProduct(
    @UploadedFiles() files: Express.Multer.File[],
    @Body()
    body: {
      name: string;
      description?: string;
      price: number;
      categoryName: string;
    },
  ) {
    if (!files || files.length === 0) {
      throw new Error('At least one file is required');
    }

    // Just call service directly (no manual firstUpload here)
    const product = await this.productsService.create(
      {
        ...body,
        price: Number(body.price),
      },
      files,
    );

    return this.productsService.findOne(Number(product.id));
  }

  // ✅ Get single product
  @Get(':id')
  async getProduct(@Param('id') id: number) {
    return this.productsService.findOne(Number(id));
  }

  // ✅ Get all products
  @Get()
  async getAllProducts(@Query('search') search?: string) {
    return this.productsService.findAll(search);
  }

  // ✏️ Update product with optional image
  @Patch('update/:id')
  @UseInterceptors(FilesInterceptor('files')) // multiple files
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body()
    body: {
      name?: string;
      description?: string;
      price?: number;
      categoryName?: string;
    },
  ) {
    if (files && files.length > 0) {
      // Upload each file
      const uploadResults = await Promise.all(
        files.map(
          (file) =>
            new Promise<any>((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'products' },
                (error, result) => {
                  if (error || !result)
                    return reject(error || new Error('Upload failed'));
                  resolve(result);
                },
              );
              streamifier.createReadStream(file.buffer).pipe(uploadStream); // ✅ 'file' comes from map
            }),
        ),
      );

      // Save uploaded images to DB
      for (const res of uploadResults) {
        await this.productsService.addProductImage(+id, res.secure_url);
      }
    }

    // Call service to update product fields
    return this.productsService.update(+id, body, files || []);
  }

  // 📸 Upload extra images
  @Post('upload-multiple/:productId')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultipleImages(
    @Param('productId') productId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new Error('No files uploaded');
    }

    const uploadedImages: { id: number; url: string; productId: number }[] = [];

    for (const file of files) {
      const uploadRes = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'products' },
          (error, result) => {
            if (error || !result)
              return reject(error || new Error('Upload failed'));
            resolve(result);
          },
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });

      const productImage = await this.productsService.addProductImage(
        +productId,
        uploadRes.secure_url,
      );

      uploadedImages.push(productImage);
    }

    return uploadedImages;
  }
  @Get('category/:id/products')
  async findProductsByCategory(@Param('id') id: number) {
    return this.productsService.findProductsByCategory(Number(id));
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: number) {
    return this.productsService.remove(+id);
  }
  // products.controller.ts
  @Delete('image/:id')
  async deleteProductImage(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.removeProductImage(id);
  }
}
