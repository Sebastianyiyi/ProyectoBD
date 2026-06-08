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

// Función robusta para exportar a CSV
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

// Componentes UI Reutilizables
function StatCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon: string }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 text-8xl opacity-5 group-hover:scale-110 transition-transform">{icon}</div>
      <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-2 text-4xl font-extrabold text-red-700">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-2 font-medium">{sub}</p>}
    </div>
  );
}

function SimpleTable({ headers, rows, isWarning = false }: { headers: string[]; rows: (string | number)[][], isWarning?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className={`border-b text-left text-xs font-bold uppercase tracking-wide ${isWarning ? 'bg-red-100 text-red-800' : 'bg-gray-50 text-gray-600'}`}>
            {headers.map((h) => <th key={h} className="px-5 py-4">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y text-gray-700">
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length} className="px-5 py-10 text-center text-gray-400 italic">No hay datos disponibles para este reporte</td></tr>
          ) : rows.map((r, i) => (
            <tr key={i} className={`transition-colors ${isWarning ? 'hover:bg-red-50' : 'hover:bg-gray-50'}`}>
              {r.map((cell, j) => <td key={j} className="px-5 py-3.5">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// NUEVO: Componente para simular gráficos de barras horizontales con Tailwind
function VisualBarChart({ data, title, labelKey, valKey }: { data: any[], title: string, labelKey: string, valKey: string }) {
  const maxVal = Math.max(...data.map(d => Number(d[valKey])), 1); // Evitar división por cero

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{title}</h3>
      <div className="space-y-4">
        {data.length === 0 ? (
          <p className="text-sm text-gray-400">Sin datos para graficar.</p>
        ) : data.map((item, i) => {
          const percentage = (Number(item[valKey]) / maxVal) * 100;
          return (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{item[labelKey]}</span>
                <span className="font-bold text-gray-900">{item[valKey]}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-600 transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ReportesPage() {
  const [tab, setTab] = useState<Tab>('inventario');
  const [invData, setInvData] = useState<ResumenInventario | null>(null);
  const [preData, setPreData] = useState<ResumenPrestamos | null>(null);
  const [manData, setManData] = useState<ResumenMantenimientos | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      setError('');
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
      } catch (err) {
        console.error("Error al cargar el reporte", err);
        setError('No se pudieron obtener los datos del servidor. Verifica la conexión a la base de datos Oracle.');
      } finally {
        setLoading(false);
      }
    };
    void cargar();
  }, [tab, invData, preData, manData]);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'inventario', label: 'Inventario de Activos', icon: '📦' },
    { key: 'prestamos', label: 'Historial de Préstamos', icon: '📋' },
    { key: 'mantenimientos', label: 'Mantenimientos Físicos', icon: '🔧' },
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Auditoría y Reportes</h1>
          <p className="mt-1 text-sm text-gray-500">Visualización de KPIs y exportación de datos tabulares consolidados</p>
        </div>
      </div>

      {/* Navegación de Pestañas Estilo Moderno */}
      <div className="flex flex-wrap gap-2 rounded-xl bg-gray-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${tab === t.key
                ? 'bg-white text-red-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-200/50 hover:text-gray-900'
              }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm animate-fade-in">
          {error}
        </div>
      )}

      {loading && !error && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
          <span className="ml-3 text-gray-500 font-medium">Procesando cubos de datos...</span>
        </div>
      )}

      {/* ===== VISTA DE INVENTARIO ===== */}
      {tab === 'inventario' && invData && !loading && !error && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {invData.porEstado.map((row) => (
              <StatCard key={row.estado} label={`Estado: ${row.estado}`} value={row.total} icon="📊" />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Gráfico Visual */}
            <div className="relative">
              <button onClick={() => exportCSV('inventario_categorias.csv', invData.porCategoria)} className="absolute right-4 top-4 rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition">↓ CSV</button>
              <VisualBarChart data={invData.porCategoria} title="Distribución por Categoría" labelKey="categoria" valKey="total" />
            </div>

            {/* Gráfico Visual */}
            <div className="relative">
              <button onClick={() => exportCSV('inventario_ubicaciones.csv', invData.porUbicacion)} className="absolute right-4 top-4 rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition">↓ CSV</button>
              <VisualBarChart data={invData.porUbicacion} title="Equipos por Ubicación" labelKey="ubicacion" valKey="total" />
            </div>
          </div>

          {/* Alerta de Auditoría (Artículos Vencidos) */}
          {invData.articulosVencidos.length > 0 && (
            <div className="rounded-2xl border border-red-200 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between bg-red-50 p-4 border-b border-red-200">
                <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">⚠️ Alerta: Préstamos vencidos sin devolución</h2>
                <button onClick={() => exportCSV('prestamos_vencidos.csv', invData.articulosVencidos)} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition shadow-sm">Descargar Reporte</button>
              </div>
              <SimpleTable
                isWarning={true}
                headers={['Artículo', 'Código Inst.', 'Solicitante Irregular', 'Fecha Límite', 'Estado Actual']}
                rows={invData.articulosVencidos.map((r) => [r.nombreArticulo, r.codigo, r.solicitante, r.fechaPrevistaDevolucion, r.estado])}
              />
            </div>
          )}
        </div>
      )}

      {/* ===== VISTA DE PRÉSTAMOS ===== */}
      {tab === 'prestamos' && preData && !loading && !error && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {preData.porEstado.map((row) => (
              <StatCard key={row.estado} label={`Status: ${row.estado}`} value={row.total} icon="📝" />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Actividad Mensual</h2>
                <button onClick={() => exportCSV('prestamos_mensual.csv', preData.porMes)} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200 transition">↓ Descargar CSV</button>
              </div>
              <SimpleTable headers={['Mes Registrado', 'Cantidad de Préstamos']} rows={preData.porMes.map((r) => [r.mes, r.total])} />
            </div>

            <div className="relative">
              <button onClick={() => exportCSV('top_solicitantes.csv', preData.topSolicitantes)} className="absolute right-4 top-4 rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition">↓ CSV</button>
              <VisualBarChart data={preData.topSolicitantes.slice(0, 5)} title="Top 5 Solicitantes Recurrentes" labelKey="solicitante" valKey="totalPrestamos" />
            </div>
          </div>
        </div>
      )}

      {/* ===== VISTA DE MANTENIMIENTOS ===== */}
      {tab === 'mantenimientos' && manData && !loading && !error && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">

          {/* Tarjetas Financieras */}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Intervenciones" value={manData.costoTotal.totalMantenimientos} icon="⚙️" />
            <StatCard label="Gasto Total en Reparaciones" value={`$${Number(manData.costoTotal.costoTotal).toFixed(2)}`} icon="💵" />
            <StatCard label="Costo Promedio por Equipo" value={`$${Number(manData.costoTotal.costoPromedio).toFixed(2)}`} icon="📈" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="relative">
              <button onClick={() => exportCSV('mantenimientos_tipos.csv', manData.porTipo)} className="absolute right-4 top-4 rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition">↓ CSV</button>
              <VisualBarChart data={manData.porTipo} title="Mantenimientos por Tipo (Preventivo/Correctivo)" labelKey="tipo" valKey="total" />
            </div>

            <div className="relative">
              <button onClick={() => exportCSV('mantenimientos_estados.csv', manData.porEstado)} className="absolute right-4 top-4 rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition">↓ CSV</button>
              <VisualBarChart data={manData.porEstado} title="Estado actual de las reparaciones" labelKey="estado" valKey="total" />
            </div>
          </div>

          {/* Agenda de Mantenimientos Próximos */}
          {manData.proximosMantenimientos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">📅 Cronograma de Próximos Mantenimientos</h2>
                <button onClick={() => exportCSV('proximos_mantenimientos.csv', manData.proximosMantenimientos)} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition shadow-sm">Exportar Cronograma</button>
              </div>
              <SimpleTable
                headers={['Equipo a Revisar', 'Código Inventario', 'Técnico Asignado', 'Fecha Programada']}
                rows={manData.proximosMantenimientos.map((r) => [r.nombreArticulo, r.codigo, r.tecnico ?? 'Sin asignar', r.proximoMantenimiento])}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}