--
-- PostgreSQL database dump
--

\restrict 0goVUgWTaLxFHrEvBYQqd5fhvpmcwBN9yUyfdMnKLQTVpmL5Xe3TBuWg36fa51V

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-10 19:05:03

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 246 (class 1259 OID 16559)
-- Name: articulo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.articulo (
    id_articulo integer NOT NULL,
    codigo_institucional character varying(60) NOT NULL,
    codigo_barras character varying(60),
    nombre character varying(150) NOT NULL,
    descripcion character varying(500),
    marca character varying(100),
    modelo character varying(100),
    numero_serie character varying(100),
    fecha_adquisicion date,
    valor numeric(12,2),
    id_categoria integer NOT NULL,
    id_estado_articulo integer NOT NULL,
    id_ubicacion integer NOT NULL,
    id_responsable integer,
    CONSTRAINT chk_art_valor CHECK (((valor IS NULL) OR (valor >= (0)::numeric)))
);


ALTER TABLE public.articulo OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 16558)
-- Name: articulo_id_articulo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.articulo_id_articulo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.articulo_id_articulo_seq OWNER TO postgres;

--
-- TOC entry 5286 (class 0 OID 0)
-- Dependencies: 245
-- Name: articulo_id_articulo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.articulo_id_articulo_seq OWNED BY public.articulo.id_articulo;


--
-- TOC entry 259 (class 1259 OID 16786)
-- Name: auditoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditoria (
    id_auditoria integer NOT NULL,
    tabla_afectada character varying(100) NOT NULL,
    accion character varying(20) NOT NULL,
    fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_origen character varying(50),
    detalle text,
    datos_antes text,
    datos_despues text,
    id_usuario integer,
    CONSTRAINT chk_aud_accion CHECK (((accion)::text = ANY ((ARRAY['INSERT'::character varying, 'UPDATE'::character varying, 'DELETE'::character varying, 'SELECT'::character varying, 'LOGIN'::character varying, 'LOGOUT'::character varying])::text[])))
);


ALTER TABLE public.auditoria OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 16785)
-- Name: auditoria_id_auditoria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditoria_id_auditoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditoria_id_auditoria_seq OWNER TO postgres;

--
-- TOC entry 5287 (class 0 OID 0)
-- Dependencies: 258
-- Name: auditoria_id_auditoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditoria_id_auditoria_seq OWNED BY public.auditoria.id_auditoria;


--
-- TOC entry 226 (class 1259 OID 16423)
-- Name: categoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categoria (
    id_categoria integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(255)
);


ALTER TABLE public.categoria OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16422)
-- Name: categoria_id_categoria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categoria_id_categoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categoria_id_categoria_seq OWNER TO postgres;

--
-- TOC entry 5288 (class 0 OID 0)
-- Dependencies: 225
-- Name: categoria_id_categoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categoria_id_categoria_seq OWNED BY public.categoria.id_categoria;


--
-- TOC entry 224 (class 1259 OID 16412)
-- Name: departamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departamento (
    id_departamento integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(255)
);


ALTER TABLE public.departamento OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16411)
-- Name: departamento_id_departamento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departamento_id_departamento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departamento_id_departamento_seq OWNER TO postgres;

--
-- TOC entry 5289 (class 0 OID 0)
-- Dependencies: 223
-- Name: departamento_id_departamento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departamento_id_departamento_seq OWNED BY public.departamento.id_departamento;


--
-- TOC entry 251 (class 1259 OID 16654)
-- Name: detalle_prestamo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_prestamo (
    id_prestamo integer NOT NULL,
    id_articulo integer NOT NULL,
    estado_salida character varying(100),
    estado_entrada character varying(100),
    observacion character varying(500)
);


ALTER TABLE public.detalle_prestamo OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16434)
-- Name: estado_articulo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estado_articulo (
    id_estado_articulo integer NOT NULL,
    nombre character varying(60) NOT NULL,
    descripcion character varying(255)
);


ALTER TABLE public.estado_articulo OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16433)
-- Name: estado_articulo_id_estado_articulo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estado_articulo_id_estado_articulo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estado_articulo_id_estado_articulo_seq OWNER TO postgres;

--
-- TOC entry 5290 (class 0 OID 0)
-- Dependencies: 227
-- Name: estado_articulo_id_estado_articulo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estado_articulo_id_estado_articulo_seq OWNED BY public.estado_articulo.id_estado_articulo;


--
-- TOC entry 234 (class 1259 OID 16467)
-- Name: estado_mantenimiento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estado_mantenimiento (
    id_estado_mantenimiento integer NOT NULL,
    nombre character varying(60) NOT NULL,
    descripcion character varying(255)
);


ALTER TABLE public.estado_mantenimiento OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16466)
-- Name: estado_mantenimiento_id_estado_mantenimiento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estado_mantenimiento_id_estado_mantenimiento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estado_mantenimiento_id_estado_mantenimiento_seq OWNER TO postgres;

--
-- TOC entry 5291 (class 0 OID 0)
-- Dependencies: 233
-- Name: estado_mantenimiento_id_estado_mantenimiento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estado_mantenimiento_id_estado_mantenimiento_seq OWNED BY public.estado_mantenimiento.id_estado_mantenimiento;


--
-- TOC entry 240 (class 1259 OID 16500)
-- Name: estado_notificacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estado_notificacion (
    id_estado_notificacion integer NOT NULL,
    nombre character varying(60) NOT NULL,
    descripcion character varying(255)
);


ALTER TABLE public.estado_notificacion OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16499)
-- Name: estado_notificacion_id_estado_notificacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estado_notificacion_id_estado_notificacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estado_notificacion_id_estado_notificacion_seq OWNER TO postgres;

--
-- TOC entry 5292 (class 0 OID 0)
-- Dependencies: 239
-- Name: estado_notificacion_id_estado_notificacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estado_notificacion_id_estado_notificacion_seq OWNED BY public.estado_notificacion.id_estado_notificacion;


--
-- TOC entry 230 (class 1259 OID 16445)
-- Name: estado_prestamo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estado_prestamo (
    id_estado_prestamo integer NOT NULL,
    nombre character varying(60) NOT NULL,
    descripcion character varying(255)
);


ALTER TABLE public.estado_prestamo OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16444)
-- Name: estado_prestamo_id_estado_prestamo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estado_prestamo_id_estado_prestamo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estado_prestamo_id_estado_prestamo_seq OWNER TO postgres;

--
-- TOC entry 5293 (class 0 OID 0)
-- Dependencies: 229
-- Name: estado_prestamo_id_estado_prestamo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estado_prestamo_id_estado_prestamo_seq OWNED BY public.estado_prestamo.id_estado_prestamo;


--
-- TOC entry 222 (class 1259 OID 16401)
-- Name: estado_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estado_usuario (
    id_estado_usuario integer NOT NULL,
    nombre character varying(60) NOT NULL,
    descripcion character varying(255)
);


ALTER TABLE public.estado_usuario OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16400)
-- Name: estado_usuario_id_estado_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estado_usuario_id_estado_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estado_usuario_id_estado_usuario_seq OWNER TO postgres;

--
-- TOC entry 5294 (class 0 OID 0)
-- Dependencies: 221
-- Name: estado_usuario_id_estado_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estado_usuario_id_estado_usuario_seq OWNED BY public.estado_usuario.id_estado_usuario;


--
-- TOC entry 248 (class 1259 OID 16601)
-- Name: imagen_articulo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.imagen_articulo (
    id_imagen integer NOT NULL,
    url_imagen character varying(500) NOT NULL,
    nombre_archivo character varying(200),
    tipo_mime character varying(60),
    extension character varying(10),
    es_principal character(1) DEFAULT 'N'::bpchar NOT NULL,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id_articulo integer NOT NULL,
    CONSTRAINT chk_img_principal CHECK ((es_principal = ANY (ARRAY['S'::bpchar, 'N'::bpchar])))
);


ALTER TABLE public.imagen_articulo OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 16600)
-- Name: imagen_articulo_id_imagen_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.imagen_articulo_id_imagen_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.imagen_articulo_id_imagen_seq OWNER TO postgres;

--
-- TOC entry 5295 (class 0 OID 0)
-- Dependencies: 247
-- Name: imagen_articulo_id_imagen_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.imagen_articulo_id_imagen_seq OWNED BY public.imagen_articulo.id_imagen;


--
-- TOC entry 253 (class 1259 OID 16674)
-- Name: mantenimiento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mantenimiento (
    id_mantenimiento integer NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date,
    descripcion text,
    tecnico_proveedor character varying(200),
    costo numeric(10,2),
    proximo_mantenimiento date,
    id_articulo integer NOT NULL,
    id_tipo_mantenimiento integer NOT NULL,
    id_estado_mantenimiento integer NOT NULL,
    CONSTRAINT chk_mnt_costo CHECK (((costo IS NULL) OR (costo >= (0)::numeric))),
    CONSTRAINT chk_mnt_fechas CHECK (((fecha_fin IS NULL) OR (fecha_fin >= fecha_inicio)))
);


ALTER TABLE public.mantenimiento OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 16673)
-- Name: mantenimiento_id_mantenimiento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mantenimiento_id_mantenimiento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mantenimiento_id_mantenimiento_seq OWNER TO postgres;

--
-- TOC entry 5296 (class 0 OID 0)
-- Dependencies: 252
-- Name: mantenimiento_id_mantenimiento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mantenimiento_id_mantenimiento_seq OWNED BY public.mantenimiento.id_mantenimiento;


--
-- TOC entry 255 (class 1259 OID 16705)
-- Name: movimiento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movimiento (
    id_movimiento integer NOT NULL,
    fecha_movimiento timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    motivo character varying(300),
    observacion character varying(500),
    id_articulo integer NOT NULL,
    id_ubicacion_origen integer,
    id_ubicacion_destino integer NOT NULL,
    id_usuario integer NOT NULL,
    id_tipo_movimiento integer NOT NULL,
    CONSTRAINT chk_mov_ubicaciones CHECK (((id_ubicacion_origen IS NULL) OR (id_ubicacion_origen <> id_ubicacion_destino)))
);


ALTER TABLE public.movimiento OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 16704)
-- Name: movimiento_id_movimiento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.movimiento_id_movimiento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movimiento_id_movimiento_seq OWNER TO postgres;

--
-- TOC entry 5297 (class 0 OID 0)
-- Dependencies: 254
-- Name: movimiento_id_movimiento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movimiento_id_movimiento_seq OWNED BY public.movimiento.id_movimiento;


--
-- TOC entry 257 (class 1259 OID 16747)
-- Name: notificacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notificacion (
    id_notificacion integer NOT NULL,
    asunto character varying(200),
    mensaje text,
    fecha_programada timestamp without time zone,
    fecha_envio timestamp without time zone,
    id_usuario integer NOT NULL,
    id_tipo_notificacion integer NOT NULL,
    id_estado_notificacion integer NOT NULL,
    id_prestamo integer,
    id_mantenimiento integer,
    CONSTRAINT chk_not_evento CHECK (((id_prestamo IS NOT NULL) OR (id_mantenimiento IS NOT NULL)))
);


ALTER TABLE public.notificacion OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 16746)
-- Name: notificacion_id_notificacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notificacion_id_notificacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notificacion_id_notificacion_seq OWNER TO postgres;

--
-- TOC entry 5298 (class 0 OID 0)
-- Dependencies: 256
-- Name: notificacion_id_notificacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notificacion_id_notificacion_seq OWNED BY public.notificacion.id_notificacion;


--
-- TOC entry 250 (class 1259 OID 16623)
-- Name: prestamo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prestamo (
    id_prestamo integer NOT NULL,
    fecha_solicitud date DEFAULT CURRENT_DATE NOT NULL,
    fecha_aprobacion date,
    fecha_entrega date,
    fecha_prevista_devolucion date,
    fecha_devolucion_real date,
    observacion character varying(500),
    id_solicitante integer NOT NULL,
    id_aprobador integer,
    id_estado_prestamo integer NOT NULL,
    CONSTRAINT chk_pre_aprobacion CHECK (((fecha_aprobacion IS NULL) OR (fecha_aprobacion >= fecha_solicitud))),
    CONSTRAINT chk_pre_devolucion CHECK (((fecha_devolucion_real IS NULL) OR (fecha_prevista_devolucion IS NULL) OR (fecha_devolucion_real >= fecha_solicitud))),
    CONSTRAINT chk_pre_entrega CHECK (((fecha_entrega IS NULL) OR (fecha_aprobacion IS NULL) OR (fecha_entrega >= fecha_aprobacion)))
);


ALTER TABLE public.prestamo OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 16622)
-- Name: prestamo_id_prestamo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prestamo_id_prestamo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prestamo_id_prestamo_seq OWNER TO postgres;

--
-- TOC entry 5299 (class 0 OID 0)
-- Dependencies: 249
-- Name: prestamo_id_prestamo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prestamo_id_prestamo_seq OWNED BY public.prestamo.id_prestamo;


--
-- TOC entry 220 (class 1259 OID 16390)
-- Name: rol; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rol (
    id_rol integer NOT NULL,
    nombre character varying(60) NOT NULL,
    descripcion character varying(255)
);


ALTER TABLE public.rol OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: rol_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rol_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rol_id_rol_seq OWNER TO postgres;

--
-- TOC entry 5300 (class 0 OID 0)
-- Dependencies: 219
-- Name: rol_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rol_id_rol_seq OWNED BY public.rol.id_rol;


--
-- TOC entry 232 (class 1259 OID 16456)
-- Name: tipo_mantenimiento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_mantenimiento (
    id_tipo_mantenimiento integer NOT NULL,
    nombre character varying(60) NOT NULL,
    descripcion character varying(255)
);


ALTER TABLE public.tipo_mantenimiento OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16455)
-- Name: tipo_mantenimiento_id_tipo_mantenimiento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipo_mantenimiento_id_tipo_mantenimiento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipo_mantenimiento_id_tipo_mantenimiento_seq OWNER TO postgres;

--
-- TOC entry 5301 (class 0 OID 0)
-- Dependencies: 231
-- Name: tipo_mantenimiento_id_tipo_mantenimiento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipo_mantenimiento_id_tipo_mantenimiento_seq OWNED BY public.tipo_mantenimiento.id_tipo_mantenimiento;


--
-- TOC entry 236 (class 1259 OID 16478)
-- Name: tipo_movimiento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_movimiento (
    id_tipo_movimiento integer NOT NULL,
    nombre character varying(60) NOT NULL,
    descripcion character varying(255)
);


ALTER TABLE public.tipo_movimiento OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16477)
-- Name: tipo_movimiento_id_tipo_movimiento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipo_movimiento_id_tipo_movimiento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipo_movimiento_id_tipo_movimiento_seq OWNER TO postgres;

--
-- TOC entry 5302 (class 0 OID 0)
-- Dependencies: 235
-- Name: tipo_movimiento_id_tipo_movimiento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipo_movimiento_id_tipo_movimiento_seq OWNED BY public.tipo_movimiento.id_tipo_movimiento;


--
-- TOC entry 238 (class 1259 OID 16489)
-- Name: tipo_notificacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_notificacion (
    id_tipo_notificacion integer NOT NULL,
    nombre character varying(60) NOT NULL,
    descripcion character varying(255)
);


ALTER TABLE public.tipo_notificacion OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16488)
-- Name: tipo_notificacion_id_tipo_notificacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipo_notificacion_id_tipo_notificacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipo_notificacion_id_tipo_notificacion_seq OWNER TO postgres;

--
-- TOC entry 5303 (class 0 OID 0)
-- Dependencies: 237
-- Name: tipo_notificacion_id_tipo_notificacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipo_notificacion_id_tipo_notificacion_seq OWNED BY public.tipo_notificacion.id_tipo_notificacion;


--
-- TOC entry 244 (class 1259 OID 16544)
-- Name: ubicacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ubicacion (
    id_ubicacion integer NOT NULL,
    nombre character varying(100) NOT NULL,
    tipo_ubicacion character varying(60),
    bloque character varying(20),
    piso character varying(20),
    descripcion character varying(255),
    id_departamento integer NOT NULL
);


ALTER TABLE public.ubicacion OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 16543)
-- Name: ubicacion_id_ubicacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ubicacion_id_ubicacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ubicacion_id_ubicacion_seq OWNER TO postgres;

--
-- TOC entry 5304 (class 0 OID 0)
-- Dependencies: 243
-- Name: ubicacion_id_ubicacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ubicacion_id_ubicacion_seq OWNED BY public.ubicacion.id_ubicacion;


--
-- TOC entry 242 (class 1259 OID 16511)
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id_usuario integer NOT NULL,
    cedula character varying(13) NOT NULL,
    nombres character varying(100) NOT NULL,
    apellidos character varying(100) NOT NULL,
    correo character varying(120) NOT NULL,
    telefono character varying(15),
    contrasena_hash character varying(255),
    fecha_registro date DEFAULT CURRENT_DATE NOT NULL,
    ultimo_acceso timestamp without time zone,
    id_rol integer NOT NULL,
    id_estado_usuario integer NOT NULL,
    CONSTRAINT chk_usr_correo CHECK (((correo)::text ~~ '%@%'::text))
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16510)
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_usuario_seq OWNER TO postgres;

--
-- TOC entry 5305 (class 0 OID 0)
-- Dependencies: 241
-- Name: usuario_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_id_usuario_seq OWNED BY public.usuario.id_usuario;


--
-- TOC entry 4969 (class 2604 OID 16562)
-- Name: articulo id_articulo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articulo ALTER COLUMN id_articulo SET DEFAULT nextval('public.articulo_id_articulo_seq'::regclass);


--
-- TOC entry 4979 (class 2604 OID 16789)
-- Name: auditoria id_auditoria; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria ALTER COLUMN id_auditoria SET DEFAULT nextval('public.auditoria_id_auditoria_seq'::regclass);


--
-- TOC entry 4958 (class 2604 OID 16426)
-- Name: categoria id_categoria; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria ALTER COLUMN id_categoria SET DEFAULT nextval('public.categoria_id_categoria_seq'::regclass);


--
-- TOC entry 4957 (class 2604 OID 16415)
-- Name: departamento id_departamento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamento ALTER COLUMN id_departamento SET DEFAULT nextval('public.departamento_id_departamento_seq'::regclass);


--
-- TOC entry 4959 (class 2604 OID 16437)
-- Name: estado_articulo id_estado_articulo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_articulo ALTER COLUMN id_estado_articulo SET DEFAULT nextval('public.estado_articulo_id_estado_articulo_seq'::regclass);


--
-- TOC entry 4962 (class 2604 OID 16470)
-- Name: estado_mantenimiento id_estado_mantenimiento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_mantenimiento ALTER COLUMN id_estado_mantenimiento SET DEFAULT nextval('public.estado_mantenimiento_id_estado_mantenimiento_seq'::regclass);


--
-- TOC entry 4965 (class 2604 OID 16503)
-- Name: estado_notificacion id_estado_notificacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_notificacion ALTER COLUMN id_estado_notificacion SET DEFAULT nextval('public.estado_notificacion_id_estado_notificacion_seq'::regclass);


--
-- TOC entry 4960 (class 2604 OID 16448)
-- Name: estado_prestamo id_estado_prestamo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_prestamo ALTER COLUMN id_estado_prestamo SET DEFAULT nextval('public.estado_prestamo_id_estado_prestamo_seq'::regclass);


--
-- TOC entry 4956 (class 2604 OID 16404)
-- Name: estado_usuario id_estado_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_usuario ALTER COLUMN id_estado_usuario SET DEFAULT nextval('public.estado_usuario_id_estado_usuario_seq'::regclass);


--
-- TOC entry 4970 (class 2604 OID 16604)
-- Name: imagen_articulo id_imagen; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.imagen_articulo ALTER COLUMN id_imagen SET DEFAULT nextval('public.imagen_articulo_id_imagen_seq'::regclass);


--
-- TOC entry 4975 (class 2604 OID 16677)
-- Name: mantenimiento id_mantenimiento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mantenimiento ALTER COLUMN id_mantenimiento SET DEFAULT nextval('public.mantenimiento_id_mantenimiento_seq'::regclass);


--
-- TOC entry 4976 (class 2604 OID 16708)
-- Name: movimiento id_movimiento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimiento ALTER COLUMN id_movimiento SET DEFAULT nextval('public.movimiento_id_movimiento_seq'::regclass);


--
-- TOC entry 4978 (class 2604 OID 16750)
-- Name: notificacion id_notificacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacion ALTER COLUMN id_notificacion SET DEFAULT nextval('public.notificacion_id_notificacion_seq'::regclass);


--
-- TOC entry 4973 (class 2604 OID 16626)
-- Name: prestamo id_prestamo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamo ALTER COLUMN id_prestamo SET DEFAULT nextval('public.prestamo_id_prestamo_seq'::regclass);


--
-- TOC entry 4955 (class 2604 OID 16393)
-- Name: rol id_rol; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol ALTER COLUMN id_rol SET DEFAULT nextval('public.rol_id_rol_seq'::regclass);


--
-- TOC entry 4961 (class 2604 OID 16459)
-- Name: tipo_mantenimiento id_tipo_mantenimiento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_mantenimiento ALTER COLUMN id_tipo_mantenimiento SET DEFAULT nextval('public.tipo_mantenimiento_id_tipo_mantenimiento_seq'::regclass);


--
-- TOC entry 4963 (class 2604 OID 16481)
-- Name: tipo_movimiento id_tipo_movimiento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_movimiento ALTER COLUMN id_tipo_movimiento SET DEFAULT nextval('public.tipo_movimiento_id_tipo_movimiento_seq'::regclass);


--
-- TOC entry 4964 (class 2604 OID 16492)
-- Name: tipo_notificacion id_tipo_notificacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_notificacion ALTER COLUMN id_tipo_notificacion SET DEFAULT nextval('public.tipo_notificacion_id_tipo_notificacion_seq'::regclass);


--
-- TOC entry 4968 (class 2604 OID 16547)
-- Name: ubicacion id_ubicacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicacion ALTER COLUMN id_ubicacion SET DEFAULT nextval('public.ubicacion_id_ubicacion_seq'::regclass);


--
-- TOC entry 4966 (class 2604 OID 16514)
-- Name: usuario id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuario_id_usuario_seq'::regclass);


--
-- TOC entry 5267 (class 0 OID 16559)
-- Dependencies: 246
-- Data for Name: articulo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.articulo (id_articulo, codigo_institucional, codigo_barras, nombre, descripcion, marca, modelo, numero_serie, fecha_adquisicion, valor, id_categoria, id_estado_articulo, id_ubicacion, id_responsable) FROM stdin;
\.


--
-- TOC entry 5280 (class 0 OID 16786)
-- Dependencies: 259
-- Data for Name: auditoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditoria (id_auditoria, tabla_afectada, accion, fecha_hora, ip_origen, detalle, datos_antes, datos_despues, id_usuario) FROM stdin;
\.


--
-- TOC entry 5247 (class 0 OID 16423)
-- Dependencies: 226
-- Data for Name: categoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categoria (id_categoria, nombre, descripcion) FROM stdin;
\.


--
-- TOC entry 5245 (class 0 OID 16412)
-- Dependencies: 224
-- Data for Name: departamento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departamento (id_departamento, nombre, descripcion) FROM stdin;
\.


--
-- TOC entry 5272 (class 0 OID 16654)
-- Dependencies: 251
-- Data for Name: detalle_prestamo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_prestamo (id_prestamo, id_articulo, estado_salida, estado_entrada, observacion) FROM stdin;
\.


--
-- TOC entry 5249 (class 0 OID 16434)
-- Dependencies: 228
-- Data for Name: estado_articulo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estado_articulo (id_estado_articulo, nombre, descripcion) FROM stdin;
\.


--
-- TOC entry 5255 (class 0 OID 16467)
-- Dependencies: 234
-- Data for Name: estado_mantenimiento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estado_mantenimiento (id_estado_mantenimiento, nombre, descripcion) FROM stdin;
\.


--
-- TOC entry 5261 (class 0 OID 16500)
-- Dependencies: 240
-- Data for Name: estado_notificacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estado_notificacion (id_estado_notificacion, nombre, descripcion) FROM stdin;
\.


--
-- TOC entry 5251 (class 0 OID 16445)
-- Dependencies: 230
-- Data for Name: estado_prestamo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estado_prestamo (id_estado_prestamo, nombre, descripcion) FROM stdin;
\.


--
-- TOC entry 5243 (class 0 OID 16401)
-- Dependencies: 222
-- Data for Name: estado_usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estado_usuario (id_estado_usuario, nombre, descripcion) FROM stdin;
\.


--
-- TOC entry 5269 (class 0 OID 16601)
-- Dependencies: 248
-- Data for Name: imagen_articulo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.imagen_articulo (id_imagen, url_imagen, nombre_archivo, tipo_mime, extension, es_principal, fecha_registro, id_articulo) FROM stdin;
\.


--
-- TOC entry 5274 (class 0 OID 16674)
-- Dependencies: 253
-- Data for Name: mantenimiento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mantenimiento (id_mantenimiento, fecha_inicio, fecha_fin, descripcion, tecnico_proveedor, costo, proximo_mantenimiento, id_articulo, id_tipo_mantenimiento, id_estado_mantenimiento) FROM stdin;
\.


--
-- TOC entry 5276 (class 0 OID 16705)
-- Dependencies: 255
-- Data for Name: movimiento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movimiento (id_movimiento, fecha_movimiento, motivo, observacion, id_articulo, id_ubicacion_origen, id_ubicacion_destino, id_usuario, id_tipo_movimiento) FROM stdin;
\.


--
-- TOC entry 5278 (class 0 OID 16747)
-- Dependencies: 257
-- Data for Name: notificacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notificacion (id_notificacion, asunto, mensaje, fecha_programada, fecha_envio, id_usuario, id_tipo_notificacion, id_estado_notificacion, id_prestamo, id_mantenimiento) FROM stdin;
\.


--
-- TOC entry 5271 (class 0 OID 16623)
-- Dependencies: 250
-- Data for Name: prestamo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prestamo (id_prestamo, fecha_solicitud, fecha_aprobacion, fecha_entrega, fecha_prevista_devolucion, fecha_devolucion_real, observacion, id_solicitante, id_aprobador, id_estado_prestamo) FROM stdin;
\.


--
-- TOC entry 5241 (class 0 OID 16390)
-- Dependencies: 220
-- Data for Name: rol; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rol (id_rol, nombre, descripcion) FROM stdin;
\.


--
-- TOC entry 5253 (class 0 OID 16456)
-- Dependencies: 232
-- Data for Name: tipo_mantenimiento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipo_mantenimiento (id_tipo_mantenimiento, nombre, descripcion) FROM stdin;
\.


--
-- TOC entry 5257 (class 0 OID 16478)
-- Dependencies: 236
-- Data for Name: tipo_movimiento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipo_movimiento (id_tipo_movimiento, nombre, descripcion) FROM stdin;
\.


--
-- TOC entry 5259 (class 0 OID 16489)
-- Dependencies: 238
-- Data for Name: tipo_notificacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipo_notificacion (id_tipo_notificacion, nombre, descripcion) FROM stdin;
\.


--
-- TOC entry 5265 (class 0 OID 16544)
-- Dependencies: 244
-- Data for Name: ubicacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ubicacion (id_ubicacion, nombre, tipo_ubicacion, bloque, piso, descripcion, id_departamento) FROM stdin;
\.


--
-- TOC entry 5263 (class 0 OID 16511)
-- Dependencies: 242
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (id_usuario, cedula, nombres, apellidos, correo, telefono, contrasena_hash, fecha_registro, ultimo_acceso, id_rol, id_estado_usuario) FROM stdin;
\.


--
-- TOC entry 5306 (class 0 OID 0)
-- Dependencies: 245
-- Name: articulo_id_articulo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.articulo_id_articulo_seq', 1, false);


--
-- TOC entry 5307 (class 0 OID 0)
-- Dependencies: 258
-- Name: auditoria_id_auditoria_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditoria_id_auditoria_seq', 1, false);


--
-- TOC entry 5308 (class 0 OID 0)
-- Dependencies: 225
-- Name: categoria_id_categoria_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categoria_id_categoria_seq', 1, false);


--
-- TOC entry 5309 (class 0 OID 0)
-- Dependencies: 223
-- Name: departamento_id_departamento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departamento_id_departamento_seq', 1, false);


--
-- TOC entry 5310 (class 0 OID 0)
-- Dependencies: 227
-- Name: estado_articulo_id_estado_articulo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estado_articulo_id_estado_articulo_seq', 1, false);


--
-- TOC entry 5311 (class 0 OID 0)
-- Dependencies: 233
-- Name: estado_mantenimiento_id_estado_mantenimiento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estado_mantenimiento_id_estado_mantenimiento_seq', 1, false);


--
-- TOC entry 5312 (class 0 OID 0)
-- Dependencies: 239
-- Name: estado_notificacion_id_estado_notificacion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estado_notificacion_id_estado_notificacion_seq', 1, false);


--
-- TOC entry 5313 (class 0 OID 0)
-- Dependencies: 229
-- Name: estado_prestamo_id_estado_prestamo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estado_prestamo_id_estado_prestamo_seq', 1, false);


--
-- TOC entry 5314 (class 0 OID 0)
-- Dependencies: 221
-- Name: estado_usuario_id_estado_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estado_usuario_id_estado_usuario_seq', 1, false);


--
-- TOC entry 5315 (class 0 OID 0)
-- Dependencies: 247
-- Name: imagen_articulo_id_imagen_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.imagen_articulo_id_imagen_seq', 1, false);


--
-- TOC entry 5316 (class 0 OID 0)
-- Dependencies: 252
-- Name: mantenimiento_id_mantenimiento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mantenimiento_id_mantenimiento_seq', 1, false);


--
-- TOC entry 5317 (class 0 OID 0)
-- Dependencies: 254
-- Name: movimiento_id_movimiento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movimiento_id_movimiento_seq', 1, false);


--
-- TOC entry 5318 (class 0 OID 0)
-- Dependencies: 256
-- Name: notificacion_id_notificacion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notificacion_id_notificacion_seq', 1, false);


--
-- TOC entry 5319 (class 0 OID 0)
-- Dependencies: 249
-- Name: prestamo_id_prestamo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prestamo_id_prestamo_seq', 1, false);


--
-- TOC entry 5320 (class 0 OID 0)
-- Dependencies: 219
-- Name: rol_id_rol_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rol_id_rol_seq', 1, false);


--
-- TOC entry 5321 (class 0 OID 0)
-- Dependencies: 231
-- Name: tipo_mantenimiento_id_tipo_mantenimiento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipo_mantenimiento_id_tipo_mantenimiento_seq', 1, false);


--
-- TOC entry 5322 (class 0 OID 0)
-- Dependencies: 235
-- Name: tipo_movimiento_id_tipo_movimiento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipo_movimiento_id_tipo_movimiento_seq', 1, false);


--
-- TOC entry 5323 (class 0 OID 0)
-- Dependencies: 237
-- Name: tipo_notificacion_id_tipo_notificacion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipo_notificacion_id_tipo_notificacion_seq', 1, false);


--
-- TOC entry 5324 (class 0 OID 0)
-- Dependencies: 243
-- Name: ubicacion_id_ubicacion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ubicacion_id_ubicacion_seq', 1, false);


--
-- TOC entry 5325 (class 0 OID 0)
-- Dependencies: 241
-- Name: usuario_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_id_usuario_seq', 1, false);


--
-- TOC entry 5045 (class 2606 OID 16577)
-- Name: articulo articulo_codigo_barras_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articulo
    ADD CONSTRAINT articulo_codigo_barras_key UNIQUE (codigo_barras);


--
-- TOC entry 5047 (class 2606 OID 16575)
-- Name: articulo articulo_codigo_institucional_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articulo
    ADD CONSTRAINT articulo_codigo_institucional_key UNIQUE (codigo_institucional);


--
-- TOC entry 5049 (class 2606 OID 16579)
-- Name: articulo articulo_numero_serie_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articulo
    ADD CONSTRAINT articulo_numero_serie_key UNIQUE (numero_serie);


--
-- TOC entry 5051 (class 2606 OID 16573)
-- Name: articulo articulo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articulo
    ADD CONSTRAINT articulo_pkey PRIMARY KEY (id_articulo);


--
-- TOC entry 5065 (class 2606 OID 16799)
-- Name: auditoria auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_pkey PRIMARY KEY (id_auditoria);


--
-- TOC entry 5005 (class 2606 OID 16432)
-- Name: categoria categoria_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria
    ADD CONSTRAINT categoria_nombre_key UNIQUE (nombre);


--
-- TOC entry 5007 (class 2606 OID 16430)
-- Name: categoria categoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria
    ADD CONSTRAINT categoria_pkey PRIMARY KEY (id_categoria);


--
-- TOC entry 5001 (class 2606 OID 16421)
-- Name: departamento departamento_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamento
    ADD CONSTRAINT departamento_nombre_key UNIQUE (nombre);


--
-- TOC entry 5003 (class 2606 OID 16419)
-- Name: departamento departamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamento
    ADD CONSTRAINT departamento_pkey PRIMARY KEY (id_departamento);


--
-- TOC entry 5009 (class 2606 OID 16443)
-- Name: estado_articulo estado_articulo_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_articulo
    ADD CONSTRAINT estado_articulo_nombre_key UNIQUE (nombre);


--
-- TOC entry 5011 (class 2606 OID 16441)
-- Name: estado_articulo estado_articulo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_articulo
    ADD CONSTRAINT estado_articulo_pkey PRIMARY KEY (id_estado_articulo);


--
-- TOC entry 5021 (class 2606 OID 16476)
-- Name: estado_mantenimiento estado_mantenimiento_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_mantenimiento
    ADD CONSTRAINT estado_mantenimiento_nombre_key UNIQUE (nombre);


--
-- TOC entry 5023 (class 2606 OID 16474)
-- Name: estado_mantenimiento estado_mantenimiento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_mantenimiento
    ADD CONSTRAINT estado_mantenimiento_pkey PRIMARY KEY (id_estado_mantenimiento);


--
-- TOC entry 5033 (class 2606 OID 16509)
-- Name: estado_notificacion estado_notificacion_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_notificacion
    ADD CONSTRAINT estado_notificacion_nombre_key UNIQUE (nombre);


--
-- TOC entry 5035 (class 2606 OID 16507)
-- Name: estado_notificacion estado_notificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_notificacion
    ADD CONSTRAINT estado_notificacion_pkey PRIMARY KEY (id_estado_notificacion);


--
-- TOC entry 5013 (class 2606 OID 16454)
-- Name: estado_prestamo estado_prestamo_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_prestamo
    ADD CONSTRAINT estado_prestamo_nombre_key UNIQUE (nombre);


--
-- TOC entry 5015 (class 2606 OID 16452)
-- Name: estado_prestamo estado_prestamo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_prestamo
    ADD CONSTRAINT estado_prestamo_pkey PRIMARY KEY (id_estado_prestamo);


--
-- TOC entry 4997 (class 2606 OID 16410)
-- Name: estado_usuario estado_usuario_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_usuario
    ADD CONSTRAINT estado_usuario_nombre_key UNIQUE (nombre);


--
-- TOC entry 4999 (class 2606 OID 16408)
-- Name: estado_usuario estado_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_usuario
    ADD CONSTRAINT estado_usuario_pkey PRIMARY KEY (id_estado_usuario);


--
-- TOC entry 5053 (class 2606 OID 16616)
-- Name: imagen_articulo imagen_articulo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.imagen_articulo
    ADD CONSTRAINT imagen_articulo_pkey PRIMARY KEY (id_imagen);


--
-- TOC entry 5059 (class 2606 OID 16688)
-- Name: mantenimiento mantenimiento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mantenimiento
    ADD CONSTRAINT mantenimiento_pkey PRIMARY KEY (id_mantenimiento);


--
-- TOC entry 5061 (class 2606 OID 16720)
-- Name: movimiento movimiento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimiento
    ADD CONSTRAINT movimiento_pkey PRIMARY KEY (id_movimiento);


--
-- TOC entry 5063 (class 2606 OID 16759)
-- Name: notificacion notificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacion
    ADD CONSTRAINT notificacion_pkey PRIMARY KEY (id_notificacion);


--
-- TOC entry 5057 (class 2606 OID 16662)
-- Name: detalle_prestamo pk_detalle_prestamo; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_prestamo
    ADD CONSTRAINT pk_detalle_prestamo PRIMARY KEY (id_prestamo, id_articulo);


--
-- TOC entry 5055 (class 2606 OID 16638)
-- Name: prestamo prestamo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamo
    ADD CONSTRAINT prestamo_pkey PRIMARY KEY (id_prestamo);


--
-- TOC entry 4993 (class 2606 OID 16399)
-- Name: rol rol_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol
    ADD CONSTRAINT rol_nombre_key UNIQUE (nombre);


--
-- TOC entry 4995 (class 2606 OID 16397)
-- Name: rol rol_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol
    ADD CONSTRAINT rol_pkey PRIMARY KEY (id_rol);


--
-- TOC entry 5017 (class 2606 OID 16465)
-- Name: tipo_mantenimiento tipo_mantenimiento_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_mantenimiento
    ADD CONSTRAINT tipo_mantenimiento_nombre_key UNIQUE (nombre);


--
-- TOC entry 5019 (class 2606 OID 16463)
-- Name: tipo_mantenimiento tipo_mantenimiento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_mantenimiento
    ADD CONSTRAINT tipo_mantenimiento_pkey PRIMARY KEY (id_tipo_mantenimiento);


--
-- TOC entry 5025 (class 2606 OID 16487)
-- Name: tipo_movimiento tipo_movimiento_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_movimiento
    ADD CONSTRAINT tipo_movimiento_nombre_key UNIQUE (nombre);


--
-- TOC entry 5027 (class 2606 OID 16485)
-- Name: tipo_movimiento tipo_movimiento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_movimiento
    ADD CONSTRAINT tipo_movimiento_pkey PRIMARY KEY (id_tipo_movimiento);


--
-- TOC entry 5029 (class 2606 OID 16498)
-- Name: tipo_notificacion tipo_notificacion_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_notificacion
    ADD CONSTRAINT tipo_notificacion_nombre_key UNIQUE (nombre);


--
-- TOC entry 5031 (class 2606 OID 16496)
-- Name: tipo_notificacion tipo_notificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_notificacion
    ADD CONSTRAINT tipo_notificacion_pkey PRIMARY KEY (id_tipo_notificacion);


--
-- TOC entry 5043 (class 2606 OID 16552)
-- Name: ubicacion ubicacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicacion
    ADD CONSTRAINT ubicacion_pkey PRIMARY KEY (id_ubicacion);


--
-- TOC entry 5037 (class 2606 OID 16530)
-- Name: usuario usuario_cedula_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_cedula_key UNIQUE (cedula);


--
-- TOC entry 5039 (class 2606 OID 16532)
-- Name: usuario usuario_correo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_correo_key UNIQUE (correo);


--
-- TOC entry 5041 (class 2606 OID 16528)
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 5069 (class 2606 OID 16580)
-- Name: articulo fk_art_cat; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articulo
    ADD CONSTRAINT fk_art_cat FOREIGN KEY (id_categoria) REFERENCES public.categoria(id_categoria);


--
-- TOC entry 5070 (class 2606 OID 16585)
-- Name: articulo fk_art_est; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articulo
    ADD CONSTRAINT fk_art_est FOREIGN KEY (id_estado_articulo) REFERENCES public.estado_articulo(id_estado_articulo);


--
-- TOC entry 5071 (class 2606 OID 16595)
-- Name: articulo fk_art_resp; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articulo
    ADD CONSTRAINT fk_art_resp FOREIGN KEY (id_responsable) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 5072 (class 2606 OID 16590)
-- Name: articulo fk_art_ubi; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articulo
    ADD CONSTRAINT fk_art_ubi FOREIGN KEY (id_ubicacion) REFERENCES public.ubicacion(id_ubicacion);


--
-- TOC entry 5092 (class 2606 OID 16800)
-- Name: auditoria fk_aud_usr; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT fk_aud_usr FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 5077 (class 2606 OID 16668)
-- Name: detalle_prestamo fk_det_art; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_prestamo
    ADD CONSTRAINT fk_det_art FOREIGN KEY (id_articulo) REFERENCES public.articulo(id_articulo);


--
-- TOC entry 5078 (class 2606 OID 16663)
-- Name: detalle_prestamo fk_det_pre; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_prestamo
    ADD CONSTRAINT fk_det_pre FOREIGN KEY (id_prestamo) REFERENCES public.prestamo(id_prestamo);


--
-- TOC entry 5073 (class 2606 OID 16617)
-- Name: imagen_articulo fk_img_art; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.imagen_articulo
    ADD CONSTRAINT fk_img_art FOREIGN KEY (id_articulo) REFERENCES public.articulo(id_articulo);


--
-- TOC entry 5079 (class 2606 OID 16689)
-- Name: mantenimiento fk_mnt_art; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mantenimiento
    ADD CONSTRAINT fk_mnt_art FOREIGN KEY (id_articulo) REFERENCES public.articulo(id_articulo);


--
-- TOC entry 5080 (class 2606 OID 16699)
-- Name: mantenimiento fk_mnt_est; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mantenimiento
    ADD CONSTRAINT fk_mnt_est FOREIGN KEY (id_estado_mantenimiento) REFERENCES public.estado_mantenimiento(id_estado_mantenimiento);


--
-- TOC entry 5081 (class 2606 OID 16694)
-- Name: mantenimiento fk_mnt_tipo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mantenimiento
    ADD CONSTRAINT fk_mnt_tipo FOREIGN KEY (id_tipo_mantenimiento) REFERENCES public.tipo_mantenimiento(id_tipo_mantenimiento);


--
-- TOC entry 5082 (class 2606 OID 16721)
-- Name: movimiento fk_mov_art; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimiento
    ADD CONSTRAINT fk_mov_art FOREIGN KEY (id_articulo) REFERENCES public.articulo(id_articulo);


--
-- TOC entry 5083 (class 2606 OID 16731)
-- Name: movimiento fk_mov_dst; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimiento
    ADD CONSTRAINT fk_mov_dst FOREIGN KEY (id_ubicacion_destino) REFERENCES public.ubicacion(id_ubicacion);


--
-- TOC entry 5084 (class 2606 OID 16726)
-- Name: movimiento fk_mov_ori; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimiento
    ADD CONSTRAINT fk_mov_ori FOREIGN KEY (id_ubicacion_origen) REFERENCES public.ubicacion(id_ubicacion);


--
-- TOC entry 5085 (class 2606 OID 16741)
-- Name: movimiento fk_mov_tipo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimiento
    ADD CONSTRAINT fk_mov_tipo FOREIGN KEY (id_tipo_movimiento) REFERENCES public.tipo_movimiento(id_tipo_movimiento);


--
-- TOC entry 5086 (class 2606 OID 16736)
-- Name: movimiento fk_mov_usr; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimiento
    ADD CONSTRAINT fk_mov_usr FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 5087 (class 2606 OID 16770)
-- Name: notificacion fk_not_est; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacion
    ADD CONSTRAINT fk_not_est FOREIGN KEY (id_estado_notificacion) REFERENCES public.estado_notificacion(id_estado_notificacion);


--
-- TOC entry 5088 (class 2606 OID 16780)
-- Name: notificacion fk_not_mnt; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacion
    ADD CONSTRAINT fk_not_mnt FOREIGN KEY (id_mantenimiento) REFERENCES public.mantenimiento(id_mantenimiento);


--
-- TOC entry 5089 (class 2606 OID 16775)
-- Name: notificacion fk_not_pre; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacion
    ADD CONSTRAINT fk_not_pre FOREIGN KEY (id_prestamo) REFERENCES public.prestamo(id_prestamo);


--
-- TOC entry 5090 (class 2606 OID 16765)
-- Name: notificacion fk_not_tipo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacion
    ADD CONSTRAINT fk_not_tipo FOREIGN KEY (id_tipo_notificacion) REFERENCES public.tipo_notificacion(id_tipo_notificacion);


--
-- TOC entry 5091 (class 2606 OID 16760)
-- Name: notificacion fk_not_usr; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacion
    ADD CONSTRAINT fk_not_usr FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 5074 (class 2606 OID 16644)
-- Name: prestamo fk_pre_apr; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamo
    ADD CONSTRAINT fk_pre_apr FOREIGN KEY (id_aprobador) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 5075 (class 2606 OID 16649)
-- Name: prestamo fk_pre_est; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamo
    ADD CONSTRAINT fk_pre_est FOREIGN KEY (id_estado_prestamo) REFERENCES public.estado_prestamo(id_estado_prestamo);


--
-- TOC entry 5076 (class 2606 OID 16639)
-- Name: prestamo fk_pre_sol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamo
    ADD CONSTRAINT fk_pre_sol FOREIGN KEY (id_solicitante) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 5068 (class 2606 OID 16553)
-- Name: ubicacion fk_ubi_dep; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicacion
    ADD CONSTRAINT fk_ubi_dep FOREIGN KEY (id_departamento) REFERENCES public.departamento(id_departamento);


--
-- TOC entry 5066 (class 2606 OID 16538)
-- Name: usuario fk_usr_est; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT fk_usr_est FOREIGN KEY (id_estado_usuario) REFERENCES public.estado_usuario(id_estado_usuario);


--
-- TOC entry 5067 (class 2606 OID 16533)
-- Name: usuario fk_usr_rol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT fk_usr_rol FOREIGN KEY (id_rol) REFERENCES public.rol(id_rol);


-- Completed on 2026-05-10 19:05:03

--
-- PostgreSQL database dump complete
--

\unrestrict 0goVUgWTaLxFHrEvBYQqd5fhvpmcwBN9yUyfdMnKLQTVpmL5Xe3TBuWg36fa51V

