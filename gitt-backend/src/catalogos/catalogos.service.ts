import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

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
  constructor(private readonly dataSource: DataSource) {}

  async getCategorias(): Promise<CategoriaRow[]> {
    const rows = await this.dataSource.query(`
      SELECT
        id_categoria,
        nombre,
        descripcion
      FROM categoria
      ORDER BY nombre ASC;
    `);

    return rows as CategoriaRow[];
  }

  async getEstadosArticulo(): Promise<EstadoArticuloRow[]> {
    const rows = await this.dataSource.query(`
      SELECT
        id_estado_articulo,
        nombre,
        descripcion
      FROM estado_articulo
      ORDER BY id_estado_articulo ASC;
    `);

    return rows as EstadoArticuloRow[];
  }

  async getUbicaciones(): Promise<UbicacionRow[]> {
    const rows = await this.dataSource.query(`
      SELECT
        id_ubicacion,
        nombre,
        tipo_ubicacion,
        bloque,
        piso,
        descripcion,
        id_departamento
      FROM ubicacion
      ORDER BY nombre ASC;
    `);

    return rows as UbicacionRow[];
  }

  async getUsuarios(): Promise<UsuarioRow[]> {
    const rows = await this.dataSource.query(`
      SELECT
        id_usuario,
        nombres,
        apellidos,
        correo
      FROM usuario
      ORDER BY nombres ASC, apellidos ASC;
    `);

    return rows as UsuarioRow[];
  }
}
