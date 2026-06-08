import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { MovimientosService } from './movimientos.service';
import type { CreateMovimientoDto } from './movimientos.service';

@Controller('movimientos')
export class MovimientosController {
  constructor(private readonly movimientosService: MovimientosService) {}

  @Get()
  findAll(
    @Query('id_articulo') idArticulo?: string,
    @Query('busqueda') busqueda?: string,
  ) {
    return this.movimientosService.findAll({
      id_articulo: idArticulo ? Number(idArticulo) : undefined,
      busqueda,
    });
  }

  @Post()
  create(@Body() dto: CreateMovimientoDto) {
    return this.movimientosService.create(dto);
  }
}
