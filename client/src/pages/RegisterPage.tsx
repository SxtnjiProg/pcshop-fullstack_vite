import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';

interface RegisterFormInputs {
  fullName: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormInputs>();

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setServerError('');

    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/register',
        data,
        {
          withCredentials: true // 🔥 ОБОВʼЯЗКОВО ДЛЯ SESSION
        }
      );

      // 🔥 Передаємо просто user
      login(res.data);

      // Редірект
      navigate('/profile');

    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      setServerError(
        error.response?.data?.error || 'Помилка реєстрації'
      );
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Створити акаунт 🚀
          </h1>
          <p className="text-gray-500 mt-2">
            Приєднуйся до нас за хвилину
          </p>
        </div>

        {serverError && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100">
            ⚠️ {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Повне ім'я
            </label>
            <input
              {...register('fullName', { required: "Ім'я обов'язкове" })}
              className={`w-full px-4 py-3 rounded-xl border outline-none ${
                errors.fullName
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 focus:border-black'
              }`}
              placeholder="Максим Пархоменко"
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              {...register('email', {
                required: 'Введи email',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Некоректний email'
                }
              })}
              className={`w-full px-4 py-3 rounded-xl border outline-none ${
                errors.email
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 focus:border-black'
              }`}
              placeholder="example@mail.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Пароль
            </label>
            <input
              type="password"
              {...register('password', {
                required: 'Введи пароль',
                minLength: {
                  value: 6,
                  message: 'Мінімум 6 символів'
                }
              })}
              className={`w-full px-4 py-3 rounded-xl border outline-none ${
                errors.password
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 focus:border-black'
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                Створити акаунт <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Вже є акаунт?{' '}
          <Link
            to="/login"
            className="text-black font-semibold hover:underline"
          >
            Увійти
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
