import { Controller, Get, Query } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import type { FiltrosAuditoria } from './auditoria.service';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  findAll(@Query() query: FiltrosAuditoria) {
    return this.auditoriaService.findAll({
      tabla_afectada: query.tabla_afectada,
      accion: query.accion,
      id_usuario: query.id_usuario ? Number(query.id_usuario) : undefined,
      fecha_desde: query.fecha_desde,
      fecha_hasta: query.fecha_hasta,
    });
  }
}
