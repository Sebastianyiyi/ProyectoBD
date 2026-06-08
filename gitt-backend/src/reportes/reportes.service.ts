import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ReportesService {
  constructor(private readonly dataSource: DataSource) {}

  async getResumenInventario() {
    const [porCategoria, porEstado, porUbicacion, articulosVencidos] = await Promise.all([
      this.dataSource.query(`
        SELECT c.nombre AS "categoria", COUNT(*) AS "total"
        FROM articulo a
        INNER JOIN categoria c ON c.id_categoria = a.id_categoria
        GROUP BY c.nombre
        ORDER BY "total" DESC
      `),
      this.dataSource.query(`
        SELECT ea.nombre AS "estado", COUNT(*) AS "total"
        FROM articulo a
        INNER JOIN estado_articulo ea ON ea.id_estado_articulo = a.id_estado_articulo
        GROUP BY ea.nombre
        ORDER BY "total" DESC
      `),
      this.dataSource.query(`
        SELECT u.nombre AS "ubicacion", COUNT(*) AS "total"
        FROM articulo a
        INNER JOIN ubicacion u ON u.id_ubicacion = a.id_ubicacion
        GROUP BY u.nombre
        ORDER BY "total" DESC
      `),
      this.dataSource.query(`
        SELECT
          a.nombre                                          AS "nombreArticulo",
          a.codigo_institucional                            AS "codigo",
          CONCAT(us.nombres, ' ', us.apellidos)             AS "solicitante",
          TO_CHAR(p.fecha_prevista_devolucion, 'YYYY-MM-DD') AS "fechaPrevistaDevolucion",
          ep.nombre                                         AS "estado"
        FROM prestamo p
        INNER JOIN detalle_prestamo dp ON dp.id_prestamo = p.id_prestamo
        INNER JOIN articulo a           ON a.id_articulo = dp.id_articulo
        INNER JOIN usuario us           ON us.id_usuario = p.id_solicitante
        INNER JOIN estado_prestamo ep   ON ep.id_estado_prestamo = p.id_estado_prestamo
        WHERE p.fecha_prevista_devolucion < CURRENT_DATE
          AND p.fecha_devolucion_real IS NULL
        ORDER BY p.fecha_prevista_devolucion ASC
      `),
    ]);

    return { porCategoria, porEstado, porUbicacion, articulosVencidos };
  }

  async getResumenPrestamos() {
    const [porEstado, porMes, topSolicitantes] = await Promise.all([
      this.dataSource.query(`
        SELECT ep.nombre AS "estado", COUNT(*) AS "total"
        FROM prestamo p
        INNER JOIN estado_prestamo ep ON ep.id_estado_prestamo = p.id_estado_prestamo
        GROUP BY ep.nombre
        ORDER BY "total" DESC
      `),
      this.dataSource.query(`
        SELECT
          TO_CHAR(p.fecha_solicitud, 'YYYY-MM') AS "mes",
          COUNT(*) AS "total"
        FROM prestamo p
        WHERE p.fecha_solicitud >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY "mes"
        ORDER BY "mes" ASC
      `),
      this.dataSource.query(`
        SELECT
          CONCAT(us.nombres, ' ', us.apellidos) AS "solicitante",
          us.correo                             AS "correo",
          COUNT(*)                              AS "totalPrestamos"
        FROM prestamo p
        INNER JOIN usuario us ON us.id_usuario = p.id_solicitante
        GROUP BY us.id_usuario, us.nombres, us.apellidos, us.correo
        ORDER BY "totalPrestamos" DESC
        LIMIT 10
      `),
    ]);

    return { porEstado, porMes, topSolicitantes };
  }

  async getResumenMantenimientos() {
    const [porTipo, porEstado, costoTotal, proximosMantenimientos] = await Promise.all([
      this.dataSource.query(`
        SELECT tm.nombre AS "tipo", COUNT(*) AS "total"
        FROM mantenimiento m
        INNER JOIN tipo_mantenimiento tm ON tm.id_tipo_mantenimiento = m.id_tipo_mantenimiento
        GROUP BY tm.nombre
        ORDER BY "total" DESC
      `),
      this.dataSource.query(`
        SELECT em.nombre AS "estado", COUNT(*) AS "total"
        FROM mantenimiento m
        INNER JOIN estado_mantenimiento em ON em.id_estado_mantenimiento = m.id_estado_mantenimiento
        GROUP BY em.nombre
        ORDER BY "total" DESC
      `),
      this.dataSource.query(`
        SELECT
          COALESCE(SUM(m.costo), 0)                       AS "costoTotal",
          COUNT(*)                                         AS "totalMantenimientos",
          COALESCE(AVG(m.costo), 0)                        AS "costoPromedio"
        FROM mantenimiento m
      `),
      this.dataSource.query(`
        SELECT
          a.nombre                                          AS "nombreArticulo",
          a.codigo_institucional                            AS "codigo",
          m.tecnico_proveedor                               AS "tecnico",
          TO_CHAR(m.proximo_mantenimiento, 'YYYY-MM-DD')   AS "proximoMantenimiento"
        FROM mantenimiento m
        INNER JOIN articulo a ON a.id_articulo = m.id_articulo
        WHERE m.proximo_mantenimiento IS NOT NULL
          AND m.proximo_mantenimiento >= CURRENT_DATE
        ORDER BY m.proximo_mantenimiento ASC
        LIMIT 20
      `),
    ]);

    return { porTipo, porEstado, costoTotal: costoTotal[0], proximosMantenimientos };
  }
}
