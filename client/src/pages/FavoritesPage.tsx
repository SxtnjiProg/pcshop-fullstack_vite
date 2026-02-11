import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react'; // Прибрали зайві іконки
import { useWishlist } from '../context/WishlistContext';

// Типізація товару в обраному
interface FavoriteProduct {
  id: number;
  title: string;
  price: number;
  slug: string;
  images: string[];
}

export default function FavoritesPage() {
  // Використовуємо інтерфейс замість any
  const [products, setProducts] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite } = useWishlist();

  useEffect(() => {
    axios.get('/api/user/favorites')
      .then(res => setProducts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const removeProduct = (id: number) => {
    toggleFavorite(id); // Видаляємо з контексту (і з бази)
    setProducts(prev => prev.filter(p => p.id !== id)); // Видаляємо візуально зі сторінки
  };

  if (loading) return <div className="text-center py-20">Завантаження...</div>;

  return (
    <div className="container mx-auto px-4 py-8 min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Heart className="text-red-500 fill-red-500" /> Обрані товари
      </h1>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <p className="text-xl text-gray-500">Список бажань порожній 💔</p>
          <Link to="/" className="text-green-600 font-bold mt-4 inline-block hover:underline">
            Перейти до каталогу
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white border rounded-2xl p-4 relative group hover:shadow-lg transition">
              <button 
                onClick={(e) => {
                  e.preventDefault(); // Щоб не переходило за посиланням при кліку на смітник
                  removeProduct(product.id);
                }}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 bg-white rounded-full p-1 shadow-sm z-10"
                title="Видалити"
              >
                <Trash2 size={20} />
              </button>

              <Link to={`/product/${product.slug}`}>
                <div className="h-48 flex items-center justify-center mb-4">
                  <img 
                    src={product.images?.[0] || '/placeholder.png'} 
                    alt={product.title} 
                    className="max-h-full object-contain" 
                  />
                </div>
                <h3 className="font-bold text-gray-800 line-clamp-2 h-12 mb-2">{product.title}</h3>
                <div className="text-xl font-bold text-green-600">{product.price} ₴</div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}