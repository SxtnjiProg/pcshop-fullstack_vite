import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Menu, Cpu, User, Heart, Scale, Layers } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useComparison } from '../context/ComparisonContext';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { items } = useCart();
  const { user } = useAuth();
  const { favorites } = useWishlist();
  const { items: compareItems } = useComparison();
  
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 h-20 flex justify-between items-center">
        
        {/* --- ЛІВА ЧАСТИНА --- */}
        <div className="flex items-center gap-6">

          {/* Логотип */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              className="bg-green-500 p-2 rounded-lg text-black shadow-[0_0_15px_rgba(34,197,94,0.5)]"
              whileHover={{ scale: 1.15 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Cpu size={24} />
            </motion.div>

            <motion.span
              className="text-xl font-black tracking-tight text-white"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              Nexora<span className="text-green-500">PC</span>
            </motion.span>
          </Link>

          {/* Конструктор ПК */}
          <Link
            to="/pc-builder"
            className="hidden md:flex items-center gap-2 px-4 h-10 rounded-lg
                       bg-white/5 border border-white/10
                       text-gray-300 text-sm font-medium
                       hover:text-green-400
                       hover:border-green-500/40
                       hover:bg-white/10
                       transition-all duration-300"
          >
            <Layers size={18} />
            <span>Конструктор ПК</span>
          </Link>
        </div>

        {/* --- ПОШУК --- */}
        <div className="hidden md:flex items-center bg-white/5 px-4 py-2 rounded-full w-96 border border-white/10 focus-within:border-green-500 focus-within:bg-black/40 transition-all duration-300">
          <Search size={18} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Пошук комплектуючих..."
            className="bg-transparent border-none outline-none w-full text-sm text-white placeholder-gray-500"
          />
        </div>

        {/* --- ПРАВА ЧАСТИНА --- */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Акаунт */}
          <Link 
            to={user ? (user.role === 'ADMIN' ? "/admin" : "/profile") : "/login"} 
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all relative"
            title={user ? user.fullName : "Увійти"}
          >
            <User size={22} />
            {user && (
              <span className="absolute bottom-2 right-2 w-2 h-2 bg-green-500 rounded-full border-2 border-[#0a0a0a]"></span>
            )}
          </Link>

          {/* Порівняння */}
          <Link 
            to="/compare" 
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all relative"
          >
            <Scale size={22} />
            {compareItems.length > 0 && (
              <span className="absolute top-1.5 right-1 bg-purple-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#0a0a0a]">
                {compareItems.length}
              </span>
            )}
          </Link>

          {/* Обране */}
          <Link 
            to={user ? "/profile/wishlist" : "/login"} 
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition-all relative"
          >
            <Heart size={22} />
            {favorites.length > 0 && (
              <span className="absolute top-1.5 right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#0a0a0a]">
                {favorites.length}
              </span>
            )}
          </Link>
          
          {/* Корзина */}
          <Link 
            to="/cart" 
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-green-400 hover:bg-white/5 transition-all relative"
          >
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute top-1.5 right-1 bg-green-500 text-black text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#0a0a0a]">
                {itemCount}
              </span>
            )}
          </Link>
          
          {/* Меню мобілка */}
          <button className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
}