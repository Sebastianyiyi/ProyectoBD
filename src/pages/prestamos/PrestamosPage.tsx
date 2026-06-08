import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Pagination } from '@/components/ui/Pagination';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

type PrestamoBD = {
  idPrestamo: number;
  idArticulo: number;
  nombreArticulo: string;
  codigoArticulo: string;
  ubicacion: string;
  solicitante: string;
  correoSolicitante: string;
  aprobador: string | null;
  estado: string;
  idEstado: number;
  fechaSolicitud: string;
  fechaAprobacion: string | null;
  fechaEntrega: string | null;
  fechaPrevistaDevolucion: string | null;
  fechaDevolucionReal: string | null;
  observacion: string | null;
};

type Articulo = { id_articulo: number; nombre: string; codigo_institucional: string; id_categoria: number; id_estado_articulo: number };
type CatItem = { id: number; nombre: string };
type Usuario = { id_usuario: number; nombres: string; apellidos: string; cedula: string };

const ESTADO_COLORS: Record<string, string> = {
  Pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
  Aprobado: 'bg-blue-100 text-blue-700 border-blue-200',
  Entregado: 'bg-purple-100 text-purple-700 border-purple-200',
  Devuelto: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Cancelado: 'bg-red-100 text-red-700 border-red-200',
};

function Badge({ estado }: { estado: string }) {
  const cls = ESTADO_COLORS[estado] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-sm ${cls}`}>
      {estado}
    </span>
  );
}

export default function PrestamosPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const [prestamos, setPrestamos] = useState<PrestamoBD[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [usuariosList, setUsuariosList] = useState<Usuario[]>([]);
  const [estadosCat, setEstadosCat] = useState<CatItem[]>([]);
  const [categorias, setCategorias] = useState<CatItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ id: number, action: string, message: string } | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form nuevo préstamo
  const [formSolicitante, setFormSolicitante] = useState('');
  const [formArticulos, setFormArticulos] = useState<number[]>([]);
  const [filtroCategoriaForm, setFiltroCategoriaForm] = useState<number | ''>('');
  const [formFechaDevolucion, setFormFechaDevolucion] = useState('');
  const [formObservacion, setFormObservacion] = useState('');
  const [formError, setFormError] = useState('');

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get<PrestamoBD[]>('/prestamos', {
        params: {
          id_estado_prestamo: filtroEstado || undefined,
          busqueda: busqueda || undefined,
        },
      });
      setPrestamos(res.data);
    } catch {
      setError('No se pudo cargar los préstamos.');
    } finally {
      setLoading(false);
    }
  }, [busqueda, filtroEstado]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useEffect(() => {
    Promise.all([
      api.get<Articulo[]>('/articulos'),
      api.get<CatItem[]>('/catalogos/estados-prestamo'),
      api.get<Usuario[]>('/usuarios').then(r => r.data).catch(() => []),
      api.get<CatItem[]>('/catalogos/categorias'),
    ]).then(([resArt, resEst, resUsu, resCat]) => {
      setArticulos(resArt.data);
      setEstadosCat(resEst.data);
      // @ts-ignore
      setUsuariosList(resUsu.value ?? resUsu);
      setCategorias(resCat.data.map((c: any) => ({ id: c.id_categoria, nombre: c.nombre })));
    }).catch(console.error);
  }, []);

  const filtrados = useMemo(() => prestamos, [prestamos]);

  const totalPages = Math.ceil(filtrados.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtrados.slice(start, start + itemsPerPage);
  }, [filtrados, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, filtroEstado]);

  // Obtener la fecha de hoy para bloquear fechas pasadas en el calendario
  const todayDate = new Date().toISOString().split('T')[0];

  const accion = async (id: number, endpoint: string) => {
    setActionLoading(true);
    try {
      let body = {};
      // Si el endpoint es devolver/cancelar, mandamos fecha_fin
      if (endpoint === 'devolver' || endpoint === 'cancelar') {
        body = { fecha_fin: new Date().toISOString().split('T')[0] };
      }

      await api.patch(`/prestamos/${id}/${endpoint}`, body ?? {});
      setSuccess(`Préstamo marcado como ${endpoint} exitosamente.`);
      await cargar();
      void api.get<Articulo[]>('/articulos').then(res => setArticulos(res.data));
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || `Error al actualizar préstamo a ${endpoint}.`);
    } finally {
      setActionLoading(false);
    }
  };

  const crearPrestamo = async () => {
    if (!formSolicitante) { setFormError('Selecciona el solicitante.'); return; }
    if (formArticulos.length === 0) { setFormError('Selecciona al menos un artículo de la lista.'); return; }
    if (!usuario) { setFormError('No hay sesión activa. Por favor recarga la página.'); return; }

    setFormError('');
    setActionLoading(true);
    try {
      await api.post('/prestamos', {
        id_solicitante: Number(formSolicitante),
        articulos: formArticulos,
        fecha_prevista_devolucion: formFechaDevolucion || undefined,
        observacion: formObservacion || undefined,
      });
      setShowModal(false);
      setFormSolicitante('');
      setFormArticulos([]);
      setFormFechaDevolucion('');
      setFormObservacion('');
      setSuccess('Préstamo registrado correctamente.');
      setTimeout(() => setSuccess(''), 4000);
      await cargar();
      void api.get<Articulo[]>('/articulos').then(r => setArticulos(r.data)).catch(console.error);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Error al crear el préstamo. Verifica tu conexión o los datos ingresados.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArticuloToggle = (id: number) => {
    setFormArticulos(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Préstamos</h1>
          <p className="mt-1 text-sm text-gray-500">Control del ciclo de vida y asignación temporal de equipos tecnológicos</p>
        </div>
        <button
          id="btn-nuevo-prestamo"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-red-700 active:scale-95"
        >
          + Nuevo préstamo
        </button>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm flex flex-wrap gap-4">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por equipo o solicitante..."
          className="h-10 flex-1 min-w-[250px] rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="h-10 rounded-xl border bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
        >
          <option value="">Todos los estados</option>
          {estadosCat.map((e) => (
            <option key={e.id} value={e.id}>{e.nombre}</option>
          ))}
        </select>
        <button
          onClick={() => { setBusqueda(''); setFiltroEstado(''); }}
          className="h-10 rounded-xl border px-5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          Limpiar
        </button>
      </div>

      {/* Alertas Globales */}
      {success && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 shadow-sm animate-fade-in">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
          Cargando registro de préstamos...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[1000px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                <th className="px-4 py-3.5">#ID</th>
                <th className="px-4 py-3.5">Equipo / Componente</th>
                <th className="px-4 py-3.5">Solicitante</th>
                <th className="px-4 py-3.5">Ubicación</th>
                <th className="px-4 py-3.5">Estado actual</th>
                <th className="px-4 py-3.5">F. Solicitud</th>
                <th className="px-4 py-3.5">F. Prevista Dev.</th>
                <th className="px-4 py-3.5">Acciones Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-700">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    No se encontraron préstamos activos.
                  </td>
                </tr>
              ) : (
                paginatedData.map((p) => (
                  <tr key={`${p.idPrestamo}-${p.idArticulo}`} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-4 font-mono text-xs text-gray-500">{p.idPrestamo}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">{p.nombreArticulo}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{p.codigoArticulo}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium">{p.solicitante}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.correoSolicitante}</p>
                    </td>
                    <td className="px-4 py-4">{p.ubicacion}</td>
                    <td className="px-4 py-4"><Badge estado={p.estado} /></td>
                    <td className="px-4 py-4">{p.fechaSolicitud ?? '-'}</td>
                    <td className="px-4 py-4">{p.fechaPrevistaDevolucion || '-'}</td>
                    <td className="px-4 py-4 text-right space-x-2 whitespace-nowrap">
                      {p.estado === 'Pendiente' && (
                        <>
                          <button onClick={() => setConfirmAction({ id: p.idPrestamo, action: 'aprobar', message: '¿Aprobar este préstamo?' })} disabled={actionLoading} className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700">Aprobar</button>
                          <button onClick={() => setConfirmAction({ id: p.idPrestamo, action: 'cancelar', message: '¿Cancelar esta solicitud?' })} disabled={actionLoading} className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700">Cancelar</button>
                        </>
                      )}
                      {p.estado === 'Aprobado' && (
                        <button onClick={() => setConfirmAction({ id: p.idPrestamo, action: 'entregar', message: '¿Marcar equipo como entregado al usuario?' })} disabled={actionLoading} className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700">Marcar Entregado</button>
                      )}
                      {p.estado === 'Entregado' && (
                        <button onClick={() => setConfirmAction({ id: p.idPrestamo, action: 'devolver', message: '¿Confirmas la devolución del equipo al inventario?' })} disabled={actionLoading} className="rounded bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700">Registrar Devolución</button>
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

      {/* Modal Nuevo Préstamo */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Registrar Nuevo Préstamo</h2>
              <button onClick={() => { setShowModal(false); setFormError(''); }} className="text-gray-400 hover:text-gray-600 transition">✕</button>
            </div>

            {formError && (
              <p className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700 animate-fade-in">{formError}</p>
            )}

            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Usuario Solicitante *</label>
                <SearchableSelect
                  options={usuariosList.map(u => ({ value: u.id_usuario, label: `${u.nombres} ${u.apellidos} - ${u.cedula}` }))}
                  value={formSolicitante ? Number(formSolicitante) : ''}
                  onChange={(val) => setFormSolicitante(val.toString())}
                  placeholder="Busca por nombre o cédula..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Equipos a prestar *</label>
                  <select
                    value={filtroCategoriaForm}
                    onChange={(e) => setFiltroCategoriaForm(e.target.value ? Number(e.target.value) : '')}
                    className="h-7 text-xs rounded border bg-white px-2 outline-none focus:ring-1 focus:ring-red-200"
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div className="max-h-52 overflow-y-auto rounded-xl border p-2 space-y-1 bg-gray-50 focus-within:ring-2 focus-within:ring-red-200 transition-all">
                  {articulos.filter(a => filtroCategoriaForm === '' || a.id_categoria === filtroCategoriaForm).map((a) => {
                    const isDisponible = a.id_estado_articulo === 1;
                    return (
                      <label key={a.id_articulo} className={`flex items-center gap-3 rounded-lg p-2 transition-colors ${isDisponible ? 'hover:bg-gray-200/50 cursor-pointer' : 'opacity-60 bg-gray-100 cursor-not-allowed'}`}>
                        <input
                          type="checkbox"
                          disabled={!isDisponible}
                          checked={formArticulos.includes(a.id_articulo)}
                          onChange={() => handleArticuloToggle(a.id_articulo)}
                          className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600 disabled:opacity-50"
                        />
                        <div className="flex flex-col flex-1">
                          <span className="text-sm font-medium text-gray-800">{a.nombre}</span>
                          <span className="text-xs font-mono text-gray-500">{a.codigo_institucional}</span>
                        </div>
                        {!isDisponible && (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${a.id_estado_articulo === 3 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                            {a.id_estado_articulo === 3 ? 'Mantenimiento' : 'Prestado'}
                          </span>
                        )}
                      </label>
                    );
                  })}
                  {articulos.filter(a => filtroCategoriaForm === '' || a.id_categoria === filtroCategoriaForm).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No hay equipos en esta categoría.</p>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-gray-400">Puedes seleccionar múltiples equipos activando las casillas.</p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha prevista de devolución</label>
                <input
                  type="date"
                  min={todayDate}
                  value={formFechaDevolucion}
                  onChange={(e) => setFormFechaDevolucion(e.target.value)}
                  className="w-full h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Observación / Motivo</label>
                <textarea
                  value={formObservacion}
                  onChange={(e) => setFormObservacion(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  placeholder="Ej. Uso para prácticas de redes o proyecto integrador..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end border-t pt-4">
              <button
                onClick={() => { setShowModal(false); setFormError(''); }}
                className="rounded-xl border px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={crearPrestamo}
                disabled={actionLoading}
                className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
              >
                {actionLoading ? 'Procesando...' : 'Confirmar Préstamo'}
              </button>
            </div>
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

// Componente auxiliar para los botones de la tabla
function ActionBtn({ label, color, onClick, disabled }: { label: string; color: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${color} rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-sm`}
    >
      {label}
    </button>
  );
}