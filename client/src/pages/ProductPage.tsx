import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Check, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // <--- Додали анімацію
import { useCart } from '../context/CartContext';

interface Product {
  id: number;
  title: string;
  price: string;
  imageUrl: string; // Залишаємо для сумісності
  images?: string[]; // <--- Нове поле для галереї
  description: string;
  category: { name: string };
  specifications?: Record<string, string | number>;
}

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState(0); // <--- Індекс активної картинки
  const { addToCart } = useCart();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${slug}`)
      .then(res => {
        setProduct(res.data);
        setActiveImage(0); // Скидаємо на першу картинку при завантаженні
      })
      .catch(err => console.error(err));
  }, [slug]);

  if (!product) return <div className="text-center py-20">Завантаження...</div>;

  // Логіка для отримання списку картинок (підтримка і старого imageUrl, і нового images)
  const imageList = Array.isArray(product.images) && product.images.length > 0
    ? product.images 
    : [product.imageUrl];

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/catalog" className="inline-flex items-center text-gray-500 hover:text-green-600 mb-6 transition">
        <ArrowLeft size={20} className="mr-2" /> Назад до каталогу
      </Link>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-gray-100 min-h-[600px]">
        
        {/* === ЛІВА КОЛОНКА: ГАЛЕРЕЯ === */}
        <div className="p-6 lg:p-10 bg-gray-50 flex flex-col items-center justify-center gap-6">
          
          {/* Головне зображення з анімацією */}
          <div className="relative w-full h-[400px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImage} // Зміна ключа запускає анімацію
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={imageList[activeImage]} 
                alt={product.title} 
                className="max-w-full max-h-full object-contain drop-shadow-2xl mix-blend-multiply" 
              />
            </AnimatePresence>
          </div>

          {/* Карусель мініатюр (показуємо, тільки якщо картинок > 1) */}
          {imageList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto w-full justify-center py-2 scrollbar-hide">
              {imageList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-20 h-20 bg-white rounded-xl border-2 flex-shrink-0 overflow-hidden transition-all duration-200 p-1
                    ${activeImage === idx 
                      ? 'border-green-500 shadow-md scale-105' 
                      : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* === ПРАВА КОЛОНКА: ІНФОРМАЦІЯ === */}
        <div className="p-6 lg:p-10 flex flex-col justify-center bg-white relative z-10">
          <span className="text-green-600 font-bold tracking-wide uppercase text-sm mb-2">{product.category.name}</span>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{product.title}</h1>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed border-b border-gray-100 pb-8">{product.description}</p>

          {product.specifications && (
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                ⚙️ Характеристики
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-baseline border-b border-gray-200 border-dashed pb-1 last:border-0">
                    <span className="text-sm text-gray-500 font-medium">{key}</span>
                    <span className="text-sm font-bold text-gray-800 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
              <div>
                <span className="text-gray-400 text-sm font-medium block mb-1">Ціна за шт.</span>
                <div className="text-4xl font-black text-gray-900 tracking-tight">{product.price} ₴</div>
              </div>
              
              <button 
                onClick={() => addToCart(product)}
                className="w-full sm:w-auto bg-[#00a046] text-white px-10 py-4 rounded-xl hover:bg-[#008a3c] transition-all duration-200 flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-green-100 active:scale-95 group"
              >
                <ShoppingCart className="group-hover:animate-bounce" /> 
                Купити
              </button>
            </div>
            
            <div className="mt-6 flex items-center text-green-600 gap-2 text-sm font-medium bg-green-50 w-fit px-3 py-1.5 rounded-full">
              <Check size={16} /> Є в наявності
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}