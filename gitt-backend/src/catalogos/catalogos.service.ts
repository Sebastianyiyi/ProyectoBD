import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

type SimpleRow = {
  id: number;
  nombre: string;
  descripcion: string | null;
};

type CategoriaRow = {
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
};

type EstadoArticuloRow = {
  id_estado_articulo: number;
  nombre: string;
  descripcion: string | null;
};

type UbicacionRow = {
  id_ubicacion: number;
  nombre: string;
  tipo_ubicacion: string | null;
  bloque: string | null;
  piso: string | null;
  descripcion: string | null;
  id_departamento: number;
};

type UsuarioRow = {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  correo: string;
};

@Injectable()
export class CatalogosService {
  constructor(private readonly dataSource: DataSource) { }

  async getCategorias(): Promise<CategoriaRow[]> {
    const rows = await this.dataSource.query(`
      SELECT id_categoria, nombre, descripcion
      FROM categoria
      ORDER BY nombre ASC;
    `);
    return rows as CategoriaRow[];
  }

  async getEstadosArticulo(): Promise<EstadoArticuloRow[]> {
    const rows = await this.dataSource.query(`
      SELECT id_estado_articulo, nombre, descripcion
      FROM estado_articulo
      ORDER BY id_estado_articulo ASC;
    `);
    return rows as EstadoArticuloRow[];
  }

  async getUbicaciones(): Promise<UbicacionRow[]> {
    const rows = await this.dataSource.query(`
      SELECT id_ubicacion, nombre, tipo_ubicacion, bloque, piso, descripcion, id_departamento
      FROM ubicacion
      ORDER BY nombre ASC;
    `);
    return rows as UbicacionRow[];
  }

  async getUsuarios(): Promise<UsuarioRow[]> {
    const rows = await this.dataSource.query(`
      SELECT id_usuario, nombres, apellidos, correo
      FROM usuario
      ORDER BY nombres ASC, apellidos ASC;
    `);
    return rows as UsuarioRow[];
  }

  async getRoles(): Promise<SimpleRow[]> {
    const rows = await this.dataSource.query(`
      SELECT id_rol AS id, nombre, descripcion
      FROM rol
      ORDER BY id_rol ASC;
    `);
    return rows as SimpleRow[];
  }

  async getEstadosUsuario(): Promise<SimpleRow[]> {
    const rows = await this.dataSource.query(`
      SELECT id_estado_usuario AS id, nombre, descripcion
      FROM estado_usuario
      ORDER BY id_estado_usuario ASC;
    `);
    return rows as SimpleRow[];
  }

  async getTiposMantenimiento(): Promise<SimpleRow[]> {
    const rows = await this.dataSource.query(`
      SELECT id_tipo_mantenimiento AS id, nombre, descripcion
      FROM tipo_mantenimiento
      ORDER BY id_tipo_mantenimiento ASC;
    `);
    return rows as SimpleRow[];
  }

  async getEstadosMantenimiento(): Promise<SimpleRow[]> {
    const rows = await this.dataSource.query(`
      SELECT id_estado_mantenimiento AS id, nombre, descripcion
      FROM estado_mantenimiento
      ORDER BY id_estado_mantenimiento ASC;
    `);
    return rows as SimpleRow[];
  }

  async getTiposMovimiento(): Promise<SimpleRow[]> {
    const rows = await this.dataSource.query(`
      SELECT id_tipo_movimiento AS id, nombre, descripcion
      FROM tipo_movimiento
      ORDER BY id_tipo_movimiento ASC;
    `);
    return rows as SimpleRow[];
  }

  async getTiposNotificacion(): Promise<SimpleRow[]> {
    const rows = await this.dataSource.query(`
      SELECT id_tipo_notificacion AS id, nombre, descripcion
      FROM tipo_notificacion
      ORDER BY id_tipo_notificacion ASC;
    `);
    return rows as SimpleRow[];
  }

  async getEstadosNotificacion(): Promise<SimpleRow[]> {
    const rows = await this.dataSource.query(`
      SELECT id_estado_notificacion AS id, nombre, descripcion
      FROM estado_notificacion
      ORDER BY id_estado_notificacion ASC;
    `);
    return rows as SimpleRow[];
  }

  async getEstadosPrestamo(): Promise<SimpleRow[]> {
    const rows = await this.dataSource.query(`
      SELECT id_estado_prestamo AS id, nombre, descripcion
      FROM estado_prestamo
      ORDER BY id_estado_prestamo ASC;
    `);
    return rows as SimpleRow[];
  }

  async getDepartamentos(): Promise<SimpleRow[]> {
    const rows = await this.dataSource.query(`
      SELECT id_departamento AS id, nombre, descripcion
      FROM departamento
      ORDER BY nombre ASC;
    `);
    return rows as SimpleRow[];
  }
}
