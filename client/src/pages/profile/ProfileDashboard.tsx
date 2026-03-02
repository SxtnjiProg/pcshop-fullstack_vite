import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import axios, { AxiosError } from 'axios';
import { User, Phone, MapPin, Save, CheckCircle, AlertCircle, X } from 'lucide-react';

export default function ProfileDashboard() {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({ fullName: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCompleteBanner, setShowCompleteBanner] = useState(false);
  const [hideProgressBar, setHideProgressBar] = useState(false);

  // Ініціалізація при завантаженні
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        address: user.address || ''
      });

      const filledFields = [user.fullName, user.phone, user.address].filter(Boolean).length;
      const progress = (filledFields / 3) * 100;

      // Banner
      const bannerHidden = localStorage.getItem('profileBannerHidden') === 'true';
      if (progress === 100 && !bannerHidden) {
        setShowCompleteBanner(true);
      }

      // Progress bar
      const progressHidden = localStorage.getItem('progressBarHidden') === 'true';
      if (progress === 100 && progressHidden) {
        setHideProgressBar(true);
      }
    }
  }, [user]);

  const handleCloseBanner = () => {
    setShowCompleteBanner(false);
    localStorage.setItem('profileBannerHidden', 'true');
  };

  const handleCloseProgressBar = () => {
    setHideProgressBar(true);
    localStorage.setItem('progressBarHidden', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await axios.put('http://localhost:5000/api/auth/profile', formData);
      login(data);
      setMessage({ type: 'success', text: 'Оновлено' });

      const filledFields = [data.fullName, data.phone, data.address].filter(Boolean).length;
      const progress = (filledFields / 3) * 100;

      if (progress === 100) {
        setShowCompleteBanner(true);
        localStorage.removeItem('profileBannerHidden');
        setHideProgressBar(true);
        localStorage.setItem('progressBarHidden', 'true');
      }

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      setMessage({ type: 'error', text: axiosError.response?.data?.error || 'Помилка' });
    } finally {
      setLoading(false);
    }
  };

  const filledFields = [user?.fullName, user?.phone, user?.address].filter(Boolean).length;
  const progress = (filledFields / 3) * 100;

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <User className="text-green-600" size={20} /> Особисті дані
        </h2>
        <p className="text-xs text-gray-500 mt-1">Редагування основної інформації вашого профілю</p>
      </section>

      {/* Banner для 100% */}
      {showCompleteBanner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-green-100 text-green-700 p-3 rounded-xl text-xs font-semibold flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle size={14} />
            Профіль заповнено на 100%
          </div>
          <button onClick={handleCloseBanner} className="p-1 hover:bg-green-200 rounded-full transition">
            <X size={14} />
          </button>
        </motion.div>
      )}

      {/* Компактний прогрес */}
      {!hideProgressBar && (
        <motion.section
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50/50 p-4 rounded-2xl border border-green-100/50 relative"
        >
          <button
            onClick={handleCloseProgressBar}
            className="absolute top-2 right-2 text-green-700 hover:text-green-900 transition"
          >
            <X size={12} />
          </button>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold text-green-800">Заповнення</h3>
            <span className="text-xs font-black text-green-700">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white rounded-full h-1.5 shadow-inner overflow-hidden border border-green-100/50">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${progress}%` }} 
              className="bg-green-500 h-full rounded-full"
              transition={{ duration: 1 }}
            />
          </div>
        </motion.section>
      )}

      {/* Форма */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {message.text && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">ПІБ</label>
            <input 
              type="text" value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Email</label>
            <input 
              type="email" value={user?.email || ''} disabled 
              className="w-full p-2.5 text-sm bg-gray-100 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed" 
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Телефон</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="tel" value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full pl-9 p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                placeholder="+380..."
              />
            </div>
          </div>
          
          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Адреса</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full pl-9 p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                placeholder="Місто, відділення"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit" disabled={loading}
            className="w-full sm:w-auto bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {loading ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>
      </form>
    </div>
  );
}
