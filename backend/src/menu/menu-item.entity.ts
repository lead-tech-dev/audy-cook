import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('menu_items')
export class MenuItem {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ default: '' }) name_fr: string;
  @Column({ default: '' }) name_en: string;
  @Column({ type: 'text', default: '' }) description_fr: string;
  @Column({ type: 'text', default: '' }) description_en: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 5 })
  min_quantity: number;

  @Column({ nullable: true, default: null })
  image: string | null;

  @Column({ default: 0 })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
