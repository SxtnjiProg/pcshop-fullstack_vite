import axios from 'axios';

// 👇 Тепер читаємо з файлу .env
const API_KEY = process.env.NOVAPOSHTA_API_KEY; 
const API_URL = 'https://api.novaposhta.ua/v2.0/json/';

export const searchCities = async (req, res) => {
  try {
    const { query } = req.body;
    
    const response = await axios.post(API_URL, {
      apiKey: API_KEY,
      modelName: 'Address',
      calledMethod: 'searchSettlements',
      methodProperties: {
        CityName: query,
        Limit: '50',
        Page: '1'
      }
    });

    if (response.data.success && response.data.data.length > 0) {
      const cities = response.data.data[0].Addresses.map(item => ({
        ref: item.DeliveryCity,
        name: item.Present
      }));
      return res.json(cities);
    }
    
    return res.json([]);
  } catch (error) {
    console.error('NP City Error:', error.message);
    res.status(500).json({ error: 'Error fetching cities' });
  }
};

export const getWarehouses = async (req, res) => {
  try {
    const { cityRef, query } = req.body;

    const response = await axios.post(API_URL, {
      apiKey: API_KEY,
      modelName: 'Address',
      calledMethod: 'getWarehouses',
      methodProperties: {
        CityRef: cityRef,
        FindByString: query || '',
        Limit: '50'
      }
    });

    if (response.data.success) {
      const warehouses = response.data.data.map(item => ({
        ref: item.Ref,
        name: item.Description,
        // 👇 ВАЖЛИВО: Додаємо координати для карти
        lat: parseFloat(item.Latitude),
        lng: parseFloat(item.Longitude)
      }));
      return res.json(warehouses);
    }

    res.json([]);
  } catch (error) {
    console.error('NP Warehouse Error:', error.message);
    res.status(500).json({ error: 'Error fetching warehouses' });
  }
};