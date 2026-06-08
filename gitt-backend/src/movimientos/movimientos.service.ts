import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Movimiento } from './movimiento.entity';

export interface CreateMovimientoDto {
  id_articulo: number;
  id_ubicacion_destino: number;
  id_usuario: number;
  id_tipo_movimiento: number;
  motivo?: string;
  observacion?: string;
}

@Injectable()
export class MovimientosService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Movimiento)
    private readonly repo: Repository<Movimiento>,
  ) {}

  async findAll(filtros: { id_articulo?: number; busqueda?: string } = {}) {
    let sql = `
      SELECT
        mv.id_movimiento                                          AS "idMovimiento",
        a.id_articulo                                             AS "idArticulo",
        a.nombre                                                  AS "nombreArticulo",
        a.codigo_institucional                                    AS "codigoArticulo",
        tm.nombre                                                 AS "tipoMovimiento",
        uo.nombre                                                 AS "ubicacionOrigen",
        ud.nombre                                                 AS "ubicacionDestino",
        CONCAT(us.nombres, ' ', us.apellidos)                     AS "usuario",
        mv.motivo                                                 AS "motivo",
        mv.observacion                                            AS "observacion",
        TO_CHAR(mv.fecha_movimiento, 'YYYY-MM-DD HH24:MI')       AS "fechaMovimiento"
      FROM movimiento mv
      INNER JOIN articulo a           ON a.id_articulo = mv.id_articulo
      INNER JOIN tipo_movimiento tm   ON tm.id_tipo_movimiento = mv.id_tipo_movimiento
      INNER JOIN ubicacion ud         ON ud.id_ubicacion = mv.id_ubicacion_destino
      INNER JOIN usuario us           ON us.id_usuario = mv.id_usuario
      LEFT  JOIN ubicacion uo         ON uo.id_ubicacion = mv.id_ubicacion_origen
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let idx = 1;

    if (filtros.id_articulo) {
      sql += ` AND mv.id_articulo = $${idx++}`;
      params.push(filtros.id_articulo);
    }
    if (filtros.busqueda) {
      sql += ` AND (LOWER(a.nombre) LIKE $${idx} OR LOWER(us.nombres) LIKE $${idx} OR LOWER(us.apellidos) LIKE $${idx})`;
      params.push(`%${filtros.busqueda.toLowerCase()}%`);
      idx++;
    }

    sql += ' ORDER BY mv.fecha_movimiento DESC';
    return this.dataSource.query(sql, params);
  }

  async create(dto: CreateMovimientoDto) {
    // Obtener la ubicación actual del artículo como origen
    const artRows = await this.dataSource.query(
      'SELECT id_ubicacion FROM articulo WHERE id_articulo = $1',
      [dto.id_articulo],
    );
    const idUbicacionOrigen = artRows[0]?.id_ubicacion ?? null;

    return this.dataSource.transaction(async (manager) => {
      const mov = manager.create(Movimiento, {
        id_articulo: dto.id_articulo,
        id_ubicacion_origen: idUbicacionOrigen,
        id_ubicacion_destino: dto.id_ubicacion_destino,
        id_usuario: dto.id_usuario,
        id_tipo_movimiento: dto.id_tipo_movimiento,
        motivo: dto.motivo ?? null,
        observacion: dto.observacion ?? null,
      });
      const saved = await manager.save(Movimiento, mov);

      // Actualizar la ubicación del artículo
      await manager.query(
        'UPDATE articulo SET id_ubicacion = $1 WHERE id_articulo = $2',
        [dto.id_ubicacion_destino, dto.id_articulo],
      );

      return saved;
    });
  }
}
