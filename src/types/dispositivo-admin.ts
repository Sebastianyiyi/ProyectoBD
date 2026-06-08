export interface DispositivoAdmin {
  idArticulo: number;
  codigoInstitucional: string;
  nombre: string;
  categoria: string;
  ubicacion: string;
  responsable: string | null;
  estado: string;
}