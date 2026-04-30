import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('referral_uses')
export class ReferralUse {
  @PrimaryColumn('varchar')
  id: string;

  @Column()
  code: string;

  @Column({ default: '' })
  owner_email: string;

  @Column({ default: '' })
  owner_name: string;

  @Column({ default: '' })
  session_id: string;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  used_at: Date;

  @Column()
  year: number;

  @Column()
  month: number;

  @CreateDateColumn()
  created_at: Date;
}
