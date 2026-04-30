import { Body, Controller, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class ValidateDto {
  @IsString() code: string;
}

class CreateReferralDto {
  @IsOptional() @IsString() owner_name?: string;
  @IsOptional() @IsString() owner_email?: string;
}

@Controller()
export class ReferralsController {
  constructor(private readonly service: ReferralsService) {}

  @Post('referrals/validate')
  async validate(@Body() dto: ValidateDto) {
    return this.service.validate(dto.code);
  }

  @Get('referrals/leaderboard')
  async leaderboard() {
    return this.service.leaderboardThisMonth(5);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/referrals')
  async list() {
    return this.service.listAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/referrals')
  async create(@Body() dto: CreateReferralDto) {
    const code = await this.service.generateForCustomer({
      email: dto.owner_email,
      name: dto.owner_name,
    });
    return { code };
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/referrals/:code/redeem')
  async manualRedeem(@Body() _: any, @Param('code') code: string) {
    const result = await this.service.incrementUses(code);
    if (!result) return { ok: false };
    return { ok: true, uses: result.uses };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/referrals/:code/toggle')
  async toggle(@Param('code') code: string) {
    const result = await this.service.toggleActive(code);
    if (!result) throw new NotFoundException('Code not found');
    return result;
  }
}
