import { IsEmail, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @MaxLength(13)
  cedula!: string;

  @IsString()
  @MaxLength(100)
  nombres!: string;

  @IsString()
  @MaxLength(100)
  apellidos!: string;

  @IsEmail()
  @MaxLength(120)
  correo!: string;

  @IsString()
  @IsOptional()
  @MaxLength(15)
  telefono?: string;

  @IsInt()
  id_rol!: number;

  @IsInt()
  id_estado_usuario!: number;
}
