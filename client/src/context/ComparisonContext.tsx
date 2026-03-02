import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import toast from 'react-hot-toast';

export interface Product { // Експортуємо інтерфейс, якщо він знадобиться в інших місцях
  id: number;
  title: string;
  price: number; 
  images: string[];
  slug: string; // <--- ДОДАНО: це виправить помилку
  specifications?: Record<string, string>; 
  category: { name: string };
}

interface ComparisonContextType {
  items: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (id: number) => void;
  clearComparison: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider = ({ children }: { children: ReactNode }) => {
  // 1. Ініціалізуємо стейт з localStorage
  const [items, setItems] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('comparison_items');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to parse comparison items', error);
      return [];
    }
  });

  // 2. Зберігаємо в localStorage при кожній зміні items
  useEffect(() => {
    localStorage.setItem('comparison_items', JSON.stringify(items));
  }, [items]);

  const addToCompare = (product: Product) => {
    // Перевірка на дублікат
    if (items.some(i => i.id === product.id)) {
      toast('Цей товар вже в порівнянні', { icon: 'ℹ️' });
      return;
    }
    
    // Перевірка категорії (можна порівнювати тільки одну категорію)
    if (items.length > 0 && items[0].category.name !== product.category.name) {
      toast.error(`Можна порівнювати тільки товари категорії "${items[0].category.name}"!`);
      return;
    }
    
    // Ліміт на кількість
    if (items.length >= 4) {
      toast.error('Максимум 4 товари для порівняння');
      return;
    }

    setItems(prev => [...prev, product]);
    toast.success('Додано до порівняння');
  };

  const removeFromCompare = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clearComparison = () => {
    setItems([]);
    toast.success('Список порівняння очищено');
  };

  return (
    <ComparisonContext.Provider value={{ items, addToCompare, removeFromCompare, clearComparison }}>
      {children}
    </ComparisonContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) throw new Error('useComparison must be used within ComparisonProvider');
  return context;
};