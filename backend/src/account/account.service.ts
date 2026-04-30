import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Customer } from '../auth/customer.entity';
import { PaymentTransaction } from '../checkout/payment-transaction.entity';
import { ReferralCode } from '../referrals/referral-code.entity';
import { CustomerAddress } from './customer-address.entity';
import { AddressDto } from './address.dto';
import { uuidv4 } from '../products/uuid';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(PaymentTransaction) private txRepo: Repository<PaymentTransaction>,
    @InjectRepository(ReferralCode) private codeRepo: Repository<ReferralCode>,
    @InjectRepository(CustomerAddress) private addressRepo: Repository<CustomerAddress>,
  ) {}

  async updateName(customerId: string, name: string) {
    await this.customerRepo.update({ id: customerId }, { name });
    const updated = await this.customerRepo.findOne({ where: { id: customerId } });
    if (!updated) throw new NotFoundException();
    return { email: updated.email, name: updated.name };
  }

  async updatePassword(customerId: string, currentPassword: string, newPassword: string) {
    const customer = await this.customerRepo.findOne({ where: { id: customerId } });
    if (!customer) throw new NotFoundException();
    const ok = await bcrypt.compare(currentPassword, customer.password_hash);
    if (!ok) throw new BadRequestException('Mot de passe actuel incorrect');
    const hash = await bcrypt.hash(newPassword, 10);
    await this.customerRepo.update({ id: customerId }, { password_hash: hash });
  }

  async getOrders(customerId: string, customerEmail: string) {
    const rows = await this.txRepo
      .createQueryBuilder('tx')
      .where("tx.payment_status = 'paid'")
      .andWhere(
        "(tx.customer_id = :customerId OR tx.metadata->>'customer_email' = :email)",
        { customerId, email: customerEmail },
      )
      .orderBy('tx.created_at', 'DESC')
      .getMany();

    return rows.map((tx) => ({
      id: tx.id,
      session_id: tx.session_id,
      amount: Number(tx.amount),
      currency: tx.currency,
      items: tx.items,
      status: tx.status,
      payment_status: tx.payment_status,
      created_at: tx.created_at,
    }));
  }

  async getOrder(customerId: string, customerEmail: string, sessionId: string) {
    const tx = await this.txRepo
      .createQueryBuilder('tx')
      .where('tx.session_id = :sessionId', { sessionId })
      .andWhere(
        "(tx.customer_id = :customerId OR tx.metadata->>'customer_email' = :email)",
        { customerId, email: customerEmail },
      )
      .getOne();
    if (!tx) throw new NotFoundException('Order not found');
    return {
      id: tx.id,
      session_id: tx.session_id,
      amount: Number(tx.amount),
      currency: tx.currency,
      items: tx.items,
      status: tx.status,
      payment_status: tx.payment_status,
      created_at: tx.created_at,
    };
  }

  async getReferralCodes(customerEmail: string) {
    return this.codeRepo.find({
      where: { owner_email: customerEmail },
      order: { created_at: 'DESC' },
    });
  }

  async getReferralSavings(customerId: string, customerEmail: string) {
    const rows = await this.txRepo
      .createQueryBuilder('tx')
      .where("tx.payment_status = 'paid'")
      .andWhere("tx.metadata->>'referral_code_used' != ''")
      .andWhere(
        "(tx.customer_id = :customerId OR tx.metadata->>'customer_email' = :email)",
        { customerId, email: customerEmail },
      )
      .orderBy('tx.created_at', 'DESC')
      .getMany();

    return rows.map((tx) => {
      const subtotal = Number(tx.metadata?.subtotal || tx.amount);
      const discountPct = Number(tx.metadata?.discount_pct || 0);
      return {
        session_id: tx.session_id,
        referral_code_used: tx.metadata?.referral_code_used || '',
        discount_pct: discountPct,
        discount_amount: Math.round(subtotal * discountPct) / 100,
        order_amount: Number(tx.amount),
        created_at: tx.created_at,
      };
    });
  }

  async getAddresses(customerId: string) {
    return this.addressRepo.find({
      where: { customer_id: customerId },
      order: { is_default: 'DESC', created_at: 'ASC' },
    });
  }

  async createAddress(customerId: string, dto: AddressDto) {
    const count = await this.addressRepo.count({ where: { customer_id: customerId } });
    const address = this.addressRepo.create({
      id: uuidv4(),
      customer_id: customerId,
      label: dto.label,
      full_name: dto.full_name,
      address_line1: dto.address_line1,
      address_line2: dto.address_line2 || null,
      city: dto.city,
      postal_code: dto.postal_code,
      country: dto.country,
      phone: dto.phone || null,
      is_default: count === 0,
    });
    return this.addressRepo.save(address);
  }

  async updateAddress(customerId: string, id: string, dto: AddressDto) {
    const addr = await this.addressRepo.findOne({ where: { id, customer_id: customerId } });
    if (!addr) throw new NotFoundException();
    addr.label = dto.label;
    addr.full_name = dto.full_name;
    addr.address_line1 = dto.address_line1;
    addr.address_line2 = dto.address_line2 || null;
    addr.city = dto.city;
    addr.postal_code = dto.postal_code;
    addr.country = dto.country;
    addr.phone = dto.phone || null;
    return this.addressRepo.save(addr);
  }

  async deleteAddress(customerId: string, id: string) {
    const addr = await this.addressRepo.findOne({ where: { id, customer_id: customerId } });
    if (!addr) throw new NotFoundException();
    const wasDefault = addr.is_default;
    await this.addressRepo.remove(addr);
    if (wasDefault) {
      const next = await this.addressRepo.findOne({
        where: { customer_id: customerId },
        order: { created_at: 'ASC' },
      });
      if (next) await this.addressRepo.update({ id: next.id }, { is_default: true });
    }
  }

  async setDefaultAddress(customerId: string, id: string) {
    const addr = await this.addressRepo.findOne({ where: { id, customer_id: customerId } });
    if (!addr) throw new NotFoundException();
    await this.addressRepo.update({ customer_id: customerId }, { is_default: false });
    await this.addressRepo.update({ id }, { is_default: true });
    return this.addressRepo.findOne({ where: { id } });
  }
}
