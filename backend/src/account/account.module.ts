import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../auth/customer.entity';
import { PaymentTransaction } from '../checkout/payment-transaction.entity';
import { ReferralCode } from '../referrals/referral-code.entity';
import { CustomerAddress } from './customer-address.entity';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, PaymentTransaction, ReferralCode, CustomerAddress]),
    AuthModule,
  ],
  providers: [AccountService],
  controllers: [AccountController],
})
export class AccountModule {}
