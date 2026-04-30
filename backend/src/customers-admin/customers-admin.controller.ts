import { Controller, Get, HttpCode, Param, Patch, UseGuards } from '@nestjs/common';
import { CustomersAdminService } from './customers-admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/customers')
export class CustomersAdminController {
  constructor(private readonly service: CustomersAdminService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/suspend')
  @HttpCode(200)
  suspend(@Param('id') id: string) {
    return this.service.setActive(id, false);
  }

  @Patch(':id/activate')
  @HttpCode(200)
  activate(@Param('id') id: string) {
    return this.service.setActive(id, true);
  }
}
