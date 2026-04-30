import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('blog_posts')
export class BlogPost {
  @PrimaryColumn('varchar')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column({ default: '' }) title_fr: string;
  @Column({ default: '' }) title_en: string;
  @Column({ type: 'text', default: '' }) excerpt_fr: string;
  @Column({ type: 'text', default: '' }) excerpt_en: string;
  @Column({ type: 'text', default: '' }) body_fr: string;
  @Column({ type: 'text', default: '' }) body_en: string;

  @Column()
  cover_image: string;

  @Column({ default: '' }) category_fr: string;
  @Column({ default: '' }) category_en: string;

  @Column({ default: 5 })
  read_time: number;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  published_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
