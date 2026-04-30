import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../auth/customer.entity';
import { PaymentTransaction } from '../checkout/payment-transaction.entity';
import { ReferralCode } from '../referrals/referral-code.entity';
import { CustomersAdminService } from './customers-admin.service';
import { CustomersAdminController } from './customers-admin.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, PaymentTransaction, ReferralCode]),
    AuthModule,
  ],
  providers: [CustomersAdminService],
  controllers: [CustomersAdminController],
})
export class CustomersAdminModule {}
