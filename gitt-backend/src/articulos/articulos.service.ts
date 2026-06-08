import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Articulo } from './articulo.entity';
import { CreateArticuloDto } from './dto/create-articulo.dto';

export interface FiltrosArticulo {
  id_categoria?: number;
  id_estado_articulo?: number;
  id_ubicacion?: number;
  id_responsable?: number;
  busqueda?: string;
}

@Injectable()
export class ArticulosService {
  constructor(
    @InjectRepository(Articulo)
    private readonly repo: Repository<Articulo>,
  ) {}

  findAll(filtros: FiltrosArticulo = {}) {
    const query = this.repo
      .createQueryBuilder('a')
      .orderBy('a.id_articulo', 'ASC');

    if (filtros.id_categoria) {
      query.andWhere('a.id_categoria = :id_categoria', {
        id_categoria: filtros.id_categoria,
      });
    }

    if (filtros.id_estado_articulo) {
      query.andWhere('a.id_estado_articulo = :id_estado_articulo', {
        id_estado_articulo: filtros.id_estado_articulo,
      });
    }

    if (filtros.id_ubicacion) {
      query.andWhere('a.id_ubicacion = :id_ubicacion', {
        id_ubicacion: filtros.id_ubicacion,
      });
    }

    if (filtros.id_responsable) {
      query.andWhere('a.id_responsable = :id_responsable', {
        id_responsable: filtros.id_responsable,
      });
    }

    if (filtros.busqueda) {
      query.andWhere(
        '(LOWER(a.nombre) LIKE :busqueda OR LOWER(a.codigo_institucional) LIKE :busqueda OR LOWER(a.marca) LIKE :busqueda)',
        { busqueda: `%${filtros.busqueda.toLowerCase()}%` },
      );
    }

    return query.getMany();
  }

  async findOne(id: number) {
    const articulo = await this.repo.findOne({
      where: { id_articulo: id },
    });

    if (!articulo) {
      throw new NotFoundException(`Artículo #${id} no encontrado`);
    }

    return articulo;
  }

  async create(dto: CreateArticuloDto) {
    const articulo = this.repo.create({
      ...dto,
      codigo_barras: dto.codigo_barras ?? null,
      descripcion: dto.descripcion ?? null,
      marca: dto.marca ?? null,
      modelo: dto.modelo ?? null,
      numero_serie: dto.numero_serie ?? null,
      fecha_adquisicion: dto.fecha_adquisicion ?? null,
      valor: dto.valor ?? null,
      id_responsable: dto.id_responsable ?? null,
    });

    return this.repo.save(articulo);
  }
}
