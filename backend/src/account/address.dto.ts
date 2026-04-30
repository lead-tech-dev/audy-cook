import { IsOptional, IsString, MinLength } from 'class-validator';

export class AddressDto {
  @IsString() @MinLength(1) label: string;
  @IsString() @MinLength(1) full_name: string;
  @IsString() @MinLength(1) address_line1: string;
  @IsOptional() @IsString() address_line2?: string;
  @IsString() @MinLength(1) city: string;
  @IsString() @MinLength(1) postal_code: string;
  @IsString() @MinLength(1) country: string;
  @IsOptional() @IsString() phone?: string;
}
