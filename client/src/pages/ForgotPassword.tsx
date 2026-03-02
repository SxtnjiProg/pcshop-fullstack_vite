import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Введіть ваш email');

    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setIsSent(true);
      toast.success('Лист відправлено!');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || 'Помилка відправки листа');
      } else {
        toast.error('Сталася непередбачена помилка');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900">Відновлення пароля</h2>
          <p className="text-gray-500 mt-2">
            Введіть email, який ви вказували при реєстрації.
          </p>
        </div>

        {isSent ? (
          <div className="text-center bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Перевірте пошту</h3>
            <p className="text-sm text-gray-600 mb-6">
              Ми відправили посилання для відновлення на <span className="font-bold">{email}</span>. 
              Якщо листа немає, перевірте папку "Спам".
            </p>
            <Link to="/login" className="inline-block bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-700 transition">
              Повернутися до входу
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email адреса</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  placeholder="mail@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition shadow-lg flex justify-center items-center disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Відправити посилання'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="text-gray-500 hover:text-emerald-600 font-medium inline-flex items-center gap-1 transition">
            <ArrowLeft size={16} /> Я згадав пароль
          </Link>
        </div>
      </div>
    </div>
  );
}