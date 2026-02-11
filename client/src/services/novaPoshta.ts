import axios from 'axios';

export interface Option {
  ref: string;
  name: string;
  lat?: number; // Координати
  lng?: number;
}

export const searchCities = async (query: string): Promise<Option[]> => {
  if (!query || query.length < 2) return [];
  try {
    const response = await axios.post('/api/novaposhta/cities', { query });
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getWarehouses = async (cityRef: string, query: string = ''): Promise<Option[]> => {
  try {
    const response = await axios.post('/api/novaposhta/warehouses', { cityRef, query });
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};