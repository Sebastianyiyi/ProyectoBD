import { Controller, Get } from '@nestjs/common';
import { ReportesService } from './reportes.service';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('inventario')
  getResumenInventario() {
    return this.reportesService.getResumenInventario();
  }

  @Get('prestamos')
  getResumenPrestamos() {
    return this.reportesService.getResumenPrestamos();
  }

  @Get('mantenimientos')
  getResumenMantenimientos() {
    return this.reportesService.getResumenMantenimientos();
  }
}
