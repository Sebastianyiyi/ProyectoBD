import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

export interface FiltrosUsuario {
  busqueda?: string;
  id_rol?: number;
  id_estado_usuario?: number;
}

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  findByCorreo(correo: string) {
    return this.usuariosRepository.findOne({ where: { correo } });
  }

  findAll(filtros: FiltrosUsuario = {}) {
    const query = this.usuariosRepository
      .createQueryBuilder('u')
      .orderBy('u.apellidos', 'ASC')
      .addOrderBy('u.nombres', 'ASC');

    if (filtros.id_rol) {
      query.andWhere('u.id_rol = :id_rol', { id_rol: filtros.id_rol });
    }

    if (filtros.id_estado_usuario) {
      query.andWhere('u.id_estado_usuario = :id_estado_usuario', {
        id_estado_usuario: filtros.id_estado_usuario,
      });
    }

    if (filtros.busqueda) {
      const b = `%${filtros.busqueda.toLowerCase()}%`;
      query.andWhere(
        '(LOWER(u.nombres) LIKE :b OR LOWER(u.apellidos) LIKE :b OR LOWER(u.correo) LIKE :b OR LOWER(u.cedula) LIKE :b)',
        { b },
      );
    }

    return query.getMany();
  }

  async findOne(id: number) {
    const usuario = await this.usuariosRepository.findOne({
      where: { id_usuario: id },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario #${id} no encontrado`);
    }
    return usuario;
  }

  async create(dto: CreateUsuarioDto) {
    const usuario = this.usuariosRepository.create({
      cedula: dto.cedula,
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      correo: dto.correo,
      telefono: dto.telefono ?? null,
      id_rol: dto.id_rol,
      id_estado_usuario: dto.id_estado_usuario,
      fecha_registro: new Date().toISOString().split('T')[0],
    });
    return this.usuariosRepository.save(usuario);
  }

  async update(id: number, dto: Partial<CreateUsuarioDto>) {
    const usuario = await this.findOne(id);
    Object.assign(usuario, {
      nombres: dto.nombres ?? usuario.nombres,
      apellidos: dto.apellidos ?? usuario.apellidos,
      correo: dto.correo ?? usuario.correo,
      telefono: dto.telefono !== undefined ? dto.telefono : usuario.telefono,
      id_rol: dto.id_rol ?? usuario.id_rol,
      id_estado_usuario: dto.id_estado_usuario ?? usuario.id_estado_usuario,
    });
    return this.usuariosRepository.save(usuario);
  }
}
