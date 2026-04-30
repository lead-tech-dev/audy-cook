import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('payment_transactions')
export class PaymentTransaction {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ unique: true })
  session_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'eur' })
  currency: string;

  @Column({ type: 'jsonb', default: [] })
  items: any[];

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ nullable: true, default: null })
  customer_id: string | null;

  @Column({ default: 'initiated' })
  status: string;

  @Column({ default: 'pending' })
  payment_status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
