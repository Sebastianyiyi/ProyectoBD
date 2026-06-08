import { IsDateString, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateMantenimientoDto {
  @IsInt()
  id_articulo!: number;

  @IsInt()
  id_tipo_mantenimiento!: number;

  @IsInt()
  id_estado_mantenimiento!: number;

  @IsDateString()
  fecha_inicio!: string;

  @IsDateString()
  @IsOptional()
  fecha_fin?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  tecnico_proveedor?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  costo?: number;

  @IsDateString()
  @IsOptional()
  proximo_mantenimiento?: string;
}

export class CerrarMantenimientoDto {
  @IsDateString()
  fecha_fin!: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  costo?: number;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  @IsOptional()
  proximo_mantenimiento?: string;
}
