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
import { MenuService } from './menu.service';
import { CreateMenuDto } from './menu.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class MenuController {
  constructor(private readonly service: MenuService) {}

  @Get('menu')
  async list() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/menu')
  async create(@Body() dto: CreateMenuDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/menu/:id')
  async update(@Param('id') id: string, @Body() dto: CreateMenuDto) {
    const u = await this.service.update(id, dto);
    if (!u) throw new NotFoundException('Menu item not found');
    return u;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/menu/:id')
  async remove(@Param('id') id: string) {
    const ok = await this.service.delete(id);
    if (!ok) throw new NotFoundException('Menu item not found');
    return { deleted: true };
  }
}
