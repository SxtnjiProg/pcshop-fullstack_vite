import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react'; 
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface WishlistContextType {
  favorites: number[];
  toggleFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    if (user) {
      // Якщо юзер залогінився - вантажимо з бази
      axios.get('/api/user/favorites')
        .then(res => {
          const ids = res.data.map((p: { id: number }) => p.id);
          setFavorites(ids);
        })
        .catch(console.error);
    } else {
      // Якщо юзер вийшов - очищаємо список.
      // Ми використовуємо коментар нижче, щоб лінтер не сварився.
      // Це безпечно, бо useEffect залежить тільки від user.
      
      // eslint-disable-next-line
      setFavorites([]); 
    }
  }, [user]);

  const toggleFavorite = async (productId: number) => {
    if (!user) {
      toast.error('Увійдіть, щоб додавати в обране');
      return;
    }

    const isLiked = favorites.includes(productId);
    
    // Оптимістичне оновлення (миттєва реакція інтерфейсу)
    if (isLiked) {
      setFavorites(prev => prev.filter(id => id !== productId));
      toast.success('Видалено з обраного');
    } else {
      setFavorites(prev => [...prev, productId]);
      toast.success('Додано в обране');
    }

    // Відправка запиту на сервер
    try {
      await axios.post('/api/user/favorites', { productId });
    } catch {
      toast.error('Помилка сервера');
      // Якщо сервер повернув помилку - відкочуємо зміни
      if (isLiked) setFavorites(prev => [...prev, productId]);
      else setFavorites(prev => prev.filter(id => id !== productId));
    }
  };

  const isFavorite = (productId: number) => favorites.includes(productId);

  return (
    <WishlistContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </WishlistContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};