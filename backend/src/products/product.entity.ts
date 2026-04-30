import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column({ default: '' }) name_fr: string;
  @Column({ default: '' }) name_en: string;
  @Column({ type: 'text', default: '' }) description_fr: string;
  @Column({ type: 'text', default: '' }) description_en: string;
  @Column({ default: '' }) category_fr: string;
  @Column({ default: '' }) category_en: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  image: string;

  @Column({ nullable: true, default: null })
  badge: string | null;

  @Column({ default: true })
  in_stock: boolean;

  @Column({ default: 0 })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
