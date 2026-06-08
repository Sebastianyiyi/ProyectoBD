import { create } from 'zustand';
import { api } from '@/lib/api';

// 1. Tipos unificados para mantener consistencia en toda la app
export type Categoria = { id_categoria: number; nombre: string; descripcion?: string | null };
export type EstadoItem = { id: number; nombre: string; id_estado_articulo?: number }; // Adaptable a préstamos y artículos
export type Ubicacion = { id_ubicacion: number; nombre: string };
export type UsuarioSimple = { id_usuario: number; nombres: string; apellidos: string; cedula: string };

interface CatalogosState {
    categorias: Categoria[];
    estadosArticulo: EstadoItem[];
    estadosPrestamo: EstadoItem[];
    ubicaciones: Ubicacion[];
    usuariosList: UsuarioSimple[];
    cargando: boolean;
    error: string | null;

    // Acción para cargar todo de una sola vez
    fetchCatalogos: () => Promise<void>;
}

export const useCatalogosStore = create<CatalogosState>((set, get) => ({
    categorias: [],
    estadosArticulo: [],
    estadosPrestamo: [],
    ubicaciones: [],
    usuariosList: [],
    cargando: false,
    error: null,

    fetchCatalogos: async () => {
        // MAGIA AQUÍ: Si las categorías ya se cargaron antes, no volvemos a hacer la petición a la BD.
        if (get().categorias.length > 0) return;

        set({ cargando: true, error: null });
        try {
            // Hacemos todas las peticiones en paralelo solo LA PRIMERA VEZ
            const [resCat, resEstArt, resEstPres, resUbi, resUsu] = await Promise.all([
                api.get('/catalogos/categorias'),
                api.get('/catalogos/estados-articulo'),
                api.get('/catalogos/estados-prestamo'),
                api.get('/catalogos/ubicaciones'),
                api.get('/usuarios')
            ]);

            set({
                categorias: resCat.data,
                // Algunos endpoints devuelven la data directa y otros envuelta, normalizamos esto:
                estadosArticulo: resEstArt.data.value ?? resEstArt.data,
                estadosPrestamo: resEstPres.data.value ?? resEstPres.data,
                ubicaciones: resUbi.data.value ?? resUbi.data,
                usuariosList: resUsu.data.value ?? resUsu.data,
                cargando: false,
            });
        } catch (error) {
            console.error("Error cargando catálogos", error);
            set({ error: 'Fallo al sincronizar los catálogos del sistema', cargando: false });
        }
    },
}));