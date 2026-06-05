import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

type Articulo = {
  id_articulo: number;
  codigo_institucional: string;
  codigo_barras: string | null;
  nombre: string;
  descripcion: string | null;
  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;
  fecha_adquisicion: string | null;
  valor: string | number | null;
  id_categoria: number;
  id_estado_articulo: number;
  id_ubicacion: number;
  id_responsable: number | null;
};

type Categoria = {
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
};

type EstadoArticulo = {
  id_estado_articulo: number;
  nombre: string;
  descripcion: string | null;
};

type Ubicacion = {
  id_ubicacion: number;
  nombre: string;
  tipo_ubicacion: string | null;
  bloque: string | null;
  piso: string | null;
  descripcion: string | null;
  id_departamento: number;
};

type Usuario = {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  correo: string;
};

export default function InventarioPage() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [estados, setEstados] = useState<EstadoArticulo[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [idResponsable, setIdResponsable] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [idCategoria, setIdCategoria] = useState('');
  const [idEstado, setIdEstado] = useState('');
  const [idUbicacion, setIdUbicacion] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCatalogos = useCallback(async () => {
    try {
      const [resCategorias, resEstados, resUbicaciones, resUsuarios] = await Promise.all([
        api.get<Categoria[]>('/catalogos/categorias'),
        api.get<EstadoArticulo[]>('/catalogos/estados-articulo'),
        api.get<Ubicacion[]>('/catalogos/ubicaciones'),
        api.get<Usuario[]>('/catalogos/usuarios'),
      ]);

      setCategorias(resCategorias.data);
      setEstados(resEstados.data);
      setUbicaciones(resUbicaciones.data);
      setUsuarios(resUsuarios.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchArticulos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get<Articulo[]>('/articulos', {
        params: {
          busqueda: busqueda || undefined,
          id_categoria: idCategoria || undefined,
          id_estado_articulo: idEstado || undefined,
          id_ubicacion: idUbicacion || undefined,
          id_responsable: idResponsable || undefined,
        },
      });

      setArticulos(response.data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el inventario.');
    } finally {
      setLoading(false);
    }
  }, [busqueda, idCategoria, idEstado, idUbicacion]);

  useEffect(() => {
    void fetchCatalogos();
  }, [fetchCatalogos]);

  useEffect(() => {
    void fetchArticulos();
  }, [fetchArticulos]);

  const categoriaMap = useMemo(() => {
    return new Map(categorias.map((item) => [item.id_categoria, item.nombre]));
  }, [categorias]);

  const estadoMap = useMemo(() => {
    return new Map(estados.map((item) => [item.id_estado_articulo, item.nombre]));
  }, [estados]);

  const ubicacionMap = useMemo(() => {
    return new Map(ubicaciones.map((item) => [item.id_ubicacion, item.nombre]));
  }, [ubicaciones]);

  const usuarioMap = useMemo(() => {
    return new Map(
      usuarios.map((item) => [
        item.id_usuario,
        `${item.nombres} ${item.apellidos}`,
      ]),
    );
  }, [usuarios]);

  const handleBuscar = (e: FormEvent) => {
    e.preventDefault();
    void fetchArticulos();
  };

  const handleLimpiar = () => {
    setBusqueda('');
    setIdCategoria('');
    setIdEstado('');
    setIdUbicacion('');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
        <p className="text-sm text-muted-foreground">
          Consulta, búsqueda y filtrado de artículos registrados.
        </p>
      </div>

      <form
        onSubmit={handleBuscar}
        className="space-y-4 rounded-2xl border bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, código o marca"
            className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-red-200"
          />

          <select
            value={idCategoria}
            onChange={(e) => setIdCategoria(e.target.value)}
            className="h-10 rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.id_categoria} value={categoria.id_categoria}>
                {categoria.nombre}
              </option>
            ))}
          </select>

          <select
            value={idEstado}
            onChange={(e) => setIdEstado(e.target.value)}
            className="h-10 rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200"
          >
            <option value="">Todos los estados</option>
            {estados.map((estado) => (
              <option
                key={estado.id_estado_articulo}
                value={estado.id_estado_articulo}
              >
                {estado.nombre}
              </option>
            ))}
          </select>

          <select
            value={idUbicacion}
            onChange={(e) => setIdUbicacion(e.target.value)}
            className="h-10 rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200"
          >
            <option value="">Todas las ubicaciones</option>
            {ubicaciones.map((ubicacion) => (
              <option key={ubicacion.id_ubicacion} value={ubicacion.id_ubicacion}>
                {ubicacion.nombre}
              </option>
            ))}
          </select>
        </div>

        <select
          value={idResponsable}
          onChange={(e) => setIdResponsable(e.target.value)}
          className="h-10 rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200"
        >
          <option value="">Todos los responsables</option>
          {usuarios.map((usuario) => (
            <option key={usuario.id_usuario} value={usuario.id_usuario}>
              {usuario.nombres} {usuario.apellidos}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="outline">
            Buscar
          </Button>

          <Button type="button" variant="outline" onClick={handleLimpiar}>
            Limpiar
          </Button>

          <Button type="button" onClick={() => void fetchArticulos()}>
            Recargar
          </Button>
        </div>
      </form>

      {loading && (
        <div className="rounded-2xl border bg-white p-4 text-sm shadow-sm">
          Cargando inventario...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[1100px] border-collapse text-sm">
            <thead className="bg-red-50/40">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Código</th>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Marca</th>
                <th className="px-4 py-3 font-semibold">Modelo</th>
                <th className="px-4 py-3 font-semibold">Serie</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Valor</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Ubicación</th>
                <th className="px-4 py-3 font-semibold">Responsable</th>
              </tr>
            </thead>

            <tbody>
              {articulos.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No se encontraron artículos.
                  </td>
                </tr>
              ) : (
                articulos.map((articulo) => (
                  <tr key={articulo.id_articulo} className="border-t">
                    <td className="px-4 py-3">{articulo.id_articulo}</td>
                    <td className="px-4 py-3">{articulo.codigo_institucional}</td>
                    <td className="px-4 py-3 font-medium">{articulo.nombre}</td>
                    <td className="px-4 py-3">{articulo.marca ?? '-'}</td>
                    <td className="px-4 py-3">{articulo.modelo ?? '-'}</td>
                    <td className="px-4 py-3">{articulo.numero_serie ?? '-'}</td>
                    <td className="px-4 py-3">{articulo.fecha_adquisicion ?? '-'}</td>
                    <td className="px-4 py-3">{articulo.valor ?? '-'}</td>
                    <td className="px-4 py-3">
                      {categoriaMap.get(articulo.id_categoria) ?? articulo.id_categoria}
                    </td>
                    <td className="px-4 py-3">
                      {estadoMap.get(articulo.id_estado_articulo) ?? articulo.id_estado_articulo}
                    </td>
                    <td className="px-4 py-3">
                      {ubicacionMap.get(articulo.id_ubicacion) ?? articulo.id_ubicacion}
                    </td>
                    <td className="px-4 py-3">
                      {articulo.id_responsable
                        ? usuarioMap.get(articulo.id_responsable) ?? articulo.id_responsable
                        : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}