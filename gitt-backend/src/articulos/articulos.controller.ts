import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ArticulosService } from './articulos.service';
import { CreateArticuloDto } from './dto/create-articulo.dto';

@Controller('articulos')
export class ArticulosController {
  constructor(private readonly articulosService: ArticulosService) {}

  @Get()
  findAll(
    @Query('id_categoria') id_categoria?: string,
    @Query('id_estado_articulo') id_estado_articulo?: string,
    @Query('id_ubicacion') id_ubicacion?: string,
    @Query('id_responsable') id_responsable?: string,
    @Query('busqueda') busqueda?: string,
  ) {
    return this.articulosService.findAll({
      id_categoria: id_categoria ? Number(id_categoria) : undefined,
      id_estado_articulo: id_estado_articulo ? Number(id_estado_articulo) : undefined,
      id_ubicacion: id_ubicacion ? Number(id_ubicacion) : undefined,
      id_responsable: id_responsable ? Number(id_responsable) : undefined,
      busqueda,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.articulosService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateArticuloDto) {
    return this.articulosService.create(dto);
  }
}
