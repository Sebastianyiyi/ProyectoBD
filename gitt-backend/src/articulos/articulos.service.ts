import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Articulo } from './articulo.entity';
import { CreateArticuloDto } from './dto/create-articulo.dto';

@Injectable()
export class ArticulosService {
  constructor(
    @InjectRepository(Articulo)
    private readonly articulosRepository: Repository<Articulo>,
  ) {}

  findAll() {
    return this.articulosRepository.find({
      order: { id_articulo: 'ASC' },
    });
  }

  async create(dto: CreateArticuloDto) {
    const articulo = this.articulosRepository.create({
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

    return this.articulosRepository.save(articulo);
  }
}
