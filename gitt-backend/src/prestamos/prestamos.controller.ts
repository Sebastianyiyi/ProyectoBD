import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PrestamosService } from './prestamos.service';
import type { FiltrosPrestamo } from './prestamos.service';
import type {
  CreatePrestamoDto,
  AprobarPrestamoDto,
  DevolverPrestamoDto,
} from './dto/create-prestamo.dto';

@Controller('prestamos')
export class PrestamosController {
  constructor(private readonly prestamosService: PrestamosService) {}

  @Get()
  getPrestamos(@Query() query: FiltrosPrestamo) {
    return this.prestamosService.getPrestamos({
      id_estado_prestamo: query.id_estado_prestamo
        ? Number(query.id_estado_prestamo)
        : undefined,
      id_solicitante: query.id_solicitante
        ? Number(query.id_solicitante)
        : undefined,
      busqueda: query.busqueda,
    });
  }

  @Get('admin')
  getPrestamosAdmin() {
    return this.prestamosService.getPrestamosAdmin();
  }

  @Post()
  create(@Body() dto: CreatePrestamoDto) {
    return this.prestamosService.create(dto);
  }

  @Patch(':id/aprobar')
  aprobar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AprobarPrestamoDto,
  ) {
    return this.prestamosService.aprobar(id, dto);
  }

  @Patch(':id/entregar')
  entregar(@Param('id', ParseIntPipe) id: number) {
    return this.prestamosService.entregar(id);
  }

  @Patch(':id/devolver')
  devolver(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DevolverPrestamoDto,
  ) {
    return this.prestamosService.devolver(id, dto);
  }

  @Patch(':id/cancelar')
  cancelar(@Param('id', ParseIntPipe) id: number) {
    return this.prestamosService.cancelar(id);
  }
}
