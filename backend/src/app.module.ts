import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';

import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { MenuModule } from './menu/menu.module';
import { BlogModule } from './blog/blog.module';
import { CheckoutModule } from './checkout/checkout.module';
import { ResellersModule } from './resellers/resellers.module';
import { ReferralsModule } from './referrals/referrals.module';
import { EmailModule } from './email/email.module';
import { AccountModule } from './account/account.module';
import { CustomersAdminModule } from './customers-admin/customers-admin.module';
import { UploadModule } from './upload/upload.module';
import { HealthModule } from './health/health.module';
import { SeedService } from './seed.service';

import { AdminUser } from './auth/admin-user.entity';
import { Customer } from './auth/customer.entity';
import { Product } from './products/product.entity';
import { MenuItem } from './menu/menu-item.entity';
import { BlogPost } from './blog/blog-post.entity';
import { PaymentTransaction } from './checkout/payment-transaction.entity';
import { ReferralCode } from './referrals/referral-code.entity';
import { ReferralUse } from './referrals/referral-use.entity';
import { CustomerAddress } from './account/customer-address.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.join(__dirname, '..', '.env'),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [AdminUser, Customer, Product, MenuItem, BlogPost, PaymentTransaction, ReferralCode, ReferralUse, CustomerAddress],
        synchronize: true,
        ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      }),
    }),
    AuthModule,
    ProductsModule,
    MenuModule,
    BlogModule,
    CheckoutModule,
    ResellersModule,
    ReferralsModule,
    EmailModule,
    AccountModule,
    CustomersAdminModule,
    UploadModule,
    HealthModule,
  ],
  providers: [SeedService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly seed: SeedService) {}
  async onModuleInit() {
    await this.seed.run();
  }
}
