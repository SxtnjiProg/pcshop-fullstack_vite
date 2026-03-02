import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Check, ShoppingCart, Heart, Scale, 
  CreditCard, Truck, ShieldCheck, ChevronRight, Info, User, X, Trash2} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useComparison } from '../context/ComparisonContext';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import toast from 'react-hot-toast';

interface Review {
  id: number;
  text: string;
  rating: number;
  createdAt: string;
  userId: number;
  user: { fullName: string };
}

interface Product {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
  images?: string[];
  description: string;
  category: { name: string; slug?: string };
  specifications?: Record<string, string | number>;
  code?: string;
  reviews?: Review[];
}

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'specs' | 'reviews'>('all');

  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useWishlist();
  const { addToCompare, items: compareItems } = useComparison();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${slug}`)
      .then(res => {
        const data = res.data;
        setProduct({
            ...data,
            code: data.code || `UA-${data.id.toString().padStart(6, '0')}`
        });
        setActiveImage(0);

        axios.get(`http://localhost:5000/api/products/similar/${data.id}`)
          .then(resSimilar => setSimilarProducts(resSimilar.data))
          .catch(console.error);
      })
      .catch(err => console.error(err));
  }, [slug]);

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500"></div>
    </div>
  );

  const imageList = Array.isArray(product.images) && product.images.length > 0
    ? product.images 
    : [product.imageUrl];

  const isInCompare = compareItems.some(i => i.id === product.id);
  const formatPrice = (price: number) => new Intl.NumberFormat('uk-UA').format(price);

  const reviewsCount = product.reviews?.length || 0;
  const averageRating = reviewsCount > 0
    ? product.reviews!.reduce((acc, r) => acc + r.rating, 0) / reviewsCount
    : 0;

  const handleAddToCompare = () => {
  if (!product) return;
  addToCompare({
    id: product.id,
    title: product.title,
    price: product.price, // ПРИБРАЛИ .toString()
    images: imageList,
    category: product.category,
    specifications: product.specifications as Record<string, string>
  } as unknown as typeof compareItems[number]);
};

  const submitReview = async () => {
    if (!user) {
      toast.error('Увійдіть, щоб залишити відгук');
      navigate('/login');
      return;
    }
    if (!reviewText.trim()) {
      toast.error('Напишіть хоч пару слів!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/products/${product.id}/reviews`, {
        rating: reviewRating,
        text: reviewText
      });

      setProduct(prev => {
        if (!prev) return null;
        return {
          ...prev,
          reviews: [res.data, ...(prev.reviews || [])]
        };
      });

      toast.success('Дякуємо за відгук!');
      setIsReviewFormOpen(false);
      setReviewText('');
      setReviewRating(5);
    } catch {
      toast.error('Помилка при відправці');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Видалити цей відгук?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/reviews/${reviewId}`);
      setProduct(prev => {
        if (!prev) return null;
        return {
          ...prev,
          reviews: prev.reviews?.filter(r => r.id !== reviewId)
        };
      });
      toast.success('Відгук видалено');
    } catch {
      toast.error('Не вдалося видалити');
    }
  };

  // Стилі для кнопок табів (щоб не дублювати)
  const getTabClass = (tabName: string) => 
    `pb-3 px-2 font-bold text-sm uppercase tracking-wide border-b-4 transition-all duration-300 ${
      activeTab === tabName 
      ? 'border-emerald-500 text-emerald-600' 
      : 'border-transparent text-gray-400 hover:text-gray-800'
    }`;

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-12 font-sans text-[#221f1f]">
      
      {/* ХЛІБНІ КРИХТИ */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center text-sm font-medium text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link to="/" className="hover:text-emerald-600 transition flex items-center gap-1">
             <ArrowLeft size={16} /> Головна
          </Link>
          <ChevronRight size={14} className="mx-2 text-gray-300" />
          <Link to="/catalog" className="hover:text-emerald-600 transition">Каталог</Link>
          <ChevronRight size={14} className="mx-2 text-gray-300" />
          <span className="hover:text-emerald-600 transition cursor-pointer">{product.category.name}</span>
          <ChevronRight size={14} className="mx-2 text-gray-300" />
          <span className="text-gray-800 font-bold truncate">{product.title}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4">
        
        {/* ЗАГОЛОВОК (В тій самій структурі, але rounded-3xl) */}
        <div className="bg-white rounded-t-3xl p-6 md:p-8 border-b border-dashed border-gray-100 relative z-10">
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-4 leading-tight tracking-tight">
            {product.title}
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
                <StarRating value={averageRating} size={18} readOnly />
                <button onClick={() => setActiveTab('reviews')} className="text-yellow-700 font-bold hover:underline ml-1">
                  {reviewsCount}
                </button>
              </div>
              <span className="text-gray-400 font-mono">CODE: {product.code}</span>
            </div>
          </div>
        </div>

        {/* ОСНОВНИЙ БЛОК (СІТКА 1.2fr / 0.8fr) */}
        <div className="bg-white rounded-b-3xl shadow-xl shadow-gray-200/50 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-0 overflow-hidden mb-6">
          
          {/* ГАЛЕРЕЯ (ЛІВА ЧАСТИНА) */}
          <div className="p-6 md:p-10 border-r border-dashed border-gray-100 relative">
             <div className="relative w-full h-[300px] md:h-[500px] flex items-center justify-center mb-8">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeImage}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={imageList[activeImage]} 
                    alt={product.title} 
                    className="max-w-full max-h-full object-contain z-10"
                  />
                </AnimatePresence>
                {/* Молодіжний акцент: пляма позаду */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50/50 to-transparent rounded-full blur-3xl scale-75 -z-0"></div>
             </div>

             {imageList.length > 1 && (
               <div className="flex gap-3 overflow-x-auto pb-2 justify-center scrollbar-hide">
                 {imageList.map((img, idx) => (
                   <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     key={idx}
                     onClick={() => setActiveImage(idx)}
                     className={`w-20 h-20 rounded-2xl p-2 transition-all duration-300 bg-white ${
                       activeImage === idx 
                       ? 'ring-2 ring-emerald-500 shadow-lg' 
                       : 'border border-gray-100 grayscale hover:grayscale-0'
                     }`}
                   >
                     <img src={img} className="w-full h-full object-contain" alt="" />
                   </motion.button>
                 ))}
               </div>
             )}
          </div>

          {/* ПРАВА ЧАСТИНА (Ціни, кнопки) - Структура збережена, дизайн оновлено */}
          <div className="p-6 md:p-10 bg-white flex flex-col gap-8 relative">
             
            {/* Блок ціни */}
            <div className="p-6 rounded-3xl bg-[#f8fcf9] border border-emerald-50">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-dashed border-emerald-100">
                 <span className="text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1.5">
                   <Check size={14} strokeWidth={3} /> В наявності
                 </span>
                 <div className="flex gap-2">
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleFavorite(product.id)}
                      className={`p-2 rounded-xl transition-colors ${isFavorite(product.id) ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:text-gray-900'}`} 
                    >
                      <Heart size={24} fill={isFavorite(product.id) ? "currentColor" : "none"} />
                    </motion.button>
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={handleAddToCompare}
                      className={`p-2 rounded-xl transition-colors ${isInCompare ? 'bg-purple-50 text-purple-600' : 'bg-white text-gray-400 hover:text-gray-900'}`} 
                    >
                      <Scale size={24} />
                    </motion.button>
                 </div>
              </div>

              <div className="mb-6">
                 {/* Стара ціна (якщо треба, можна додати логіку) */}
                 <div className="flex items-baseline gap-2">
                   <div className="text-gray-900 text-5xl font-black tracking-tight">
                     {formatPrice(product.price)} <span className="text-2xl font-medium text-gray-400">₴</span>
                   </div>
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                 <motion.button 
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => addToCart(product)}
                   className="w-full bg-green-500 text-white h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:bg-green-700 transition-all"
                 >
                    <ShoppingCart size={22} /> Купити зараз
                 </motion.button>
                 
                 <motion.button 
                    whileHover={{ scale: 1.02, backgroundColor: '#f0fdf4' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full border-2 border-emerald-100 text-emerald-800 h-12 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2"
                 >
                    <CreditCard size={18} /> Розстрочка 0%
                 </motion.button>
              </div>
            </div>

            {/* Доставка і гарантія - та ж структура, але іконки в кружечках */}
            <div className="space-y-5 text-sm text-gray-600">
               <div className="flex gap-4 items-start">
                 <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                    <Truck size={20} />
                 </div>
                 <div>
                   <p className="font-bold text-gray-900 text-base">Доставка</p>
                   <p className="mt-1">Нова Пошта, Укрпошта. Самовивіз з точок видачі.</p>
                 </div>
               </div>
               <div className="flex gap-4 items-start">
                 <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl shrink-0">
                    <ShieldCheck size={20} />
                 </div>
                 <div>
                   <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-base">Гарантія</p>
                      <Info size={14} className="text-gray-400" />
                   </div>
                   <p className="mt-1">12 місяців офіційної гарантії. Обмін/повернення - 14 днів.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* ТАБИ (Опис, Хар-ки, Відгуки) - Структура 100% збережена */}
        <div className="mt-8 bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 p-6 md:p-10">
           
           {/* Хедер табів */}
           <div className="flex gap-8 border-b border-gray-100 mb-8 overflow-x-auto">
             <button onClick={() => setActiveTab('all')} className={getTabClass('all')}>
               Усе про товар
             </button>
             <button onClick={() => setActiveTab('specs')} className={getTabClass('specs')}>
               Характеристики
             </button>
             <button onClick={() => setActiveTab('reviews')} className={getTabClass('reviews')}>
               Відгуки <span className="ml-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{reviewsCount}</span>
             </button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             
             {/* Основний контент (2/3 ширини) */}
             <div className="lg:col-span-2 space-y-12">
                 
                 {/* Характеристики (Таблиця) */}
                 {(activeTab === 'all' || activeTab === 'specs') && product.specifications && (
                   <div id="specs" className="animate-fade-in">
                      <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                         Характеристики
                      </h2>
                      <div className="bg-gray-50/50 rounded-2xl overflow-hidden border border-gray-100">
                        <table className="w-full text-sm">
                          <tbody>
                            {Object.entries(product.specifications).map(([key, val]) => (
                              <tr key={key} className="group hover:bg-white transition-colors border-b border-gray-100 last:border-0">
                                 <td className="py-4 px-6 text-gray-500 w-1/2 align-top font-medium">{key}</td>
                                 <td className="py-4 px-6 text-gray-900 font-bold align-top">{val}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   </div>
                 )}

                 {/* Опис */}
                 {(activeTab === 'all') && (
                   <div className="animate-fade-in">
                     <h2 className="text-2xl font-black mb-6">Опис</h2>
                     <div className="prose prose-lg prose-emerald text-gray-600 leading-relaxed max-w-none">
                       {product.description}
                     </div>
                   </div>
                 )}

                 {/* ВІДГУКИ */}
                 {(activeTab === 'reviews' || activeTab === 'all') && (
                   <div id="reviews" className="pt-4 animate-fade-in">
                      <div className="flex items-center justify-between mb-8 bg-gray-900 text-white p-6 rounded-2xl shadow-lg">
                        <div>
                           <h2 className="text-xl font-bold">Відгуки покупців</h2>
                           <p className="text-gray-400 text-sm">Ваша думка важлива для нас</p>
                        </div>
                        
                        {!isReviewFormOpen && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsReviewFormOpen(true)}
                            className="bg-white text-gray-900 px-5 py-2.5 rounded-xl font-bold text-sm transition hover:bg-gray-100"
                          >
                            Написати
                          </motion.button>
                        )}
                      </div>

                      {/* ФОРМА ВІДГУКУ */}
                      <AnimatePresence>
                        {isReviewFormOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: -20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -20, height: 0 }}
                            className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-200 overflow-hidden"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="font-bold text-lg">Новий відгук</h3>
                              <button onClick={() => setIsReviewFormOpen(false)} className="bg-white p-1 rounded-full text-gray-400 hover:text-red-500 shadow-sm transition">
                                <X size={20} />
                              </button>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Оцінка</label>
                                <StarRating value={reviewRating} onChange={setReviewRating} size={32} />
                              </div>

                              <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Коментар</label>
                                <textarea
                                  value={reviewText}
                                  onChange={(e) => setReviewText(e.target.value)}
                                  className="w-full bg-white border border-gray-200 rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                  placeholder="Розкажіть про свої враження..."
                                ></textarea>
                              </div>

                              <button 
                                onClick={submitReview}
                                disabled={isSubmitting}
                                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition w-full md:w-auto shadow-lg shadow-emerald-200"
                              >
                                {isSubmitting ? 'Відправка...' : 'Надіслати відгук'}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* СПИСОК ВІДГУКІВ */}
                      <div className="space-y-6">
                        {product.reviews && product.reviews.length > 0 ? (
                          product.reviews.map((review) => (
                            <div key={review.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative group hover:bg-white hover:shadow-md transition-all">
                               <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-gray-700 shadow-sm border border-gray-100">
                                        <User size={18} />
                                     </div>
                                     <div>
                                        <div className="font-bold text-gray-900 text-sm">{review.user.fullName}</div>
                                        <div className="text-gray-400 text-xs">{new Date(review.createdAt).toLocaleDateString('uk-UA')}</div>
                                     </div>
                                  </div>
                                  <StarRating value={review.rating} size={16} readOnly />
                               </div>
                               
                               <p className="text-gray-700 ml-[52px] leading-relaxed">{review.text}</p>

                               {user && user.id === review.userId && (
                                 <button 
                                   onClick={() => handleDeleteReview(review.id)}
                                   className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition p-2"
                                 >
                                   <Trash2 size={16} />
                                 </button>
                               )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                             <div className="text-gray-400 mb-2">Ще немає відгуків</div>
                             <div className="text-sm text-gray-500">Станьте першим, хто оцінить цей товар!</div>
                          </div>
                        )}
                      </div>
                   </div>
                 )}
             </div>

             {/* СХОЖІ ТОВАРИ (ПРАВА КОЛОНКА ВНИЗУ) - Як було в оригіналі */}
             <div className="hidden lg:block">
                 <div className="bg-[#f8fcf9] rounded-3xl p-6 sticky top-24 border border-emerald-50">
                   <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                     Схожі товари
                   </h3>
                   
                   {similarProducts.length > 0 ? (
                      <div className="space-y-4">
                         {similarProducts.map((simProduct) => (
                           <Link to={`/product/${simProduct.id}`} key={simProduct.id} className="flex gap-4 group cursor-pointer bg-white p-3 rounded-2xl transition hover:shadow-lg border border-transparent hover:border-emerald-100">
                              <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center p-2 shrink-0 border border-gray-100 group-hover:border-emerald-200 transition">
                                 <img src={simProduct.imageUrl} alt={simProduct.title} className="max-h-full object-contain" />
                              </div>
                              <div className="flex flex-col justify-center">
                                 <p className="text-sm text-gray-700 font-medium group-hover:text-emerald-600 line-clamp-2 leading-snug transition mb-1">
                                    {simProduct.title}
                                 </p>
                                 <p className="text-base font-black text-gray-900">{formatPrice(simProduct.price)} ₴</p>
                              </div>
                           </Link>
                         ))}
                      </div>
                   ) : (
                      <div className="text-gray-400 text-sm text-center py-4">Схожих товарів не знайдено</div>
                   )}
                 </div>
             </div>

           </div>
        </div>
      </div>
    </div>
  );
}