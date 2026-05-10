export interface Rol {
  id_rol: number
  nombre: string
  descripcion?: string
}

export interface Categoria {
  id_categoria: number
  nombre: string
  descripcion?: string
}

export interface Departamento {
  id_departamento: number
  nombre: string
  descripcion?: string
}

export interface EstadoArticulo {
  id_estado_articulo: number
  nombre: string
  descripcion?: string
}

export interface EstadoMantenimiento {
  id_estado_mantenimiento: number
  nombre: string
  descripcion?: string
}

export interface EstadoNotificacion {
  id_estado_notificacion: number
  nombre: string
  descripcion?: string
}

export interface EstadoPrestamo {
  id_estado_prestamo: number
  nombre: string
  descripcion?: string
}

export interface EstadoUsuario {
  id_estado_usuario: number
  nombre: string
  descripcion?: string
}

export interface TipoMantenimiento {
  id_tipo_mantenimiento: number
  nombre: string
  descripcion?: string
}

export interface TipoMovimiento {
  id_tipo_movimiento: number
  nombre: string
  descripcion?: string
}

export interface TipoNotificacion {
  id_tipo_notificacion: number
  nombre: string
  descripcion?: string
}

export interface Ubicacion {
  id_ubicacion: number
  nombre: string
  tipo_ubicacion?: string
  bloque?: string
  piso?: string
  descripcion?: string
  id_departamento: number
}

export interface Usuario {
  id_usuario: number
  cedula: string
  nombres: string
  apellidos: string
  correo: string
  telefono?: string
  contrasena_hash?: string
  fecha_registro: string
  ultimo_acceso?: string
  id_rol: number
  id_estado_usuario: number
}

export interface Articulo {
  id_articulo: number
  codigo_institucional: string
  codigo_barras?: string
  nombre: string
  descripcion?: string
  marca?: string
  modelo?: string
  numero_serie?: string
  fecha_adquisicion?: string
  valor?: number
  id_categoria: number
  id_estado_articulo: number
  id_ubicacion: number
  id_responsable?: number
}

export interface Prestamo {
  id_prestamo: number
  fecha_solicitud: string
  fecha_aprobacion?: string
  fecha_entrega?: string
  fecha_prevista_devolucion?: string
  fecha_devolucion_real?: string
  observacion?: string
  id_solicitante: number
  id_aprobador?: number
  id_estado_prestamo: number
}

export interface DetallePrestamo {
  id_prestamo: number
  id_articulo: number
  estado_salida?: string
  estado_entrada?: string
  observacion?: string
}