import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { AccountService } from './account.service';
import { JwtCustomerGuard } from '../auth/jwt-customer.guard';
import { AddressDto } from './address.dto';

class UpdateNameDto {
  @IsString() name: string;
}

class UpdatePasswordDto {
  @IsString() currentPassword: string;
  @IsString() @MinLength(6) newPassword: string;
}

@UseGuards(JwtCustomerGuard)
@Controller('account')
export class AccountController {
  constructor(private readonly service: AccountService) {}

  @Patch('me')
  async updateName(@Req() req: any, @Body() dto: UpdateNameDto) {
    return this.service.updateName(req.user.sub, dto.name);
  }

  @Patch('password')
  async updatePassword(@Req() req: any, @Body() dto: UpdatePasswordDto) {
    await this.service.updatePassword(req.user.sub, dto.currentPassword, dto.newPassword);
    return { ok: true };
  }

  @Get('orders')
  async getOrders(@Req() req: any) {
    return this.service.getOrders(req.user.sub, req.user.email);
  }

  @Get('orders/:sessionId')
  async getOrder(@Req() req: any, @Param('sessionId') sessionId: string) {
    return this.service.getOrder(req.user.sub, req.user.email, sessionId);
  }

  @Get('referrals')
  async getReferralCodes(@Req() req: any) {
    return this.service.getReferralCodes(req.user.email);
  }

  @Get('referral-savings')
  async getReferralSavings(@Req() req: any) {
    return this.service.getReferralSavings(req.user.sub, req.user.email);
  }

  @Get('addresses')
  async getAddresses(@Req() req: any) {
    return this.service.getAddresses(req.user.sub);
  }

  @Post('addresses')
  async createAddress(@Req() req: any, @Body() dto: AddressDto) {
    return this.service.createAddress(req.user.sub, dto);
  }

  @Patch('addresses/:id')
  async updateAddress(@Req() req: any, @Param('id') id: string, @Body() dto: AddressDto) {
    return this.service.updateAddress(req.user.sub, id, dto);
  }

  @Delete('addresses/:id')
  @HttpCode(204)
  async deleteAddress(@Req() req: any, @Param('id') id: string) {
    await this.service.deleteAddress(req.user.sub, id);
  }

  @Patch('addresses/:id/default')
  async setDefault(@Req() req: any, @Param('id') id: string) {
    return this.service.setDefaultAddress(req.user.sub, id);
  }
}
