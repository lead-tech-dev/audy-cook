import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutItemDto {
  @IsString() product_id: string;
  @IsInt() @Min(1) quantity: number;
}

export class CheckoutDto {
  @IsArray() @ArrayNotEmpty() @ValidateNested({ each: true }) @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];
  @IsString() origin_url: string;
  @IsOptional() @IsEmail() customer_email?: string;
  @IsOptional() @IsString() customer_name?: string;
  @IsOptional() @IsString() referral_code?: string;
  @IsOptional() @IsString() customer_id?: string;
  @IsOptional() shipping_address?: Record<string, any>;
}
