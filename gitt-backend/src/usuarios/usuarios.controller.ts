import { Controller, Get, Param } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('correo/:correo')
  findByCorreo(@Param('correo') correo: string) {
    return this.usuariosService.findByCorreo(correo);
  }
}
