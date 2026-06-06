import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ubicacion } from './ubicacion.entity';
import { CreateUbicacionDto } from './dto/create-ubicacion.dto';

@Injectable()
export class UbicacionesService {
  constructor(
    @InjectRepository(Ubicacion)
    private readonly repo: Repository<Ubicacion>,
  ) {}

  findAll() {
    return this.repo
      .createQueryBuilder('u')
      .orderBy('u.nombre', 'ASC')
      .getMany();
  }

  async findOne(id: number) {
    const ubicacion = await this.repo.findOne({ where: { id_ubicacion: id } });
    if (!ubicacion) {
      throw new NotFoundException(`Ubicación #${id} no encontrada`);
    }
    return ubicacion;
  }

  async create(dto: CreateUbicacionDto) {
    const ubicacion = this.repo.create({
      nombre: dto.nombre,
      tipo_ubicacion: dto.tipo_ubicacion ?? null,
      bloque: dto.bloque ?? null,
      piso: dto.piso ?? null,
      descripcion: dto.descripcion ?? null,
      id_departamento: dto.id_departamento,
    });
    return this.repo.save(ubicacion);
  }

  async update(id: number, dto: Partial<CreateUbicacionDto>) {
    const ubicacion = await this.findOne(id);
    Object.assign(ubicacion, {
      nombre: dto.nombre ?? ubicacion.nombre,
      tipo_ubicacion: dto.tipo_ubicacion !== undefined ? dto.tipo_ubicacion : ubicacion.tipo_ubicacion,
      bloque: dto.bloque !== undefined ? dto.bloque : ubicacion.bloque,
      piso: dto.piso !== undefined ? dto.piso : ubicacion.piso,
      descripcion: dto.descripcion !== undefined ? dto.descripcion : ubicacion.descripcion,
      id_departamento: dto.id_departamento ?? ubicacion.id_departamento,
    });
    return this.repo.save(ubicacion);
  }

  async remove(id: number) {
    const ubicacion = await this.findOne(id);
    // Verificar que no haya artículos en esta ubicación
    const count = await this.repo.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'total')
      .from('articulo', 'a')
      .where('a.id_ubicacion = :id', { id })
      .getRawOne<{ total: string }>();
    if (count && parseInt(count.total) > 0) {
      throw new BadRequestException(
        'No se puede eliminar: hay artículos asignados a esta ubicación',
      );
    }
    await this.repo.remove(ubicacion);
    return { message: 'Ubicación eliminada correctamente' };
  }
}
