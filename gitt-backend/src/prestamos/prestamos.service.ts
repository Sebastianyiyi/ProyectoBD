import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PrestamoAdminDto } from './dto/prestamo-admin.dto';

@Injectable()
export class PrestamosService {
  constructor(private readonly dataSource: DataSource) {}

  async getPrestamosAdmin(): Promise<PrestamoAdminDto[]> {
    const rows = await this.dataSource.query(`
      SELECT
        p.id_prestamo                                     AS "idPrestamo",
        a.id_articulo                                     AS "idArticulo",
        a.nombre                                          AS "nombreArticulo",
        u.nombre                                          AS "ubicacion",
        CONCAT(us.nombres, ' ', us.apellidos)             AS "encargado",
        ep.nombre                                         AS "estado",
        TO_CHAR(p.fecha_prevista_devolucion, 'DD/MM/YYYY') AS "fechaPrevistaDevolucion"
      FROM prestamo p
      INNER JOIN detalle_prestamo dp
        ON dp.id_prestamo = p.id_prestamo
      INNER JOIN articulo a
        ON a.id_articulo = dp.id_articulo
      INNER JOIN ubicacion u
        ON u.id_ubicacion = a.id_ubicacion
      INNER JOIN usuario us
        ON us.id_usuario = p.id_solicitante
      INNER JOIN estado_prestamo ep
        ON ep.id_estado_prestamo = p.id_estado_prestamo
      ORDER BY p.id_prestamo DESC;
    `);

    return rows;
  }
}
