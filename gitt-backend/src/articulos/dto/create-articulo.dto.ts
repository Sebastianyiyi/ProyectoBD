import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateArticuloDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  codigo_institucional!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  codigo_barras?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  marca?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  modelo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  numero_serie?: string;

  @IsOptional()
  @IsString()
  fecha_adquisicion?: string;

  @IsOptional()
  @IsNumber()
  valor?: number;

  @IsInt()
  id_categoria!: number;

  @IsInt()
  id_estado_articulo!: number;

  @IsInt()
  id_ubicacion!: number;

  @IsOptional()
  @IsInt()
  id_responsable?: number;
}
