import axios from 'axios';
import { DispositivoAdmin } from '@/types/dispositivo-admin';

const API_URL = 'http://localhost:3000/api';

export const getDispositivosAdmin = async (): Promise<DispositivoAdmin[]> => {
  const response = await axios.get(`${API_URL}/inventario/admin/dispositivos`);
  return response.data;
};