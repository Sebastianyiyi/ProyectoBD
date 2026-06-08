export interface PrestamoAdmin {
  idPrestamo: number;
  idArticulo: number;
  nombreArticulo: string;
  ubicacion: string;
  encargado: string;
  estado: string;
  fechaPrevistaDevolucion: string | null;
}