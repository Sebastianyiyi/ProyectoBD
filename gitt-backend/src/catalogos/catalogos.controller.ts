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

  @Get('roles')
  getRoles() {
    return this.catalogosService.getRoles();
  }

  @Get('estados-usuario')
  getEstadosUsuario() {
    return this.catalogosService.getEstadosUsuario();
  }

  @Get('tipos-mantenimiento')
  getTiposMantenimiento() {
    return this.catalogosService.getTiposMantenimiento();
  }

  @Get('estados-mantenimiento')
  getEstadosMantenimiento() {
    return this.catalogosService.getEstadosMantenimiento();
  }

  @Get('tipos-movimiento')
  getTiposMovimiento() {
    return this.catalogosService.getTiposMovimiento();
  }

  @Get('tipos-notificacion')
  getTiposNotificacion() {
    return this.catalogosService.getTiposNotificacion();
  }

  @Get('estados-notificacion')
  getEstadosNotificacion() {
    return this.catalogosService.getEstadosNotificacion();
  }

  @Get('estados-prestamo')
  getEstadosPrestamo() {
    return this.catalogosService.getEstadosPrestamo();
  }

  @Get('departamentos')
  getDepartamentos() {
    return this.catalogosService.getDepartamentos();
  }
}
