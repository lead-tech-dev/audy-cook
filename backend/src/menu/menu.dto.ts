import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LocalizedTextDto } from '../products/products.dto';

export class CreateMenuDto {
  @ValidateNested() @Type(() => LocalizedTextDto) name: LocalizedTextDto;
  @ValidateNested() @Type(() => LocalizedTextDto) description: LocalizedTextDto;
  @IsNumber() price: number;
  @IsOptional() @IsNumber() min_quantity?: number = 5;
  @IsOptional() @IsString() image?: string | null;
  @IsOptional() @IsNumber() sort_order?: number = 0;
}
