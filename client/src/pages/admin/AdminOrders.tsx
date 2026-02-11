import { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Check, X, Clock, User, Truck, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

// 👇 1. Типізація елементів замовлення
interface AdminOrderItem {
  id: number;
  quantity: number;
  product: {
    title: string;
  };
}

interface AdminOrder {
  id: number;
  fullName: string;
  phone: string;
  city: string;
  total: number;
  status: string;
  ttn?: string;
  createdAt: string;
  items: AdminOrderItem[]; // 👇 Використовуємо типізований масив замість any[]
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newTtn, setNewTtn] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders/all');
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingOrder) return;
    try {
      await axios.put(`/api/orders/${editingOrder.id}/status`, {
        status: newStatus,
        ttn: newTtn
      });
      
      toast.success('Статус оновлено');
      setEditingOrder(null);
      fetchOrders();
    } catch (error) {
      // 👇 2. Використовуємо змінну error (логуємо її), щоб лінтер не сварився
      console.error('Update error:', error); 
      toast.error('Помилка оновлення');
    }
  };

  const openEditModal = (order: AdminOrder) => {
    setEditingOrder(order);
    setNewStatus(order.status);
    setNewTtn(order.ttn || '');
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PAID': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex w-fit items-center gap-1"><Check size={12}/> Оплачено</span>;
      case 'SHIPPED': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold flex w-fit items-center gap-1"><Truck size={12}/> Відправлено</span>;
      case 'DELIVERED': return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold flex w-fit items-center gap-1"><Check size={12}/> Доставлено</span>;
      case 'PENDING': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold flex w-fit items-center gap-1"><Clock size={12}/> Очікує</span>;
      case 'CANCELLED': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold flex w-fit items-center gap-1"><X size={12}/> Скасовано</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">{status}</span>;
    }
  };

  if (loading) return <div className="p-8">Завантаження...</div>;

  return (
    <div className="space-y-6 relative">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Package className="text-green-600" /> Всі замовлення
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Клієнт</th>
              <th className="p-4">Сума</th>
              <th className="p-4">Статус</th>
              <th className="p-4">ТТН</th>
              <th className="p-4">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-700">#{order.id}</td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-medium flex items-center gap-1"><User size={12}/> {order.fullName}</span>
                    <span className="text-xs text-gray-500">{order.phone}</span>
                  </div>
                </td>
                <td className="p-4 font-bold">{order.total.toLocaleString()} ₴</td>
                <td className="p-4">{getStatusBadge(order.status)}</td>
                <td className="p-4 font-mono text-xs">{order.ttn || '-'}</td>
                <td className="p-4">
                  <button 
                    onClick={() => openEditModal(order)}
                    className="p-2 bg-gray-100 hover:bg-green-50 hover:text-green-600 rounded-lg transition"
                  >
                    <Edit size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* МОДАЛЬНЕ ВІКНО РЕДАГУВАННЯ */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Редагувати замовлення #{editingOrder.id}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                <select 
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="PENDING">Очікує оплати</option>
                  <option value="PAID">Оплачено (Готується)</option>
                  <option value="SHIPPED">Відправлено</option>
                  <option value="DELIVERED">Доставлено</option>
                  <option value="CANCELLED">Скасовано</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ТТН (Tracking Number)</label>
                <input 
                  type="text" 
                  value={newTtn}
                  onChange={(e) => setNewTtn(e.target.value)}
                  placeholder="204505..."
                  className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-400 mt-1">Введіть номер накладної Нової Пошти</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleUpdate}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition"
                >
                  Зберегти
                </button>
                <button 
                  onClick={() => setEditingOrder(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-200 transition"
                >
                  Скасувати
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}