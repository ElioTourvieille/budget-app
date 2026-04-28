import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères.' })
  firstName?: string;

  @IsOptional()
  @IsUrl({}, { message: "L'URL de l'avatar est invalide." })
  avatarUrl?: string;
}