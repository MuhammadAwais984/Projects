import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // Get all categories
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  // Get single category
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  // Create category
  @Post()
  create(@Body() body: { name: string; slug: string }) {
    return this.categoriesService.create(body);
  }
  @Get(':id/products')
  getProductsByCategory(@Param('id') id: string) {
    return this.categoriesService.findProductsByCategory(+id);
  }
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; slug?: string },
  ) {
    return this.categoriesService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
