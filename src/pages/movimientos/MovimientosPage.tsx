import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Movimiento = {
  idMovimiento: number;
  idArticulo: number;
  nombreArticulo: string;
  codigoArticulo: string;
  tipoMovimiento: string;
  ubicacionOrigen: string | null;
  ubicacionDestino: string;
  usuario: string;
  motivo: string | null;
  observacion: string | null;
  fechaMovimiento: string;
};

type CatItem = { id: number; nombre: string };
type Articulo = { id_articulo: number; nombre: string; codigo_institucional: string };
type Ubicacion = { id_ubicacion: number; nombre: string };
type Usuario = { id_usuario: number; nombres: string; apellidos: string; cedula: string };

const inputCls = 'w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--fisei-red-200)] outline-none';
const selectCls = 'w-full rounded-xl border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--fisei-red-200)] outline-none';

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [tiposMov, setTiposMov] = useState<CatItem[]>([]);
  const [usuariosList, setUsuariosList] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [fArticulo, setFArticulo] = useState('');
  const [fUbicacionDest, setFUbicacionDest] = useState('');
  const [fUsuario, setFUsuario] = useState('');
  const [fTipo, setFTipo] = useState('');
  const [fMotivo, setFMotivo] = useState('');
  const [fObservacion, setFObservacion] = useState('');
  const [formError, setFormError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Movimiento[]>('/movimientos', {
        params: { busqueda: busqueda || undefined },
      });
      setMovimientos(res.data);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [busqueda]);

  useEffect(() => { void cargar(); }, [cargar]);

  useEffect(() => {
    Promise.all([
      api.get<Articulo[]>('/articulos'),
      api.get<Ubicacion[]>('/ubicaciones'),
      api.get<CatItem[]>('/catalogos/tipos-movimiento'),
      api.get<Usuario[]>('/usuarios').then(r => r.data).catch(() => []),
    ]).then(([a, u, t, us]) => {
      setArticulos(a.data);
      setUbicaciones(u.data);
      setTiposMov(t.data);
      // @ts-ignore
      setUsuariosList(us.value ?? us);
    }).catch(console.error);
  }, []);

  const registrarMovimiento = async () => {
    if (!fArticulo || !fUbicacionDest || !fTipo || !fUsuario) {
      setFormError('Artículo, ubicación destino, tipo y usuario son obligatorios');
      return;
    }
    setFormError('');
    setActionLoading(true);
    try {
      await api.post('/movimientos', {
        id_articulo: Number(fArticulo),
        id_ubicacion_destino: Number(fUbicacionDest),
        id_usuario: Number(fUsuario),
        id_tipo_movimiento: Number(fTipo),
        motivo: fMotivo || undefined,
        observacion: fObservacion || undefined,
      });
      setShowModal(false);
      setFArticulo(''); setFUbicacionDest(''); setFUsuario(''); setFTipo(''); setFMotivo(''); setFObservacion('');
      await cargar();
    } catch { setFormError('Error al registrar movimiento.'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--app-text)]">Movimientos</h1>
          <p className="mt-1 text-sm text-[var(--fisei-red-600)]">Historial de traslados de artículos entre ubicaciones</p>
        </div>
        <button id="btn-nuevo-movimiento" onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-[var(--fisei-red-600)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--fisei-red-700)] active:scale-95">
          + Registrar traslado
        </button>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm flex gap-3">
        <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por artículo o usuario…" className="h-10 flex-1 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--fisei-red-200)]" />
      </div>

      {loading ? (
        <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-500">Cargando movimientos…</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-red-50/40 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Artículo</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Origen</th>
                <th className="px-4 py-3">Destino</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Motivo</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No hay movimientos registrados.</td></tr>
              ) : movimientos.map((m) => (
                <tr key={m.idMovimiento} className="border-t hover:bg-red-50/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.idMovimiento}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{m.nombreArticulo}</p>
                    <p className="text-xs text-gray-400">{m.codigoArticulo}</p>
                  </td>
                  <td className="px-4 py-3"><span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs text-blue-700">{m.tipoMovimiento}</span></td>
                  <td className="px-4 py-3 text-gray-500">{m.ubicacionOrigen ?? '—'}</td>
                  <td className="px-4 py-3 font-medium text-[var(--app-text)]">{m.ubicacionDestino}</td>
                  <td className="px-4 py-3 text-gray-600">{m.usuario}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{m.motivo ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{m.fechaMovimiento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--app-text)]">Registrar traslado</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            {formError && <p className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{formError}</p>}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Artículo *</label>
                <select value={fArticulo} onChange={(e) => setFArticulo(e.target.value)} className={selectCls}>
                  <option value="">Seleccioná un artículo</option>
                  {articulos.map((a) => <option key={a.id_articulo} value={a.id_articulo}>{a.nombre} — {a.codigo_institucional}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ubicación destino *</label>
                <select value={fUbicacionDest} onChange={(e) => setFUbicacionDest(e.target.value)} className={selectCls}>
                  <option value="">Seleccioná ubicación</option>
                  {ubicaciones.map((u) => <option key={u.id_ubicacion} value={u.id_ubicacion}>{u.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Usuario responsable *</label>
                <select value={fUsuario} onChange={(e) => setFUsuario(e.target.value)} className={selectCls}>
                  <option value="">Seleccioná un usuario</option>
                  {usuariosList.map((u) => <option key={u.id_usuario} value={u.id_usuario}>{u.nombres} {u.apellidos}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tipo de movimiento *</label>
                <select value={fTipo} onChange={(e) => setFTipo(e.target.value)} className={selectCls}>
                  <option value="">Seleccioná tipo</option>
                  {tiposMov.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Motivo</label>
                <input type="text" value={fMotivo} onChange={(e) => setFMotivo(e.target.value)} className={inputCls} placeholder="Motivo del traslado…" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Observación</label>
                <textarea value={fObservacion} onChange={(e) => setFObservacion(e.target.value)} rows={2} className={inputCls} />
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="rounded-xl border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
              <button onClick={registrarMovimiento} disabled={actionLoading} className="rounded-xl bg-[var(--fisei-red-600)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--fisei-red-700)] disabled:opacity-60 transition">
                {actionLoading ? 'Guardando…' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
