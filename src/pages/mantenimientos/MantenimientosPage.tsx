import { useCallback, useEffect, useState, useMemo } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { api } from '@/lib/api';
import { Pagination } from '@/components/ui/Pagination';

type Mantenimiento = {
  id_mantenimiento: number;
  id_articulo: number;
  articulo_nombre: string;
  codigo_institucional: string;
  tipo_mantenimiento: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  costo: number | null;
  estado: string;
  tecnico_asignado: string | null;
};

type ArticuloSimple = { id_articulo: number; nombre: string; codigo_institucional: string; id_estado_articulo: number; id_categoria: number };
type UsuarioSimple = { id_usuario: number; nombres: string; apellidos: string; id_rol: number };
// Tipos dinámicos para los catálogos
type CatalogoItem = { id_tipo_mantenimiento?: number; id_estado_mantenimiento?: number; id?: number; nombre: string };

export default function MantenimientosPage() {
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [articulos, setArticulos] = useState<ArticuloSimple[]>([]);
  const [tecnicos, setTecnicos] = useState<UsuarioSimple[]>([]);
  const [categorias, setCategorias] = useState<CatalogoItem[]>([]);

  // Nuevos estados para catálogos desde la BD
  const [tiposMant, setTiposMant] = useState<CatalogoItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [filtroCategoriaForm, setFiltroCategoriaForm] = useState<number | ''>('');
  const [confirmAction, setConfirmAction] = useState<{ id: number, action: 'iniciar' | 'cerrar' | 'cancelar', message: string } | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    id_articulo: '',
    id_tipo_mantenimiento: '',
    descripcion: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    costo: '',
    tecnico_proveedor: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [resMant, resArt, resUsu, resTipos, resCat] = await Promise.all([
        api.get<Mantenimiento[]>('/mantenimientos', { params: { busqueda, tipo: filtroTipo, estado: filtroEstado } }),
        api.get<ArticuloSimple[]>('/articulos'),
        api.get<UsuarioSimple[]>('/usuarios'),
        api.get<CatalogoItem[]>('/catalogos/tipos-mantenimiento'),
        api.get<CatalogoItem[]>('/catalogos/categorias')
      ]);

      setMantenimientos((resMant.data as any).value ?? resMant.data);
      setArticulos((resArt.data as any).value ?? resArt.data);
      const allUsers = (resUsu.data as any).value ?? resUsu.data;
      setTecnicos(allUsers.filter((u: UsuarioSimple) => u.id_rol === 1 || u.id_rol === 2));
      setTiposMant((resTipos.data as any).value ?? resTipos.data);
      setCategorias((resCat.data as any).map((c: any) => ({ id: c.id_categoria, nombre: c.nombre })));
    } catch (err) {
      console.error('Error al cargar mantenimientos:', err);
      setError('No se pudo conectar con la base de datos.');
    } finally {
      setLoading(false);
    }
  }, [busqueda, filtroTipo, filtroEstado]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(mantenimientos.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return mantenimientos.slice(start, start + itemsPerPage);
  }, [mantenimientos, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, filtroTipo, filtroEstado]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCrearMantenimiento = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.id_articulo || !formData.id_tipo_mantenimiento || !formData.descripcion || !formData.fecha_inicio) {
      setFormError('Por favor, completa los campos obligatorios (*).');
      return;
    }

    setFormError('');
    setActionLoading(true);

    try {
      const payload = {
        id_articulo: Number(formData.id_articulo),
        id_tipo_mantenimiento: Number(formData.id_tipo_mantenimiento),
        id_estado_mantenimiento: 1, // Siempre Programado
        descripcion: formData.descripcion,
        fecha_inicio: formData.fecha_inicio,
        costo: formData.costo ? Number(formData.costo) : undefined,
        tecnico_proveedor: formData.tecnico_proveedor || undefined,
      };

      await api.post('/mantenimientos', payload);
      setSuccess('Orden de mantenimiento registrada exitosamente.');
      setShowModal(false);
      setFormData({
        id_articulo: '', id_tipo_mantenimiento: '', descripcion: '',
        fecha_inicio: new Date().toISOString().split('T')[0], costo: '', tecnico_proveedor: ''
      });
      setTimeout(() => setSuccess(''), 5000);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error al registrar el mantenimiento.');
    } finally {
      setActionLoading(false);
    }
  };

  const accion = async (id: number, action: 'iniciar' | 'cerrar' | 'cancelar') => {
    setActionLoading(true);
    try {
      const body = action === 'cerrar' ? { fecha_fin: new Date().toISOString().split('T')[0] } : {};
      await api.patch(`/mantenimientos/${id}/${action}`, body);
      setSuccess(`Orden de mantenimiento actualizada exitosamente.`);
      setTimeout(() => setSuccess(''), 4000);
      await fetchData();
    } catch (err) {
      setError(`Error al ejecutar acción: ${action}.`);
    } finally {
      setActionLoading(false);
    }
  };

  // Funciones auxiliares para obtener IDs de los catálogos dinámicos
  const getCatId = (cat: any) => cat.id_tipo_mantenimiento || cat.id_estado_mantenimiento || cat.id;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Control de Mantenimientos</h1>
          <p className="text-sm text-gray-500">Registro de intervenciones técnicas, reparaciones y costos.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-red-700"
        >
          + Nueva Orden Técnica
        </button>
      </div>

      {success && <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">{success}</div>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="p-10 text-center text-gray-500">Cargando registros...</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
              <tr>
                <th className="px-5 py-4">Equipo Intervenido</th>
                <th className="px-5 py-4">Tipo</th>
                <th className="px-5 py-4">Descripción</th>
                <th className="px-5 py-4">Técnico Asignado</th>
                <th className="px-5 py-4">Costo</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-700">
              {paginatedData.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500">No hay registros.</td></tr>
              ) : (
                paginatedData.map((m) => (
                  <tr key={m.id_mantenimiento} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-semibold">{m.articulo_nombre} <span className="block text-xs font-normal text-gray-500">{m.codigo_institucional}</span></td>
                    <td className="px-5 py-4">{m.tipo_mantenimiento}</td>
                    <td className="px-5 py-4 max-w-xs truncate">{m.descripcion}</td>
                    <td className="px-5 py-4">{m.tecnico_asignado || '-'}</td>
                    <td className="px-5 py-4">{m.costo ? `$${Number(m.costo).toFixed(2)}` : '-'}</td>
                    <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                      {m.estado === 'Programado' && (
                        <>
                          <button onClick={() => setConfirmAction({ id: m.id_mantenimiento, action: 'iniciar', message: '¿Estás seguro de iniciar este mantenimiento?' })} disabled={actionLoading} className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700">Iniciar</button>
                          <button onClick={() => setConfirmAction({ id: m.id_mantenimiento, action: 'cancelar', message: '¿Estás seguro de cancelar esta orden de mantenimiento?' })} disabled={actionLoading} className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700">Cancelar</button>
                        </>
                      )}
                      {m.estado === 'En Progreso' && (
                        <button onClick={() => setConfirmAction({ id: m.id_mantenimiento, action: 'cerrar', message: '¿Confirmas que el equipo ha sido reparado y devuelto?' })} disabled={actionLoading} className="rounded bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700">Marcar Listo</button>
                      )}
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex justify-between border-b pb-3 mb-4">
              <h2 className="text-lg font-bold">Nueva Orden Técnica</h2>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            {formError && <p className="mb-4 text-sm text-red-600">{formError}</p>}

            <form onSubmit={handleCrearMantenimiento} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700">Filtrar Categoría</label>
                  <select value={filtroCategoriaForm} onChange={(e) => setFiltroCategoriaForm(e.target.value ? Number(e.target.value) : '')} className="w-full border rounded-xl p-2 text-sm mt-1">
                    <option value="">Todas las categorías</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700">Equipo *</label>
                  <select name="id_articulo" value={formData.id_articulo} onChange={handleInputChange} className="w-full border rounded-xl p-2 text-sm mt-1" required>
                    <option value="">Selecciona equipo...</option>
                    {articulos.filter(a => filtroCategoriaForm === '' || a.id_categoria === filtroCategoriaForm).map(a => {
                      const isDisponible = a.id_estado_articulo === 1;
                      const statusText = a.id_estado_articulo === 2 ? ' (Prestado)' : a.id_estado_articulo === 3 ? ' (En Mantenimiento)' : '';
                      return (
                        <option key={a.id_articulo} value={a.id_articulo} disabled={!isDisponible}>
                          {a.codigo_institucional} - {a.nombre}{statusText}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Tipo de Trabajo *</label>
                <select name="id_tipo_mantenimiento" value={formData.id_tipo_mantenimiento} onChange={handleInputChange} className="w-full border rounded-xl p-2 text-sm mt-1" required>
                  <option value="">Selecciona tipo...</option>
                  {tiposMant.map(t => <option key={getCatId(t)} value={getCatId(t)}>{t.nombre}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Descripción Falla *</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} className="w-full border rounded-xl p-2 text-sm mt-1" required />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700">Costo Estimado</label>
                  <input type="number" name="costo" value={formData.costo} onChange={handleInputChange} className="w-full border rounded-xl p-2 text-sm mt-1" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-700">Técnico Asignado</label>
                  <select name="tecnico_proveedor" value={formData.tecnico_proveedor} onChange={handleInputChange} className="w-full border rounded-xl p-2 text-sm mt-1">
                    <option value="">Ninguno / Externo</option>
                    {tecnicos.map(t => <option key={t.id_usuario} value={`${t.nombres} ${t.apellidos}`}>{t.nombres} {t.apellidos}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4"><button type="submit" className="bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-bold">Guardar</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar Acción</h3>
            <p className="text-sm text-gray-600 mb-6">{confirmAction.message}</p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setConfirmAction(null)} 
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  void accion(confirmAction.id, confirmAction.action);
                  setConfirmAction(null);
                }} 
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition shadow-sm"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}