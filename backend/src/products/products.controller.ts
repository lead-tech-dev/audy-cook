import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './products.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get('products')
  async list() {
    return this.service.findAll();
  }

  @Get('products/:slug')
  async getOne(@Param('slug') slug: string) {
    const p = await this.service.findBySlug(slug);
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/products')
  async create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/products/:id')
  async update(@Param('id') id: string, @Body() dto: CreateProductDto) {
    const updated = await this.service.update(id, dto);
    if (!updated) throw new NotFoundException('Product not found');
    return updated;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/products/:id')
  async remove(@Param('id') id: string) {
    const ok = await this.service.delete(id);
    if (!ok) throw new NotFoundException('Product not found');
    return { deleted: true };
  }
}
