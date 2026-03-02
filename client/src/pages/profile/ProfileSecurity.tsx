import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff, Shield, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileSecurity() {
  const [passData, setPassData] = useState({ 
    currentPassword: '', 
    newPassword: '',
    confirmPassword: '' 
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [status, setStatus] = useState<{ type: 'success' | 'error' | '', text: string }>({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassData({ ...passData, [e.target.name]: e.target.value });
    // Очищаємо статус при введенні
    if (status.text) setStatus({ type: '', text: '' });
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 1, text: 'Слабкий', color: 'bg-red-500' },
      { strength: 2, text: 'Середній', color: 'bg-yellow-500' },
      { strength: 3, text: 'Добрий', color: 'bg-blue-500' },
      { strength: 4, text: 'Сильний', color: 'bg-green-500' },
      { strength: 5, text: 'Дуже сильний', color: 'bg-green-600' }
    ];

    return levels.find(l => l.strength === strength) || levels[0];
  };

  const passwordStrength = getPasswordStrength(passData.newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: '', text: '' });

    if (passData.newPassword !== passData.confirmPassword) {
      setStatus({ type: 'error', text: 'Нові паролі не співпадають' });
      return;
    }

    if (passData.newPassword.length < 6) {
      setStatus({ type: 'error', text: 'Пароль має бути не менше 6 символів' });
      return;
    }

    setLoading(true);
    try {
      await axios.put('http://localhost:5000/api/auth/password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      
      setStatus({ type: 'success', text: 'Пароль успішно оновлено!' });
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswords({ current: false, new: false, confirm: false });
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      setStatus({ type: 'error', text: error.response?.data?.error || 'Помилка зміни пароля' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Shield className="text-green-600" size={28} />
          Безпека
        </h2>
        <p className="text-sm text-gray-600">Керуйте паролем та налаштуваннями безпеки</p>
      </div>

      {/* Форма зміни пароля */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Key size={18} className="text-green-600" />
            Зміна пароля
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Статус повідомлення */}
          <AnimatePresence>
            {status.text && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                  status.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                <span className="font-medium">{status.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Поточний пароль */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Поточний пароль</label>
            <div className="relative">
              <input 
                type={showPasswords.current ? "text" : "password"}
                name="currentPassword"
                value={passData.currentPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                placeholder="Введіть поточний пароль"
                required 
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Новий пароль */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Новий пароль</label>
            <div className="relative">
              <input 
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={passData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                placeholder="Введіть новий пароль"
                required 
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Індикатор сили пароля */}
            {passData.newPassword && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Складність пароля:</span>
                  <span className={`font-medium ${
                    passwordStrength.strength >= 4 ? 'text-green-600' : 
                    passwordStrength.strength >= 3 ? 'text-blue-600' :
                    passwordStrength.strength >= 2 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {passwordStrength.text}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Підтвердження пароля */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Підтвердіть новий пароль</label>
            <div className="relative">
              <input 
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={passData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 outline-none transition-all text-sm ${
                  passData.confirmPassword && passData.newPassword !== passData.confirmPassword 
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-300' 
                    : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                }`}
                placeholder="Повторіть новий пароль"
                required 
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passData.confirmPassword && passData.newPassword !== passData.confirmPassword && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                Паролі не співпадають
              </p>
            )}
            {passData.confirmPassword && passData.newPassword === passData.confirmPassword && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle size={12} />
                Паролі співпадають
              </p>
            )}
          </div>

          {/* Кнопка */}
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading || (!!passData.confirmPassword && passData.newPassword !== passData.confirmPassword)}
              className="w-full sm:w-auto bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Оновлення...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Змінити пароль
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Поради безпеки */}
      <div className="bg-green-50 border border-green-100 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
          <Shield size={16} />
          Поради для створення надійного пароля
        </h4>
        <ul className="text-xs text-green-800 space-y-1 ml-6 list-disc">
          <li>Використовуйте мінімум 8 символів</li>
          <li>Поєднуйте великі та малі літери</li>
          <li>Додайте цифри та спеціальні символи</li>
          <li>Уникайте очевидних слів та дат</li>
        </ul>
      </div>
    </div>
  );
}