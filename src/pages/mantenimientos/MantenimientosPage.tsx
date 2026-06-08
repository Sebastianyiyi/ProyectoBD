import { useCallback, useEffect, useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { api } from '@/lib/api';

// Tipos estructurados según la lógica relacional
type Mantenimiento = {
  id_mantenimiento: number;
  id_articulo: number;
  articulo_nombre: string;
  codigo_institucional: string;
  tipo_mantenimiento: 'Preventivo' | 'Correctivo';
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  costo: number | null;
  estado: string; // Ej: En proceso, Finalizado
  tecnico_asignado: string | null;
};

// Tipos auxiliares para los selects del formulario
type ArticuloSimple = { id_articulo: number; nombre: string; codigo_institucional: string };
type UsuarioSimple = { id_usuario: number; nombres: string; apellidos: string };

export default function MantenimientosPage() {
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [articulos, setArticulos] = useState<ArticuloSimple[]>([]);
  const [tecnicos, setTecnicos] = useState<UsuarioSimple[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Estados Modal
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    id_articulo: '',
    tipo_mantenimiento: 'Preventivo',
    descripcion: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    costo: '',
    id_tecnico: '',
    estado: 'En proceso'
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [resMant, resArt, resUsu] = await Promise.all([
        api.get<Mantenimiento[]>('/mantenimientos', {
          params: { busqueda, tipo: filtroTipo, estado: filtroEstado }
        }),
        api.get<ArticuloSimple[]>('/articulos'), // Para el select de equipos
        api.get<UsuarioSimple[]>('/usuarios')    // Para asignar técnicos
      ]);

      setMantenimientos((resMant.data as any).value ?? resMant.data);
      setArticulos((resArt.data as any).value ?? resArt.data);

      // Filtramos solo a los usuarios que tengan rol de técnico o admin si tu BD lo permite, 
      // por ahora cargamos todos para el ejemplo.
      setTecnicos((resUsu.data as any).value ?? resUsu.data);
    } catch (err) {
      console.error('Error al cargar mantenimientos:', err);
      setError('No se pudo conectar con la base de datos para cargar el historial de mantenimientos.');
    } finally {
      setLoading(false);
    }
  }, [busqueda, filtroTipo, filtroEstado]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCrearMantenimiento = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.id_articulo || !formData.descripcion || !formData.fecha_inicio) {
      setFormError('Por favor, completa los campos obligatorios del equipo y la descripción.');
      return;
    }

    setFormError('');
    setActionLoading(true);

    try {
      const payload = {
        id_articulo: Number(formData.id_articulo),
        tipo_mantenimiento: formData.tipo_mantenimiento,
        descripcion: formData.descripcion,
        fecha_inicio: formData.fecha_inicio,
        costo: formData.costo ? Number(formData.costo) : undefined,
        id_tecnico: formData.id_tecnico ? Number(formData.id_tecnico) : undefined,
        estado: formData.estado
      };

      await api.post('/mantenimientos', payload);
      setSuccess('Orden de mantenimiento registrada exitosamente.');
      setShowModal(false);
      setFormData({
        id_articulo: '', tipo_mantenimiento: 'Preventivo', descripcion: '',
        fecha_inicio: new Date().toISOString().split('T')[0], costo: '', id_tecnico: '', estado: 'En proceso'
      });
      setTimeout(() => setSuccess(''), 5000);
      void fetchData();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error al registrar el mantenimiento. Verifica los datos.');
    } finally {
      setActionLoading(false);
    }
  };

  const finalizarMantenimiento = async (id: number) => {
    if (!window.confirm('¿Confirmas que el equipo ha sido reparado y está listo para uso?')) return;

    try {
      await api.patch(`/mantenimientos/${id}/finalizar`);
      setSuccess('Mantenimiento finalizado. El equipo vuelve a estar disponible.');
      setTimeout(() => setSuccess(''), 4000);
      void fetchData();
    } catch (err) {
      setError('No se pudo actualizar el estado del mantenimiento.');
      setTimeout(() => setError(''), 4000);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Control de Mantenimientos</h1>
          <p className="text-sm text-gray-500">
            Registro de intervenciones técnicas, reparaciones y costos asociados.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-red-700 active:scale-95"
        >
          + Nueva Orden Técnica
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
          placeholder="Buscar por equipo o código..."
          className="h-10 flex-1 min-w-[250px] rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
        />
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="h-10 rounded-xl border bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
        >
          <option value="">Todos los tipos</option>
          <option value="Preventivo">Preventivo</option>
          <option value="Correctivo">Correctivo</option>
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="h-10 rounded-xl border bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
        >
          <option value="">Todos los estados</option>
          <option value="En proceso">En proceso</option>
          <option value="Finalizado">Finalizado</option>
        </select>
        <button
          onClick={() => { setBusqueda(''); setFiltroTipo(''); setFiltroEstado(''); }}
          className="h-10 rounded-xl border px-5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          Limpiar
        </button>
      </div>

      {/* Tabla de Mantenimientos */}
      {loading ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
          Cargando registros técnicos...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[1000px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                <th className="px-5 py-4">Equipo Intervenido</th>
                <th className="px-5 py-4">Tipo</th>
                <th className="px-5 py-4">Descripción de Falla</th>
                <th className="px-5 py-4">Técnico Asignado</th>
                <th className="px-5 py-4">Costo</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-700">
              {mantenimientos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                    No se encontraron registros de mantenimiento.
                  </td>
                </tr>
              ) : (
                mantenimientos.map((m) => (
                  <tr key={m.id_mantenimiento} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{m.articulo_nombre}</p>
                      <p className="text-xs font-mono text-gray-500 mt-0.5">{m.codigo_institucional}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${m.tipo_mantenimiento === 'Preventivo' ? 'bg-blue-50 text-blue-700 ring-blue-700/10' : 'bg-orange-50 text-orange-700 ring-orange-700/10'
                        }`}>
                        {m.tipo_mantenimiento}
                      </span>
                    </td>
                    <td className="px-5 py-4 max-w-xs truncate text-gray-600" title={m.descripcion}>
                      {m.descripcion}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{m.tecnico_asignado || <span className="italic text-gray-400">Externo / Sin asignar</span>}</td>
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {m.costo ? `$${Number(m.costo).toFixed(2)}` : '-'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-sm ${m.estado === 'Finalizado'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                        {m.estado}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {m.estado !== 'Finalizado' && (
                        <button
                          onClick={() => finalizarMantenimiento(m.id_mantenimiento)}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-emerald-700 active:scale-95 shadow-sm"
                        >
                          Marcar Listo
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nueva Orden Técnica */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl border animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Nueva Orden de Mantenimiento</h2>
              <button onClick={() => { setShowModal(false); setFormError(''); }} className="text-gray-400 hover:text-gray-600 transition text-lg">✕</button>
            </div>

            {formError && (
              <p className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">{formError}</p>
            )}

            <form onSubmit={handleCrearMantenimiento} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Equipo a intervenir *</label>
                <select
                  name="id_articulo"
                  value={formData.id_articulo}
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  required
                >
                  <option value="">Selecciona el equipo del inventario...</option>
                  {articulos.map((a) => (
                    <option key={a.id_articulo} value={a.id_articulo}>
                      {a.codigo_institucional} - {a.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Tipo de Trabajo *</label>
                  <select
                    name="tipo_mantenimiento"
                    value={formData.tipo_mantenimiento}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  >
                    <option value="Preventivo">Mantenimiento Preventivo</option>
                    <option value="Correctivo">Mantenimiento Correctivo (Falla)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Técnico Responsable</label>
                  <select
                    name="id_tecnico"
                    value={formData.id_tecnico}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  >
                    <option value="">Tercerizado / Externo</option>
                    {tecnicos.map((t) => (
                      <option key={t.id_usuario} value={t.id_usuario}>{t.nombres} {t.apellidos}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Diagnóstico / Descripción *</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  placeholder="Describe la falla reportada o el trabajo a realizar..."
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha de Inicio *</label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Costo Estimado ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="costo"
                    value={formData.costo}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  />
                </div>
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
                  {actionLoading ? 'Guardando...' : 'Generar Orden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}