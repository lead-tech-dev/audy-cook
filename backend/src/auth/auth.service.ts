import { BadRequestException, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AdminUser } from './admin-user.entity';
import { Customer } from './customer.entity';
import { PaymentTransaction } from '../checkout/payment-transaction.entity';
import { ReferralCode } from '../referrals/referral-code.entity';
import { uuidv4 } from '../products/uuid';

function randomShard(len = 4): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(AdminUser) private adminRepo: Repository<AdminUser>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(PaymentTransaction) private txRepo: Repository<PaymentTransaction>,
    @InjectRepository(ReferralCode) private codeRepo: Repository<ReferralCode>,
    private jwt: JwtService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  async seedAdmin() {
    const email = (process.env.ADMIN_EMAIL || 'admin@audycook.com').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'audycook2026';
    const existing = await this.adminRepo.findOne({ where: { email } });
    const hash = await bcrypt.hash(password, 10);
    if (!existing) {
      await this.adminRepo.save(this.adminRepo.create({ id: uuidv4(), email, password_hash: hash }));
      console.log(`[seed] Admin created: ${email}`);
    } else if (!(await bcrypt.compare(password, existing.password_hash))) {
      await this.adminRepo.update({ email }, { password_hash: hash });
      console.log(`[seed] Admin password updated: ${email}`);
    }
  }

  async adminLogin(email: string, password: string) {
    const user = await this.adminRepo.findOne({ where: { email: email.toLowerCase() } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const token = await this.jwt.signAsync({ sub: user.email, email: user.email, role: 'admin' });
    return { access_token: token, token_type: 'bearer', email: user.email };
  }

  async register(name: string, email: string, password: string) {
    const lowerEmail = email.toLowerCase();
    const existing = await this.customerRepo.findOne({ where: { email: lowerEmail } });
    if (existing) throw new BadRequestException('Email déjà utilisé');
    const hash = await bcrypt.hash(password, 10);
    const customer = await this.customerRepo.save(
      this.customerRepo.create({ id: uuidv4(), name, email: lowerEmail, password_hash: hash }),
    );
    // Auto-generate referral code for the new customer
    await this.generateReferralCode(customer.email, customer.name);

    // Retroactively link past orders placed with the same email
    await this.txRepo
      .createQueryBuilder()
      .update(PaymentTransaction)
      .set({ customer_id: customer.id })
      .where('customer_id IS NULL')
      .andWhere("metadata->>'customer_email' = :email", { email: lowerEmail })
      .execute();
    const token = await this.jwt.signAsync({ sub: customer.id, email: customer.email, name: customer.name, role: 'customer' });
    return { access_token: token, token_type: 'bearer', id: customer.id, email: customer.email, name: customer.name };
  }

  private async generateReferralCode(email: string, name: string): Promise<void> {
    const existing = await this.codeRepo.findOne({ where: { owner_email: email } });
    if (existing) return;
    const slug = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6) || 'AUDY';
    for (let i = 0; i < 5; i++) {
      const code = `AUDY-${slug}-${randomShard(4)}`;
      const taken = await this.codeRepo.findOne({ where: { code } });
      if (!taken) {
        await this.codeRepo.save(this.codeRepo.create({ id: uuidv4(), code, owner_email: email, owner_name: name, discount_pct: 10, uses: 0, active: true }));
        return;
      }
    }
    const code = `AUDY-${randomShard(8)}`;
    await this.codeRepo.save(this.codeRepo.create({ id: uuidv4(), code, owner_email: email, owner_name: name, discount_pct: 10, uses: 0, active: true }));
  }

  async customerLogin(email: string, password: string) {
    const customer = await this.customerRepo.findOne({ where: { email: email.toLowerCase() } });
    if (!customer) throw new UnauthorizedException('Identifiants invalides');
    const ok = await bcrypt.compare(password, customer.password_hash);
    if (!ok) throw new UnauthorizedException('Identifiants invalides');
    if (!customer.is_active) throw new UnauthorizedException('Compte suspendu');
    const token = await this.jwt.signAsync({ sub: customer.id, email: customer.email, name: customer.name, role: 'customer' });
    return { access_token: token, token_type: 'bearer', id: customer.id, email: customer.email, name: customer.name };
  }
}
