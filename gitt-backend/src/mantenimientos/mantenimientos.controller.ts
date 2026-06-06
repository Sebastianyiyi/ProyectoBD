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
import { MantenimientosService } from './mantenimientos.service';
import type { FiltrosMantenimiento } from './mantenimientos.service';
import type { CreateMantenimientoDto, CerrarMantenimientoDto } from './dto/create-mantenimiento.dto';

@Controller('mantenimientos')
export class MantenimientosController {
  constructor(private readonly mantenimientosService: MantenimientosService) {}

  @Get()
  findAll(@Query() query: FiltrosMantenimiento) {
    return this.mantenimientosService.findAll({
      id_tipo_mantenimiento: query.id_tipo_mantenimiento
        ? Number(query.id_tipo_mantenimiento)
        : undefined,
      id_estado_mantenimiento: query.id_estado_mantenimiento
        ? Number(query.id_estado_mantenimiento)
        : undefined,
      id_articulo: query.id_articulo ? Number(query.id_articulo) : undefined,
      busqueda: query.busqueda,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mantenimientosService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateMantenimientoDto) {
    return this.mantenimientosService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateMantenimientoDto>,
  ) {
    return this.mantenimientosService.update(id, dto);
  }

  @Patch(':id/cerrar')
  cerrar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CerrarMantenimientoDto,
  ) {
    return this.mantenimientosService.cerrar(id, dto);
  }
}
