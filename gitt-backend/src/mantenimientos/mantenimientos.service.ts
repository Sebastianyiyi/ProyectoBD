import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Mantenimiento } from './mantenimiento.entity';
import {
  CreateMantenimientoDto,
  CerrarMantenimientoDto,
} from './dto/create-mantenimiento.dto';

export interface FiltrosMantenimiento {
  id_tipo_mantenimiento?: number;
  id_estado_mantenimiento?: number;
  id_articulo?: number;
  busqueda?: string;
}

@Injectable()
export class MantenimientosService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Mantenimiento)
    private readonly repo: Repository<Mantenimiento>,
  ) {}

  async findAll(filtros: FiltrosMantenimiento = {}) {
    let sql = `
      SELECT
        m.id_mantenimiento                                  AS "idMantenimiento",
        a.id_articulo                                       AS "idArticulo",
        a.nombre                                            AS "nombreArticulo",
        a.codigo_institucional                              AS "codigoArticulo",
        tm.nombre                                           AS "tipoMantenimiento",
        em.nombre                                           AS "estadoMantenimiento",
        m.id_estado_mantenimiento                           AS "idEstado",
        m.descripcion                                       AS "descripcion",
        m.tecnico_proveedor                                 AS "tecnicoProveedor",
        m.costo                                             AS "costo",
        TO_CHAR(m.fecha_inicio, 'YYYY-MM-DD')               AS "fechaInicio",
        TO_CHAR(m.fecha_fin, 'YYYY-MM-DD')                  AS "fechaFin",
        TO_CHAR(m.proximo_mantenimiento, 'YYYY-MM-DD')      AS "proximoMantenimiento"
      FROM mantenimiento m
      INNER JOIN articulo a             ON a.id_articulo = m.id_articulo
      INNER JOIN tipo_mantenimiento tm  ON tm.id_tipo_mantenimiento = m.id_tipo_mantenimiento
      INNER JOIN estado_mantenimiento em ON em.id_estado_mantenimiento = m.id_estado_mantenimiento
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let idx = 1;

    if (filtros.id_tipo_mantenimiento) {
      sql += ` AND m.id_tipo_mantenimiento = $${idx++}`;
      params.push(filtros.id_tipo_mantenimiento);
    }
    if (filtros.id_estado_mantenimiento) {
      sql += ` AND m.id_estado_mantenimiento = $${idx++}`;
      params.push(filtros.id_estado_mantenimiento);
    }
    if (filtros.id_articulo) {
      sql += ` AND m.id_articulo = $${idx++}`;
      params.push(filtros.id_articulo);
    }
    if (filtros.busqueda) {
      sql += ` AND (LOWER(a.nombre) LIKE $${idx} OR LOWER(m.tecnico_proveedor) LIKE $${idx})`;
      params.push(`%${filtros.busqueda.toLowerCase()}%`);
      idx++;
    }

    sql += ' ORDER BY m.id_mantenimiento DESC';
    return this.dataSource.query(sql, params);
  }

  async findOne(id: number) {
    const m = await this.repo.findOne({ where: { id_mantenimiento: id } });
    if (!m) throw new NotFoundException(`Mantenimiento #${id} no encontrado`);
    return m;
  }

  async create(dto: CreateMantenimientoDto) {
    const m = this.repo.create({
      id_articulo: dto.id_articulo,
      id_tipo_mantenimiento: dto.id_tipo_mantenimiento,
      id_estado_mantenimiento: dto.id_estado_mantenimiento,
      fecha_inicio: dto.fecha_inicio,
      fecha_fin: dto.fecha_fin ?? null,
      descripcion: dto.descripcion ?? null,
      tecnico_proveedor: dto.tecnico_proveedor ?? null,
      costo: dto.costo ?? null,
      proximo_mantenimiento: dto.proximo_mantenimiento ?? null,
    });
    return this.repo.save(m);
  }

  async update(id: number, dto: Partial<CreateMantenimientoDto>) {
    const m = await this.findOne(id);
    Object.assign(m, {
      id_tipo_mantenimiento: dto.id_tipo_mantenimiento ?? m.id_tipo_mantenimiento,
      id_estado_mantenimiento: dto.id_estado_mantenimiento ?? m.id_estado_mantenimiento,
      descripcion: dto.descripcion !== undefined ? dto.descripcion : m.descripcion,
      tecnico_proveedor: dto.tecnico_proveedor !== undefined ? dto.tecnico_proveedor : m.tecnico_proveedor,
      costo: dto.costo !== undefined ? dto.costo : m.costo,
      fecha_fin: dto.fecha_fin !== undefined ? dto.fecha_fin : m.fecha_fin,
      proximo_mantenimiento: dto.proximo_mantenimiento !== undefined ? dto.proximo_mantenimiento : m.proximo_mantenimiento,
    });
    return this.repo.save(m);
  }

  async cerrar(id: number, dto: CerrarMantenimientoDto) {
    const m = await this.findOne(id);

    // Buscar estado "Completado" dinámicamente
    const estadoRows = await this.dataSource.query(
      `SELECT id_estado_mantenimiento FROM estado_mantenimiento WHERE LOWER(nombre) LIKE 'complet%' LIMIT 1`,
    );
    const idEstadoCompletado = estadoRows[0]?.id_estado_mantenimiento;
    if (idEstadoCompletado) m.id_estado_mantenimiento = idEstadoCompletado;

    m.fecha_fin = dto.fecha_fin;
    if (dto.costo !== undefined) m.costo = dto.costo;
    if (dto.descripcion !== undefined) m.descripcion = dto.descripcion;
    if (dto.proximo_mantenimiento !== undefined)
      m.proximo_mantenimiento = dto.proximo_mantenimiento;

    return this.repo.save(m);
  }
}
