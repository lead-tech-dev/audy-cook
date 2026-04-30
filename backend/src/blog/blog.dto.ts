import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LocalizedTextDto } from '../products/products.dto';

export class CreateBlogDto {
  @IsString() slug: string;
  @ValidateNested() @Type(() => LocalizedTextDto) title: LocalizedTextDto;
  @ValidateNested() @Type(() => LocalizedTextDto) excerpt: LocalizedTextDto;
  @ValidateNested() @Type(() => LocalizedTextDto) body: LocalizedTextDto;
  @IsString() cover_image: string;
  @ValidateNested() @Type(() => LocalizedTextDto) category: LocalizedTextDto;
  @IsOptional() @IsNumber() read_time?: number = 5;
}
