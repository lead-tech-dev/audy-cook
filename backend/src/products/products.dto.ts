import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LocalizedTextDto {
  @IsString() @IsOptional() fr: string = '';
  @IsString() @IsOptional() en: string = '';
}

export class CreateProductDto {
  @IsString() slug: string;
  @ValidateNested() @Type(() => LocalizedTextDto) name: LocalizedTextDto;
  @ValidateNested() @Type(() => LocalizedTextDto) description: LocalizedTextDto;
  @ValidateNested() @Type(() => LocalizedTextDto) category: LocalizedTextDto;
  @IsNumber() price: number;
  @IsString() image: string;
  @IsOptional() @IsString() badge?: string | null;
  @IsOptional() @IsBoolean() in_stock?: boolean = true;
  @IsOptional() @IsNumber() sort_order?: number = 0;
}
