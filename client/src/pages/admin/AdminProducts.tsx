import { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Upload, Search, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';

// --- ІНТЕРФЕЙСИ ---
interface Product {
  id: number;
  title: string;
  price: number;
  category: { name: string } | null;
}

interface ImportProduct {
  title: string;
  price: string;
  categoryName: string;
  images: string[];
  specifications: Record<string, string>;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Стейт для пошуку та фільтрації
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/products?limit=1000')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Видалити цей товар?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
      toast.success('Товар видалено');
    } catch (err) {
      console.error(err);
      toast.error('Помилка видалення');
    }
  };

  // --- ЛОГІКА МАСОВОГО ІМПОРТУ (Залишаємо як було) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      let parsedData: ImportProduct[] = [];

      if (file.name.endsWith('.csv')) {
        parsedData = parseCSV(text);
      } else {
        parsedData = parseTXT(text);
      }

      if (parsedData.length === 0) {
        toast.error('Не знайдено товарів у файлі');
        return;
      }

      if (!window.confirm(`Знайдено ${parsedData.length} товарів. Завантажити їх у базу?`)) return;

      const loadingToast = toast.loading(`Імпорт ${parsedData.length} товарів...`);
      try {
        const res = await axios.post('http://localhost:5000/api/products/batch', parsedData);
        toast.success(`Успішно додано: ${res.data.count}`);
        if (res.data.errors && res.data.errors.length > 0) {
          console.warn('Errors during import:', res.data.errors);
          toast(`${res.data.errors.length} товарів пропущено`, { icon: '⚠️' });
        }
        fetchProducts();
      } catch (err) {
        console.error(err);
        toast.error('Помилка сервера при імпорті');
      } finally {
        toast.dismiss(loadingToast);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const parseTXT = (text: string): ImportProduct[] => {
    const blocks = text.split(/\n\s*\n/);
    return blocks.map((block): ImportProduct | null => {
      const lines = block.split('\n');
      const item: ImportProduct = { title: '', price: '', categoryName: '', images: [], specifications: {} };
      lines.forEach(line => {
        const [key, ...valParts] = line.split(':');
        if (!key) return;
        const val = valParts.join(':').trim();
        const k = key.trim().toLowerCase();
        if (k.includes('назва') || k === 'title') item.title = val;
        else if (k.includes('ціна') || k === 'price') item.price = val;
        else if (k.includes('категорія') || k === 'category') item.categoryName = val;
        else if (k.includes('фото') || k === 'image') item.images.push(val);
        else if (val) item.specifications[key.trim()] = val;
      });
      if (item.title && item.price && item.categoryName) return item;
      return null;
    }).filter((item): item is ImportProduct => item !== null);
  };

  const parseCSV = (text: string): ImportProduct[] => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(/[;,]/).map(h => h.trim().toLowerCase());
    const result: ImportProduct[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(/[;,]/).map(v => v.trim());
      if (values.length < 3) continue;
      const item: ImportProduct = { title: '', price: '', categoryName: '', images: [], specifications: {} };
      headers.forEach((header, index) => {
        const val = values[index];
        if (!val) return;
        if (header.includes('назва') || header === 'title') item.title = val;
        else if (header.includes('ціна') || header === 'price') item.price = val;
        else if (header.includes('категорія') || header === 'category') item.categoryName = val;
        else if (header.includes('фото') || header === 'image') item.images = val.split(' ').filter(Boolean);
        else item.specifications[headers[index]] = val;
      });
      if (item.title && item.price && item.categoryName) result.push(item);
    }
    return result;
  };

  // --- НОВА ЛОГІКА ФІЛЬТРАЦІЇ ---
  
  // 1. Отримуємо список унікальних категорій з завантажених товарів
  const categories = useMemo(() => {
    const cats = products.map(p => p.category?.name).filter(Boolean) as string[];
    return Array.from(new Set(cats)).sort();
  }, [products]);

  // 2. Фільтруємо товари
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category?.name === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Товари ({filteredProducts.length})</h1>
        
        <div className="flex gap-2">
          <div className="relative">
            <input 
              type="file" 
              accept=".txt,.csv" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-100"
            >
              <Upload size={20} /> Масовий імпорт
            </button>
          </div>

          <Link to="/admin/products/new" className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition flex items-center gap-2 shadow-lg shadow-green-100">
            <Plus size={20} /> Додати
          </Link>
        </div>
      </div>

      {/* --- ПАНЕЛЬ ПОШУКУ ТА ФІЛЬТРІВ --- */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        
        {/* Пошук */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Пошук за назвою..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Фільтр категорії */}
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select 
            className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer transition"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Всі категорії</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {/* Стрілочка для селекта (кастомна) */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
            ▼
          </div>
        </div>

      </div>

      {/* ТАБЛИЦЯ ТОВАРІВ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="p-4">Назва</th>
              <th className="p-4">Ціна</th>
              <th className="p-4">Категорія</th>
              <th className="p-4 text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
               <tr><td colSpan={4} className="p-10 text-center text-gray-400">Завантаження...</td></tr>
            ) : filteredProducts.length === 0 ? (
               <tr><td colSpan={4} className="p-10 text-center text-gray-400">Нічого не знайдено</td></tr>
            ) : filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition group">
                <td className="p-4 font-medium text-gray-900">{p.title}</td>
                <td className="p-4 text-green-600 font-bold">{p.price} ₴</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                    selectedCategory === p.category?.name ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {p.category?.name || 'Без категорії'}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/admin/products/edit/${p.id}`} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                    <Pencil size={18} />
                  </Link>
                  <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}