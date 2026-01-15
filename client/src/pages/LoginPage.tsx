import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setServerError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', data);
      login(res.data.token, res.data);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      setServerError(error.response?.data?.error || 'Невірний логін або пароль');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative overflow-hidden bg-white">
      {/* Анімовані абстрактні хвилі */}
      <motion.div 
        className="absolute w-[600px] h-[600px] bg-green-100/20 rounded-full top-[-10rem] left-[-10rem] blur-[120px]"
        animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div 
        className="absolute w-[500px] h-[500px] bg-green-200/10 rounded-full bottom-[-8rem] right-[-8rem] blur-[100px]"
        animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl border border-gray-200 relative z-10"
      >
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gray-900 tracking-tight"
          >
            З поверненням
          </motion.h1>
        </div>

        {serverError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100 flex items-center gap-2"
          >
            ⚠️ {serverError}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <motion.div whileFocus={{ scale: 1.02 }} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input 
              {...register('email', { 
                required: 'Введи email', 
                pattern: { value: /^\S+@\S+$/i, message: 'Некоректний email' } 
              })}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 transition-all outline-none ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-green-500'}`}
              placeholder="example@mail.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </motion.div>

          {/* Password */}
          <motion.div whileFocus={{ scale: 1.02 }} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Пароль</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                {...register('password', { required: 'Введи пароль', minLength: { value: 6, message: 'Мінімум 6 символів' } })}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 transition-all outline-none ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-green-500'}`}
                placeholder="••••••••"
              />
              <motion.button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </motion.button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </motion.div>

          <motion.button 
            type="submit" 
            disabled={isSubmitting}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-green-500 text-black py-3.5 rounded-xl font-bold text-lg hover:bg-green-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/20"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <>Увійти <ArrowRight size={20} /></>}
          </motion.button>
        </form>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          Не маєш акаунту?{' '}
          <Link to="/register" className="text-black font-semibold hover:underline">
            Зареєструватися
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
