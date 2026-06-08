import React, { useEffect, useMemo, useState } from 'react';
import { getDispositivosAdmin } from '../../services/inventario.service';
import { DispositivoAdmin } from '../../types/dispositivo-admin';

export default function InventarioPage() {
  const [dispositivos, setDispositivos] = useState<DispositivoAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [categoria, setCategoria] = useState('');
  const [ubicacion, setUbicacion] = useState('');

  useEffect(() => {
    const cargarDispositivos = async () => {
      try {
        const data = await getDispositivosAdmin();
        setDispositivos(data);
      } catch (error) {
        console.error('Error al cargar inventario:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDispositivos();
  }, []);

  const estados = useMemo(
    () => [...new Set(dispositivos.map((d) => d.estado))],
    [dispositivos]
  );

  const categorias = useMemo(
    () => [...new Set(dispositivos.map((d) => d.categoria))],
    [dispositivos]
  );

  const ubicaciones = useMemo(
    () => [...new Set(dispositivos.map((d) => d.ubicacion))],
    [dispositivos]
  );

  const filtrados = useMemo(() => {
    return dispositivos.filter((d) => {
      const texto = busqueda.toLowerCase();

      const coincideTexto =
        d.codigoInstitucional.toLowerCase().includes(texto) ||
        d.nombre.toLowerCase().includes(texto) ||
        d.categoria.toLowerCase().includes(texto) ||
        d.ubicacion.toLowerCase().includes(texto) ||
        (d.responsable ?? '').toLowerCase().includes(texto);

      const coincideEstado = !estado || d.estado === estado;
      const coincideCategoria = !categoria || d.categoria === categoria;
      const coincideUbicacion = !ubicacion || d.ubicacion === ubicacion;

      return coincideTexto && coincideEstado && coincideCategoria && coincideUbicacion;
    });
  }, [dispositivos, busqueda, estado, categoria, ubicacion]);

  if (loading) {
    return <div style={{ padding: '24px' }}>Cargando inventario...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '20px' }}>Inventario de dispositivos</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <input
          type="text"
          placeholder="Buscar por código, nombre, responsable..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={inputStyle}
        />

        <select value={estado} onChange={(e) => setEstado(e.target.value)} style={inputStyle}>
          <option value="">Todos los estados</option>
          {estados.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={inputStyle}>
          <option value="">Todas las categorías</option>
          {categorias.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} style={inputStyle}>
          <option value="">Todas las ubicaciones</option>
          {ubicaciones.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Código</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Categoría</th>
              <th style={thStyle}>Ubicación</th>
              <th style={thStyle}>Responsable</th>
              <th style={thStyle}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((item) => (
              <tr key={item.idArticulo}>
                <td style={tdStyle}>{item.codigoInstitucional}</td>
                <td style={tdStyle}>{item.nombre}</td>
                <td style={tdStyle}>{item.categoria}</td>
                <td style={tdStyle}>{item.ubicacion}</td>
                <td style={tdStyle}>{item.responsable ?? 'Sin responsable'}</td>
                <td style={tdStyle}>{item.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '10px',
  border: '1px solid #ccc',
  borderRadius: '8px',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px',
  borderBottom: '1px solid #ddd',
  backgroundColor: '#f5f5f5',
};

const tdStyle: React.CSSProperties = {
  padding: '12px',
  borderBottom: '1px solid #eee',
};