import { useEffect, useState } from 'react';
import { getDispositivosAdmin } from '@/services/inventario.service';
import { DispositivoAdmin } from '@/types/dispositivo-admin';

export default function TablaDispositivosAdmin() {
  const [data, setData] = useState<DispositivoAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const result = await getDispositivosAdmin();
        setData(result);
      } catch (error) {
        console.error('Error al cargar dispositivos', error);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  if (loading) return <p>Cargando dispositivos...</p>;

  return (
    <div className="rounded-xl border p-4">
      <h2 className="mb-4 text-xl font-semibold">Dispositivos registrados</h2>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Código</th>
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-left">Categoría</th>
            <th className="p-2 text-left">Ubicación</th>
            <th className="p-2 text-left">Responsable</th>
            <th className="p-2 text-left">Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.idArticulo} className="border-b">
              <td className="p-2">{item.codigoInstitucional}</td>
              <td className="p-2">{item.nombre}</td>
              <td className="p-2">{item.categoria}</td>
              <td className="p-2">{item.ubicacion}</td>
              <td className="p-2">{item.responsable ?? 'Sin responsable'}</td>
              <td className="p-2">{item.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}