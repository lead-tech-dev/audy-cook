import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { AdminUser } from './admin-user.entity';
import { Customer } from './customer.entity';
import { PaymentTransaction } from '../checkout/payment-transaction.entity';
import { ReferralCode } from '../referrals/referral-code.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminUser, Customer, PaymentTransaction, ReferralCode]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'audycook_jwt_secret',
        signOptions: { expiresIn: '30d' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
