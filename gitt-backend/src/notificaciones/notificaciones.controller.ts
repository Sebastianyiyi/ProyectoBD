import { Controller, Get, Patch, Param, Query, ParseIntPipe } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  getAll() {
    return this.notificacionesService.getAll();
  }

  @Get('mias')
  getMias(@Query('id_usuario', ParseIntPipe) idUsuario: number) {
    return this.notificacionesService.getMias(idUsuario);
  }

  @Get('no-leidas')
  getNoLeidas(@Query('id_usuario', ParseIntPipe) idUsuario: number) {
    return this.notificacionesService.getNoLeidas(idUsuario).then((total) => ({ total }));
  }

  @Patch(':id/leer')
  marcarLeida(@Param('id', ParseIntPipe) id: number) {
    return this.notificacionesService.marcarLeida(id);
  }
}
