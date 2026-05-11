import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type DashboardSummary = {
  totalArticulos: number;
  disponibles: number;
  prestados: number;
  vencidos: number;
  enMantenimiento: number;
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get<DashboardSummary>('/dashboard/summary');
        setSummary(response.data);
      } catch (error) {
        console.error('Error al cargar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <div className="p-6">Cargando dashboard...</div>;
  }

  if (!summary) {
    return <div className="p-6">No se pudo cargar la información.</div>;
  }

  const cards = [
    { title: 'Total artículos', value: summary.totalArticulos },
    { title: 'Disponibles', value: summary.disponibles },
    { title: 'Prestados', value: summary.prestados },
    { title: 'Vencidos', value: summary.vencidos },
    { title: 'En mantenimiento', value: summary.enMantenimiento },
  ];

  return (
    <div className="p-6 space-y-6 bg-white min-h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--app-text)]">
          Dashboard
        </h1>
        <p className="mt-1 text-[var(--fisei-red-600)]">
          Resumen general del inventario tecnológico
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-3xl border p-5"
            style={{
              background: '#fffdfa',
              borderColor: '#f3dfe3',
              boxShadow: '0 8px 24px rgba(190, 30, 52, 0.045)',
            }}
          >
            <p className="text-sm text-[var(--fisei-red-600)]">{card.title}</p>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-[var(--fisei-red-700)]">
              {card.value}
            </h2>
          </div>
        ))}
      </div>
    </div>
  )
}