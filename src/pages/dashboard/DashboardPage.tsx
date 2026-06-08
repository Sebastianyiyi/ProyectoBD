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

export default function DashboardPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError('');
        // Tu endpoint correcto
        const response = await api.get<DashboardSummary>('/dashboard/summary');
        setSummary(response.data);
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
      <div className="flex flex-col gap-2 rounded-3xl bg-gradient-to-r from-red-700 to-red-900 p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold tracking-tight">
          ¡Hola, {usuario?.nombres || 'Administrador'}! 👋
        </h1>
        <p className="text-red-100 max-w-2xl text-lg mt-2">
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
    <div className={`rounded-2xl border p-5 shadow-sm flex flex-col justify-between transition-transform hover:scale-105 ${color}`}>
      <div className="flex justify-between items-start">
        <h3 className="text-xs font-bold uppercase tracking-wider opacity-80">{title}</h3>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="mt-3">
        <p className="text-4xl font-extrabold">{value}</p>
        <p className="text-xs mt-1 font-medium opacity-80">{subtitle}</p>
      </div>
    </div>
  );
}

function QuickActionCard({ title, desc, link, btnText }: { title: string, desc: string, link: string, btnText: string }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <h3 className="text-lg font-bold text-[var(--app-text)]">{title}</h3>
        <p className="text-sm text-gray-500 mt-2">{desc}</p>
      </div>
      <a
        href={link}
        className="mt-4 inline-block w-full rounded-xl bg-gray-50 px-4 py-2 border text-center text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
      >
        {btnText}
      </a>
    </div>
  );
}