import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Mantenimiento = {
  idMantenimiento: number;
  idArticulo: number;
  nombreArticulo: string;
  codigoArticulo: string;
  tipoMantenimiento: string;
  estadoMantenimiento: string;
  idEstado: number;
  descripcion: string | null;
  tecnicoProveedor: string | null;
  costo: number | null;
  fechaInicio: string;
  fechaFin: string | null;
  proximoMantenimiento: string | null;
};

type CatItem = { id: number; nombre: string };
type Articulo = { id_articulo: number; nombre: string; codigo_institucional: string };

const ESTADO_COLORS: Record<string, string> = {
  Pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
  'En curso': 'bg-blue-100 text-blue-700 border-blue-200',
  Completado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Cancelado: 'bg-red-100 text-red-700 border-red-200',
};

export default function MantenimientosPage() {
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [tipos, setTipos] = useState<CatItem[]>([]);
  const [estados, setEstados] = useState<CatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCerrarModal, setShowCerrarModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form nuevo
  const [fArticulo, setFArticulo] = useState('');
  const [fTipo, setFTipo] = useState('');
  const [fEstado, setFEstado] = useState('');
  const [fFechaInicio, setFFechaInicio] = useState('');
  const [fTecnico, setFTecnico] = useState('');
  const [fDescripcion, setFDescripcion] = useState('');
  const [formError, setFormError] = useState('');

  // Form cerrar
  const [cFechaFin, setCFechaFin] = useState('');
  const [cCosto, setCCosto] = useState('');
  const [cProximo, setCProximo] = useState('');

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get<Mantenimiento[]>('/mantenimientos', {
        params: {
          id_tipo_mantenimiento: filtroTipo || undefined,
          id_estado_mantenimiento: filtroEstado || undefined,
        },
      });
      setMantenimientos(res.data);
    } catch {
      setError('No se pudo cargar los mantenimientos.');
    } finally {
      setLoading(false);
    }
  }, [filtroEstado, filtroTipo]);

  useEffect(() => { void cargar(); }, [cargar]);

  useEffect(() => {
    Promise.all([
      api.get<Articulo[]>('/articulos'),
      api.get<CatItem[]>('/catalogos/tipos-mantenimiento'),
      api.get<CatItem[]>('/catalogos/estados-mantenimiento'),
    ]).then(([a, t, e]) => {
      setArticulos(a.data);
      setTipos(t.data);
      setEstados(e.data);
    }).catch(console.error);
  }, []);

  const crearMantenimiento = async () => {
    if (!fArticulo || !fTipo || !fEstado || !fFechaInicio) {
      setFormError('Artículo, tipo, estado y fecha de inicio son obligatorios');
      return;
    }
    setFormError('');
    setActionLoading(true);
    try {
      await api.post('/mantenimientos', {
        id_articulo: Number(fArticulo),
        id_tipo_mantenimiento: Number(fTipo),
        id_estado_mantenimiento: Number(fEstado),
        fecha_inicio: fFechaInicio,
        tecnico_proveedor: fTecnico || undefined,
        descripcion: fDescripcion || undefined,
      });
      setShowModal(false);
      setFArticulo(''); setFTipo(''); setFEstado('');
      setFFechaInicio(''); setFTecnico(''); setFDescripcion('');
      await cargar();
    } catch {
      setFormError('Error al crear el mantenimiento.');
    } finally {
      setActionLoading(false);
    }
  };

  const cerrarMantenimiento = async () => {
    if (!selectedId || !cFechaFin) { return; }
    setActionLoading(true);
    try {
      await api.patch(`/mantenimientos/${selectedId}/cerrar`, {
        fecha_fin: cFechaFin,
        costo: cCosto ? Number(cCosto) : undefined,
        proximo_mantenimiento: cProximo || undefined,
      });
      setShowCerrarModal(false);
      setSelectedId(null);
      setCFechaFin(''); setCCosto(''); setCProximo('');
      await cargar();
    } catch {
      alert('Error al cerrar el mantenimiento.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--app-text)]">Mantenimientos</h1>
          <p className="mt-1 text-sm text-[var(--fisei-red-600)]">Registro y seguimiento de mantenimientos de equipos</p>
        </div>
        <button
          id="btn-nuevo-mantenimiento"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[var(--fisei-red-600)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--fisei-red-700)] active:scale-95"
        >
          + Nuevo mantenimiento
        </button>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm flex flex-wrap gap-3">
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--fisei-red-200)]"
        >
          <option value="">Todos los tipos</option>
          {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--fisei-red-200)]"
        >
          <option value="">Todos los estados</option>
          {estados.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
        <button
          onClick={() => { setFiltroEstado(''); setFiltroTipo(''); }}
          className="h-10 rounded-xl border px-4 text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          Limpiar
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-500">Cargando mantenimientos…</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-red-50/40 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Artículo</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Técnico</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">F. Inicio</th>
                <th className="px-4 py-3">F. Fin</th>
                <th className="px-4 py-3">Costo</th>
                <th className="px-4 py-3">Próximo</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mantenimientos.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-gray-400">No hay mantenimientos registrados.</td></tr>
              ) : mantenimientos.map((m) => (
                <tr key={m.idMantenimiento} className="border-t hover:bg-red-50/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.idMantenimiento}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{m.nombreArticulo}</p>
                    <p className="text-xs text-gray-400">{m.codigoArticulo}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{m.tipoMantenimiento}</td>
                  <td className="px-4 py-3 text-gray-600">{m.tecnicoProveedor ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${ESTADO_COLORS[m.estadoMantenimiento] ?? 'bg-gray-100 text-gray-600'}`}>
                      {m.estadoMantenimiento}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{m.fechaInicio}</td>
                  <td className="px-4 py-3 text-gray-600">{m.fechaFin ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{m.costo != null ? `$${Number(m.costo).toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{m.proximoMantenimiento ?? '—'}</td>
                  <td className="px-4 py-3">
                    {!m.fechaFin && (
                      <button
                        onClick={() => { setSelectedId(m.idMantenimiento); setShowCerrarModal(true); }}
                        className="rounded-lg bg-emerald-500 px-2 py-1 text-xs font-medium text-white hover:opacity-80 transition"
                      >
                        Cerrar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal nuevo */}
      {showModal && (
        <Modal title="Nuevo mantenimiento" onClose={() => { setShowModal(false); setFormError(''); }}>
          {formError && <p className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{formError}</p>}
          <div className="space-y-4">
            <Field label="Artículo *">
              <select value={fArticulo} onChange={(e) => setFArticulo(e.target.value)} className={selectCls}>
                <option value="">Seleccioná un artículo</option>
                {articulos.map((a) => <option key={a.id_articulo} value={a.id_articulo}>{a.nombre} — {a.codigo_institucional}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tipo *">
                <select value={fTipo} onChange={(e) => setFTipo(e.target.value)} className={selectCls}>
                  <option value="">Seleccioná</option>
                  {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
              </Field>
              <Field label="Estado *">
                <select value={fEstado} onChange={(e) => setFEstado(e.target.value)} className={selectCls}>
                  <option value="">Seleccioná</option>
                  {estados.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Fecha de inicio *">
              <input type="date" value={fFechaInicio} onChange={(e) => setFFechaInicio(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Técnico / Proveedor">
              <input type="text" value={fTecnico} onChange={(e) => setFTecnico(e.target.value)} placeholder="Nombre del técnico…" className={inputCls} />
            </Field>
            <Field label="Descripción">
              <textarea value={fDescripcion} onChange={(e) => setFDescripcion(e.target.value)} rows={3} className={inputCls} placeholder="Detalles del mantenimiento…" />
            </Field>
          </div>
          <div className="mt-6 flex gap-3 justify-end">
            <button onClick={() => { setShowModal(false); setFormError(''); }} className="rounded-xl border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
            <button onClick={crearMantenimiento} disabled={actionLoading} className="rounded-xl bg-[var(--fisei-red-600)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--fisei-red-700)] disabled:opacity-60 transition">
              {actionLoading ? 'Guardando…' : 'Registrar'}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal cerrar */}
      {showCerrarModal && (
        <Modal title="Cerrar mantenimiento" onClose={() => { setShowCerrarModal(false); setSelectedId(null); }}>
          <div className="space-y-4">
            <Field label="Fecha de fin *">
              <input type="date" value={cFechaFin} onChange={(e) => setCFechaFin(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Costo ($)">
              <input type="number" value={cCosto} onChange={(e) => setCCosto(e.target.value)} min={0} step={0.01} placeholder="0.00" className={inputCls} />
            </Field>
            <Field label="Próximo mantenimiento">
              <input type="date" value={cProximo} onChange={(e) => setCProximo(e.target.value)} className={inputCls} />
            </Field>
          </div>
          <div className="mt-6 flex gap-3 justify-end">
            <button onClick={() => { setShowCerrarModal(false); setSelectedId(null); }} className="rounded-xl border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
            <button onClick={cerrarMantenimiento} disabled={actionLoading || !cFechaFin} className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition">
              {actionLoading ? 'Guardando…' : 'Cerrar mantenimiento'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const inputCls = 'w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--fisei-red-200)] outline-none';
const selectCls = 'w-full rounded-xl border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--fisei-red-200)] outline-none';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--app-text)]">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}