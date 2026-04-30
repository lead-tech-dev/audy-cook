import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('referral_codes')
export class ReferralCode {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ default: '' })
  owner_email: string;

  @Column({ default: '' })
  owner_name: string;

  @Column({ default: 10 })
  discount_pct: number;

  @Column({ default: 0 })
  uses: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
