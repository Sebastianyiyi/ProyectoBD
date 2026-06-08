import { useCallback, useEffect, useState, useMemo } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { api } from '@/lib/api';
import { Pagination } from '@/components/ui/Pagination';

// Tipos basados en la estructura de tu tabla ubicacion
type Ubicacion = {
  id_ubicacion: number;
  nombre: string;
  tipo_ubicacion: string | null;
  bloque: string | null;
  piso: string | null;
  descripcion: string | null;
  id_departamento: number;
};

// Tipo para la tabla departamento (relación foránea)
type Departamento = {
  id_departamento: number;
  nombre: string;
};

export default function UbicacionesPage() {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados Modal
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    tipo_ubicacion: 'Laboratorio',
    bloque: '',
    piso: '',
    descripcion: '',
    id_departamento: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [resUbicaciones, resDepartamentos] = await Promise.all([
        // Se asume la existencia de estos endpoints en tu NestJS
        api.get<Ubicacion[]>('/ubicaciones', { params: { busqueda, tipo_ubicacion: filtroTipo } }),
        api.get<Departamento[]>('/catalogos/departamentos').catch(() => ({ data: [] })) // Fallback si no existe aún
      ]);

      setUbicaciones((resUbicaciones.data as any).value ?? resUbicaciones.data);
      setDepartamentos((resDepartamentos.data as any).value ?? resDepartamentos.data);
    } catch (err) {
      console.error('Error al cargar ubicaciones:', err);
      setError('No se pudo conectar con la base de datos para cargar las ubicaciones.');
    } finally {
      setLoading(false);
    }
  }, [busqueda, filtroTipo]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(ubicaciones.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return ubicaciones.slice(start, start + itemsPerPage);
  }, [ubicaciones, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, filtroTipo]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCrearUbicacion = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.tipo_ubicacion || !formData.id_departamento) {
      setFormError('Por favor, completa los campos obligatorios (*).');
      return;
    }

    setFormError('');
    setActionLoading(true);

    try {
      const payload = {
        ...formData,
        id_departamento: Number(formData.id_departamento),
        bloque: formData.bloque || undefined,
        piso: formData.piso || undefined,
        descripcion: formData.descripcion || undefined,
      };

      await api.post('/ubicaciones', payload);
      setSuccess('Ubicación registrada exitosamente.');
      setShowModal(false);
      setFormData({ nombre: '', tipo_ubicacion: 'Laboratorio', bloque: '', piso: '', descripcion: '', id_departamento: '' });
      setTimeout(() => setSuccess(''), 4000);
      void fetchData();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error al registrar la ubicación. Verifica los datos.');
    } finally {
      setActionLoading(false);
    }
  };

  // Mapa rápido para mostrar el nombre del departamento
  const getNombreDepartamento = (id: number) => {
    const depto = departamentos.find(d => d.id_departamento === id);
    return depto ? depto.nombre : `ID: ${id}`;
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Espacios Físicos</h1>
          <p className="text-sm text-gray-500">
            Administración de laboratorios, aulas y oficinas institucionales.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-red-700 active:scale-95"
        >
          + Nueva Ubicación
        </button>
      </div>

      {/* Alertas */}
      {success && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 shadow-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm flex flex-wrap gap-4 items-center">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre de ubicación o bloque..."
          className="h-10 flex-1 min-w-[250px] rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
        />
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="h-10 rounded-xl border bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
        >
          <option value="">Todos los tipos</option>
          <option value="Laboratorio">Laboratorio</option>
          <option value="Aula">Aula</option>
          <option value="Oficina">Oficina</option>
          <option value="Bodega">Bodega</option>
          <option value="Auditorio">Auditorio</option>
        </select>
        <button
          onClick={() => { setBusqueda(''); setFiltroTipo(''); }}
          className="h-10 rounded-xl border px-5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          Limpiar
        </button>
      </div>

      {/* Tabla de Ubicaciones */}
      {loading ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
          Cargando mapa de ubicaciones...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Nombre del Espacio</th>
                <th className="px-5 py-4">Tipo</th>
                <th className="px-5 py-4">Bloque y Piso</th>
                <th className="px-5 py-4">Departamento Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-700">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                    No se encontraron ubicaciones registradas.
                  </td>
                </tr>
              ) : (
                paginatedData.map((u) => (
                  <tr key={u.id_ubicacion} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{u.id_ubicacion}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{u.nombre}</p>
                      {u.descripcion && <p className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{u.descripcion}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                        {u.tipo_ubicacion || 'General'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      <span className="font-medium text-gray-800">{u.bloque || '-'}</span>
                      {u.piso && <span className="text-gray-400 mx-1">|</span>}
                      {u.piso ? `Piso ${u.piso}` : ''}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {getNombreDepartamento(u.id_departamento)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modal Nueva Ubicación */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Registrar Espacio Físico</h2>
              <button onClick={() => { setShowModal(false); setFormError(''); }} className="text-gray-400 hover:text-gray-600 transition text-lg">✕</button>
            </div>

            {formError && (
              <p className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">{formError}</p>
            )}

            <form onSubmit={handleCrearUbicacion} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Nombre de la Ubicación *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  maxLength={100}
                  placeholder="Ej. Laboratorio de Redes CISCO"
                  className="w-full h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Tipo de Espacio *</label>
                  <select
                    name="tipo_ubicacion"
                    value={formData.tipo_ubicacion}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                    required
                  >
                    <option value="Laboratorio">Laboratorio</option>
                    <option value="Aula">Aula</option>
                    <option value="Oficina">Oficina</option>
                    <option value="Bodega">Bodega</option>
                    <option value="Auditorio">Auditorio</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Departamento Asignado *</label>
                  <select
                    name="id_departamento"
                    value={formData.id_departamento}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                    required
                  >
                    <option value="">Selecciona departamento...</option>
                    {departamentos.map((d) => (
                      <option key={d.id_departamento} value={d.id_departamento}>{d.nombre}</option>
                    ))}
                    {departamentos.length === 0 && <option value="1">Departamento de Sistemas (ID: 1)</option>}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Bloque / Edificio</label>
                  <input
                    type="text"
                    name="bloque"
                    value={formData.bloque}
                    onChange={handleInputChange}
                    maxLength={50}
                    placeholder="Ej. Bloque 2"
                    className="w-full h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Piso / Nivel</label>
                  <input
                    type="text"
                    name="piso"
                    value={formData.piso}
                    onChange={handleInputChange}
                    maxLength={20}
                    placeholder="Ej. Planta Baja, Piso 3"
                    className="w-full h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Descripción o Referencia</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={2}
                  maxLength={200}
                  className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  placeholder="Instrucciones para llegar o detalles adicionales..."
                />
              </div>

              <div className="mt-6 flex gap-3 justify-end border-t pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormError(''); }}
                  className="rounded-xl border px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
                >
                  {actionLoading ? 'Guardando...' : 'Guardar Ubicación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}