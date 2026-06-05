import { Controller, Get } from '@nestjs/common';
import { CatalogosService } from './catalogos.service';

@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}

  @Get('categorias')
  getCategorias() {
    return this.catalogosService.getCategorias();
  }

  @Get('estados-articulo')
  getEstadosArticulo() {
    return this.catalogosService.getEstadosArticulo();
  }

  @Get('ubicaciones')
  getUbicaciones() {
    return this.catalogosService.getUbicaciones();
  }

  @Get('usuarios')
  getUsuarios() {
    return this.catalogosService.getUsuarios();
  }
}
