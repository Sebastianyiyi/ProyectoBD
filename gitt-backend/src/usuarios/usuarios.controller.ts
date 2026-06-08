import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import type { FiltrosUsuario } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  findAll(@Query() query: FiltrosUsuario) {
    return this.usuariosService.findAll({
      busqueda: query.busqueda,
      id_rol: query.id_rol ? Number(query.id_rol) : undefined,
      id_estado_usuario: query.id_estado_usuario
        ? Number(query.id_estado_usuario)
        : undefined,
    });
  }

  @Get('correo/:correo')
  findByCorreo(@Param('correo') correo: string) {
    return this.usuariosService.findByCorreo(correo);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateUsuarioDto>,
  ) {
    return this.usuariosService.update(id, dto);
  }
}
