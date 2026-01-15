import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Shield, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSettings() {
  const { user } = useAuth();
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await axios.put('http://localhost:5000/api/auth/password', passData);
      setMessage({ type: 'success', text: 'Пароль успішно оновлено!' });
      setPassData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      setMessage({ type: 'error', text: error.response?.data?.error || 'Помилка зміни пароля' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900">Налаштування</h1>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-2xl">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 pb-4 border-b">
          <Shield className="text-green-600" /> Безпека та вхід
        </h2>
        
        {/* Інфо про акаунт */}
        <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
           <div>
             <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Активний акаунт</p>
             <p className="font-medium text-lg text-gray-900">{user?.email}</p>
           </div>
           <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider border border-green-200">
             {user?.role}
           </span>
        </div>

        {/* Форма зміни пароля */}
        <form onSubmit={handlePasswordChange} className="space-y-5">
          {message && (
            <div className={`p-4 rounded-xl text-sm flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Поточний пароль</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              value={passData.currentPassword}
              onChange={e => setPassData({...passData, currentPassword: e.target.value})}
              placeholder="Введи старий пароль"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Новий пароль</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              value={passData.newPassword}
              onChange={e => setPassData({...passData, newPassword: e.target.value})}
              placeholder="Введи новий пароль"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50 shadow-lg"
            >
              <Save size={18} /> {loading ? 'Збереження...' : 'Змінити пароль'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}