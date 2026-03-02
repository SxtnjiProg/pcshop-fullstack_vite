import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Loader2, Star, MessageSquare } from 'lucide-react'; // Додав MessageSquare для краси
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface FavoriteProduct {
  id: number;
  title: string;
  price: number;
  slug: string;
  images: string[];
  inStock?: boolean;
  category?: { name: string };
  // Бекенд може повертати це як string або number
  rating?: number | string;
  reviewCount?: number | string;
}

export default function ProfileWishlist() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    axios.get('/api/user/favorites')
      .then(res => {
        // Логування, щоб ви могли перевірити в консолі, що приходить
        console.log("Favorites data:", res.data); 
        setProducts(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const removeProduct = (id: number) => {
    toggleFavorite(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Видалено');
  };

  const handleAddToCart = (e: React.MouseEvent, product: FavoriteProduct) => {
    e.preventDefault();
    const cartItem = {
      ...product,
      category: product.category || { name: 'Каталог' },
      quantity: 1 
    };
    addToCart(cartItem as unknown as Parameters<typeof addToCart>[0]); 
    toast.success('Додано в кошик');
  };

  // Функція рендеру зірок з безпечним приведенням типів
  const renderStars = (ratingVal: number | string | undefined) => {
    const rating = Number(ratingVal) || 0; // Перетворюємо в число, якщо прийшов рядок
    
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={12}
        className={`${
          index < Math.round(rating) 
            ? 'text-orange-400 fill-orange-400' 
            : 'text-gray-200 fill-gray-100' // Додав fill-gray-100 для пустих зірок
        }`}
      />
    ));
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-green-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
           <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
             <Heart className="text-green-600 fill-green-600" size={24} /> Список бажань
           </h2>
           <p className="text-gray-400 text-xs mt-1">Збережені товари ({products.length})</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
           <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
             <Heart className="text-gray-300" size={24} />
           </div>
           <h3 className="text-base font-bold text-gray-900 mb-1">Список порожній</h3>
           <button 
             onClick={() => navigate('/catalog')}
             className="text-green-600 font-bold text-sm hover:underline mt-2"
           >
             Перейти до каталогу
           </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {products.map((product) => {
              // Безпечне отримання числових значень
              const count = Number(product.reviewCount) || 0;
              const rating = Number(product.rating) || 0;

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  className="bg-white border border-gray-100 rounded-2xl p-3 flex gap-4 hover:shadow-md hover:border-green-100 transition-all duration-200 group relative items-center"
                >
                  {/* Зображення */}
                  <Link to={`/product/${product.slug}`} className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center p-2">
                    <img 
                      src={product.images?.[0] || '/placeholder.png'} 
                      alt={product.title} 
                      className="max-h-full max-w-full object-contain mix-blend-multiply" 
                    />
                  </Link>

                  {/* Інфо */}
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        {product.category && (
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 inline-block">
                            {product.category.name}
                          </span>
                        )}
                        
                        <Link to={`/product/${product.slug}`} className="font-bold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2 hover:text-green-600 transition-colors mb-2 block">
                          {product.title}
                        </Link>
                        
                        {/* БЛОК ВІДГУКІВ */}
                        <div className="flex items-center gap-2 h-4">
                          {count > 0 ? (
                            <>
                              <div className="flex gap-0.5">{renderStars(rating)}</div>
                              <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                <MessageSquare size={10} /> {count} відг.
                              </span>
                            </>
                          ) : (
                            <span className="text-[10px] text-gray-300 font-medium bg-gray-50 px-2 py-0.5 rounded-md">
                              Немає відгуків
                            </span>
                          )}
                        </div>
                    </div>

                    {/* Ціна та Кнопка */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0">
                        <div className="font-black text-lg sm:text-xl text-gray-900 whitespace-nowrap">
                          {product.price.toLocaleString()} ₴
                        </div>
                        
                        <button 
                          onClick={(e) => handleAddToCart(e, product)}
                          className="bg-green-600 text-white w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-lg flex items-center justify-center gap-2 font-bold text-xs hover:bg-green-700 transition shadow-sm active:scale-95"
                          title="Додати в кошик"
                        >
                          <ShoppingCart size={16} />
                          <span className="hidden sm:inline">Купити</span>
                        </button>
                    </div>
                  </div>

                  {/* Кнопка видалення */}
                  <button 
                    onClick={() => removeProduct(product.id)}
                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"
                    title="Видалити"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}