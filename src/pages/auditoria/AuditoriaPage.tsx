import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

// Tipos estructurados según la tabla auditoria de tu base de datos
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
  // Si tu backend hace el JOIN, podrías recibir el nombre del usuario
  usuario_nombre?: string;
};

// Colores según la acción
const ACCION_COLORS: Record<string, string> = {
  INSERT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  UPDATE: 'bg-blue-100 text-blue-700 border-blue-200',
  DELETE: 'bg-red-100 text-red-700 border-red-200',
  LOGIN: 'bg-purple-100 text-purple-700 border-purple-200',
  LOGOUT: 'bg-gray-100 text-gray-700 border-gray-200',
  SELECT: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

export default function AuditoriaPage() {
  const [registros, setRegistros] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [busquedaTabla, setBusquedaTabla] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('');

  // Estado para ver detalles (JSON antes/después)
  const [selectedLog, setSelectedLog] = useState<Auditoria | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get<Auditoria[]>('/auditoria', {
        params: {
          tabla: busquedaTabla || undefined,
          accion: filtroAccion || undefined
        }
      });

      setRegistros((response.data as any).value ?? response.data);
    } catch (err) {
      console.error('Error al cargar auditoría:', err);
      setError('No se pudo conectar con la base de datos para cargar los logs de auditoría.');
    } finally {
      setLoading(false);
    }
  }, [busquedaTabla, filtroAccion]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Función para formatear fechas ISO
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-EC', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Auditoría del Sistema</h1>
          <p className="text-sm text-gray-500">
            Registro inmutable de actividades, cambios y accesos en la base de datos.
          </p>
        </div>
        <button
          onClick={() => void fetchData()}
          className="flex items-center justify-center gap-2 rounded-xl border bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-95"
        >
          ↻ Refrescar Logs
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm flex flex-wrap gap-4 items-center">
        <input
          type="text"
          value={busquedaTabla}
          onChange={(e) => setBusquedaTabla(e.target.value)}
          placeholder="Buscar por tabla afectada (ej. articulo, prestamo)..."
          className="h-10 flex-1 min-w-[250px] rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
        />
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
          onClick={() => { setBusquedaTabla(''); setFiltroAccion(''); }}
          className="h-10 rounded-xl border px-5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          Limpiar
        </button>
      </div>

      {/* Tabla de Auditoría */}
      {loading ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
          Cargando logs de transacciones...
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
              {registros.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                    No hay registros de auditoría que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                registros.map((log) => (
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
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-200 active:scale-95 shadow-sm"
                      >
                        Ver Cambios
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
                {/* Datos Antes (Si es UPDATE o DELETE) */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Datos Anteriores
                  </h3>
                  <pre className="text-xs text-red-800 bg-red-50 p-3 rounded-xl border border-red-100 overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {selectedLog.datos_antes ? JSON.stringify(JSON.parse(selectedLog.datos_antes), null, 2) : 'N/A o No aplica para esta acción.'}
                  </pre>
                </div>

                {/* Datos Después (Si es INSERT o UPDATE) */}
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