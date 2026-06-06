import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Ubicacion = {
  id_ubicacion: number;
  nombre: string;
  tipo_ubicacion: string | null;
  bloque: string | null;
  piso: string | null;
  descripcion: string | null;
  id_departamento: number;
};

type Departamento = { id: number; nombre: string };

const inputCls = 'w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--fisei-red-200)] outline-none';
const selectCls = 'w-full rounded-xl border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--fisei-red-200)] outline-none';

export default function UbicacionesPage() {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [fNombre, setFNombre] = useState('');
  const [fTipo, setFTipo] = useState('');
  const [fBloque, setFBloque] = useState('');
  const [fPiso, setFPiso] = useState('');
  const [fDescripcion, setFDescripcion] = useState('');
  const [fDepartamento, setFDepartamento] = useState('');
  const [formError, setFormError] = useState('');

  const deptMap = new Map(departamentos.map((d) => [d.id, d.nombre]));

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Ubicacion[]>('/ubicaciones');
      setUbicaciones(res.data);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  useEffect(() => {
    api.get<Departamento[]>('/catalogos/departamentos').then((r) => setDepartamentos(r.data)).catch(console.error);
  }, []);

  const abrirNuevo = () => {
    setEditId(null);
    setFNombre(''); setFTipo(''); setFBloque(''); setFPiso(''); setFDescripcion(''); setFDepartamento('');
    setFormError('');
    setShowModal(true);
  };

  const abrirEditar = (u: Ubicacion) => {
    setEditId(u.id_ubicacion);
    setFNombre(u.nombre); setFTipo(u.tipo_ubicacion ?? ''); setFBloque(u.bloque ?? '');
    setFPiso(u.piso ?? ''); setFDescripcion(u.descripcion ?? '');
    setFDepartamento(String(u.id_departamento));
    setFormError('');
    setShowModal(true);
  };

  const guardar = async () => {
    if (!fNombre || !fDepartamento) { setFormError('Nombre y departamento son obligatorios'); return; }
    setFormError('');
    setActionLoading(true);
    try {
      const body = {
        nombre: fNombre,
        tipo_ubicacion: fTipo || undefined,
        bloque: fBloque || undefined,
        piso: fPiso || undefined,
        descripcion: fDescripcion || undefined,
        id_departamento: Number(fDepartamento),
      };
      if (editId) {
        await api.patch(`/ubicaciones/${editId}`, body);
      } else {
        await api.post('/ubicaciones', body);
      }
      setShowModal(false);
      await cargar();
    } catch { setFormError('Error al guardar ubicación.'); }
    finally { setActionLoading(false); }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta ubicación? Solo es posible si no tiene artículos asignados.')) return;
    try {
      await api.delete(`/ubicaciones/${id}`);
      await cargar();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message ?? 'Error al eliminar ubicación.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--app-text)]">Ubicaciones</h1>
          <p className="mt-1 text-sm text-[var(--fisei-red-600)]">Gestión de aulas, laboratorios y espacios físicos</p>
        </div>
        <button id="btn-nueva-ubicacion" onClick={abrirNuevo} className="flex items-center gap-2 rounded-xl bg-[var(--fisei-red-600)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--fisei-red-700)] active:scale-95">
          + Nueva ubicación
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-500">Cargando ubicaciones…</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ubicaciones.length === 0 ? (
            <p className="col-span-3 py-10 text-center text-gray-400">No hay ubicaciones registradas.</p>
          ) : ubicaciones.map((u) => (
            <div key={u.id_ubicacion} className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: '#f3dfe3' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-[var(--app-text)]">{u.nombre}</p>
                  <p className="text-xs text-[var(--fisei-red-600)] mt-0.5">
                    {[u.tipo_ubicacion, u.bloque && `Bloque ${u.bloque}`, u.piso && `Piso ${u.piso}`].filter(Boolean).join(' · ') || 'Sin detalle'}
                  </p>
                </div>
                <span className="rounded-full bg-red-50 border border-red-100 px-2 py-0.5 text-xs font-medium text-[var(--fisei-red-700)]">
                  {deptMap.get(u.id_departamento) ?? `Dpto. ${u.id_departamento}`}
                </span>
              </div>
              {u.descripcion && <p className="mt-2 text-xs text-gray-400 line-clamp-2">{u.descripcion}</p>}
              <div className="mt-4 flex gap-2">
                <button onClick={() => abrirEditar(u)} className="flex-1 rounded-xl border py-1.5 text-xs font-medium text-[var(--fisei-red-600)] hover:bg-red-50 transition">Editar</button>
                <button onClick={() => eliminar(u.id_ubicacion)} className="rounded-xl border border-red-200 py-1.5 px-3 text-xs font-medium text-red-500 hover:bg-red-50 transition">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--app-text)]">{editId ? 'Editar ubicación' : 'Nueva ubicación'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            {formError && <p className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{formError}</p>}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nombre *</label>
                <input type="text" value={fNombre} onChange={(e) => setFNombre(e.target.value)} className={inputCls} placeholder="Ej: Laboratorio de Redes" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Departamento *</label>
                <select value={fDepartamento} onChange={(e) => setFDepartamento(e.target.value)} className={selectCls}>
                  <option value="">Seleccioná un departamento</option>
                  {departamentos.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Tipo</label>
                  <input type="text" value={fTipo} onChange={(e) => setFTipo(e.target.value)} className={inputCls} placeholder="Laboratorio" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Bloque</label>
                  <input type="text" value={fBloque} onChange={(e) => setFBloque(e.target.value)} className={inputCls} placeholder="A" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Piso</label>
                  <input type="text" value={fPiso} onChange={(e) => setFPiso(e.target.value)} className={inputCls} placeholder="1" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
                <textarea value={fDescripcion} onChange={(e) => setFDescripcion(e.target.value)} rows={2} className={inputCls} />
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="rounded-xl border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
              <button onClick={guardar} disabled={actionLoading} className="rounded-xl bg-[var(--fisei-red-600)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--fisei-red-700)] disabled:opacity-60 transition">
                {actionLoading ? 'Guardando…' : editId ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}