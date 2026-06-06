import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Prestamo } from './prestamo.entity';
import { DetallePrestamo } from './detalle-prestamo.entity';
import {
  CreatePrestamoDto,
  AprobarPrestamoDto,
  DevolverPrestamoDto,
} from './dto/create-prestamo.dto';

export interface FiltrosPrestamo {
  id_estado_prestamo?: number;
  id_solicitante?: number;
  busqueda?: string;
}

@Injectable()
export class PrestamosService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Prestamo)
    private readonly prestamoRepo: Repository<Prestamo>,
    @InjectRepository(DetallePrestamo)
    private readonly detalleRepo: Repository<DetallePrestamo>,
  ) {}

  async getPrestamos(filtros: FiltrosPrestamo = {}) {
    let sql = `
      SELECT
        p.id_prestamo                                       AS "idPrestamo",
        a.id_articulo                                       AS "idArticulo",
        a.nombre                                            AS "nombreArticulo",
        a.codigo_institucional                              AS "codigoArticulo",
        u.nombre                                            AS "ubicacion",
        CONCAT(us.nombres, ' ', us.apellidos)               AS "solicitante",
        us.correo                                           AS "correoSolicitante",
        CASE
          WHEN ap.id_usuario IS NULL THEN NULL
          ELSE CONCAT(ap.nombres, ' ', ap.apellidos)
        END                                                 AS "aprobador",
        ep.nombre                                           AS "estado",
        p.id_estado_prestamo                                AS "idEstado",
        TO_CHAR(p.fecha_solicitud, 'YYYY-MM-DD')            AS "fechaSolicitud",
        TO_CHAR(p.fecha_aprobacion, 'YYYY-MM-DD')           AS "fechaAprobacion",
        TO_CHAR(p.fecha_entrega, 'YYYY-MM-DD')              AS "fechaEntrega",
        TO_CHAR(p.fecha_prevista_devolucion, 'YYYY-MM-DD')  AS "fechaPrevistaDevolucion",
        TO_CHAR(p.fecha_devolucion_real, 'YYYY-MM-DD')      AS "fechaDevolucionReal",
        p.observacion                                       AS "observacion",
        dp.estado_salida                                    AS "estadoSalida",
        dp.estado_entrada                                   AS "estadoEntrada"
      FROM prestamo p
      INNER JOIN detalle_prestamo dp ON dp.id_prestamo = p.id_prestamo
      INNER JOIN articulo a          ON a.id_articulo = dp.id_articulo
      INNER JOIN ubicacion u         ON u.id_ubicacion = a.id_ubicacion
      INNER JOIN usuario us          ON us.id_usuario = p.id_solicitante
      INNER JOIN estado_prestamo ep  ON ep.id_estado_prestamo = p.id_estado_prestamo
      LEFT  JOIN usuario ap          ON ap.id_usuario = p.id_aprobador
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let idx = 1;

    if (filtros.id_estado_prestamo) {
      sql += ` AND p.id_estado_prestamo = $${idx++}`;
      params.push(filtros.id_estado_prestamo);
    }
    if (filtros.id_solicitante) {
      sql += ` AND p.id_solicitante = $${idx++}`;
      params.push(filtros.id_solicitante);
    }
    if (filtros.busqueda) {
      sql += ` AND (LOWER(a.nombre) LIKE $${idx} OR LOWER(us.nombres) LIKE $${idx} OR LOWER(us.apellidos) LIKE $${idx})`;
      params.push(`%${filtros.busqueda.toLowerCase()}%`);
      idx++;
    }

    sql += ' ORDER BY p.id_prestamo DESC';
    return this.dataSource.query(sql, params);
  }

  async create(dto: CreatePrestamoDto) {
    // Estado inicial = 1 (Pendiente — asumimos que es el id 1)
    const estadoRows = await this.dataSource.query(
      `SELECT id_estado_prestamo FROM estado_prestamo WHERE LOWER(nombre) LIKE 'pend%' LIMIT 1`,
    );
    const idEstado = estadoRows[0]?.id_estado_prestamo ?? 1;

    return this.dataSource.transaction(async (manager) => {
      const prestamo = manager.create(Prestamo, {
        id_solicitante: dto.id_solicitante,
        fecha_prevista_devolucion: dto.fecha_prevista_devolucion ?? null,
        observacion: dto.observacion ?? null,
        id_estado_prestamo: idEstado,
      });
      const saved = await manager.save(Prestamo, prestamo);

      for (const idArticulo of dto.articulos) {
        const detalle = manager.create(DetallePrestamo, {
          id_prestamo: saved.id_prestamo,
          id_articulo: idArticulo,
          estado_salida: null,
          estado_entrada: null,
        });
        await manager.save(DetallePrestamo, detalle);
      }

      return saved;
    });
  }

  async aprobar(id: number, dto: AprobarPrestamoDto) {
    const prestamo = await this.prestamoRepo.findOne({ where: { id_prestamo: id } });
    if (!prestamo) throw new NotFoundException(`Préstamo #${id} no encontrado`);

    prestamo.id_aprobador = dto.id_aprobador;
    prestamo.fecha_aprobacion = new Date().toISOString().split('T')[0];

    const estadoRows = await this.dataSource.query(
      `SELECT id_estado_prestamo FROM estado_prestamo WHERE LOWER(nombre) LIKE 'aprob%' LIMIT 1`,
    );
    prestamo.id_estado_prestamo = estadoRows[0]?.id_estado_prestamo ?? 2;

    return this.prestamoRepo.save(prestamo);
  }

  async entregar(id: number) {
    const prestamo = await this.prestamoRepo.findOne({ where: { id_prestamo: id } });
    if (!prestamo) throw new NotFoundException(`Préstamo #${id} no encontrado`);

    prestamo.fecha_entrega = new Date().toISOString().split('T')[0];

    const estadoRows = await this.dataSource.query(
      `SELECT id_estado_prestamo FROM estado_prestamo WHERE LOWER(nombre) LIKE 'entreg%' LIMIT 1`,
    );
    prestamo.id_estado_prestamo = estadoRows[0]?.id_estado_prestamo ?? 3;

    return this.prestamoRepo.save(prestamo);
  }

  async devolver(id: number, dto: DevolverPrestamoDto) {
    const prestamo = await this.prestamoRepo.findOne({ where: { id_prestamo: id } });
    if (!prestamo) throw new NotFoundException(`Préstamo #${id} no encontrado`);

    prestamo.fecha_devolucion_real = new Date().toISOString().split('T')[0];
    if (dto.observacion) prestamo.observacion = dto.observacion;

    const estadoRows = await this.dataSource.query(
      `SELECT id_estado_prestamo FROM estado_prestamo WHERE LOWER(nombre) LIKE 'devuel%' LIMIT 1`,
    );
    prestamo.id_estado_prestamo = estadoRows[0]?.id_estado_prestamo ?? 4;

    if (dto.estado_entrada) {
      await this.detalleRepo.update(
        { id_prestamo: id },
        { estado_entrada: dto.estado_entrada },
      );
    }

    return this.prestamoRepo.save(prestamo);
  }

  async cancelar(id: number) {
    const prestamo = await this.prestamoRepo.findOne({ where: { id_prestamo: id } });
    if (!prestamo) throw new NotFoundException(`Préstamo #${id} no encontrado`);

    const estadoRows = await this.dataSource.query(
      `SELECT id_estado_prestamo FROM estado_prestamo WHERE LOWER(nombre) LIKE 'cancel%' LIMIT 1`,
    );
    if (!estadoRows[0]) throw new BadRequestException('Estado Cancelado no configurado en la BD');
    prestamo.id_estado_prestamo = estadoRows[0].id_estado_prestamo;

    return this.prestamoRepo.save(prestamo);
  }

  // Mantener compatibilidad con el método viejo
  async getPrestamosAdmin() {
    return this.getPrestamos();
  }
}
