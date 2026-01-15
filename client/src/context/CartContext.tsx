import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react'; // Виправлено імпорт

// Тип елемента в кошику
interface CartItem {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

// Тип товару, який ми передаємо в функцію (замість any)
interface ProductInput {
  id: number;
  title: string;
  price: string | number;
  imageUrl: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: ProductInput) => void;
  removeFromCart: (id: number) => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Використовуємо ProductInput замість any
  const addToCart = (product: ProductInput) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { 
        id: product.id, 
        title: product.title, 
        price: Number(product.price),
        imageUrl: product.imageUrl, 
        quantity: 1 
      }];
    });
  };

  const removeFromCart = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};