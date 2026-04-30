import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtCustomerGuard } from './jwt-customer.guard';

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('admin/login')
  async adminLogin(@Body() dto: LoginDto) {
    return this.auth.adminLogin(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/me')
  async adminMe(@Req() req: any) {
    return { email: req.user?.email, role: 'admin' };
  }

  @Post('auth/register')
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.name, dto.email, dto.password);
  }

  @Post('auth/login')
  async customerLogin(@Body() dto: LoginDto) {
    return this.auth.customerLogin(dto.email, dto.password);
  }

  @UseGuards(JwtCustomerGuard)
  @Get('account/me')
  async customerMe(@Req() req: any) {
    return { id: req.user?.sub, email: req.user?.email, name: req.user?.name, role: 'customer' };
  }
}
