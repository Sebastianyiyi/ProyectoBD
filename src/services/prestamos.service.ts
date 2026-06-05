import axios from 'axios';
import { PrestamoAdmin } from '@/types/prestamo-admin';

const API_URL = 'http://localhost:3000/api';

export const getPrestamosAdmin = async (): Promise<PrestamoAdmin[]> => {
  const response = await axios.get(`${API_URL}/prestamos/admin`);
  return response.data;
};