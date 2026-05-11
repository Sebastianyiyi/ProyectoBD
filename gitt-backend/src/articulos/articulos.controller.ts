import { Body, Controller, Get, Post } from '@nestjs/common';
import { ArticulosService } from './articulos.service';
import { CreateArticuloDto } from './dto/create-articulo.dto';

@Controller('articulos')
export class ArticulosController {
  constructor(private readonly articulosService: ArticulosService) {}

  @Get()
  findAll() {
    return this.articulosService.findAll();
  }

  @Post()
  create(@Body() dto: CreateArticuloDto) {
    return this.articulosService.create(dto);
  }
}
