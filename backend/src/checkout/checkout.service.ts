import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import Stripe from 'stripe';
import { PaymentTransaction } from './payment-transaction.entity';
import { ProductsService } from '../products/products.service';
import { ReferralsService } from '../referrals/referrals.service';
import { EmailService } from '../email/email.service';
import { referralRedeemedEmailHtml } from '../email/templates';
import { CheckoutDto } from './checkout.dto';
import { uuidv4 } from '../products/uuid';

@Injectable()
export class CheckoutService {
  private stripe: Stripe | null = null;

  constructor(
    @InjectRepository(PaymentTransaction)
    private repo: Repository<PaymentTransaction>,
    private products: ProductsService,
    private referrals: ReferralsService,
    private email: EmailService,
  ) {}

  private getStripe(): Stripe {
    if (!this.stripe) {
      const key = process.env.STRIPE_API_KEY;
      if (!key) throw new InternalServerErrorException('Stripe API key not configured');
      this.stripe = new Stripe(key, { apiVersion: '2024-11-20.acacia' as any });
    }
    return this.stripe;
  }

  async createSession(dto: CheckoutDto) {
    let total = 0;
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const detailed: any[] = [];

    for (const it of dto.items) {
      const prod: any = await this.products.findById(it.product_id);
      if (!prod) throw new BadRequestException(`Product ${it.product_id} not found`);
      const lineTotal = Number(prod.price) * it.quantity;
      total += lineTotal;
      detailed.push({
        product_id: prod.id,
        name: prod.name?.fr || prod.slug,
        quantity: it.quantity,
        unit_price: Number(prod.price),
        line_total: lineTotal,
      });
      lineItems.push({
        quantity: it.quantity,
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(Number(prod.price) * 100),
          product_data: {
            name: prod.name?.fr || prod.slug,
            images: prod.image ? [prod.image] : [],
          },
        },
      });
    }

    if (total <= 0) throw new BadRequestException('Invalid total');

    let discountPct = 0;
    let referralCode: string | null = null;
    if (dto.referral_code) {
      const ref = await this.referrals.findByCode(dto.referral_code);
      if (!ref) throw new BadRequestException('Code de parrainage invalide');
      discountPct = ref.discount_pct;
      referralCode = ref.code;
    }
    const finalAmount = Math.round(total * (1 - discountPct / 100) * 100) / 100;

    const origin = dto.origin_url.replace(/\/$/, '');
    const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/cart`;

    let stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    if (discountPct > 0) {
      stripeLineItems = [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(finalAmount * 100),
            product_data: {
              name: `AUDY COOK – Commande (${detailed.length} article${detailed.length > 1 ? 's' : ''}) • Code ${referralCode} −${discountPct}%`,
            },
          },
        },
      ];
    } else {
      stripeLineItems = lineItems;
    }

    const session = await this.getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: stripeLineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: dto.customer_email || undefined,
      metadata: {
        source: 'audycook_web',
        customer_email: dto.customer_email || '',
        customer_name: dto.customer_name || '',
        referral_code: referralCode || '',
        discount_pct: String(discountPct),
      },
    });

    await this.repo.save(this.repo.create({
      id: uuidv4(),
      session_id: session.id,
      amount: finalAmount,
      currency: 'eur',
      items: detailed,
      customer_id: dto.customer_id || null,
      metadata: {
        customer_email: dto.customer_email || '',
        customer_name: dto.customer_name || '',
        subtotal: Math.round(total * 100) / 100,
        discount_pct: discountPct,
        referral_code_used: referralCode || '',
        shipping_address: dto.shipping_address || null,
      },
      status: 'initiated',
      payment_status: 'pending',
    }));

    return {
      url: session.url,
      session_id: session.id,
      subtotal: Math.round(total * 100) / 100,
      discount_pct: discountPct,
      total: finalAmount,
    };
  }

  async getStatus(sessionId: string) {
    const tx = await this.repo.findOne({ where: { session_id: sessionId } });
    if (!tx) throw new NotFoundException('Session not found');

    if (tx.payment_status === 'paid') {
      return {
        status: tx.status,
        payment_status: tx.payment_status,
        amount: Number(tx.amount),
        currency: tx.currency,
        generated_referral_code: tx.metadata?.generated_referral_code || null,
      };
    }

    const session = await this.getStripe().checkout.sessions.retrieve(sessionId);
    const newStatus = session.status || 'open';
    const newPaymentStatus = session.payment_status || 'pending';

    if (newPaymentStatus !== 'paid') {
      await this.repo.update({ session_id: sessionId }, { status: newStatus, payment_status: newPaymentStatus });
      return {
        status: newStatus,
        payment_status: newPaymentStatus,
        amount: Number(tx.amount),
        currency: tx.currency,
        generated_referral_code: null,
      };
    }

    // Atomic claim: only the first concurrent poll processes the payment
    const result = await this.repo.update(
      { session_id: sessionId, payment_status: Not('paid') },
      { status: newStatus, payment_status: 'paid' },
    );

    if (!result.affected || result.affected === 0) {
      // Another request already processed it — return stored code
      const fresh = await this.repo.findOne({ where: { session_id: sessionId } });
      return {
        status: newStatus,
        payment_status: 'paid',
        amount: Number(tx.amount),
        currency: tx.currency,
        generated_referral_code: fresh?.metadata?.generated_referral_code || null,
      };
    }

    // We won the race — process referral
    if (tx.metadata?.referral_code_used) {
      const refResult = await this.referrals.incrementUses(tx.metadata.referral_code_used, sessionId);
      if (refResult?.owner_email) {
        this.email.send({
          to: refResult.owner_email,
          subject: `Merci ! ${tx.metadata?.customer_name || "Un·e ami·e"} vient d'utiliser votre code AUDY COOK`,
          html: referralRedeemedEmailHtml({
            ownerName: refResult.owner_name,
            redeemerName: tx.metadata?.customer_name || '',
            code: tx.metadata.referral_code_used,
            totalUses: refResult.uses,
          }),
        });
      }
    }

    const generatedCode = await this.referrals.generateForCustomer({
      email: tx.metadata?.customer_email,
      name: tx.metadata?.customer_name,
    });

    await this.repo.update(
      { session_id: sessionId },
      { metadata: { ...(tx.metadata || {}), generated_referral_code: generatedCode } } as any,
    );

    return {
      status: newStatus,
      payment_status: 'paid',
      amount: Number(tx.amount),
      currency: tx.currency,
      generated_referral_code: generatedCode,
    };
  }
}
