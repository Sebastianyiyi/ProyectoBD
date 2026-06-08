import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class MicrosoftLoginDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsEmail()
  correo: string;

  @IsString()
  @IsNotEmpty()
  nombres: string;

  @IsString()
  @IsNotEmpty()
  apellidos: string;
}
