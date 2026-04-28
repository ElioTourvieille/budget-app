import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: "L'email doit être une adresse email valide." })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Le prénom est requis.' })
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères.' })
  firstName: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
  password: string;
}