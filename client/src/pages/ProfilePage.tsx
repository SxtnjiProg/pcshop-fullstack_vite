import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios, { AxiosError } from 'axios'; // <--- Додали AxiosError
import { User, Package, Lock, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'security'>('info');
  
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/auth/password', passData);
      setMessage('Пароль успішно змінено!');
      setPassData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      // Правильно типізуємо помилку
      const error = err as AxiosError<{ error: string }>;
      setMessage(error.response?.data?.error || 'Помилка');
    }
  };

  if (!user) return <div className="p-10 text-center">Ви не авторизовані</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR */}
        <div className="w-full md:w-1/4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold">{user.fullName}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('info')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'info' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
            >
              <User size={18} /> Особисті дані
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'orders' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
            >
              <Package size={18} /> Мої замовлення
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'security' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
            >
              <Lock size={18} /> Безпека
            </button>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 bg-white border border-gray-200 hover:bg-red-50 transition mt-4"
            >
              <LogOut size={18} /> Вийти
            </button>
          </nav>
        </div>

        {/* CONTENT */}
        <div className="w-full md:w-3/4">
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
            
            {/* TAB: INFO */}
            {activeTab === 'info' && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-6">Особиста інформація</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">ПІБ</label>
                    <div className="text-lg font-medium">{user.fullName}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <div className="text-lg font-medium">{user.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Роль</label>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold">{user.role}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ORDERS */}
            {activeTab === 'orders' && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-6">Історія замовлень</h2>
                <div className="text-center py-10 text-gray-500">
                  <Package size={48} className="mx-auto mb-3 text-gray-300" />
                  Ви ще нічого не замовляли
                </div>
              </div>
            )}

            {/* TAB: SECURITY */}
            {activeTab === 'security' && (
              <div className="animate-fade-in max-w-md">
                <h2 className="text-2xl font-bold mb-6">Зміна пароля</h2>
                {message && <div className={`p-3 rounded mb-4 text-sm ${message.includes('успішно') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{message}</div>}
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Поточний пароль</label>
                    <input type="password" required className="w-full border p-2 rounded-lg" value={passData.currentPassword} onChange={e => setPassData({...passData, currentPassword: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Новий пароль</label>
                    <input type="password" required className="w-full border p-2 rounded-lg" value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} />
                  </div>
                  <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition">Оновити пароль</button>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}