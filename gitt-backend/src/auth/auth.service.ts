import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { MicrosoftLoginDto } from './dto/microsoft-login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async loginConMicrosoft(dto: MicrosoftLoginDto) {
    let usuario = await this.usuarioRepository.findOne({
      where: { correo: dto.correo },
    });

    if (!usuario) {
      usuario = this.usuarioRepository.create({
        correo: dto.correo,
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        cedula: 'PENDIENTE',
        id_rol: 1,
        id_estado_usuario: 1,
        fecha_registro: new Date().toISOString().split('T')[0],
      });
      await this.usuarioRepository.save(usuario);
    } else {
      usuario.ultimo_acceso = new Date();
      await this.usuarioRepository.save(usuario);
    }

    return {
      id_usuario: usuario.id_usuario,
      correo: usuario.correo,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      id_rol: usuario.id_rol,
      id_estado_usuario: usuario.id_estado_usuario,
    };
  }
}
