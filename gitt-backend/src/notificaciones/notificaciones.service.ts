import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Notificacion } from './notificacion.entity';

@Injectable()
export class NotificacionesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Notificacion)
    private readonly repo: Repository<Notificacion>,
  ) {}

  async getMias(idUsuario: number) {
    const rows = await this.dataSource.query(`
      SELECT
        n.id_notificacion   AS "idNotificacion",
        n.asunto            AS "asunto",
        n.mensaje           AS "mensaje",
        tn.nombre           AS "tipo",
        en.nombre           AS "estado",
        n.id_estado_notificacion AS "idEstado",
        n.id_prestamo       AS "idPrestamo",
        n.id_mantenimiento  AS "idMantenimiento",
        TO_CHAR(n.fecha_programada, 'YYYY-MM-DD HH24:MI') AS "fechaProgramada",
        TO_CHAR(n.fecha_envio,      'YYYY-MM-DD HH24:MI') AS "fechaEnvio"
      FROM notificacion n
      INNER JOIN tipo_notificacion    tn ON tn.id_tipo_notificacion    = n.id_tipo_notificacion
      INNER JOIN estado_notificacion  en ON en.id_estado_notificacion  = n.id_estado_notificacion
      WHERE n.id_usuario = $1
      ORDER BY n.id_notificacion DESC
    `, [idUsuario]);
    return rows;
  }

  async getAll() {
    const rows = await this.dataSource.query(`
      SELECT
        n.id_notificacion   AS "idNotificacion",
        CONCAT(u.nombres, ' ', u.apellidos) AS "usuario",
        n.asunto            AS "asunto",
        n.mensaje           AS "mensaje",
        tn.nombre           AS "tipo",
        en.nombre           AS "estado",
        n.id_estado_notificacion AS "idEstado",
        n.id_prestamo       AS "idPrestamo",
        n.id_mantenimiento  AS "idMantenimiento",
        TO_CHAR(n.fecha_programada, 'YYYY-MM-DD HH24:MI') AS "fechaProgramada",
        TO_CHAR(n.fecha_envio,      'YYYY-MM-DD HH24:MI') AS "fechaEnvio"
      FROM notificacion n
      INNER JOIN usuario u                 ON u.id_usuario             = n.id_usuario
      INNER JOIN tipo_notificacion    tn   ON tn.id_tipo_notificacion  = n.id_tipo_notificacion
      INNER JOIN estado_notificacion  en   ON en.id_estado_notificacion = n.id_estado_notificacion
      ORDER BY n.id_notificacion DESC
    `);
    return rows;
  }

  async getNoLeidas(idUsuario: number): Promise<number> {
    const rows = await this.dataSource.query<{ total: string }[]>(`
      SELECT COUNT(*) AS total
      FROM notificacion n
      INNER JOIN estado_notificacion en ON en.id_estado_notificacion = n.id_estado_notificacion
      WHERE n.id_usuario = $1
        AND LOWER(en.nombre) NOT LIKE 'le%'
    `, [idUsuario]);
    return parseInt(rows[0]?.total ?? '0');
  }

  async marcarLeida(id: number) {
    const estadoRows = await this.dataSource.query(
      `SELECT id_estado_notificacion FROM estado_notificacion WHERE LOWER(nombre) LIKE 'le%' LIMIT 1`,
    );
    const idEstado = estadoRows[0]?.id_estado_notificacion;
    if (idEstado) {
      await this.repo.update(id, { id_estado_notificacion: idEstado });
    }
    return { ok: true };
  }

  async crearNotificacion(data: {
    id_usuario: number;
    asunto: string;
    mensaje: string;
    id_tipo_notificacion: number;
    id_prestamo?: number;
    id_mantenimiento?: number;
  }) {
    const estadoRows = await this.dataSource.query(
      `SELECT id_estado_notificacion FROM estado_notificacion WHERE LOWER(nombre) LIKE 'pend%' LIMIT 1`,
    );
    const idEstado = estadoRows[0]?.id_estado_notificacion ?? 1;

    const n = this.repo.create({
      id_usuario: data.id_usuario,
      asunto: data.asunto,
      mensaje: data.mensaje,
      id_tipo_notificacion: data.id_tipo_notificacion,
      id_estado_notificacion: idEstado,
      id_prestamo: data.id_prestamo ?? null,
      id_mantenimiento: data.id_mantenimiento ?? null,
    });
    return this.repo.save(n);
  }
}
