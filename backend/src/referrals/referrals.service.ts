import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReferralCode } from './referral-code.entity';
import { ReferralUse } from './referral-use.entity';
import { uuidv4 } from '../products/uuid';

function randomShard(len = 4): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

@Injectable()
export class ReferralsService {
  constructor(
    @InjectRepository(ReferralCode) private codeRepo: Repository<ReferralCode>,
    @InjectRepository(ReferralUse) private useRepo: Repository<ReferralUse>,
  ) {}

  async validate(code: string) {
    const upper = code.trim().toUpperCase();
    if (!upper) throw new NotFoundException('Code requis');
    const doc = await this.codeRepo.findOne({ where: { code: upper, active: true } });
    if (!doc) throw new NotFoundException('Code invalide');
    return { code: doc.code, discount_pct: doc.discount_pct, owner_name: doc.owner_name };
  }

  async findByCode(code: string) {
    return this.codeRepo.findOne({ where: { code: code.trim().toUpperCase(), active: true } });
  }

  async incrementUses(code: string, sessionId?: string): Promise<{ owner_email: string; owner_name: string; uses: number } | null> {
    const upper = code.trim().toUpperCase();
    await this.codeRepo.increment({ code: upper }, 'uses', 1);
    const updated = await this.codeRepo.findOne({ where: { code: upper } });
    if (!updated) return null;

    const now = new Date();
    await this.useRepo.save(this.useRepo.create({
      id: uuidv4(),
      code: upper,
      owner_email: updated.owner_email || '',
      owner_name: updated.owner_name || '',
      session_id: sessionId || '',
      used_at: now,
      year: now.getUTCFullYear(),
      month: now.getUTCMonth() + 1,
    }));

    return { owner_email: updated.owner_email, owner_name: updated.owner_name, uses: updated.uses };
  }

  async toggleActive(code: string): Promise<{ code: string; active: boolean } | null> {
    const upper = code.trim().toUpperCase();
    const doc = await this.codeRepo.findOne({ where: { code: upper } });
    if (!doc) return null;
    await this.codeRepo.update({ code: upper }, { active: !doc.active });
    const updated = await this.codeRepo.findOne({ where: { code: upper } });
    if (!updated) return null;
    return { code: updated.code, active: updated.active };
  }

  async generateForCustomer(opts: { email?: string; name?: string }) {
    const slug = (opts.name || opts.email || 'AUDY')
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 6) || 'AUDY';

    for (let i = 0; i < 5; i++) {
      const code = `AUDY-${slug}-${randomShard(4)}`;
      const exists = await this.codeRepo.findOne({ where: { code } });
      if (!exists) {
        await this.codeRepo.save(this.codeRepo.create({
          id: uuidv4(),
          code,
          owner_email: opts.email || '',
          owner_name: opts.name || '',
          discount_pct: 10,
          uses: 0,
          active: true,
        }));
        return code;
      }
    }

    const code = `AUDY-${randomShard(8)}`;
    await this.codeRepo.save(this.codeRepo.create({
      id: uuidv4(),
      code,
      owner_email: opts.email || '',
      owner_name: opts.name || '',
      discount_pct: 10,
      uses: 0,
      active: true,
    }));
    return code;
  }

  async listAll() {
    return this.codeRepo.find({ order: { uses: 'DESC', created_at: 'DESC' } });
  }

  async leaderboardThisMonth(limit = 5) {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;

    const rows = await this.useRepo
      .createQueryBuilder('ru')
      .select('ru.code', 'code')
      .addSelect('ru.owner_name', 'owner_name')
      .addSelect('ru.owner_email', 'owner_email')
      .addSelect('CAST(COUNT(*) AS INT)', 'uses_this_month')
      .addSelect('MAX(ru.used_at)', 'last_used_at')
      .where('ru.year = :year AND ru.month = :month', { year, month })
      .groupBy('ru.code, ru.owner_name, ru.owner_email')
      .orderBy('uses_this_month', 'DESC')
      .addOrderBy('last_used_at', 'DESC')
      .limit(limit)
      .getRawMany();

    return rows.map((r) => ({
      code: r.code,
      owner_name: r.owner_name || '',
      owner_email_masked: maskEmail(r.owner_email || ''),
      uses_this_month: r.uses_this_month,
    }));
  }
}

function maskEmail(email: string): string {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${'•'.repeat(Math.max(1, local.length - 2))}@${domain}`;
}
