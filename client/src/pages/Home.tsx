import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Grid, List, ChevronLeft, ChevronRight, Heart, BarChart2, CheckCircle2 } from 'lucide-react'
import qs from 'qs'
import FilterSidebar from '../components/FilterSidebar'
import type { FilterState } from '../components/FilterSidebar'

interface Product {
  id: number
  title: string
  price: string
  imageUrl: string
  slug: string
  category: { name: string }
  specifications?: Record<string, string>
}

const promoSlides = [
  { id: 1, image: '/banner/1.png', text: '' },
  { id: 2, image: '/banner/2.png', text: '' },
  { id: 3, image: '/banner/3.jpg', text: 'Комплектуючі 2025' }
]

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<FilterState>({ category: null, minPrice: '', maxPrice: '' })
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [limit, setLimit] = useState(12)
  const [slide, setSlide] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      const query = qs.stringify(filters, { skipNulls: true })
      try {
        const res = await axios.get<Product[]>(`http://localhost:5000/api/products?${query}`)
        setProducts(res.data)
      } catch (err) { console.error(err) } finally { setLoading(false) }
    }
    fetchProducts()
  }, [filters])

  const visibleProducts = products.slice(0, limit)
  const nextSlide = () => setSlide((s) => (s === promoSlides.length - 1 ? 0 : s + 1))
  const prevSlide = () => setSlide((s) => (s === 0 ? promoSlides.length - 1 : s - 1))

  return (
    <div className="container mx-auto px-4 py-8 relative">

      {/* ================= 1. PROMO SLIDER (Compact & Responsive) ================= */}
      <div className="relative h-[160px] sm:h-[240px] lg:h-[320px] rounded-2xl overflow-hidden mb-8 shadow-md group/slider z-10 transition-all duration-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={promoSlides[slide].id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            {/* object-cover + object-center гарантують, що картинка заповнить весь блок і не спотвориться */}
            <img 
              src={promoSlides[slide].image} 
              className="w-full h-full object-cover object-center" 
              alt="promo" 
            />
            
            {/* Градієнт та текст: зменшив відступи (p-4) та шрифт, щоб влізло в менший банер */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4 sm:p-8">
              <h2 className="text-white text-lg sm:text-3xl font-bold drop-shadow-md max-w-xl leading-tight">
                {promoSlides[slide].text}
              </h2>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Кнопки навігації (трохи зменшені) */}
        <button 
          onClick={prevSlide} 
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white p-1.5 sm:p-2 rounded-full text-white hover:text-black transition opacity-0 group-hover/slider:opacity-100 backdrop-blur-sm"
        >
           <ChevronLeft size={20} />
        </button>
        <button 
          onClick={nextSlide} 
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white p-1.5 sm:p-2 rounded-full text-white hover:text-black transition opacity-0 group-hover/slider:opacity-100 backdrop-blur-sm"
        >
           <ChevronRight size={20} />
        </button>
      </div>

      {/* ================= 2. HEADER & TOOLBAR (Чистий) ================= */}
      {/* Прибрав bg-white, shadow, border, sticky - тепер це просто блок на фоні сторінки */}
      <div className="flex justify-between items-end mb-6 z-20 relative">
        <div>
          <h1 className="text-3xl font-black text-gray-800">Каталог</h1>
          <p className="text-gray-500 text-sm mt-1">Знайдено: {products.length}</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition ${view === 'grid' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <Grid size={20} />
          </button>
          <button onClick={() => setView('list')} className={`p-2 rounded-lg transition ${view === 'list' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <List size={20} />
          </button>
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="border-gray-300 border rounded-lg px-3 py-2 bg-transparent text-gray-700 outline-none focus:border-green-500 cursor-pointer">
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={36}>36</option>
          </select>
        </div>
      </div>

      {/* ================= 3. CONTENT LAYOUT ================= */}
      <div className="flex gap-8 items-start">
        <aside className="w-72 shrink-0 sticky top-24 z-30 hidden lg:block">
          <FilterSidebar onFilterChange={setFilters} currentCategory={filters.category as string} currentFilters={filters} />
        </aside>

        <div className="flex-grow min-w-0">
          {loading ? (
            <div className="py-20 text-center text-gray-400">Завантаження...</div>
          ) : (
            <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              
              {visibleProducts.map(product => (
                <div
                  key={product.id}
                  className="group relative bg-white rounded-2xl border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-gray-300 hover:rounded-b-none hover:z-30 h-full"
                >
                  <div className="p-4 flex flex-col h-full bg-white rounded-2xl group-hover:rounded-b-none relative z-20">
                    
                    {/* TOP ACTIONS */}
                    <div className="absolute top-3 right-3 z-30 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0">
                       <button className="bg-white p-2 rounded-full shadow-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition border border-gray-100" title="В обране">
                         <Heart size={18} />
                       </button>
                       <button className="bg-white p-2 rounded-full shadow-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition border border-gray-100" title="До порівняння">
                         <BarChart2 size={18} className="rotate-90" />
                       </button>
                    </div>

                    {/* STATUS LABEL */}
                    <div className="absolute top-3 left-3 z-20">
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide flex items-center gap-1">
                        <CheckCircle2 size={12} /> Топ продаж
                      </span>
                    </div>

                    <Link to={`/product/${product.slug}`} className="block grow mt-4">
                      {/* IMAGE */}
                      <div className="h-52 flex items-center justify-center mb-4 overflow-hidden p-2">
                        <motion.img
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                          src={product.imageUrl}
                          alt={product.title}
                          className="object-contain h-full max-w-full"
                        />
                      </div>

                      {/* INFO */}
                      <div className="mb-2">
                        <span className="text-xs text-gray-400 uppercase font-semibold">{product.category.name}</span>
                        <h3 className="font-medium text-gray-900 leading-snug line-clamp-2 mt-1 min-h-[44px] group-hover:text-green-600 transition-colors">
                          {product.title}
                        </h3>
                      </div>
                    </Link>

                    {/* PRICE & CART BTN */}
                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-gray-900">{product.price} ₴</span>
                        <span className="text-xs text-green-600 font-medium">Є в наявності</span>
                      </div>
                      
                      <motion.button
                        whileHover={{ y: -3, backgroundColor: "#008a3c" }} 
                        whileTap={{ scale: 0.95, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-12 h-12 flex items-center justify-center bg-[#00a046] text-white rounded-xl shadow-lg shadow-green-100"
                      >
                        <ShoppingCart size={22} strokeWidth={2.5} />
                      </motion.button>
                    </div>
                  </div>

                  {/* DROPDOWN SPECS */}
                  <div className="absolute left-[-1px] right-[-1px] top-[100%] bg-white border border-t-0 border-gray-300 rounded-b-xl px-4 pb-4 pt-1 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="h-px bg-gray-100 w-full mb-3"></div>
                    {product.specifications ? (
                      <ul className="text-sm text-gray-500 space-y-2">
                        {Object.entries(product.specifications).slice(0, 5).map(([k, v]) => (
                          <li key={k} className="flex justify-between items-baseline text-xs">
                            <span className="text-gray-400 shrink-0 pr-2">{k}</span>
                            <span className="font-medium text-gray-700 text-right line-clamp-1">{v}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-gray-400 py-1">Детальні характеристики дивіться на сторінці товару</div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}