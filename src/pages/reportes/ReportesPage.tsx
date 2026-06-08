import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { Pagination } from '@/components/ui/Pagination';

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

type Auditoria = {
  id_auditoria: number;
  tabla_afectada: string;
  accion: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT' | 'LOGIN' | 'LOGOUT';
  fecha_hora: string;
  ip_origen: string | null;
  detalle: string | null;
  datos_antes: string | null;
  datos_despues: string | null;
  id_usuario: number | null;
  usuario_nombre?: string;
};

const ACCION_COLORS: Record<string, string> = {
  INSERT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  UPDATE: 'bg-blue-100 text-blue-700 border-blue-200',
  DELETE: 'bg-red-100 text-red-700 border-red-200',
  LOGIN: 'bg-purple-100 text-purple-700 border-purple-200',
  LOGOUT: 'bg-gray-100 text-gray-700 border-gray-200',
  SELECT: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

type Tab = 'inventario' | 'prestamos' | 'mantenimientos' | 'auditoria';

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
  const [audiData, setAudiData] = useState<Auditoria[] | null>(null);

  // Filtros y modal de Auditoría
  const [busquedaTabla, setBusquedaTabla] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('');
  const [selectedLog, setSelectedLog] = useState<Auditoria | null>(null);

  // Paginación para Auditoría
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
        } else if (tab === 'auditoria') {
          const r = await api.get<any>('/auditoria', {
            params: { tabla_afectada: busquedaTabla || undefined, accion: filtroAccion || undefined }
          });
          const data = r.data?.value ?? r.data;
          
          if (Array.isArray(data)) {
            const mappedData: Auditoria[] = data.map((item: any) => ({
              id_auditoria: item.idAuditoria || item.id_auditoria,
              tabla_afectada: item.tablaAfectada || item.tabla_afectada,
              accion: item.accion,
              fecha_hora: item.fechaHora || item.fecha_hora,
              ip_origen: item.ipOrigen || item.ip_origen,
              detalle: item.detalle,
              datos_antes: item.datosAntes || item.datos_antes,
              datos_despues: item.datosDespues || item.datos_despues,
              id_usuario: item.idUsuario || item.id_usuario,
              usuario_nombre: item.usuario || item.usuario_nombre
            }));
            setAudiData(mappedData);
          } else {
            setAudiData([]);
          }
        }
      } catch (err) {
        console.error("Error al cargar el reporte", err);
        setError('No se pudieron obtener los datos del servidor. Verifica la conexión a la base de datos Oracle.');
      } finally {
        setLoading(false);
      }
    };
    void cargar();
  }, [tab, invData, preData, manData, busquedaTabla, filtroAccion]);

  const totalPages = Math.ceil((audiData || []).length / itemsPerPage);
  const paginatedAudiData = useMemo(() => {
    if (!audiData) return [];
    const start = (currentPage - 1) * itemsPerPage;
    return audiData.slice(start, start + itemsPerPage);
  }, [audiData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [busquedaTabla, filtroAccion]);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-EC', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'inventario', label: 'Inventario de Activos', icon: '📦' },
    { key: 'prestamos', label: 'Historial de Préstamos', icon: '📋' },
    { key: 'mantenimientos', label: 'Mantenimientos Físicos', icon: '🔧' },
    { key: 'auditoria', label: 'Auditoría del Sistema', icon: '🛡️' },
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reportes y Estadísticas</h1>
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

      {loading && !error && (tab !== 'auditoria' || !audiData) && (
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
                <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">⚠️ Alerta Administrativa: Préstamos vencidos sin devolución</h2>
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

      {/* ===== VISTA DE AUDITORÍA ===== */}
      {tab === 'auditoria' && audiData && !error && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-2xl border bg-white p-5 shadow-sm flex flex-wrap gap-4 items-center">
            <select
              value={busquedaTabla}
              onChange={(e) => setBusquedaTabla(e.target.value)}
              className="h-10 flex-1 min-w-[250px] rounded-xl border bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
            >
              <option value="">Todas las tablas</option>
              <option value="articulo">Artículos</option>
              <option value="prestamo">Préstamos</option>
              <option value="mantenimiento">Mantenimientos</option>
              <option value="movimiento">Movimientos</option>
              <option value="ubicacion">Ubicaciones</option>
              <option value="usuario">Usuarios</option>
            </select>
            <select
              value={filtroAccion}
              onChange={(e) => setFiltroAccion(e.target.value)}
              className="h-10 rounded-xl border bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
            >
              <option value="">Todas las acciones</option>
              <option value="INSERT">INSERT (Creación)</option>
              <option value="UPDATE">UPDATE (Actualización)</option>
              <option value="DELETE">DELETE (Eliminación)</option>
              <option value="LOGIN">LOGIN (Acceso)</option>
            </select>
            <button
              onClick={() => { setBusquedaTabla(''); setFiltroAccion(''); setCurrentPage(1); }}
              className="h-10 rounded-xl border px-5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Limpiar
            </button>
            <button
              onClick={() => exportCSV('auditoria_logs.csv', audiData)}
              className="h-10 rounded-xl bg-gray-900 px-5 text-sm font-medium text-white hover:bg-gray-800 transition"
            >
              Exportar
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
              <span className="ml-3 text-gray-500 font-medium">Filtrando logs de auditoría...</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
              <table className="w-full min-w-[1000px] border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <th className="px-5 py-4">ID</th>
                    <th className="px-5 py-4">Fecha y Hora</th>
                    <th className="px-5 py-4">Usuario (ID)</th>
                    <th className="px-5 py-4">Tabla Afectada</th>
                    <th className="px-5 py-4">Acción</th>
                    <th className="px-5 py-4">IP Origen</th>
                    <th className="px-5 py-4 text-right">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-700">
                  {paginatedAudiData.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-500">No hay registros de auditoría que coincidan.</td></tr>
                  ) : paginatedAudiData.map((log) => (
                    <tr key={log.id_auditoria} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">#{log.id_auditoria}</td>
                      <td className="px-5 py-3 font-medium text-gray-800">{formatearFecha(log.fecha_hora)}</td>
                      <td className="px-5 py-3 text-gray-600">
                        {log.usuario_nombre ? `${log.usuario_nombre} ` : ''}
                        <span className="text-xs text-gray-400 font-mono">({log.id_usuario || 'Sistema'})</span>
                      </td>
                      <td className="px-5 py-3 font-mono text-gray-600">{log.tabla_afectada}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${ACCION_COLORS[log.accion] || ACCION_COLORS.SELECT}`}>
                          {log.accion}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs font-mono">{log.ip_origen || '127.0.0.1'}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => setSelectedLog(log)} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-200 active:scale-95 shadow-sm">Ver Cambios</button>
                      </td>
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
        </div>
      )}

      {/* Modal para ver Detalles y JSON de Cambios */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl border animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Detalle de Transacción #{selectedLog.id_auditoria}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Ejecutado en la tabla <span className="font-mono text-red-600">{selectedLog.tabla_afectada}</span>
                </p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600 transition text-lg">✕</button>
            </div>

            <div className="space-y-4">
              {selectedLog.detalle && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Resumen de la operación</h3>
                  <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-xl border">{selectedLog.detalle}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Datos Anteriores
                  </h3>
                  <pre className="text-xs text-red-800 bg-red-50 p-3 rounded-xl border border-red-100 overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {selectedLog.datos_antes ? JSON.stringify(JSON.parse(selectedLog.datos_antes), null, 2) : 'N/A o No aplica para esta acción.'}
                  </pre>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Datos Nuevos
                  </h3>
                  <pre className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-100 overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {selectedLog.datos_despues ? JSON.stringify(JSON.parse(selectedLog.datos_despues), null, 2) : 'N/A o No aplica para esta acción.'}
                  </pre>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t pt-4">
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-xl bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 shadow-sm"
              >
                Cerrar Detalles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}