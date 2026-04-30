import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../auth/customer.entity';
import { PaymentTransaction } from '../checkout/payment-transaction.entity';
import { ReferralCode } from '../referrals/referral-code.entity';

@Injectable()
export class CustomersAdminService {
  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(PaymentTransaction) private txRepo: Repository<PaymentTransaction>,
    @InjectRepository(ReferralCode) private codeRepo: Repository<ReferralCode>,
  ) {}

  async findAll() {
    const customers = await this.customerRepo.find({ order: { created_at: 'DESC' } });

    const stats: { customer_id: string; order_count: number; total_spent: number }[] =
      await this.txRepo
        .createQueryBuilder('tx')
        .select('tx.customer_id', 'customer_id')
        .addSelect('CAST(COUNT(*) AS INT)', 'order_count')
        .addSelect('CAST(SUM(CAST(tx.amount AS FLOAT)) AS FLOAT)', 'total_spent')
        .where("tx.payment_status = 'paid'")
        .andWhere('tx.customer_id IS NOT NULL')
        .groupBy('tx.customer_id')
        .getRawMany();

    const statsMap = new Map(stats.map((s) => [s.customer_id, s]));

    return customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      is_active: c.is_active,
      created_at: c.created_at,
      order_count: statsMap.get(c.id)?.order_count ?? 0,
      total_spent: statsMap.get(c.id)?.total_spent ?? 0,
    }));
  }

  async findOne(id: string) {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) throw new NotFoundException();

    const [orders, referralCodes] = await Promise.all([
      this.txRepo.find({
        where: { customer_id: id, payment_status: 'paid' as any },
        order: { created_at: 'DESC' },
      }),
      this.codeRepo.find({
        where: { owner_email: customer.email },
        order: { created_at: 'ASC' },
      }),
    ]);

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      is_active: customer.is_active,
      created_at: customer.created_at,
      orders: orders.map((tx) => ({
        session_id: tx.session_id,
        amount: Number(tx.amount),
        currency: tx.currency,
        items: tx.items,
        payment_status: tx.payment_status,
        created_at: tx.created_at,
      })),
      referral_codes: referralCodes.map((c) => ({
        code: c.code,
        discount_pct: c.discount_pct,
        uses: c.uses,
        active: c.active,
      })),
    };
  }

  async setActive(id: string, is_active: boolean) {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) throw new NotFoundException();
    await this.customerRepo.update({ id }, { is_active });
    return { id, is_active };
  }
}
