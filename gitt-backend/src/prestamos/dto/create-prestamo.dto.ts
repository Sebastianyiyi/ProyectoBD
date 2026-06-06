import { IsArray, IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePrestamoDto {
  @IsInt()
  id_solicitante!: number;

  @IsDateString()
  @IsOptional()
  fecha_prevista_devolucion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  observacion?: string;

  @IsArray()
  @IsInt({ each: true })
  articulos!: number[];
}

export class AprobarPrestamoDto {
  @IsInt()
  id_aprobador!: number;
}

export class DevolverPrestamoDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  observacion?: string;

  @IsString()
  @IsOptional()
  estado_entrada?: string;
}
