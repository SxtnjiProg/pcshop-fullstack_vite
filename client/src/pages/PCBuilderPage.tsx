import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Cpu, RotateCcw, AlertCircle, ShoppingCart, Loader2, Plus } from 'lucide-react';
import { useBuilder } from '../context/BuilderContext';
import { useCart } from '../context/CartContext';
import { STEPS, STEP_LABELS, CATEGORY_SLUGS } from '../constants/builder';
import type { BuilderProduct } from '../context/BuilderContext';
import toast from 'react-hot-toast';

export default function PCBuilderPage() {
  const { 
    currentStep, 
    build, 
    totalPrice, 
    nextStep, 
    prevStep, 
    selectComponent, 
    removeComponent,
    getCompatibilityFilters 
  } = useBuilder();
  
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState<BuilderProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const stepKey = STEPS[currentStep];
  const dbSlug = CATEGORY_SLUGS[stepKey];

  useEffect(() => {
    if (!dbSlug) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const filters = getCompatibilityFilters();
        const params = new URLSearchParams();
        
        params.append('category', dbSlug);
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });

        params.append('limit', '100');

        const res = await axios.get(`/api/products?${params.toString()}`);
        
        const data = res.data.products || res.data;
        setProducts(Array.isArray(data) ? data : []);
        
      } catch (error) {
        console.error("Помилка завантаження:", error);
        toast.error('Не вдалося завантажити комплектуючі');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

  }, [currentStep, build, dbSlug, getCompatibilityFilters]); 

  const handleFinish = () => {
    // Збираємо всі вибрані деталі в один масив (викидаємо порожні слоти)
    const selectedComponents = Object.values(build).filter(item => item !== null && item !== undefined);
    
    if (selectedComponents.length === 0) {
      toast.error('Збірка порожня');
      return;
    }

    // Шукаємо корпус для головної картинки (зазвичай це крок 'case', 'pc-case' тощо).
    // Якщо корпусу ще не вибрали, беремо картинку першої ліпшої обраної деталі.
    const pcCase = build['case'] || build['pc_case'] || build['chassis'];
    const mainImage = pcCase?.images?.[0] || selectedComponents[0]?.images?.[0] || '/placeholder.png';

    // Створюємо ОДИН "віртуальний" товар, який об'єднує всю збірку
    const customPcProduct = {
      id: `custom-build-${Date.now()}`, // Унікальний ID, щоб можна було додати кілька різних збірок
      title: 'Персональна збірка ПК',
      price: totalPrice,
      images: [mainImage], // Картинка корпусу
      quantity: 1,
      isCustomBuild: true, // 🔥 Спеціальний прапорець, щоб кошик зрозумів, що це збірка
      buildComponents: selectedComponents // Ховаємо всі деталі всередину об'єкта
    };

    // Додаємо цей єдиний об'єкт у кошик (через as any, бо тип нестандартний)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addToCart(customPcProduct as any);
    
    toast.success('Збірку успішно додано до кошика як один товар!');
  };

  const formatSpecValue = (val: string | number | boolean) => {
    if (typeof val === 'boolean') return val ? 'Так' : 'Ні';
    return val;
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      <div className="container mx-auto px-4 py-10">
        
        {/* ЗАГОЛОВОК */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center">
            <Cpu className="text-green-500" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Конструктор ПК</h1>
            <p className="text-gray-500 text-sm mt-1">Зберіть комп'ютер мрії з перевіркою сумісності</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ЛІВА ЧАСТИНА: ПРОГРЕС ЗБІРКИ */}
          <div className="w-full lg:w-1/3 xl:w-1/4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 sticky top-28">
              <h3 className="font-bold text-xl mb-6 text-gray-900">Ваша збірка</h3>
              
              <div className="space-y-1 relative mb-6">
                {/* Вертикальна лінія */}
                <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-gray-100 z-0"></div>

                {STEPS.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = !!build[step];
                  const item = build[step];

                  return (
                    <div key={step} className="relative z-10 py-2">
                      <div className="flex items-start gap-4">
                        
                        {/* Кружечок кроку */}
                        <div 
                          onClick={() => index <= currentStep && prevStep()}
                          className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all mt-0.5 cursor-pointer shrink-0
                            ${isActive ? 'border-green-500 bg-green-500 text-white shadow-md shadow-green-200 scale-110' : 
                              isCompleted ? 'border-green-500 bg-white text-green-500' : 'border-gray-200 bg-white text-gray-400'}
                          `}
                        >
                          {isCompleted ? <Check size={16} /> : index + 1}
                        </div>

                        {/* Текст кроку */}
                        <div className="flex-1 min-w-0 pt-1.5">
                          <p className={`text-sm font-bold transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                            {STEP_LABELS[step]}
                          </p>
                          
                          {item ? (
                            <motion.div 
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2.5 bg-green-50/50 border border-green-200 shadow-sm p-3 rounded-xl flex items-center justify-between group cursor-default"
                            >
                              <div className="flex flex-col min-w-0 pr-2">
                                <span className="text-[10px] uppercase tracking-wider text-green-600 font-bold mb-0.5">Обрано</span>
                                <span className="text-xs font-bold text-gray-900 truncate" title={item.title}>
                                  {item.title}
                                </span>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeComponent(step);
                                }} 
                                className="w-7 h-7 shrink-0 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-100 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                title="Видалити"
                              >
                                <RotateCcw size={14} />
                              </button>
                            </motion.div>
                          ) : (
                             isActive && <p className="text-xs font-medium text-green-600 mt-1.5 animate-pulse">Очікування вибору...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-6">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-gray-500 text-sm font-medium mb-1">Загальна сума:</span>
                  <span className="text-3xl font-black text-gray-900">{totalPrice.toLocaleString()} ₴</span>
                </div>
                
                {/* 🔥 ПРУЖИНИСТА КНОПКА 🔥 */}
                <button 
                  onClick={handleFinish}
                  disabled={totalPrice === 0}
                  className="w-full flex items-center justify-center gap-3 bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <ShoppingCart size={20} /> Купити збірку
                </button>
              </div>
            </div>
          </div>

          {/* ПРАВА ЧАСТИНА: СПИСОК КОМПОНЕНТІВ */}
          <div className="w-full lg:w-2/3 xl:w-3/4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl min-h-[700px] border border-gray-200 shadow-sm flex flex-col">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Вибір: {STEP_LABELS[stepKey]}</h2>
                  <p className="text-sm text-gray-500 mt-1">Знайдено сумісних товарів: {products.length}</p>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={prevStep} 
                    disabled={currentStep === 0} 
                    className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl disabled:opacity-30 transition-colors"
                  >
                    Назад
                  </button>
                  <button 
                    onClick={nextStep} 
                    className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-bold text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Пропустити
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex-1 flex flex-col justify-center items-center">
                  <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
                  <p className="text-gray-500 font-medium">Перевірка сумісності...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle size={40} className="text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Нічого не знайдено</h3>
                  <p className="text-gray-500 max-w-md">
                    Немає товарів, що відповідають поточним фільтрам сумісності. Спробуйте змінити попередні компоненти (наприклад, материнську плату).
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
                  <AnimatePresence mode='popLayout'>
                    {products.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -4 }}
                        className="border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-green-500/30 transition-all cursor-pointer bg-white group flex flex-col"
                        onClick={() => selectComponent(stepKey, product)}
                      >
                        <div className="h-44 flex items-center justify-center p-4 bg-[#f8f9fa] rounded-xl mb-5 group-hover:bg-green-50/50 transition-colors">
                          <img 
                            src={product.images?.[0] || '/placeholder.png'} 
                            alt={product.title} 
                            className="max-h-full max-w-full object-contain mix-blend-multiply drop-shadow-sm group-hover:scale-105 transition-transform duration-300" 
                          />
                        </div>
                        
                        {/* Характеристики (Tags) */}
                        <div className="flex flex-wrap gap-1.5 mb-4 min-h-[1.75rem]">
                          {product.specifications && Object.entries(product.specifications).slice(0, 3).map(([key, val]) => (
                             <span key={key} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold tracking-wide">
                               {key}: <span className="text-gray-900">{formatSpecValue(val)}</span>
                             </span>
                          ))}
                        </div>

                        <h3 className="font-bold text-sm leading-snug mb-5 line-clamp-2 flex-grow group-hover:text-green-600 transition-colors text-gray-900">
                          {product.title}
                        </h3>
                        
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                          <span className="font-black text-xl text-gray-900">
                            {Number(product.price).toLocaleString()} ₴
                          </span>
                          <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-900 text-white group-hover:bg-green-500 group-hover:shadow-md group-hover:shadow-green-200 transition-all">
                             <Plus size={20} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}