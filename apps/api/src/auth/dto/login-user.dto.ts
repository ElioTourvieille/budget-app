import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: "L'email doit être une adresse email valide." })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis.' })
  password: string;
}