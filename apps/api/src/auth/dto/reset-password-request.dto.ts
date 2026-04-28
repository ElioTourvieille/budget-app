import { IsEmail } from 'class-validator';

export class ResetPasswordRequestDto {
  @IsEmail({}, { message: "L'email doit être une adresse email valide." })
  email: string;
}