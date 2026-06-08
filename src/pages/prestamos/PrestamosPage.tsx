import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

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

type Articulo = { id_articulo: number; nombre: string; codigo_institucional: string };
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
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form nuevo préstamo
  const [formSolicitante, setFormSolicitante] = useState('');
  const [formArticulos, setFormArticulos] = useState<number[]>([]);
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
    ]).then(([resArt, resEst, resUsu]) => {
      setArticulos(resArt.data);
      setEstadosCat(resEst.data);
      // @ts-ignore
      setUsuariosList(resUsu.value ?? resUsu);
    }).catch(console.error);
  }, []);

  const filtrados = useMemo(() => prestamos, [prestamos]);

  const accion = async (id: number, endpoint: string, body?: object) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.patch(`/prestamos/${id}/${endpoint}`, body ?? {});
      setSuccess(`Préstamo ${endpoint} exitosamente.`);
      await cargar();
      setTimeout(() => setSuccess(''), 4000);
    } catch {
      setError(`Error al ejecutar acción: ${endpoint}. Verificá los datos.`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  const crearPrestamo = async () => {
    if (!formSolicitante) { setFormError('Seleccioná el solicitante'); return; }
    if (formArticulos.length === 0) { setFormError('Seleccioná al menos un artículo'); return; }
    if (!usuario) { setFormError('No hay sesión activa'); return; }
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
      setSuccess('Préstamo creado correctamente.');
      setTimeout(() => setSuccess(''), 4000);
      await cargar();
    } catch {
      setFormError('Error al crear el préstamo. Verificá los datos.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--app-text)]">Préstamos</h1>
          <p className="mt-1 text-sm text-[var(--fisei-red-600)]">Gestión del ciclo de vida de préstamos de equipos</p>
        </div>
        <button
          id="btn-nuevo-prestamo"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[var(--fisei-red-600)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--fisei-red-700)] active:scale-95"
        >
          + Nuevo préstamo
        </button>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm flex flex-wrap gap-3">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por artículo o solicitante…"
          className="h-10 flex-1 min-w-[200px] rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--fisei-red-200)]"
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--fisei-red-200)]"
        >
          <option value="">Todos los estados</option>
          {estadosCat.map((e) => (
            <option key={e.id} value={e.id}>{e.nombre}</option>
          ))}
        </select>
        <button
          onClick={() => { setBusqueda(''); setFiltroEstado(''); }}
          className="h-10 rounded-xl border px-4 text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          Limpiar
        </button>
      </div>

      {/* Tabla */}
      {success && (
        <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}
      {loading ? (
        <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-500">Cargando préstamos...</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-red-50/40 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Artículo</th>
                <th className="px-4 py-3">Solicitante</th>
                <th className="px-4 py-3">Ubicación</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">F. Solicitud</th>
                <th className="px-4 py-3">F. Prevista Dev.</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">No hay préstamos registrados.</td>
                </tr>
              ) : (
                filtrados.map((p) => (
                  <tr key={`${p.idPrestamo}-${p.idArticulo}`} className="border-t hover:bg-red-50/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.idPrestamo}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--app-text)]">{p.nombreArticulo}</p>
                      <p className="text-xs text-gray-400">{p.codigoArticulo}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{p.solicitante}</p>
                      <p className="text-xs text-gray-400">{p.correoSolicitante}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.ubicacion}</td>
                    <td className="px-4 py-3"><Badge estado={p.estado} /></td>
                    <td className="px-4 py-3 text-gray-600">{p.fechaSolicitud ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.fechaPrevistaDevolucion || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.estado === 'Pendiente' && (
                          <>
                            <ActionBtn
                              label="Aprobar"
                              color="bg-blue-500"
                              disabled={actionLoading}
                              onClick={() => accion(p.idPrestamo, 'aprobar', { id_aprobador: usuario?.id_usuario || 1 })}
                            />
                            <ActionBtn
                              label="Cancelar"
                              color="bg-red-400"
                              disabled={actionLoading}
                              onClick={() => accion(p.idPrestamo, 'cancelar')}
                            />
                          </>
                        )}
                        {p.estado === 'Aprobado' && (
                          <ActionBtn
                            label="Entregar"
                            color="bg-purple-500"
                            disabled={actionLoading}
                            onClick={() => accion(p.idPrestamo, 'entregar')}
                          />
                        )}
                        {p.estado === 'Entregado' && (
                          <ActionBtn
                            label="Devolver"
                            color="bg-emerald-500"
                            disabled={actionLoading}
                            onClick={() => accion(p.idPrestamo, 'devolver')}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal nuevo préstamo */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-[var(--app-text)] mb-4">Nuevo préstamo</h2>
            {formError && (
              <p className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{formError}</p>
            )}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Solicitante *</label>
                <select
                  value={formSolicitante}
                  onChange={(e) => setFormSolicitante(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--fisei-red-200)] outline-none bg-white"
                >
                  <option value="">Seleccioná un solicitante</option>
                  {usuariosList.map((u) => (
                    <option key={u.id_usuario} value={u.id_usuario}>
                      {u.nombres} {u.apellidos} ({u.cedula})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Artículos *</label>
                <select
                  multiple
                  size={5}
                  value={formArticulos.map(String)}
                  onChange={(e) => {
                    const vals = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
                    setFormArticulos(vals);
                  }}
                  className="w-full rounded-xl border p-2 text-sm focus:ring-2 focus:ring-[var(--fisei-red-200)]"
                >
                  {articulos.map((a) => (
                    <option key={a.id_articulo} value={a.id_articulo}>
                      {a.nombre} — {a.codigo_institucional}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-400">Ctrl+clic para seleccionar varios</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Fecha prevista de devolución</label>
                <input
                  type="date"
                  value={formFechaDevolucion}
                  onChange={(e) => setFormFechaDevolucion(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--fisei-red-200)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Observación</label>
                <textarea
                  value={formObservacion}
                  onChange={(e) => setFormObservacion(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--fisei-red-200)]"
                  placeholder="Descripción opcional del préstamo…"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => { setShowModal(false); setFormError(''); }}
                className="rounded-xl border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={crearPrestamo}
                disabled={actionLoading}
                className="rounded-xl bg-[var(--fisei-red-600)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--fisei-red-700)] disabled:opacity-60"
              >
                {actionLoading ? 'Guardando…' : 'Crear préstamo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ label, color, onClick, disabled }: { label: string; color: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${color} rounded-lg px-2 py-1 text-xs font-medium text-white transition hover:opacity-80 disabled:opacity-50`}
    >
      {label}
    </button>
  );
}