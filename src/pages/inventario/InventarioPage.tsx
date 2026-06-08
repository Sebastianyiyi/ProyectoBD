import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
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

  // Estados para filtros
  const [busqueda, setBusqueda] = useState('');
  const [idCategoria, setIdCategoria] = useState('');
  const [idEstado, setIdEstado] = useState('');
  const [idUbicacion, setIdUbicacion] = useState('');
  const [idResponsable, setIdResponsable] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para el Modal de Creación
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    codigo_institucional: '',
    codigo_barras: '',
    nombre: '',
    descripcion: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    fecha_adquisicion: '',
    valor: '',
    id_categoria: '',
    id_estado_articulo: '',
    id_ubicacion: '',
    id_responsable: ''
  });

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
      console.error('Error al cargar catálogos:', err);
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
  }, [busqueda, idCategoria, idEstado, idUbicacion, idResponsable]);

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
    setIdResponsable('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCrearArticulo = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.codigo_institucional || !formData.nombre || !formData.id_categoria || !formData.id_estado_articulo || !formData.id_ubicacion) {
      setFormError('Por favor, completa todos los campos obligatorios (*).');
      return;
    }

    setFormError('');
    setActionLoading(true);

    try {
      const payload = {
        ...formData,
        valor: formData.valor ? Number(formData.valor) : undefined,
        id_categoria: Number(formData.id_categoria),
        id_estado_articulo: Number(formData.id_estado_articulo),
        id_ubicacion: Number(formData.id_ubicacion),
        id_responsable: formData.id_responsable ? Number(formData.id_responsable) : undefined,
        descripcion: formData.descripcion || undefined,
        marca: formData.marca || undefined,
        modelo: formData.modelo || undefined,
        numero_serie: formData.numero_serie || undefined,
        codigo_barras: formData.codigo_barras || undefined,
        fecha_adquisicion: formData.fecha_adquisicion || undefined,
      };

      await api.post('/articulos', payload);
      setSuccess('Artículo registrado correctamente.');
      setShowModal(false);

      // Resetear formulario
      setFormData({
        codigo_institucional: '',
        codigo_barras: '',
        nombre: '',
        descripcion: '',
        marca: '',
        modelo: '',
        numero_serie: '',
        fecha_adquisicion: '',
        valor: '',
        id_categoria: '',
        id_estado_articulo: '',
        id_ubicacion: '',
        id_responsable: ''
      });

      setTimeout(() => setSuccess(''), 4000);
      void fetchArticulos();
    } catch (err) {
      console.error(err);
      setFormError('Error al crear el artículo. Verifica la integridad de los datos.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Inventario</h1>
          <p className="text-sm text-muted-foreground">
            Consulta, búsqueda y filtrado de artículos registrados.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-red-700 active:scale-95 self-start sm:self-center"
        >
          + Nuevo Artículo
        </button>
      </div>

      {/* Alertas de Éxito Generales */}
      {success && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 shadow-sm animate-fade-in">
          {success}
        </div>
      )}

      {/* Formulario de Filtros */}
      <form
        onSubmit={handleBuscar}
        className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, código o marca..."
            className="h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 w-full transition-all"
          />

          <select
            value={idCategoria}
            onChange={(e) => setIdCategoria(e.target.value)}
            className="h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 w-full transition-all"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.nombre}
              </option>
            ))}
          </select>

          <select
            value={idEstado}
            onChange={(e) => setIdEstado(e.target.value)}
            className="h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 w-full transition-all"
          >
            <option value="">Todos los estados</option>
            {estados.map((est) => (
              <option key={est.id_estado_articulo} value={est.id_estado_articulo}>
                {est.nombre}
              </option>
            ))}
          </select>

          <select
            value={idUbicacion}
            onChange={(e) => setIdUbicacion(e.target.value)}
            className="h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 w-full transition-all"
          >
            <option value="">Todas las ubicaciones</option>
            {ubicaciones.map((ubi) => (
              <option key={ubi.id_ubicacion} value={ubi.id_ubicacion}>
                {ubi.nombre}
              </option>
            ))}
          </select>

          <select
            value={idResponsable}
            onChange={(e) => setIdResponsable(e.target.value)}
            className="h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 w-full transition-all"
          >
            <option value="">Todos los responsables</option>
            {usuarios.map((usr) => (
              <option key={usr.id_usuario} value={usr.id_usuario}>
                {usr.nombres} {usr.apellidos}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="submit" className="rounded-xl px-5">
            Buscar
          </Button>
          <Button type="button" variant="outline" className="rounded-xl px-5" onClick={handleLimpiar}>
            Limpiar
          </Button>
          <Button type="button" variant="secondary" className="rounded-xl px-5" onClick={() => void fetchArticulos()}>
            Recargar
          </Button>
        </div>
      </form>

      {/* Estados de Carga y Error de la Tabla */}
      {loading && (
        <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
          Cargando inventario...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {/* Tabla de Resultados */}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm transition-all">
          <table className="w-full min-w-[1200px] border-collapse text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr className="text-left">
                <th className="px-4 py-3.5 font-semibold">ID</th>
                <th className="px-4 py-3.5 font-semibold">Código Inst.</th>
                <th className="px-4 py-3.5 font-semibold">Nombre del Artículo</th>
                <th className="px-4 py-3.5 font-semibold">Marca</th>
                <th className="px-4 py-3.5 font-semibold">Modelo</th>
                <th className="px-4 py-3.5 font-semibold">N° Serie</th>
                <th className="px-4 py-3.5 font-semibold">Adquisición</th>
                <th className="px-4 py-3.5 font-semibold">Valor</th>
                <th className="px-4 py-3.5 font-semibold">Categoría</th>
                <th className="px-4 py-3.5 font-semibold">Estado</th>
                <th className="px-4 py-3.5 font-semibold">Ubicación</th>
                <th className="px-4 py-3.5 font-semibold">Responsable</th>
              </tr>
            </thead>

            <tbody className="divide-y text-gray-700">
              {articulos.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-10 text-center text-muted-foreground">
                    No se encontraron artículos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                articulos.map((articulo) => (
                  <tr key={articulo.id_articulo} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{articulo.id_articulo}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{articulo.codigo_institucional}</td>
                    <td className="px-4 py-3 font-medium">{articulo.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{articulo.marca ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{articulo.modelo ?? '-'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{articulo.numero_serie ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{articulo.fecha_adquisicion ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {articulo.valor ? `$${Number(articulo.valor).toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {categoriaMap.get(articulo.id_categoria) ?? articulo.id_categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        {estadoMap.get(articulo.id_estado_articulo) ?? articulo.id_estado_articulo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {ubicacionMap.get(articulo.id_ubicacion) ?? articulo.id_ubicacion}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {articulo.id_responsable
                        ? usuarioMap.get(articulo.id_responsable) ?? articulo.id_responsable
                        : <span className="text-gray-400 italic">Sin asignar</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para Crear Nuevo Artículo */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl border max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Registrar Nuevo Artículo</h2>
              <button
                onClick={() => { setShowModal(false); setFormError(''); }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCrearArticulo} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Código Institucional *</label>
                  <input
                    type="text"
                    name="codigo_institucional"
                    value={formData.codigo_institucional}
                    onChange={handleInputChange}
                    maxLength={60}
                    placeholder="Ej. UTA-FISEI-LAB-01"
                    className="w-full h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Código de Barras</label>
                  <input
                    type="text"
                    name="codigo_barras"
                    value={formData.codigo_barras}
                    onChange={handleInputChange}
                    maxLength={60}
                    placeholder="Opcional"
                    className="w-full h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Nombre del Artículo *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  maxLength={150}
                  placeholder="Ej. Laptop HP ProBook G9"
                  className="w-full h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Marca</label>
                  <input
                    type="text"
                    name="marca"
                    value={formData.marca}
                    onChange={handleInputChange}
                    maxLength={100}
                    placeholder="Ej. HP"
                    className="w-full h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Modelo</label>
                  <input
                    type="text"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleInputChange}
                    maxLength={100}
                    placeholder="Ej. ProBook 440"
                    className="w-full h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Número de Serie</label>
                  <input
                    type="text"
                    name="numero_serie"
                    value={formData.numero_serie}
                    onChange={handleInputChange}
                    maxLength={100}
                    placeholder="Ej. 5CD12345XYZ"
                    className="w-full h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha de Adquisición</label>
                  <input
                    type="date"
                    name="fecha_adquisicion"
                    value={formData.fecha_adquisicion}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Valor Estimado ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="valor"
                    value={formData.valor}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Categoría *</label>
                  <select
                    name="id_categoria"
                    value={formData.id_categoria}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                    required
                  >
                    <option value="">Selecciona...</option>
                    {categorias.map((cat) => (
                      <option key={cat.id_categoria} value={cat.id_categoria}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado *</label>
                  <select
                    name="id_estado_articulo"
                    value={formData.id_estado_articulo}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                    required
                  >
                    <option value="">Selecciona...</option>
                    {estados.map((est) => (
                      <option key={est.id_estado_articulo} value={est.id_estado_articulo}>
                        {est.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Ubicación *</label>
                  <select
                    name="id_ubicacion"
                    value={formData.id_ubicacion}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                    required
                  >
                    <option value="">Selecciona...</option>
                    {ubicaciones.map((ubi) => (
                      <option key={ubi.id_ubicacion} value={ubi.id_ubicacion}>
                        {ubi.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Usuario Responsable (Custodio)</label>
                <select
                  name="id_responsable"
                  value={formData.id_responsable}
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                >
                  <option value="">Ninguno (Disponible en bodega)</option>
                  {usuarios.map((usr) => (
                    <option key={usr.id_usuario} value={usr.id_usuario}>
                      {usr.nombres} {usr.apellidos}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Descripción Breve</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  maxLength={500}
                  rows={3}
                  placeholder="Detalles adicionales del activo..."
                  className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormError(''); }}
                  className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60 shadow-sm"
                >
                  {actionLoading ? 'Guardando...' : 'Guardar Artículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}