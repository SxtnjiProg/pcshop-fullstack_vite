import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Додали Link
import lottie from 'lottie-web';
import axios, { AxiosError } from 'axios';
import { useComparison } from '../context/ComparisonContext';
import { 
  Trash2, Sparkles, AlertCircle, Scale, 
  Loader2, X, ArrowLeft, ShoppingBag, MessageCircle, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Імпорт анімації
import botAnimation from '../assets/Anima Bot.json'; 

export default function ComparePage() {
  const navigate = useNavigate();
  const { items, removeFromCompare, clearComparison } = useComparison();
  const aiSectionRef = useRef<HTMLDivElement>(null);
  const botContainer = useRef<HTMLDivElement>(null);

  const [aiAnswer, setAiAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 2 && botContainer.current) {
      const anim = lottie.loadAnimation({
        container: botContainer.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: botAnimation,
      });
      return () => anim.destroy();
    }
  }, [items.length]);

  const scrollToAI = () => {
    aiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleAskAI = async () => {
    if (items.length !== 2) return;
    setLoading(true);
    setAiAnswer('');
    try {
      const res = await axios.post('http://localhost:5000/api/ai/compare', {
        product1: items[0],
        product2: items[1]
      });
      setAiAnswer(res.data.answer);
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      setAiAnswer(axiosError.response?.data?.error || 'Вибачте, ШІ тимчасово недоступний.');
    } finally {
      setLoading(false);
    }
  };

  // --- ПОРОЖНІЙ СТАН ---
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[70vh]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-[3rem] shadow-xl shadow-gray-100 border border-gray-50 flex flex-col items-center text-center max-w-lg"
        >
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8">
            <Scale size={48} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Тут поки порожньо</h2>
          <p className="text-gray-500 mb-10 text-lg leading-relaxed">
            Додайте товари з каталогу, щоб порівняти їх характеристики пліч-о-пліч.
          </p>
          <button 
            onClick={() => navigate('/catalog')}
            className="flex items-center gap-3 bg-green-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-green-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-100"
          >
            <ShoppingBag size={20} /> Перейти до каталогу
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-32 relative bg-[#f9fafb]">
      
      {/* ПЛАВАЮЧИЙ БОТ */}
      <AnimatePresence>
        {items.length === 2 && !aiAnswer && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-10 right-6 z-50 flex flex-col items-end group"
          >
            <div className="mb-2 mr-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-white text-black text-xs font-bold py-3 px-5 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-2">
                <MessageCircle size={16} className="text-purple-600" />
                <span>Порівняти через AI? Тисни! ✨</span>
                <div className="absolute -bottom-1 right-6 w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100"></div>
              </div>
            </div>

            <button onClick={scrollToAI} className="w-24 h-24 md:w-32 md:h-32 transition-transform active:scale-90 relative">
              <div ref={botContainer} className="w-full h-full drop-shadow-2xl" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ШАПКА */}
      <div className="mb-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-green-600 mb-6 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Повернутись назад
        </button>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Порівняння товарів</h1>
          <button 
            onClick={clearComparison} 
            className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-5 py-2.5 rounded-xl font-bold text-xs uppercase transition-all"
          >
            <Trash2 size={18} /> Очистити список
          </button>
        </div>
      </div>

      {/* СІТКА КАРТОК */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {items.map((product) => (
            <motion.div 
              key={product.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 relative flex flex-col h-full group"
            >
              {/* Кнопка видалення */}
              <button 
                onClick={(e) => { e.preventDefault(); removeFromCompare(product.id); }} 
                className="absolute top-5 right-5 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all p-2 rounded-full z-20"
                title="Видалити з порівняння"
              >
                <X size={18} />
              </button>

              {/* Клікабельна частина картки */}
              <Link to={`/product/${product.slug}`} className="flex-grow flex flex-col">
                <div className="h-52 flex justify-center mb-6 p-2">
                  <img src={product.images?.[0]} alt={product.title} className="max-h-full object-contain" />
                </div>

                <div className="mb-2">
                  <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">
                    {product.category.name}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-2 leading-tight h-14 overflow-hidden group-hover:text-green-600 transition-colors">
                  {product.title}
                </h3>
                <div className="text-2xl font-black text-green-600 mb-6 flex items-center gap-2">
                  {product.price.toLocaleString()} ₴
                  <ChevronRight size={20} className="text-gray-300 group-hover:text-green-600 transition-colors opacity-0 group-hover:opacity-100" />
                </div>
              </Link>
              
              {/* Характеристики (не клікабельні) */}
              <div className="space-y-4 text-[11px] bg-gray-50/80 p-6 rounded-[1.5rem] h-[320px] overflow-y-auto custom-scrollbar border border-gray-100/50">
                <p className="text-gray-400 font-bold uppercase tracking-widest border-b border-gray-200 pb-2 mb-2 sticky top-0 bg-gray-50/80 backdrop-blur-sm">
                  Характеристики
                </p>
                <div className="space-y-3 pr-2">
                  {Object.entries(product.specifications || {}).map(([key, val]) => (
                    <div key={key} className="flex flex-col gap-1 border-b border-gray-100 pb-2 last:border-0">
                      <span className="text-gray-400 font-medium">{key}</span>
                      <span className="font-bold text-gray-800 text-[12px] leading-snug">{val as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Плейсхолдер */}
        {items.length < 4 && (
          <div 
            className="border-3 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-400 p-10 min-h-[500px] bg-white/30 hover:bg-white hover:border-green-300 transition-all cursor-pointer group" 
            onClick={() => navigate('/catalog')}
          >
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <AlertCircle size={32} className="text-gray-300 group-hover:text-green-500 transition-colors" />
             </div>
             <p className="text-center font-bold text-lg text-gray-500 group-hover:text-gray-800 transition-colors">Додати товар</p>
             <p className="text-sm mt-2">Перейти до каталогу</p>
          </div>
        )}
      </div>

      {/* ОНОВЛЕНА СЕКЦІЯ AI */}
      <div ref={aiSectionRef} className="mt-24">
        {/* Декоративний роздільник */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-16"></div>

        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-xl shadow-purple-50/50 border border-purple-100 overflow-hidden relative">
          {/* Верхня кольорова смужка */}
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500" />
          
          <div className="p-8 md:p-12 text-center relative z-10">
            {items.length === 2 ? (
              <>
                {!aiAnswer && (
                  <div className="mb-10">
                    <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider mb-4">
                      <Sparkles size={16} /> PCShop AI Brain
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
                      Вагаєтесь між двома моделями?
                    </h3>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                      Дозвольте нашому штучному інтелекту проаналізувати їхні характеристики та надати об'єктивну рекомендацію за 5 секунд.
                    </p>
                  </div>
                )}

                <div className="flex justify-center relative">
                  {/* Кнопка */}
                  <button 
                    onClick={handleAskAI}
                    disabled={loading || !!aiAnswer}
                    className={`relative z-20 px-12 py-5 rounded-full font-black text-lg flex items-center gap-3 transition-all duration-300 ${
                      aiAnswer 
                        ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-default" 
                        : "bg-black text-white shadow-2xl shadow-purple-200 hover:scale-105 active:scale-95 hover:shadow-purple-300"
                    }`}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Sparkles className={!aiAnswer ? "text-purple-400" : ""} />}
                    {loading ? 'Аналізую...' : aiAnswer ? 'Аналіз завершено' : 'Отримати AI-рекомендацію'}
                  </button>
                </div>

                {/* ВІДПОВІДЬ */}
                <AnimatePresence>
                  {aiAnswer && (
                    <motion.div 
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="mt-12 text-left"
                    >
                       <div className="bg-gradient-to-br from-purple-50 to-white p-8 md:p-10 rounded-[2.5rem] border border-purple-100 shadow-sm relative">
                          <div className="flex items-center gap-3 mb-6">
                             <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center shadow-inner">
                                <Sparkles size={24} className="text-purple-600" />
                             </div>
                             <div>
                                <h4 className="font-black text-gray-900 text-lg">Вердикт асистента</h4>
                                <p className="text-xs text-purple-500 font-bold uppercase tracking-widest">На основі характеристик</p>
                             </div>
                          </div>
                          <div className="text-lg leading-relaxed text-gray-700 font-medium whitespace-pre-line">
                             {aiAnswer}
                          </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              // Стан, коли не 2 товари
              <div className="py-10 flex flex-col items-center">
                 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Scale size={32} className="text-gray-400" />
                 </div>
                 <h4 className="font-bold text-xl text-gray-900 mb-2">Функція AI-порівняння</h4>
                 <p className="text-gray-500 max-w-md mx-auto mb-6">
                   Щоб отримати рекомендацію від штучного інтелекту, будь ласка, залиште у списку порівняння рівно <strong>два товари</strong>.
                 </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}