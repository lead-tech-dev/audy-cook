import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentTransaction } from './payment-transaction.entity';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { ProductsModule } from '../products/products.module';
import { ReferralsModule } from '../referrals/referrals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentTransaction]),
    ProductsModule,
    ReferralsModule,
  ],
  providers: [CheckoutService],
  controllers: [CheckoutController],
})
export class CheckoutModule {}
