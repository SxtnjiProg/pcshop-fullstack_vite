import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, Grid, List, ChevronLeft, ChevronRight, Heart, 
  CheckCircle2, Loader2, Scale, Flame, XCircle, AlertTriangle 
} from 'lucide-react'
import qs from 'qs'
import FilterSidebar from '../components/FilterSidebar'
import type { FilterState } from '../components/FilterSidebar'
import { useWishlist } from '../context/WishlistContext'
import { useComparison } from '../context/ComparisonContext'
import { useCart } from '../context/CartContext' // <--- Імпорт кошика

// Оновлений інтерфейс
interface Product {
  id: number
  title: string
  price: number // Важливо: змінив на number, бо в БД це Float/Int
  images: string[]
  slug: string
  category: { name: string }
  specifications?: Record<string, string>
  stock: number      // <--- Нове поле
  soldCount: number  // <--- Нове поле
}

interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  totalPages: number
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
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const [slide, setSlide] = useState(0)
  const [loading, setLoading] = useState(false)

  // Контексти
  const { toggleFavorite, isFavorite } = useWishlist();
  const { addToCompare, items: compareItems } = useComparison();
  const { addToCart } = useCart(); // <--- Хук кошика

  const isInCompare = (id: number) => compareItems.some(i => i.id === id);

  const fetchProducts = async (pageParam: number, isNewFilter: boolean = false) => {
    setLoading(true)
    const query = qs.stringify({ ...filters, page: pageParam, limit }, { skipNulls: true })
    
    try {
      const res = await axios.get<ProductsResponse>(`/api/products?${query}`)
      
      if (isNewFilter) {
        setProducts(res.data.products)
      } else {
        setProducts(prev => [...prev, ...res.data.products])
      }
      
      setTotalPages(res.data.totalPages)
    } catch (err) { 
      console.error(err) 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => {
    setPage(1)
    fetchProducts(1, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, limit])

  const loadMore = () => {
    const nextPage = page + 1
    if (nextPage <= totalPages) {
      setPage(nextPage)
      fetchProducts(nextPage, false)
    }
  }

  const nextSlide = () => setSlide((s) => (s === promoSlides.length - 1 ? 0 : s + 1))
  const prevSlide = () => setSlide((s) => (s === 0 ? promoSlides.length - 1 : s - 1))

  return (
    <div className="container mx-auto px-4 py-8 relative">

      {/* ================= 1. PROMO SLIDER ================= */}
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
            <img 
              src={promoSlides[slide].image} 
              className="w-full h-full object-cover object-center" 
              alt="promo" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4 sm:p-8">
              <h2 className="text-white text-lg sm:text-3xl font-bold drop-shadow-md max-w-xl leading-tight">
                {promoSlides[slide].text}
              </h2>
            </div>
          </motion.div>
        </AnimatePresence>

        <button onClick={prevSlide} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white p-1.5 sm:p-2 rounded-full text-white hover:text-black transition opacity-0 group-hover/slider:opacity-100 backdrop-blur-sm">
           <ChevronLeft size={20} />
        </button>
        <button onClick={nextSlide} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white p-1.5 sm:p-2 rounded-full text-white hover:text-black transition opacity-0 group-hover/slider:opacity-100 backdrop-blur-sm">
           <ChevronRight size={20} />
        </button>
      </div>

      {/* ================= 2. HEADER & TOOLBAR ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-end mb-6 z-20 relative gap-4 sm:gap-0">
        <div>
          <h1 className="text-3xl font-black text-gray-800">Каталог</h1>
          <p className="text-gray-500 text-sm mt-1">Товарів: {products.length}</p>
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
          
          {loading && products.length === 0 && (
             <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-500" size={40} /></div>
          )}

          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {products.map(product => {
                // 👇 ЛОГІКА СТАТУСІВ
                const isTopSeller = product.soldCount >= 5;
                const isOutOfStock = product.stock === 0;
                const isLowStock = product.stock < 5 && product.stock > 0;

                return (
                  <div
                    key={product.id}
                    className={`group relative bg-white rounded-2xl border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-gray-300 hover:rounded-b-none hover:z-30 h-full flex flex-col ${isOutOfStock ? 'opacity-90' : ''}`}
                  >
                    <div className="p-4 flex flex-col h-full bg-white rounded-2xl group-hover:rounded-b-none relative z-20">
                      
                      {/* TOP ACTIONS (Like / Compare) */}
                      <div className="absolute top-3 right-3 z-30 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0">
                          <button 
                            onClick={() => toggleFavorite(product.id)}
                            className={`bg-white p-2 rounded-full shadow-md transition border border-gray-100 ${
                              isFavorite(product.id) ? "text-red-500" : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                            }`} 
                            title="В обране"
                          >
                            <Heart size={18} className={isFavorite(product.id) ? "fill-red-500" : ""} />
                          </button>

                          <button 
                          
                          onClick={() => addToCompare({ ...product, price: product.price.toString() } as typeof compareItems[number])}
                          
                          className={`bg-white p-2 rounded-full shadow-md transition border border-gray-100 ${
                            isInCompare(product.id)
                            ? "text-purple-600 bg-purple-50 border-purple-200"
                            : "text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                          }`}
                          title="До порівняння"
                        >
                          <Scale size={18} />
                        </button>
                      </div>

                      {/* 👇 STATUS LABELS & BADGES */}
                      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 items-start">
                        {/* Хіт продажів */}
                        {isTopSeller && !isOutOfStock && (
                            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                <Flame size={12} fill="white" /> ХІТ
                            </span>
                        )}

                        {/* Наявність */}
                        {isOutOfStock ? (
                            <span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide flex items-center gap-1">
                              <XCircle size={12} /> Закінчився
                            </span>
                        ) : isLowStock ? (
                            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide flex items-center gap-1">
                              <AlertTriangle size={12} /> Закінчується
                            </span>
                        ) : (
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide flex items-center gap-1">
                              <CheckCircle2 size={12} /> В наявності
                            </span>
                        )}
                      </div>

                      <Link to={`/product/${product.slug}`} className="block grow mt-6">
                        <div className="h-52 flex items-center justify-center mb-4 overflow-hidden p-2">
                          <motion.img
                            whileHover={!isOutOfStock ? { scale: 1.05 } : {}}
                            transition={{ duration: 0.3 }}
                            src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'} 
                            alt={product.title}
                            className={`object-contain h-full max-w-full ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
                          />
                        </div>

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
                          <span className={`text-2xl font-bold ${isOutOfStock ? 'text-gray-400' : 'text-gray-900'}`}>
                             {product.price.toLocaleString()} ₴
                          </span>
                        </div>
                        
                        <motion.button
                          whileHover={!isOutOfStock ? { y: -3, backgroundColor: "#008a3c" } : {}}
                          whileTap={!isOutOfStock ? { scale: 0.95, y: 0 } : {}}
                          transition={{ duration: 0.2 }}
                          // 👇 ЛОГІКА КОШИКА
                          onClick={(e) => {
                            e.preventDefault(); // Щоб не переходило на сторінку товару
                            if (!isOutOfStock) {
                                addToCart(product);
                            }
                          }}
                          disabled={isOutOfStock}
                          className={`w-12 h-12 flex items-center justify-center rounded-xl shadow-lg transition-colors ${
                              isOutOfStock 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                              : 'bg-[#00a046] text-white shadow-green-100'
                          }`}
                        >
                          <ShoppingCart size={22} strokeWidth={2.5} />
                        </motion.button>
                      </div>
                    </div>

                    {/* DROPDOWN SPECS */}
                    {!isOutOfStock && (
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
                    )}

                  </div>
                );
            })}
          </div>
          
          {/* ================= LOAD MORE BUTTON ================= */}
          {products.length > 0 && page < totalPages && (
             <div className="mt-12 flex justify-center">
              <motion.button
                onClick={loadMore}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-green-500 text-green-600 font-bold rounded-full hover:bg-green-50 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Показати ще товари'}
              </motion.button>
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-20 text-gray-500 text-lg">
              Товарів не знайдено 😔
            </div>
          )}

        </div>
      </div>
    </div>
  )
}