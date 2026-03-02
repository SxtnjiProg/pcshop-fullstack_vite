import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowRight, Mail, Lock, User, AlertCircle } from 'lucide-react';

interface RegisterFormInputs {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting } // 🔥 Видалили watch звідси
  } = useForm<RegisterFormInputs>();

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setServerError('');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/register',
        { email: data.email, password: data.password, fullName: data.fullName },
        { withCredentials: true }
      );
      login(res.data);
      navigate('/profile');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setServerError(err.response?.data?.error || 'Помилка реєстрації');
      } else {
        setServerError('Сталася непередбачена помилка. Спробуйте пізніше.');
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-[#f8f9fa] py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-200"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-900 mb-3">Створення акаунта</h1>
          <p className="text-gray-500 text-base">Заповніть форму для реєстрації в магазині</p>
        </div>

        {serverError && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 text-red-700 p-4 rounded-2xl mb-8 border border-red-100 flex items-start gap-3 font-medium"
          >
            <AlertCircle size={22} className="shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* FULL NAME */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Ім'я та Прізвище</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <User size={20} />
              </div>
              <input
                type="text"
                {...register('fullName', { required: 'Введіть ваше ім\'я' })}
                className={`w-full pl-12 pr-4 py-3.5 bg-gray-50/50 rounded-2xl border outline-none transition-all text-base ${
                  errors.fullName ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50/50' : 'border-gray-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50/50'
                }`}
                placeholder="Іван Іваненко"
              />
            </div>
            {errors.fullName && <p className="text-red-500 text-sm mt-2 font-medium">{errors.fullName.message}</p>}
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email адреса</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Mail size={20} />
              </div>
              <input
                type="email"
                {...register('email', {
                  required: 'Введіть email',
                  pattern: { value: /^\S+@\S+$/i, message: 'Некоректний формат email' }
                })}
                className={`w-full pl-12 pr-4 py-3.5 bg-gray-50/50 rounded-2xl border outline-none transition-all text-base ${
                  errors.email ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50/50' : 'border-gray-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50/50'
                }`}
                placeholder="mail@example.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-2 font-medium">{errors.email.message}</p>}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Придумайте пароль</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Пароль обов\'язковий',
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/,
                    message: 'Мінімум 8 символів: велика і мала літери, та цифра'
                  }
                })}
                className={`w-full pl-12 pr-12 py-3.5 bg-gray-50/50 rounded-2xl border outline-none transition-all text-base ${
                  errors.password ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50/50' : 'border-gray-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50/50'
                }`}
                placeholder="Мінімум 8 символів"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-2 font-medium">{errors.password.message}</p>}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Підтвердіть пароль</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock size={20} />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword', {
                  required: 'Підтвердіть пароль',
                  // 🔥 ОСЬ ТУТ МАГІЯ: formValues містить всі поточні дані форми
                  validate: (value, formValues) => value === formValues.password || 'Паролі не співпадають'
                })}
                className={`w-full pl-12 pr-12 py-3.5 bg-gray-50/50 rounded-2xl border outline-none transition-all text-base ${
                  errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50/50' : 'border-gray-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50/50'
                }`}
                placeholder="Повторіть пароль"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-2 font-medium">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-100 mt-8 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>Зареєструватися <ArrowRight size={22} /></>
            )}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-gray-100 text-center text-base text-gray-500">
          Вже маєте акаунт?{' '}
          <Link to="/login" className="text-green-600 font-bold hover:text-green-700 hover:underline transition-colors">
            Увійти
          </Link>
        </div>
      </motion.div>
    </div>
  );
}