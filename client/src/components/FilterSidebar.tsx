import { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, X, SlidersHorizontal } from 'lucide-react';
import qs from 'qs';

export interface FilterState {
  category: string | null;
  minPrice: string;
  maxPrice: string;
  [key: string]: string | string[] | null; 
}

interface FilterProps {
  onFilterChange: (filters: FilterState) => void;
  currentCategory: string | null;
  currentFilters: FilterState;
}

// Інтерфейс для категорій, які прийдуть з бекенду
interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function FilterSidebar({ onFilterChange, currentCategory, currentFilters }: FilterProps) {
  const [priceRange, setPriceRange] = useState({
    min: currentFilters.minPrice || '',
    max: currentFilters.maxPrice || ''
  });
  
  // 1. Стейт для списку категорій (тепер динамічний)
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [availableFilters, setAvailableFilters] = useState<Record<string, string[]>>({});

  // 2. Завантажуємо категорії при першому рендері
  useEffect(() => {
    axios.get('http://localhost:5000/api/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Помилка завантаження категорій:', err));
  }, []);

  const hasActiveFilters = () => {
    const hasPrice = !!currentFilters.minPrice || !!currentFilters.maxPrice;
    const hasSpecs = Object.keys(currentFilters).some(key => 
      !['category', 'minPrice', 'maxPrice'].includes(key)
    );
    return hasPrice || hasSpecs;
  };

  const clearAllFilters = () => {
    setPriceRange({ min: '', max: '' });
    onFilterChange({
      category: currentCategory,
      minPrice: '',
      maxPrice: ''
    });
  };

  useEffect(() => {
    const newMin = currentFilters.minPrice || '';
    const newMax = currentFilters.maxPrice || '';
    if (priceRange.min !== newMin || priceRange.max !== newMax) {
      setPriceRange({ min: newMin, max: newMax });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilters.minPrice, currentFilters.maxPrice]); 

  // Завантаження доступних характеристик (динамічні фільтри)
  useEffect(() => {
    if (currentCategory) {
      const queryString = qs.stringify(currentFilters, { arrayFormat: 'repeat' });
      axios.get(`http://localhost:5000/api/filters?${queryString}`)
        .then(res => setAvailableFilters(res.data))
        .catch(err => console.error(err));
    } else {
        // Якщо категорія не обрана, можна очистити специфікації або завантажити загальні
        setAvailableFilters({});
    }
  }, [currentCategory, currentFilters]);

  const isSpecSelected = (key: string, value: string): boolean => {
    const currentValues = currentFilters[key];
    if (Array.isArray(currentValues)) {
      return currentValues.includes(value);
    }
    return currentValues === value;
  };

  const handleCategoryClick = (catSlug: string) => {
    // Якщо клікнули на вже активну категорію — знімаємо виділення
    const newCategory = currentCategory === catSlug ? null : catSlug;
    
    // При зміні категорії скидаємо специфікації, але залишаємо ціну
    onFilterChange({
      category: newCategory,
      minPrice: priceRange.min,
      maxPrice: priceRange.max
    });
  };

  const handleSpecChange = (key: string, value: string) => {
    const currentRaw = currentFilters[key];
    let currentValues: string[] = [];
    if (Array.isArray(currentRaw)) currentValues = currentRaw;
    else if (typeof currentRaw === 'string') currentValues = [currentRaw];

    let newValues;
    if (currentValues.includes(value)) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }

    const updatedFilters = { ...currentFilters };
    if (newValues.length > 0) {
      updatedFilters[key] = newValues;
    } else {
      delete updatedFilters[key];
    }
    onFilterChange(updatedFilters);
  };

  const applyPrice = () => {
    onFilterChange({
      ...currentFilters,
      minPrice: priceRange.min,
      maxPrice: priceRange.max
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-8">
      
      {/* --- ЗАГОЛОВОК --- */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-gray-900 font-bold">
          <SlidersHorizontal size={20} />
          <span>Фільтри</span>
        </div>
        
        {hasActiveFilters() && (
          <button 
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition"
          >
            <X size={14} /> Очистити
          </button>
        )}
      </div>

      {/* --- ЦІНА --- */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase">Ціна, ₴</h3>
        <div className="flex gap-2 mb-2">
          <input type="number" placeholder="Від" className="w-full border p-2 rounded text-sm outline-none focus:border-green-500"
            value={priceRange.min} onChange={e => setPriceRange({...priceRange, min: e.target.value})} />
          <input type="number" placeholder="До" className="w-full border p-2 rounded text-sm outline-none focus:border-green-500"
            value={priceRange.max} onChange={e => setPriceRange({...priceRange, max: e.target.value})} />
        </div>
        <button onClick={applyPrice} className="w-full bg-gray-100 hover:bg-green-100 text-green-700 font-bold py-2 rounded text-sm transition">ОК</button>
      </div>

      {/* --- КАТЕГОРІЇ (ДИНАМІЧНІ) --- */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase">Категорії</h3>
        <div className="space-y-1">
          {/* Якщо категорії ще вантажаться, можна показати скелетон або текст */}
          {categories.length === 0 && <p className="text-gray-400 text-xs">Завантаження...</p>}
          
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              // 3. Використовуємо cat.slug для фільтрації
              onClick={() => handleCategoryClick(cat.slug)}
              className={`flex justify-between p-2 rounded cursor-pointer text-sm transition ${
                currentCategory === cat.slug ? 'bg-green-50 text-green-700 font-bold' : 'hover:bg-gray-50'
              }`}
            >
              <span>{cat.name}</span>
              {currentCategory === cat.slug && <Check size={16} />}
            </div>
          ))}
        </div>
      </div>

      {/* --- ДИНАМІЧНІ СПЕЦИФІКАЦІЇ --- */}
      {currentCategory && Object.entries(availableFilters).map(([key, values]) => (
        <div key={key}>
          <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase">{key}</h3>
          <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar pr-1">
            {values.map((val) => {
              const isChecked = isSpecSelected(key, val);
              return (
                <div 
                  key={val} 
                  onClick={() => handleSpecChange(key, val)}
                  className="flex items-center gap-2 cursor-pointer text-sm hover:text-green-700 select-none py-1 group"
                >
                  <div 
                    className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${isChecked ? 'bg-green-600 border-green-600' : 'border-gray-300 group-hover:border-green-500'}`}
                  >
                    {isChecked && <Check size={12} className="text-white" />}
                  </div>
                  <span>{val}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}