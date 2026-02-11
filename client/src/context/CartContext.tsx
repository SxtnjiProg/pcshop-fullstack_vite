import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// 1. ВИПРАВЛЕНИЙ ІНТЕРФЕЙС ТОВАРУ В КОШИКУ
export interface CartItem {
  id: number;          // Унікальний ID запису в кошику (або timestamp для гостя)
  productId: number;   // ID самого товару
  title: string;
  price: number;
  image: string;       // Саме image (одна картинка), а не масив
  quantity: number;
  slug: string;        // Додали slug для посилань
}

// Інтерфейс вхідного товару (те, що передаємо в addToCart)
interface ProductInput {
  id: number;
  title: string;
  price: number;
  slug?: string;       // Може бути необов'язковим, якщо генеруємо
  images?: string[];   // Масив картинок з бекенду
  imageUrl?: string;   // Або одна картинка (старий варіант)
}

// Інтерфейс елемента кошика з сервера
interface ServerCartItem {
  id: number;
  product: {
    id: number;
    title: string;
    price: number;
    images?: string[];
    imageUrl?: string;
    slug?: string;
  };
  quantity: number;
}

// 2. ВИПРАВЛЕНИЙ ІНТЕРФЕЙС КОНТЕКСТУ
interface CartContextType {
  items: CartItem[];
  addToCart: (product: ProductInput) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void; // <--- Додали функцію
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  
  // Лінива ініціалізація
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const localCart = localStorage.getItem('guest_cart');
      return localCart ? JSON.parse(localCart) : [];
    } catch {
      return [];
    }
  });

  // Завантаження з сервера
  const fetchServerCart = useCallback(async () => {
    try {
      const res = await axios.get('/api/cart');
      
      // Мапимо відповідь сервера у наш зручний формат CartItem
      const mappedItems = res.data.map((item: ServerCartItem) => ({
        id: item.id,
        productId: item.product.id,
        title: item.product.title,
        price: item.product.price,
        // Беремо першу картинку або заглушку
        image: item.product.images?.[0] || item.product.imageUrl || '/placeholder.png',
        quantity: item.quantity,
        slug: item.product.slug || ''
      }));
      setItems(mappedItems);
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Синхронізація при зміні юзера
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line
      fetchServerCart();
    }
  }, [user, fetchServerCart]);

  // Збереження в localStorage (для гостя)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('guest_cart', JSON.stringify(items));
    }
  }, [items, user]);

  // Merge carts (Злиття при логіні)
  useEffect(() => {
    const syncCart = async () => {
      const localCartRaw = localStorage.getItem('guest_cart');
      if (user && localCartRaw) {
        const localItems: CartItem[] = JSON.parse(localCartRaw);

        if (localItems.length > 0) {
          try {
            for (const item of localItems) {
              await axios.post('/api/cart', {
                productId: item.productId,
                quantity: item.quantity
              });
            }
            localStorage.removeItem('guest_cart');
            await fetchServerCart();
            toast.success('Кошик синхронізовано');
          } catch {
             console.error('Merge error');
          }
        }
      }
    };
    syncCart();
  }, [user, fetchServerCart]);

  const addToCart = async (product: ProductInput) => {
    // Визначаємо картинку
    const mainImage = product.images?.[0] || product.imageUrl || '/placeholder.png';
    const productSlug = product.slug || '';

    if (user) {
      try {
        await axios.post('/api/cart', { productId: product.id, quantity: 1 });
        fetchServerCart();
        toast.success('Додано в кошик');
      } catch {
        toast.error('Помилка додавання');
      }
    } else {
      setItems(prev => {
        const existing = prev.find(i => i.productId === product.id);
        if (existing) {
          return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
        }
        return [...prev, {
          id: Date.now(),
          productId: product.id,
          title: product.title,
          price: product.price,
          image: mainImage,
          quantity: 1,
          slug: productSlug
        }];
      });
      toast.success('Додано в кошик');
    }
  };

  const removeFromCart = async (productId: number) => {
    if (user) {
      try {
        await axios.delete(`/api/cart/${productId}`);
        fetchServerCart();
      } catch (error) {
        console.error(error);
      }
    } else {
      setItems(prev => prev.filter(i => i.productId !== productId));
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) return;
    
    // Оптимістичне оновлення UI (спочатку міняємо стейт)
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i));

    if (user) {
      try {
        // Треба знайти ID запису в базі (CartItem.id), а не Product.id
        // Але наш бекенд (контролер updateCartItem) очікує ID запису.
        // Тому нам треба знайти cartItemId у поточному стейті
        const cartItem = items.find(i => i.productId === productId);
        if (cartItem) {
           await axios.put(`/api/cart/${cartItem.id}`, { quantity });
           // fetchServerCart(); // Можна не викликати, щоб не було "стрибків", бо ми вже оновили стейт
        }
      } catch (error) {
        console.error(error);
        fetchServerCart(); // Відкат у разі помилки
      }
    }
  };

  const clearCart = async () => {
     if (user) {
         // Тут бажано мати endpoint DELETE /api/cart, але поки очистимо локально
         setItems([]);
     } else {
         setItems([]);
         localStorage.removeItem('guest_cart');
     }
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};