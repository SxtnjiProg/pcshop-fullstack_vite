import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios'; // <--- 1. Додали імпорт типу помилки
import { Plus, Trash2, Layers, X, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  id: number;
  name: string;
  slug: string;
  _count?: { products: number };
}

// Інтерфейс для помилки з бекенду (ми знаємо, що там приходить { error: string })
interface ApiErrorResponse {
  error: string;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Стан для модалки
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/categories');
      setCategories(res.data);
    } catch { 
      // 2. ВИПРАВЛЕННЯ: Прибрали (error), бо ми його не використовували
      toast.error('Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await axios.post('http://localhost:5000/api/categories', { name: newCategoryName });
      toast.success('Категорію створено! 🎉');
      setNewCategoryName('');
      setIsModalOpen(false);
      fetchCategories(); 
    } catch (err) {
      // 3. ВИПРАВЛЕННЯ: Правильна типізація замість :any
      const error = err as AxiosError<ApiErrorResponse>;
      toast.error(error.response?.data?.error || 'Помилка створення');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Видалити цю категорію?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/categories/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Видалено');
    } catch (err) {
      // 4. ВИПРАВЛЕННЯ: Правильна типізація
      const error = err as AxiosError<ApiErrorResponse>;
      toast.error(error.response?.data?.error || 'Помилка видалення');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold flex items-center gap-3">
             <Layers className="text-green-600" /> Категорії
           </h1>
           <p className="text-gray-500 mt-1">Керування розділами магазину</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition flex items-center gap-2 shadow-lg shadow-black/20 font-medium"
        >
          <Plus size={20} /> Нова категорія
        </button>
      </div>

      {/* Grid Сітка Категорій */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
           <p className="text-gray-400">Завантаження...</p>
        ) : categories.map((cat) => (
          <div key={cat.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="bg-green-50 p-2.5 rounded-lg text-green-600">
                  <FolderOpen size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{cat.name}</h3>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">/{cat.slug}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>Товарів: <b className="text-black">{cat._count?.products || 0}</b></span>
              
              <button 
                onClick={() => handleDelete(cat.id)}
                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition"
                title="Видалити"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* МОДАЛКА СТВОРЕННЯ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold mb-1">Нова категорія</h2>
              <p className="text-gray-500 text-sm mb-6">Введіть назву, а посилання (slug) згенерується автоматично.</p>

              <form onSubmit={handleCreate}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Назва категорії</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Наприклад: Монітори"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition mb-6"
                />

                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition"
                  >
                    Скасувати
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition"
                  >
                    Створити
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}