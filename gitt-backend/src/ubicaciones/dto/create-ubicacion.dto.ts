import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUbicacionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  tipo_ubicacion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  bloque?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  piso?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  descripcion?: string;

  @IsNumber()
  @IsNotEmpty()
  id_departamento!: number;
}
