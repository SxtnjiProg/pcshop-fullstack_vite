import { useEffect, useState } from 'react';
import axios from 'axios';

// 1. Описуємо тип Замовлення
interface Order {
  id: number;
  fullName: string;
  phone: string;
  total: string; // або number, залежно від того, як приходить з бази (Prisma Decimal приходить як string)
  status: string;
  createdAt: string;
}

export default function AdminOrders() {
  // 2. Вказуємо, що стейт — це масив Замовлень
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/orders');
      setOrders(res.data);
    } catch (err) { 
      console.error(err); // Використовуємо err, щоб лінтер не сварився
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/orders/${id}`, { status });
      fetchOrders();
    } catch (err) { 
      console.error(err); // Використовуємо err
      alert('Помилка оновлення'); 
    }
  };

  if (loading) return <div className="p-8">Завантаження...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Замовлення</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Клієнт</th>
              <th className="p-4">Сума</th>
              <th className="p-4">Статус</th>
              <th className="p-4">Дії</th>
            </tr>
          </thead>
          <tbody>
            {/* TypeScript тепер знає, що order має тип Order */}
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="p-4">#{order.id}</td>
                <td className="p-4">
                  <div className="font-medium">{order.fullName}</div>
                  <div className="text-xs text-gray-500">{order.phone}</div>
                </td>
                <td className="p-4 font-bold">{order.total} ₴</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold">{order.status}</span>
                </td>
                <td className="p-4">
                  <select 
                    value={order.status} 
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="border p-1 rounded text-sm bg-white"
                  >
                    <option value="PENDING">Очікує</option>
                    <option value="PAID">Оплачено</option>
                    <option value="SHIPPED">Відправлено</option>
                    <option value="CANCELLED">Скасовано</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}