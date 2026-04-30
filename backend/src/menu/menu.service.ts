import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from './menu-item.entity';
import { CreateMenuDto } from './menu.dto';
import { uuidv4 } from '../products/uuid';

@Injectable()
export class MenuService {
  constructor(@InjectRepository(MenuItem) private repo: Repository<MenuItem>) {}

  private toDto(m: MenuItem) {
    return {
      id: m.id,
      name: { fr: m.name_fr, en: m.name_en },
      description: { fr: m.description_fr, en: m.description_en },
      price: Number(m.price),
      min_quantity: m.min_quantity,
      image: m.image,
      sort_order: m.sort_order,
    };
  }

  async findAll() {
    const rows = await this.repo.find({ order: { sort_order: 'ASC' } });
    return rows.map((m) => this.toDto(m));
  }

  async create(dto: CreateMenuDto) {
    const entity = this.repo.create({
      id: uuidv4(),
      name_fr: dto.name?.fr || '',
      name_en: dto.name?.en || '',
      description_fr: dto.description?.fr || '',
      description_en: dto.description?.en || '',
      price: dto.price,
      min_quantity: dto.min_quantity ?? 5,
      image: dto.image ?? null,
      sort_order: dto.sort_order ?? 0,
    });
    const saved = await this.repo.save(entity);
    return this.toDto(saved);
  }

  async update(id: string, dto: CreateMenuDto) {
    await this.repo.update({ id }, {
      name_fr: dto.name?.fr || '',
      name_en: dto.name?.en || '',
      description_fr: dto.description?.fr || '',
      description_en: dto.description?.en || '',
      price: dto.price,
      min_quantity: dto.min_quantity ?? 5,
      image: dto.image ?? null,
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
    for (const item of items) {
      const existing = await this.repo.findOne({ where: { name_fr: item.name?.fr } });
      if (!existing) {
        await this.repo.save(this.repo.create({
          id: uuidv4(),
          name_fr: item.name?.fr || '',
          name_en: item.name?.en || '',
          description_fr: item.description?.fr || '',
          description_en: item.description?.en || '',
          price: item.price,
          min_quantity: item.min_quantity ?? 5,
          image: item.image ?? null,
          sort_order: item.sort_order ?? 0,
        }));
      }
    }
  }
}
