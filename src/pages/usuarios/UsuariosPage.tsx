import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { api } from '@/lib/api';
import { Pagination } from '@/components/ui/Pagination';

// Tipos basados en la estructura de tu base de datos
type Usuario = {
  id_usuario: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  fecha_registro: string;
  id_rol: number;
  id_estado_usuario: number;
};

type Rol = {
  id: number;
  nombre: string;
  descripcion: string;
};

type EstadoUsuario = {
  id: number;
  nombre: string;
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [estados, setEstados] = useState<EstadoUsuario[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [idRolFiltro, setIdRolFiltro] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para el Modal de Creación
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    cedula: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    id_rol: '',
    id_estado_usuario: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [resUsuarios, resRoles, resEstados] = await Promise.all([
        api.get<Usuario[]>('/usuarios', { params: { busqueda, id_rol: idRolFiltro } }),
        api.get<Rol[]>('/catalogos/roles'),
        api.get<EstadoUsuario[]>('/catalogos/estados-usuario')
      ]);

      // Adaptación de respuesta (dependiendo si tu backend devuelve el array directo o dentro de "value")
      setUsuarios((resUsuarios.data as any).value ?? resUsuarios.data);
      setRoles((resRoles.data as any).value ?? resRoles.data);
      setEstados((resEstados.data as any).value ?? resEstados.data);
    } catch (err) {
      console.error('Error al cargar datos de usuarios:', err);
      setError('No se pudo conectar con la base de datos para cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }, [busqueda, idRolFiltro]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Mapas para renderizado rápido en la tabla
  const rolMap = useMemo(() => new Map(roles.map((r) => [r.id, r.nombre])), [roles]);
  const estadoMap = useMemo(() => new Map(estados.map((e) => [e.id, e.nombre])), [estados]);

  const totalPages = Math.ceil(usuarios.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return usuarios.slice(start, start + itemsPerPage);
  }, [usuarios, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, idRolFiltro]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCrearUsuario = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.cedula || !formData.nombres || !formData.apellidos || !formData.correo || !formData.id_rol || !formData.id_estado_usuario) {
      setFormError('Por favor, completa todos los campos obligatorios (*).');
      return;
    }

    setFormError('');
    setActionLoading(true);

    try {
      // ESTE ES EL PAYLOAD QUE TU BACKEND ESPERA
      // Nos aseguramos de enviar exactamente los nombres que espera el DTO de NestJS
      const payload = {
        cedula: formData.cedula,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        correo: formData.correo,
        telefono: formData.telefono || null,

        // Enviamos tanto snake_case como camelCase para cubrir todas las bases
        id_rol: Number(formData.id_rol),
        idRol: Number(formData.id_rol),

        id_estado_usuario: Number(formData.id_estado_usuario),
        idEstadoUsuario: Number(formData.id_estado_usuario),

        contrasena: formData.cedula, // Tu backend usa esto para hashear
      };

      await api.post('/usuarios', payload);

      setSuccess('Usuario registrado correctamente.');
      setShowModal(false);
      setFormData({ cedula: '', nombres: '', apellidos: '', correo: '', telefono: '', id_rol: '', id_estado_usuario: '' });
      setTimeout(() => setSuccess(''), 4000);
      void fetchData();
    } catch (err: any) {
      console.error('Error de servidor:', err.response?.data);
      setFormError(err.response?.data?.message || 'Error al guardar. Verifica la conexión.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Control de Usuarios</h1>
          <p className="text-sm text-gray-500">
            Gestión de accesos, roles y personal autorizado en la institución.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-red-700 active:scale-95"
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* Alertas */}
      {success && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 shadow-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm flex flex-wrap gap-4 items-center">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, apellido o cédula..."
          className="h-10 flex-1 min-w-[250px] rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
        />
        <select
          value={idRolFiltro}
          onChange={(e) => setIdRolFiltro(e.target.value)}
          className="h-10 rounded-xl border bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
        >
          <option value="">Todos los roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.nombre}</option>
          ))}
        </select>
        <button
          onClick={() => { setBusqueda(''); setIdRolFiltro(''); setCurrentPage(1); }}
          className="h-10 rounded-xl border px-5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          Limpiar
        </button>
      </div>

      {/* Tabla de Usuarios */}
      {loading ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
          Cargando directorio de usuarios...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[1000px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                <th className="px-5 py-4">Usuario</th>
                <th className="px-5 py-4">Documento (C.I.)</th>
                <th className="px-5 py-4">Contacto</th>
                <th className="px-5 py-4">Rol Asignado</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Fecha Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-700">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                    No se encontraron usuarios registrados.
                  </td>
                </tr>
              ) : (
                paginatedData.map((u) => (
                  <tr key={u.id_usuario} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{u.nombres} {u.apellidos}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{u.correo}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-gray-600">{u.cedula}</td>
                    <td className="px-5 py-4 text-gray-600">{u.telefono || <span className="italic text-gray-400">Sin registrar</span>}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {rolMap.get(u.id_rol) || `Rol #${u.id_rol}`}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-sm ${estadoMap.get(u.id_estado_usuario) === 'Activo'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                        {estadoMap.get(u.id_estado_usuario) || `Estado #${u.id_estado_usuario}`}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{new Date(u.fecha_registro).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modal Nuevo Usuario */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl border max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Registrar Personal / Estudiante</h2>
              <button onClick={() => { setShowModal(false); setFormError(''); }} className="text-gray-400 hover:text-gray-600 transition text-lg">✕</button>
            </div>

            {formError && (
              <p className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700 animate-fade-in">{formError}</p>
            )}

            <form onSubmit={handleCrearUsuario} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Nombres *</label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    maxLength={100}
                    className="w-full h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Apellidos *</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    maxLength={100}
                    className="w-full h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Cédula de Identidad *</label>
                  <input
                    type="text"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleInputChange}
                    maxLength={13}
                    placeholder="Ej. 1801020304"
                    className="w-full h-10 rounded-xl border px-3 text-sm font-mono outline-none focus:ring-2 focus:ring-red-200 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    maxLength={15}
                    placeholder="Opcional"
                    className="w-full h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Correo Institucional *</label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  maxLength={120}
                  placeholder="ejemplo@uta.edu.ec"
                  className="w-full h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Rol en el sistema *</label>
                  <select
                    name="id_rol"
                    value={formData.id_rol}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                    required
                  >
                    <option value="">Selecciona rol...</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado de Cuenta *</label>
                  <select
                    name="id_estado_usuario"
                    value={formData.id_estado_usuario}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 transition-all"
                    required
                  >
                    <option value="">Selecciona estado...</option>
                    {estados.map((e) => (
                      <option key={e.id} value={e.id}>{e.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end border-t pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormError(''); }}
                  className="rounded-xl border px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
                >
                  {actionLoading ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}