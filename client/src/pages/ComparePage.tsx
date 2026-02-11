import { useState } from 'react';
import axios from 'axios';
import { useComparison } from '../context/ComparisonContext';
import { Trash2, Sparkles, AlertCircle, Scale, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ComparePage() {
  // 👇 Дістаємо функцію clearComparison
  const { items, removeFromCompare, clearComparison } = useComparison();
  
  const [aiAnswer, setAiAnswer] = useState('');
  const [cachedData, setCachedData] = useState<{ key: string, text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    if (items.length !== 2) return;
    
    const currentKey = items.map(i => i.id).sort((a, b) => a - b).join('-');

    if (cachedData && cachedData.key === currentKey) {
      setAiAnswer(cachedData.text);
      return;
    }
    
    setLoading(true);
    setAiAnswer('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/ai/compare', {
        product1: items[0],
        product2: items[1]
      });
      
      const answer = res.data.answer;
      setAiAnswer(answer);
      setCachedData({ key: currentKey, text: answer });

    } catch (error) {
      console.error(error);
      setAiAnswer('Вибачте, ШІ зараз відпочиває. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
        <Scale size={64} className="mb-4 opacity-20" />
        <p className="text-xl">Список порівняння порожній</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      
      {/* 👇 ЗАГОЛОВОК З КНОПКОЮ ОЧИСТИТИ */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Scale className="text-purple-600" /> Порівняння товарів
        </h1>
        
        <button 
          onClick={clearComparison}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition font-medium text-sm"
        >
          <Trash2 size={16} /> Очистити все
        </button>
      </div>

      {/* СІТКА ТОВАРІВ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {items.map((product) => (
            <motion.div 
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative group flex flex-col"
            >
              <button 
                onClick={() => removeFromCompare(product.id)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition z-10"
                title="Видалити"
              >
                <X size={20} />
              </button>
              
              <div className="h-40 flex justify-center mb-6">
                 <img src={product.images?.[0] || '/placeholder.png'} alt={product.title} className="max-h-full object-contain" />
              </div>
              
              {/* 👇 КАТЕГОРІЯ ТОВАРУ */}
              <div className="mb-1">
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md uppercase tracking-wider">
                  {product.category.name}
                </span>
              </div>
              
              <h3 className="font-bold text-lg mb-2 leading-snug h-12 overflow-hidden">{product.title}</h3>
              <div className="text-2xl font-bold text-green-600 mb-6">{product.price} ₴</div>
              
              <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl h-[300px] overflow-y-auto custom-scrollbar flex-grow">
                 {product.specifications && Object.entries(product.specifications).map(([key, val]) => (
                   <div key={key} className="flex flex-col border-b border-gray-200 last:border-0 pb-2">
                      <span className="text-gray-400 text-xs uppercase font-bold">{key}</span>
                      <span className="font-medium text-gray-800">{val as string}</span>
                   </div>
                 ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Плейсхолдер */}
        {items.length < 4 && (
           <div className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 p-6 min-h-[400px]">
              <AlertCircle size={48} className="mb-4 opacity-20" />
              <p className="text-center">Можна додати ще {4 - items.length}</p>
           </div>
        )}
      </div>

      {/* СЕКЦІЯ AI */}
      <div className="mt-12 max-w-3xl mx-auto flex flex-col items-center">
          
          {items.length === 2 ? (
            <div className="flex flex-col items-center text-center space-y-6 w-full">
                
                {!aiAnswer && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                     <h3 className="text-xl font-bold text-gray-800">
                       Вагаєтесь з вибором? 🤔
                     </h3>
                     <p className="text-gray-500 max-w-md mx-auto">
                       Натисніть кнопку нижче, і наш <span className="text-purple-600 font-bold">Штучний Інтелект</span> проаналізує ці товари та дасть коротку пораду за 5 секунд.
                     </p>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAskAI}
                  disabled={loading || (!!aiAnswer)}
                  className={`px-10 py-4 rounded-full font-bold text-lg flex items-center gap-3 shadow-xl z-20 relative transition-all
                    ${aiAnswer 
                      ? "bg-gray-200 text-gray-400 cursor-default shadow-none"
                      : "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-purple-200"
                    }
                  `}
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" /> Аналізую...</> 
                  ) : aiAnswer ? (
                    <><Sparkles /> Готово!</>
                  ) : (
                    <><Sparkles className="text-yellow-300" /> Запитати у ШІ</>
                  )}
                </motion.button>
            </div>

          ) : items.length > 2 ? (
             <div className="bg-gray-100 text-gray-600 px-6 py-3 rounded-full flex items-center gap-3 border border-gray-200">
               <Sparkles className="text-gray-400" />
               <span className="text-sm">Для AI-порівняння залиште тільки <strong>2 товари</strong></span>
             </div>
          ) : null}

          {/* ВІДПОВІДЬ */}
          <AnimatePresence>
            {aiAnswer && (
              <motion.div 
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="w-full mt-8"
              >
                 <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 rounded-3xl shadow-2xl border border-gray-700 relative overflow-hidden">
                    
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-gray-900 rotate-45 border-l border-t border-gray-700"></div>

                    <button 
                      onClick={() => setAiAnswer('')} 
                      className="absolute top-4 right-4 text-gray-400 hover:text-white transition bg-white/5 hover:bg-white/20 rounded-full p-2"
                    >
                      <X size={18} />
                    </button>

                    <div className="flex items-start gap-4">
                        <div className="bg-purple-600/20 p-3 rounded-full shrink-0">
                           <Sparkles className="text-purple-300" size={24} />
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-purple-300 mb-2">PCShop AI Assistant</h4>
                           <div className="text-lg leading-relaxed text-gray-200 whitespace-pre-line">
                              {aiAnswer}
                           </div>
                        </div>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
      </div>

    </div>
  );
}