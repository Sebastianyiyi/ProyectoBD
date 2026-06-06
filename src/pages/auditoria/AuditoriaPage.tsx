import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Auditoria = {
  idAuditoria: number;
  tablaAfectada: string;
  accion: string;
  usuario: string;
  ipOrigen: string | null;
  detalle: string | null;
  datosAntes: string | null;
  datosDespues: string | null;
  fechaHora: string;
};

const ACCION_COLOR: Record<string, string> = {
  INSERT: 'bg-emerald-100 text-emerald-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  SELECT: 'bg-gray-100 text-gray-600',
  LOGIN: 'bg-purple-100 text-purple-700',
  LOGOUT: 'bg-amber-100 text-amber-700',
};

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAccion, setFiltroAccion] = useState('');
  const [filtroTabla, setFiltroTabla] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await api.get<Auditoria[]>('/auditoria', {
        params: {
          accion: filtroAccion || undefined,
          tabla_afectada: filtroTabla || undefined,
          fecha_desde: fechaDesde || undefined,
          fecha_hasta: fechaHasta || undefined,
        },
      });
      setLogs(res.data);
    } catch { /* noop */ }
    finally { setLoading(false); }
  };

  useEffect(() => { void cargar(); }, [filtroAccion, filtroTabla, fechaDesde, fechaHasta]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--app-text)]">Auditoría</h1>
        <p className="mt-1 text-sm text-[var(--fisei-red-600)]">Registro de acciones realizadas en el sistema (últimas 500)</p>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm flex flex-wrap gap-3">
        <select value={filtroAccion} onChange={(e) => setFiltroAccion(e.target.value)} className="h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--fisei-red-200)]">
          <option value="">Todas las acciones</option>
          {['INSERT', 'UPDATE', 'DELETE', 'SELECT', 'LOGIN', 'LOGOUT'].map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <input type="text" value={filtroTabla} onChange={(e) => setFiltroTabla(e.target.value)} placeholder="Filtrar por tabla…" className="h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--fisei-red-200)]" />
        <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--fisei-red-200)]" />
        <span className="flex items-center text-sm text-gray-400">→</span>
        <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--fisei-red-200)]" />
        <button onClick={() => { setFiltroAccion(''); setFiltroTabla(''); setFechaDesde(''); setFechaHasta(''); }} className="h-10 rounded-xl border px-4 text-sm text-gray-600 hover:bg-gray-50 transition">Limpiar</button>
      </div>

      {loading ? (
        <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-500">Cargando auditoría…</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-red-50/40 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Fecha y hora</th>
                <th className="px-4 py-3">Acción</th>
                <th className="px-4 py-3">Tabla</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No hay registros de auditoría.</td></tr>
              ) : logs.map((l) => (
                <tr key={l.idAuditoria} className="border-t hover:bg-red-50/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{l.idAuditoria}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{l.fechaHora}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ACCION_COLOR[l.accion] ?? 'bg-gray-100 text-gray-600'}`}>{l.accion}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{l.tablaAfectada}</td>
                  <td className="px-4 py-3 text-gray-600">{l.usuario}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{l.ipOrigen ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{l.detalle ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
