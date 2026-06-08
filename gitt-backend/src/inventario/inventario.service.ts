import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DispositivoAdminDto } from './dto/dispositivo-admin.dto';

@Injectable()
export class InventarioService {
  constructor(private readonly dataSource: DataSource) {}

  async getDispositivosAdmin(): Promise<DispositivoAdminDto[]> {
    const rows = await this.dataSource.query(`
      SELECT
        a.id_articulo AS "idArticulo",
        a.codigo_institucional AS "codigoInstitucional",
        a.nombre AS "nombre",
        c.nombre AS "categoria",
        u.nombre AS "ubicacion",
        CASE
          WHEN us.id_usuario IS NULL THEN NULL
          ELSE CONCAT(us.nombres, ' ', us.apellidos)
        END AS "responsable",
        ea.nombre AS "estado"
      FROM articulo a
      INNER JOIN categoria c
        ON c.id_categoria = a.id_categoria
      INNER JOIN ubicacion u
        ON u.id_ubicacion = a.id_ubicacion
      INNER JOIN estado_articulo ea
        ON ea.id_estado_articulo = a.id_estado_articulo
      LEFT JOIN usuario us
        ON us.id_usuario = a.id_responsable
      ORDER BY a.nombre ASC;
    `);

    return rows;
  }
}
