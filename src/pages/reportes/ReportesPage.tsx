import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type ResumenInventario = {
  porCategoria: { categoria: string; total: number }[];
  porEstado: { estado: string; total: number }[];
  porUbicacion: { ubicacion: string; total: number }[];
  articulosVencidos: { nombreArticulo: string; codigo: string; solicitante: string; fechaPrevistaDevolucion: string; estado: string }[];
};

type ResumenPrestamos = {
  porEstado: { estado: string; total: number }[];
  porMes: { mes: string; total: number }[];
  topSolicitantes: { solicitante: string; correo: string; totalPrestamos: number }[];
};

type ResumenMantenimientos = {
  porTipo: { tipo: string; total: number }[];
  porEstado: { estado: string; total: number }[];
  costoTotal: { costoTotal: number; totalMantenimientos: number; costoPromedio: number };
  proximosMantenimientos: { nombreArticulo: string; codigo: string; tecnico: string; proximoMantenimiento: string }[];
};

type Tab = 'inventario' | 'prestamos' | 'mantenimientos';

function exportCSV(filename: string, rows: object[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((r) =>
      headers.map((h) => {
        const val = String((r as Record<string, unknown>)[h] ?? '');
        return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',')
    ),
  ].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: '#f3dfe3' }}>
      <p className="text-sm text-[var(--fisei-red-600)]">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-[var(--fisei-red-700)]">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-red-50/40 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            {headers.map((h) => <th key={h} className="px-4 py-3">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length} className="px-4 py-8 text-center text-gray-400">Sin datos</td></tr>
          ) : rows.map((r, i) => (
            <tr key={i} className="border-t hover:bg-red-50/20 transition-colors">
              {r.map((cell, j) => <td key={j} className="px-4 py-3">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ReportesPage() {
  const [tab, setTab] = useState<Tab>('inventario');
  const [invData, setInvData] = useState<ResumenInventario | null>(null);
  const [preData, setPreData] = useState<ResumenPrestamos | null>(null);
  const [manData, setManData] = useState<ResumenMantenimientos | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        if (tab === 'inventario' && !invData) {
          const r = await api.get<ResumenInventario>('/reportes/inventario');
          setInvData(r.data);
        } else if (tab === 'prestamos' && !preData) {
          const r = await api.get<ResumenPrestamos>('/reportes/prestamos');
          setPreData(r.data);
        } else if (tab === 'mantenimientos' && !manData) {
          const r = await api.get<ResumenMantenimientos>('/reportes/mantenimientos');
          setManData(r.data);
        }
      } catch { /* noop */ }
      finally { setLoading(false); }
    };
    void cargar();
  }, [tab]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'inventario', label: '📦 Inventario' },
    { key: 'prestamos', label: '📋 Préstamos' },
    { key: 'mantenimientos', label: '🔧 Mantenimientos' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--app-text)]">Reportes</h1>
        <p className="mt-1 text-sm text-[var(--fisei-red-600)]">Resúmenes estadísticos y exportación de datos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            id={`tab-reporte-${t.key}`}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${tab === t.key ? 'border-[var(--fisei-red-600)] text-[var(--fisei-red-600)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div className="py-12 text-center text-sm text-gray-400">Cargando reporte…</div>}

      {/* Inventario */}
      {tab === 'inventario' && invData && !loading && (
        <div className="space-y-6">
          {/* Estadísticas por estado */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[var(--app-text)]">Por estado</h2>
              <button onClick={() => exportCSV('reporte_inventario_estados.csv', invData.porEstado)} className="rounded-xl border px-3 py-1.5 text-xs font-medium text-[var(--fisei-red-600)] hover:bg-red-50 transition">↓ Exportar CSV</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
              {invData.porEstado.map((row) => (
                <StatCard key={row.estado} label={row.estado} value={row.total} />
              ))}
            </div>
          </div>

          {/* Por categoría */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[var(--app-text)]">Por categoría</h2>
              <button onClick={() => exportCSV('reporte_inventario_categorias.csv', invData.porCategoria)} className="rounded-xl border px-3 py-1.5 text-xs font-medium text-[var(--fisei-red-600)] hover:bg-red-50 transition">↓ Exportar CSV</button>
            </div>
            <SimpleTable headers={['Categoría', 'Total']} rows={invData.porCategoria.map((r) => [r.categoria, r.total])} />
          </div>

          {/* Por ubicación */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[var(--app-text)]">Por ubicación</h2>
              <button onClick={() => exportCSV('reporte_inventario_ubicaciones.csv', invData.porUbicacion)} className="rounded-xl border px-3 py-1.5 text-xs font-medium text-[var(--fisei-red-600)] hover:bg-red-50 transition">↓ Exportar CSV</button>
            </div>
            <SimpleTable headers={['Ubicación', 'Total']} rows={invData.porUbicacion.map((r) => [r.ubicacion, r.total])} />
          </div>

          {/* Artículos vencidos */}
          {invData.articulosVencidos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-red-600">⚠️ Préstamos vencidos sin devolución</h2>
                <button onClick={() => exportCSV('reporte_prestamos_vencidos.csv', invData.articulosVencidos)} className="rounded-xl border px-3 py-1.5 text-xs font-medium text-[var(--fisei-red-600)] hover:bg-red-50 transition">↓ Exportar CSV</button>
              </div>
              <SimpleTable
                headers={['Artículo', 'Código', 'Solicitante', 'Fecha prevista devolución', 'Estado']}
                rows={invData.articulosVencidos.map((r) => [r.nombreArticulo, r.codigo, r.solicitante, r.fechaPrevistaDevolucion, r.estado])}
              />
            </div>
          )}
        </div>
      )}

      {/* Préstamos */}
      {tab === 'prestamos' && preData && !loading && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[var(--app-text)]">Por estado</h2>
              <button onClick={() => exportCSV('reporte_prestamos_estados.csv', preData.porEstado)} className="rounded-xl border px-3 py-1.5 text-xs font-medium text-[var(--fisei-red-600)] hover:bg-red-50 transition">↓ Exportar CSV</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
              {preData.porEstado.map((row) => (
                <StatCard key={row.estado} label={row.estado} value={row.total} />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[var(--app-text)]">Actividad mensual (últimos 12 meses)</h2>
              <button onClick={() => exportCSV('reporte_prestamos_mensual.csv', preData.porMes)} className="rounded-xl border px-3 py-1.5 text-xs font-medium text-[var(--fisei-red-600)] hover:bg-red-50 transition">↓ Exportar CSV</button>
            </div>
            <SimpleTable headers={['Mes', 'Total préstamos']} rows={preData.porMes.map((r) => [r.mes, r.total])} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[var(--app-text)]">Top 10 solicitantes</h2>
              <button onClick={() => exportCSV('reporte_top_solicitantes.csv', preData.topSolicitantes)} className="rounded-xl border px-3 py-1.5 text-xs font-medium text-[var(--fisei-red-600)] hover:bg-red-50 transition">↓ Exportar CSV</button>
            </div>
            <SimpleTable
              headers={['Solicitante', 'Correo', 'Total préstamos']}
              rows={preData.topSolicitantes.map((r) => [r.solicitante, r.correo, r.totalPrestamos])}
            />
          </div>
        </div>
      )}

      {/* Mantenimientos */}
      {tab === 'mantenimientos' && manData && !loading && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Total mantenimientos" value={manData.costoTotal.totalMantenimientos} />
            <StatCard label="Costo total" value={`$${Number(manData.costoTotal.costoTotal).toFixed(2)}`} />
            <StatCard label="Costo promedio" value={`$${Number(manData.costoTotal.costoPromedio).toFixed(2)}`} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[var(--app-text)]">Por tipo</h2>
              <button onClick={() => exportCSV('reporte_mantenimientos_tipos.csv', manData.porTipo)} className="rounded-xl border px-3 py-1.5 text-xs font-medium text-[var(--fisei-red-600)] hover:bg-red-50 transition">↓ Exportar CSV</button>
            </div>
            <SimpleTable headers={['Tipo', 'Total']} rows={manData.porTipo.map((r) => [r.tipo, r.total])} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[var(--app-text)]">Por estado</h2>
            </div>
            <SimpleTable headers={['Estado', 'Total']} rows={manData.porEstado.map((r) => [r.estado, r.total])} />
          </div>

          {manData.proximosMantenimientos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-[var(--app-text)]">📅 Próximos mantenimientos</h2>
                <button onClick={() => exportCSV('reporte_proximos_mantenimientos.csv', manData.proximosMantenimientos)} className="rounded-xl border px-3 py-1.5 text-xs font-medium text-[var(--fisei-red-600)] hover:bg-red-50 transition">↓ Exportar CSV</button>
              </div>
              <SimpleTable
                headers={['Artículo', 'Código', 'Técnico', 'Fecha programada']}
                rows={manData.proximosMantenimientos.map((r) => [r.nombreArticulo, r.codigo, r.tecnico ?? '—', r.proximoMantenimiento])}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}