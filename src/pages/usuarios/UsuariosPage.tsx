import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Usuario = {
  id_usuario: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  id_rol: number;
  id_estado_usuario: number;
};

type CatItem = { id: number; nombre: string };

const ROL_COLOR: Record<number, string> = {
  1: 'bg-purple-100 text-purple-700 border-purple-200',
  2: 'bg-blue-100 text-blue-700 border-blue-200',
  3: 'bg-gray-100 text-gray-600 border-gray-200',
};

const ESTADO_COLOR: Record<number, string> = {
  1: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  2: 'bg-red-100 text-red-700 border-red-200',
};

const inputCls = 'w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--fisei-red-200)] outline-none';
const selectCls = 'w-full rounded-xl border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--fisei-red-200)] outline-none';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<CatItem[]>([]);
  const [estadosU, setEstadosU] = useState<CatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [fCedula, setFCedula] = useState('');
  const [fNombres, setFNombres] = useState('');
  const [fApellidos, setFApellidos] = useState('');
  const [fCorreo, setFCorreo] = useState('');
  const [fTelefono, setFTelefono] = useState('');
  const [fRol, setFRol] = useState('');
  const [fEstado, setFEstado] = useState('');
  const [formError, setFormError] = useState('');

  const rolMap = new Map(roles.map((r) => [r.id, r.nombre]));
  const estadoMap = new Map(estadosU.map((e) => [e.id, e.nombre]));

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Usuario[]>('/usuarios', {
        params: {
          busqueda: busqueda || undefined,
          id_rol: filtroRol || undefined,
        },
      });
      setUsuarios(res.data);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [busqueda, filtroRol]);

  useEffect(() => { void cargar(); }, [cargar]);

  useEffect(() => {
    Promise.all([
      api.get<CatItem[]>('/catalogos/roles'),
      api.get<CatItem[]>('/catalogos/estados-usuario'),
    ]).then(([r, e]) => { setRoles(r.data); setEstadosU(e.data); }).catch(console.error);
  }, []);

  const abrirNuevo = () => {
    setEditId(null);
    setFCedula(''); setFNombres(''); setFApellidos('');
    setFCorreo(''); setFTelefono(''); setFRol(''); setFEstado('');
    setFormError('');
    setShowModal(true);
  };

  const abrirEditar = (u: Usuario) => {
    setEditId(u.id_usuario);
    setFCedula(u.cedula); setFNombres(u.nombres); setFApellidos(u.apellidos);
    setFCorreo(u.correo); setFTelefono(u.telefono ?? '');
    setFRol(String(u.id_rol)); setFEstado(String(u.id_estado_usuario));
    setFormError('');
    setShowModal(true);
  };

  const guardar = async () => {
    if (!fNombres || !fApellidos || !fCorreo || !fRol || !fEstado) {
      setFormError('Nombres, apellidos, correo, rol y estado son obligatorios');
      return;
    }
    setFormError('');
    setActionLoading(true);
    try {
      if (editId) {
        await api.patch(`/usuarios/${editId}`, {
          nombres: fNombres, apellidos: fApellidos,
          correo: fCorreo, telefono: fTelefono || undefined,
          id_rol: Number(fRol), id_estado_usuario: Number(fEstado),
        });
      } else {
        if (!fCedula) { setFormError('Cédula es obligatoria'); return; }
        await api.post('/usuarios', {
          cedula: fCedula, nombres: fNombres, apellidos: fApellidos,
          correo: fCorreo, telefono: fTelefono || undefined,
          id_rol: Number(fRol), id_estado_usuario: Number(fEstado),
        });
      }
      setShowModal(false);
      await cargar();
    } catch { setFormError('Error al guardar usuario. Verificá los datos.'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--app-text)]">Usuarios</h1>
          <p className="mt-1 text-sm text-[var(--fisei-red-600)]">Gestión de usuarios del sistema</p>
        </div>
        <button id="btn-nuevo-usuario" onClick={abrirNuevo} className="flex items-center gap-2 rounded-xl bg-[var(--fisei-red-600)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--fisei-red-700)] active:scale-95">
          + Nuevo usuario
        </button>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm flex flex-wrap gap-3">
        <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre, cédula o correo…" className="h-10 flex-1 min-w-[200px] rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--fisei-red-200)]" />
        <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)} className="h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--fisei-red-200)]">
          <option value="">Todos los roles</option>
          {roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
        </select>
        <button onClick={() => { setBusqueda(''); setFiltroRol(''); }} className="h-10 rounded-xl border px-4 text-sm text-gray-600 hover:bg-gray-50 transition">Limpiar</button>
      </div>

      {loading ? (
        <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-500">Cargando usuarios…</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-red-50/40 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Cédula</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No hay usuarios registrados.</td></tr>
              ) : usuarios.map((u) => (
                <tr key={u.id_usuario} className="border-t hover:bg-red-50/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{u.id_usuario}</td>
                  <td className="px-4 py-3 font-mono text-xs">{u.cedula}</td>
                  <td className="px-4 py-3 font-medium">{u.apellidos}, {u.nombres}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{u.correo}</td>
                  <td className="px-4 py-3 text-gray-500">{u.telefono ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${ROL_COLOR[u.id_rol] ?? 'bg-gray-100 text-gray-600'}`}>
                      {rolMap.get(u.id_rol) ?? `Rol ${u.id_rol}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${ESTADO_COLOR[u.id_estado_usuario] ?? 'bg-gray-100 text-gray-600'}`}>
                      {estadoMap.get(u.id_estado_usuario) ?? `Est. ${u.id_estado_usuario}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => abrirEditar(u)} className="rounded-lg bg-[var(--fisei-red-600)] px-2 py-1 text-xs font-medium text-white hover:opacity-80 transition">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--app-text)]">{editId ? 'Editar usuario' : 'Nuevo usuario'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            {formError && <p className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{formError}</p>}
            <div className="space-y-4">
              {!editId && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Cédula *</label>
                  <input type="text" value={fCedula} onChange={(e) => setFCedula(e.target.value)} maxLength={13} className={inputCls} placeholder="1234567890" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nombres *</label>
                  <input type="text" value={fNombres} onChange={(e) => setFNombres(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Apellidos *</label>
                  <input type="text" value={fApellidos} onChange={(e) => setFApellidos(e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Correo *</label>
                <input type="email" value={fCorreo} onChange={(e) => setFCorreo(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
                <input type="text" value={fTelefono} onChange={(e) => setFTelefono(e.target.value)} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Rol *</label>
                  <select value={fRol} onChange={(e) => setFRol(e.target.value)} className={selectCls}>
                    <option value="">Seleccioná</option>
                    {roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Estado *</label>
                  <select value={fEstado} onChange={(e) => setFEstado(e.target.value)} className={selectCls}>
                    <option value="">Seleccioná</option>
                    {estadosU.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="rounded-xl border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
              <button onClick={guardar} disabled={actionLoading} className="rounded-xl bg-[var(--fisei-red-600)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--fisei-red-700)] disabled:opacity-60 transition">
                {actionLoading ? 'Guardando…' : editId ? 'Guardar cambios' : 'Crear usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}