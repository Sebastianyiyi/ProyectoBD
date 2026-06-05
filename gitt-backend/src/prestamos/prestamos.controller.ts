import { Controller, Get } from '@nestjs/common';
import { PrestamosService } from './prestamos.service';

@Controller('prestamos')
export class PrestamosController {
  constructor(private readonly prestamosService: PrestamosService) {}

  @Get('admin')
  getPrestamosAdmin() {
    return this.prestamosService.getPrestamosAdmin();
  }
}
