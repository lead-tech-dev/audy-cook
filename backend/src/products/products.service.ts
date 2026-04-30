import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './products.dto';
import { uuidv4 } from './uuid';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  private toDto(p: Product) {
    return {
      id: p.id,
      slug: p.slug,
      name: { fr: p.name_fr, en: p.name_en },
      description: { fr: p.description_fr, en: p.description_en },
      category: { fr: p.category_fr, en: p.category_en },
      price: Number(p.price),
      image: p.image,
      badge: p.badge,
      in_stock: p.in_stock,
      sort_order: p.sort_order,
    };
  }

  async findAll() {
    const rows = await this.repo.find({ order: { sort_order: 'ASC' } });
    return rows.map((p) => this.toDto(p));
  }

  async findById(id: string) {
    const p = await this.repo.findOne({ where: { id } });
    return p ? this.toDto(p) : null;
  }

  async findBySlug(slug: string) {
    const p = await this.repo.findOne({ where: { slug } });
    return p ? this.toDto(p) : null;
  }

  async create(dto: CreateProductDto) {
    const entity = this.repo.create({
      id: uuidv4(),
      slug: dto.slug,
      name_fr: dto.name?.fr || '',
      name_en: dto.name?.en || '',
      description_fr: dto.description?.fr || '',
      description_en: dto.description?.en || '',
      category_fr: dto.category?.fr || '',
      category_en: dto.category?.en || '',
      price: dto.price,
      image: dto.image,
      badge: dto.badge ?? null,
      in_stock: dto.in_stock ?? true,
      sort_order: dto.sort_order ?? 0,
    });
    const saved = await this.repo.save(entity);
    return this.toDto(saved);
  }

  async update(id: string, dto: CreateProductDto) {
    await this.repo.update({ id }, {
      slug: dto.slug,
      name_fr: dto.name?.fr || '',
      name_en: dto.name?.en || '',
      description_fr: dto.description?.fr || '',
      description_en: dto.description?.en || '',
      category_fr: dto.category?.fr || '',
      category_en: dto.category?.en || '',
      price: dto.price,
      image: dto.image,
      badge: dto.badge ?? null,
      in_stock: dto.in_stock ?? true,
      sort_order: dto.sort_order ?? 0,
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
          name_fr: item.name?.fr || '',
          name_en: item.name?.en || '',
          description_fr: item.description?.fr || '',
          description_en: item.description?.en || '',
          category_fr: item.category?.fr || '',
          category_en: item.category?.en || '',
          price: item.price,
          image: item.image,
          badge: item.badge ?? null,
          in_stock: item.in_stock ?? true,
          sort_order: item.sort_order ?? 0,
        }));
        created += 1;
      }
    }
    return created;
  }
}
