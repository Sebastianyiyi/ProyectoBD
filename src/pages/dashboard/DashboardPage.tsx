import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

// Tipos extraídos exactamente de tu backend
type DashboardSummary = {
  totalArticulos: number;
  disponibles: number;
  prestados: number;
  vencidos: number;
  enMantenimiento: number;
};

type CategoriaInventario = { categoria: string; total: string };
type EstadoInventario = { estado: string; total: string };
type CostosMantenimiento = { costoTotal: string; totalMantenimientos: string; costoPromedio: string };

export default function DashboardPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categorias, setCategorias] = useState<CategoriaInventario[]>([]);
  const [estadoEquipos, setEstadoEquipos] = useState<EstadoInventario[]>([]);
  const [costos, setCostos] = useState<CostosMantenimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError('');
        // Tu endpoint correcto
        const [resSummary, resInventario, resMantenimientos] = await Promise.all([
          api.get<DashboardSummary>('/dashboard/summary'),
          api.get('/reportes/inventario'),
          api.get('/reportes/mantenimientos')
        ]);
        setSummary(resSummary.data);
        setCategorias(resInventario.data.porCategoria || []);
        setEstadoEquipos(resInventario.data.porEstado || []);
        setCostos(resMantenimientos.data.costoTotal || null);
      } catch (err) {
        console.error('Error al cargar dashboard:', err);
        setError('No se pudo conectar con la base de datos para obtener las estadísticas.');
      } finally {
        setLoading(false);
      }
    };

    void fetchSummary();
  }, []);

  return (
    <div className="p-6 space-y-8 bg-white min-h-full animate-in fade-in duration-500">
      {/* Encabezado de Bienvenida */}
      <div className="relative overflow-hidden flex flex-col gap-2 rounded-3xl bg-gradient-to-br from-[#99182a] via-[#be1e34] to-[#d7263d] p-8 text-white shadow-xl shadow-red-900/10">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />
        
        <h1 className="relative z-10 text-4xl font-extrabold tracking-tight drop-shadow-sm">
          ¡Hola, {usuario?.nombres || 'Administrador'}! 👋
        </h1>
        <p className="relative z-10 text-red-50 max-w-2xl text-lg mt-2 font-medium opacity-90 drop-shadow-sm">
          Bienvenido al Sistema de Gestión de Inventario y Préstamos de Laboratorios (FISEI).
          Aquí tienes un resumen en tiempo real del estado de los activos tecnológicos.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {/* Tarjetas de Indicadores (KPIs) conectadas a tu BD - 5 Columnas */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total de Equipos"
          value={loading ? '...' : summary?.totalArticulos ?? 0}
          subtitle="Registrados"
          color="bg-blue-50 text-blue-700 border-blue-200"
          icon="💻"
        />
        <StatCard
          title="Disponibles"
          value={loading ? '...' : summary?.disponibles ?? 0}
          subtitle="Listos para uso"
          color="bg-emerald-50 text-emerald-700 border-emerald-200"
          icon="✅"
        />
        <StatCard
          title="Prestados"
          value={loading ? '...' : summary?.prestados ?? 0}
          subtitle="En laboratorios"
          color="bg-amber-50 text-amber-700 border-amber-200"
          icon="⏱️"
        />
        <StatCard
          title="Vencidos"
          value={loading ? '...' : summary?.vencidos ?? 0}
          subtitle="Devolución retrasada"
          color="bg-red-100 text-red-800 border-red-300"
          icon="⚠️"
        />
        <StatCard
          title="En Mantenimiento"
          value={loading ? '...' : summary?.enMantenimiento ?? 0}
          subtitle="Reparación técnica"
          color="bg-purple-50 text-purple-700 border-purple-200"
          icon="🔧"
        />
      </div>

      {/* Sección de Gráficos */}
      {!loading && (
        <div className="grid gap-6 lg:grid-cols-3 mt-8">
          <div className="rounded-3xl border bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Equipos por Categoría</h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {categorias.length === 0 ? (
                <div className="w-full text-center text-gray-400 mt-20">No hay datos de categorías</div>
              ) : (
                categorias.map((c, i) => {
                  const max = Math.max(...categorias.map(x => Number(x.total)), 1);
                  const height = (Number(c.total) / max) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center justify-end flex-1 h-full group">
                      <div className="text-xs font-bold text-gray-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">{c.total}</div>
                      <div 
                        className="w-full bg-[#be1e34] rounded-t-md transition-all duration-500 group-hover:bg-[#99182a]"
                        style={{ height: `${height}%`, minHeight: '4px' }}
                      />
                      <div className="text-[10px] font-semibold text-gray-500 mt-2 rotate-45 origin-left truncate w-12">{c.categoria}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border bg-white p-6 shadow-sm flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Estado del Inventario</h2>
              <div className="space-y-4 mt-6">
                {estadoEquipos.length === 0 ? (
                  <div className="w-full text-center text-gray-400 mt-10">No hay datos</div>
                ) : (
                  estadoEquipos.map((e, i) => {
                    const max = Math.max(...estadoEquipos.map(x => Number(x.total)), 1);
                    const width = (Number(e.total) / max) * 100;
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-20 text-xs font-semibold text-gray-600 truncate">{e.estado}</div>
                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden flex items-center">
                          <div 
                            className="h-full bg-gradient-to-r from-[#d7263d] to-[#be1e34] rounded-full transition-all duration-1000"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                        <div className="w-6 text-right text-sm font-bold text-gray-700">{e.total}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-3xl border bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm border-green-100">
              <h2 className="text-lg font-bold text-green-900 mb-2">Costos de Mantenimiento</h2>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-green-700">${costos?.costoTotal || '0.00'}</p>
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mt-1">Inversión Total</p>
              </div>
              <div className="mt-4 flex justify-between items-center text-sm font-medium text-green-800">
                <span>Promedio: ${Number(costos?.costoPromedio || 0).toFixed(2)}</span>
                <span>{costos?.totalMantenimientos || 0} Registros</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accesos Rápidos */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Accesos Rápidos</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <QuickActionCard
            title="Inventario"
            desc="Ingresa un equipo nuevo o busca activos existentes."
            link="/inventario"
            btnText="Ir a Inventario"
          />
          <QuickActionCard
            title="Préstamos"
            desc="Gestiona las solicitudes, entregas y devoluciones."
            link="/prestamos"
            btnText="Ir a Préstamos"
          />
          <QuickActionCard
            title="Reportes"
            desc="Exporta la información para auditoría de la FISEI."
            link="/reportes"
            btnText="Ir a Reportes"
          />
        </div>
      </div>
    </div>
  );
}

// Componentes UI Auxiliares
function StatCard({ title, value, subtitle, color, icon }: { title: string, value: string | number, subtitle: string, color: string, icon: string }) {
  return (
    <div className={`group rounded-3xl border p-5 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden bg-white`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${color.split(' ')[0]}`} />
      <div className="relative z-10 flex justify-between items-start">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">{title}</h3>
        <span className="text-xl drop-shadow-sm transition-transform duration-300 group-hover:scale-110">{icon}</span>
      </div>
      <div className="relative z-10 mt-4">
        <p className={`text-4xl font-extrabold tracking-tight ${color.includes('text-') ? color.match(/text-[a-z]+-[0-9]+/)?.[0] : 'text-gray-900'}`}>{value}</p>
        <p className="text-xs mt-1 font-semibold text-gray-400 uppercase tracking-wide">{subtitle}</p>
      </div>
    </div>
  );
}

function QuickActionCard({ title, desc, link, btnText }: { title: string, desc: string, link: string, btnText: string }) {
  return (
    <div className="group rounded-3xl border bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-300 hover:border-red-200">
      <div>
        <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-[#be1e34]">{title}</h3>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">{desc}</p>
      </div>
      <a
        href={link}
        className="mt-6 inline-block w-full rounded-2xl bg-gray-50 px-4 py-2.5 border border-gray-100 text-center text-sm font-bold text-gray-700 hover:bg-[#fff1f3] hover:text-[#be1e34] hover:border-[#ffcdd5] transition-all duration-200 shadow-sm hover:shadow"
      >
        {btnText}
      </a>
    </div>
  );
}