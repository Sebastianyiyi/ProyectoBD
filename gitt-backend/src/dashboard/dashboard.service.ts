import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Articulo } from '../articulos/articulo.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Articulo)
    private readonly articulosRepository: Repository<Articulo>,
  ) {}

  async getSummary() {
    const totalArticulos = await this.articulosRepository.count();

    const disponibles = await this.articulosRepository.count({
      where: { id_estado_articulo: 1 },
    });

    const prestados = await this.articulosRepository.count({
      where: { id_estado_articulo: 2 },
    });

    const enMantenimiento = await this.articulosRepository.count({
      where: { id_estado_articulo: 3 },
    });

    const vencidos = 0;

    return {
      totalArticulos,
      disponibles,
      prestados,
      vencidos,
      enMantenimiento,
    };
  }
}
