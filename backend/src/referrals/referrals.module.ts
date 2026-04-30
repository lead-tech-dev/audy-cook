import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralCode } from './referral-code.entity';
import { ReferralUse } from './referral-use.entity';
import { ReferralsService } from './referrals.service';
import { ReferralsController } from './referrals.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ReferralCode, ReferralUse]), AuthModule],
  providers: [ReferralsService],
  controllers: [ReferralsController],
  exports: [ReferralsService],
})
export class ReferralsModule {}
