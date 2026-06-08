import { useCallback, useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { Pagination } from '@/components/ui/Pagination';

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

type CatItem = { id?: number; id_categoria?: number; nombre: string };
type Articulo = { id_articulo: number; nombre: string; codigo_institucional: string; id_categoria: number; id_ubicacion: number | null };
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
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [categorias, setCategorias] = useState<CatItem[]>([]);
  const [filtroCategoriaForm, setFiltroCategoriaForm] = useState<number | ''>('');

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

  const totalPages = Math.ceil(movimientos.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return movimientos.slice(start, start + itemsPerPage);
  }, [movimientos, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

  useEffect(() => {
    Promise.all([
      api.get<Articulo[]>('/articulos'),
      api.get<Ubicacion[]>('/ubicaciones'),
      api.get<CatItem[]>('/catalogos/tipos-movimiento'),
      api.get<Usuario[]>('/usuarios').then(r => r.data).catch(() => []),
      api.get<CatItem[]>('/catalogos/categorias').catch(() => ({ data: [] }))
    ]).then(([a, u, t, us, c]) => {
      setArticulos((a.data as any).value ?? a.data);
      setUbicaciones((u.data as any).value ?? u.data);
      setTiposMov((t.data as any).value ?? t.data);
      // @ts-ignore
      setUsuariosList(us.value ?? us);
      setCategorias((c.data as any).value ?? c.data);
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
          <table className="w-full min-w-[1000px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                <th className="px-4 py-3.5"># ID</th>
                <th className="px-4 py-3.5">Artículo Movido</th>
                <th className="px-4 py-3.5">Tipo</th>
                <th className="px-4 py-3.5">Trayecto (Origen → Destino)</th>
                <th className="px-4 py-3.5">Usuario Responsable</th>
                <th className="px-4 py-3.5">Motivo</th>
                <th className="px-4 py-3.5">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-700">
              {paginatedData.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No hay movimientos registrados.</td></tr>
              ) : paginatedData.map((m) => (
                <tr key={m.idMovimiento} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-4 font-mono text-xs text-gray-500">{m.idMovimiento}</td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-gray-900">{m.nombreArticulo}</p>
                    <p className="text-xs font-mono text-gray-500 mt-0.5">{m.codigoArticulo}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {m.tipoMovimiento}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{m.ubicacionOrigen ?? 'Sin ubicación'}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-semibold text-gray-900">{m.ubicacionDestino}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-800">{m.usuario}</td>
                  <td className="px-4 py-4 text-xs text-gray-500 max-w-[200px] truncate" title={m.motivo || ''}>{m.motivo ?? '—'}</td>
                  <td className="px-4 py-4 text-xs text-gray-500 whitespace-nowrap">{m.fechaMovimiento}</td>
                </tr>
              ))}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--app-text)]">Registrar traslado</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            {formError && <p className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{formError}</p>}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Filtrar por Categoría</label>
                  <select value={filtroCategoriaForm} onChange={(e) => setFiltroCategoriaForm(e.target.value ? Number(e.target.value) : '')} className={selectCls}>
                    <option value="">Todas las categorías</option>
                    {categorias.map((c) => <option key={c.id ?? c.id_categoria} value={c.id ?? c.id_categoria}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Artículo *</label>
                  <select value={fArticulo} onChange={(e) => { setFArticulo(e.target.value); setFUbicacionDest(''); }} className={selectCls}>
                    <option value="">Seleccioná un artículo</option>
                    {articulos.filter(a => filtroCategoriaForm === '' || a.id_categoria === filtroCategoriaForm).map((a) => {
                      const ubiActual = ubicaciones.find(u => u.id_ubicacion === a.id_ubicacion)?.nombre ?? 'Sin ubicación';
                      return (
                        <option key={a.id_articulo} value={a.id_articulo}>
                          {a.codigo_institucional} - {a.nombre} (Actualmente en: {ubiActual})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Ubicación destino *</label>
                  <select value={fUbicacionDest} onChange={(e) => setFUbicacionDest(e.target.value)} className={selectCls}>
                    <option value="">Seleccioná ubicación destino</option>
                    {ubicaciones.map((u) => {
                      const articuloSel = articulos.find(a => a.id_articulo === Number(fArticulo));
                      const isCurrentLocation = articuloSel?.id_ubicacion === u.id_ubicacion;
                      return (
                        <option key={u.id_ubicacion} value={u.id_ubicacion} disabled={isCurrentLocation}>
                          {u.nombre} {isCurrentLocation ? '(Ubicación actual)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Usuario responsable *</label>
                  <select value={fUsuario} onChange={(e) => setFUsuario(e.target.value)} className={selectCls}>
                    <option value="">Seleccioná un usuario</option>
                    {usuariosList.map((u) => <option key={u.id_usuario} value={u.id_usuario}>{u.nombres} {u.apellidos}</option>)}
                  </select>
                </div>
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
