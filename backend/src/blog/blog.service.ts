import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost } from './blog-post.entity';
import { CreateBlogDto } from './blog.dto';
import { uuidv4 } from '../products/uuid';

@Injectable()
export class BlogService {
  constructor(@InjectRepository(BlogPost) private repo: Repository<BlogPost>) {}

  private toDto(p: BlogPost) {
    return {
      id: p.id,
      slug: p.slug,
      title: { fr: p.title_fr, en: p.title_en },
      excerpt: { fr: p.excerpt_fr, en: p.excerpt_en },
      body: { fr: p.body_fr, en: p.body_en },
      cover_image: p.cover_image,
      category: { fr: p.category_fr, en: p.category_en },
      read_time: p.read_time,
      published_at: p.published_at instanceof Date ? p.published_at.toISOString() : p.published_at,
    };
  }

  async findAll() {
    const rows = await this.repo.find({ order: { published_at: 'DESC' } });
    return rows.map((p) => this.toDto(p));
  }

  async findBySlug(slug: string) {
    const p = await this.repo.findOne({ where: { slug } });
    return p ? this.toDto(p) : null;
  }

  async create(dto: CreateBlogDto) {
    const entity = this.repo.create({
      id: uuidv4(),
      slug: dto.slug,
      title_fr: dto.title?.fr || '',
      title_en: dto.title?.en || '',
      excerpt_fr: dto.excerpt?.fr || '',
      excerpt_en: dto.excerpt?.en || '',
      body_fr: dto.body?.fr || '',
      body_en: dto.body?.en || '',
      cover_image: dto.cover_image,
      category_fr: dto.category?.fr || '',
      category_en: dto.category?.en || '',
      read_time: dto.read_time ?? 5,
      published_at: new Date(),
    });
    const saved = await this.repo.save(entity);
    return this.toDto(saved);
  }

  async update(id: string, dto: CreateBlogDto) {
    await this.repo.update({ id }, {
      slug: dto.slug,
      title_fr: dto.title?.fr || '',
      title_en: dto.title?.en || '',
      excerpt_fr: dto.excerpt?.fr || '',
      excerpt_en: dto.excerpt?.en || '',
      body_fr: dto.body?.fr || '',
      body_en: dto.body?.en || '',
      cover_image: dto.cover_image,
      category_fr: dto.category?.fr || '',
      category_en: dto.category?.en || '',
      read_time: dto.read_time ?? 5,
    });
    const updated = await this.repo.findOne({ where: { id } });
    return updated ? this.toDto(updated) : null;
  }

  async delete(id: string) {
    const result = await this.repo.delete({ id });
    return (result.affected ?? 0) > 0;
  }

  async seedIfMissing(items: any[]) {
    let created = 0;
    for (const item of items) {
      const existing = await this.repo.findOne({ where: { slug: item.slug } });
      if (!existing) {
        await this.repo.save(this.repo.create({
          id: uuidv4(),
          slug: item.slug,
          title_fr: item.title?.fr || '',
          title_en: item.title?.en || '',
          excerpt_fr: item.excerpt?.fr || '',
          excerpt_en: item.excerpt?.en || '',
          body_fr: item.body?.fr || '',
          body_en: item.body?.en || '',
          cover_image: item.cover_image,
          category_fr: item.category?.fr || '',
          category_en: item.category?.en || '',
          read_time: item.read_time ?? 5,
          published_at: new Date(),
        }));
        created += 1;
      }
    }
    return created;
  }
}
