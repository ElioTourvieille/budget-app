import { AccountType } from '@prisma/client';
import { IsEnum, IsHexColor, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères.' })
  name: string;

  @IsEnum(AccountType, { message: 'Type de compte invalide.' })
  type: AccountType;

  @IsOptional()
  @IsString()
  bank?: string;

  @IsOptional()
  @IsHexColor({ message: 'La couleur doit être un code hexadécimal valide.' })
  color?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}