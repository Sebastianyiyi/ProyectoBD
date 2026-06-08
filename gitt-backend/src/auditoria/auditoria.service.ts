import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Auditoria } from './auditoria.entity';

export interface FiltrosAuditoria {
  tabla_afectada?: string;
  accion?: string;
  id_usuario?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}

@Injectable()
export class AuditoriaService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Auditoria)
    private readonly repo: Repository<Auditoria>,
  ) {}

  async findAll(filtros: FiltrosAuditoria = {}) {
    let sql = `
      SELECT
        au.id_auditoria                                           AS "idAuditoria",
        au.tabla_afectada                                         AS "tablaAfectada",
        au.accion                                                 AS "accion",
        CASE
          WHEN us.id_usuario IS NULL THEN 'Sistema'
          ELSE CONCAT(us.nombres, ' ', us.apellidos)
        END                                                       AS "usuario",
        au.ip_origen                                              AS "ipOrigen",
        au.detalle                                                AS "detalle",
        au.datos_antes                                            AS "datosAntes",
        au.datos_despues                                          AS "datosDespues",
        TO_CHAR(au.fecha_hora, 'YYYY-MM-DD HH24:MI:SS')          AS "fechaHora"
      FROM auditoria au
      LEFT JOIN usuario us ON us.id_usuario = au.id_usuario
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let idx = 1;

    if (filtros.tabla_afectada) {
      sql += ` AND LOWER(au.tabla_afectada) LIKE $${idx++}`;
      params.push(`%${filtros.tabla_afectada.toLowerCase()}%`);
    }
    if (filtros.accion) {
      sql += ` AND au.accion = $${idx++}`;
      params.push(filtros.accion.toUpperCase());
    }
    if (filtros.id_usuario) {
      sql += ` AND au.id_usuario = $${idx++}`;
      params.push(filtros.id_usuario);
    }
    if (filtros.fecha_desde) {
      sql += ` AND au.fecha_hora >= $${idx++}`;
      params.push(filtros.fecha_desde);
    }
    if (filtros.fecha_hasta) {
      sql += ` AND au.fecha_hora <= $${idx++}`;
      params.push(`${filtros.fecha_hasta} 23:59:59`);
    }

    sql += ' ORDER BY au.fecha_hora DESC LIMIT 500';
    return this.dataSource.query(sql, params);
  }

  async registrar(data: {
    tabla_afectada: string;
    accion: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT' | 'LOGIN' | 'LOGOUT';
    id_usuario?: number;
    detalle?: string;
    datos_antes?: string;
    datos_despues?: string;
    ip_origen?: string;
  }) {
    const entrada = this.repo.create({
      tabla_afectada: data.tabla_afectada,
      accion: data.accion,
      id_usuario: data.id_usuario ?? null,
      detalle: data.detalle ?? null,
      datos_antes: data.datos_antes ?? null,
      datos_despues: data.datos_despues ?? null,
      ip_origen: data.ip_origen ?? null,
    });
    return this.repo.save(entrada);
  }
}
