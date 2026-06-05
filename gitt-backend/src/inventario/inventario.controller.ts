import { Controller, Get } from '@nestjs/common';
import { InventarioService } from './inventario.service';

@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Get('admin/dispositivos')
  getDispositivosAdmin() {
    return this.inventarioService.getDispositivosAdmin();
  }
}
