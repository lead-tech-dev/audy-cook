import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('customer_addresses')
export class CustomerAddress {
  @PrimaryColumn('varchar')
  id: string;

  @Column()
  customer_id: string;

  @Column({ default: '' })
  label: string;

  @Column()
  full_name: string;

  @Column()
  address_line1: string;

  @Column({ nullable: true, default: null })
  address_line2: string | null;

  @Column()
  city: string;

  @Column()
  postal_code: string;

  @Column({ default: 'Luxembourg' })
  country: string;

  @Column({ nullable: true, default: null })
  phone: string | null;

  @Column({ default: false })
  is_default: boolean;

  @CreateDateColumn()
  created_at: Date;
}
