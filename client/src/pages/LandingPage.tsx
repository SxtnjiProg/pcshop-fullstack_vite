import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, Zap, ShieldCheck, ArrowRight, MousePointer2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
      
      {/* 🟢 Фонові ефекти (Блюр) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* HERO SECTION */}
      <div className="container mx-auto px-4 h-screen flex flex-col justify-center items-center text-center relative z-10">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-900/30 border border-green-500/30 text-green-400 text-sm font-bold tracking-wider uppercase"
        >
          <Zap size={16} className="animate-pulse" /> Next Gen Performance
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-tight"
        >
          ТВІЙ ПК <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-700 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">
            ТВОЇ ПРАВИЛА
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-gray-400 text-xl md:text-2xl max-w-2xl mb-12 leading-relaxed"
        >
          Ми не просто продаємо залізо. Ми створюємо архітектуру твоєї перемоги. 
          Максимальний FPS, тиха робота та естетика майбутнього.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col md:flex-row gap-6"
        >
          <Link 
            to="/catalog"
            className="group relative px-8 py-4 bg-green-500 text-black font-black text-lg rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(34,197,94,0.6)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              ВІДКРИТИ КАТАЛОГ <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
          
          <button className="px-8 py-4 bg-transparent border border-gray-700 text-white font-bold rounded-xl hover:bg-gray-800 transition flex items-center gap-2">
            <MousePointer2 size={20} /> Як це працює?
          </button>
        </motion.div>
      </div>

      {/* 🟢 БІГУЧИЙ РЯДОК (MARQUEE) */}
      <div className="absolute bottom-0 w-full bg-green-500/10 border-t border-green-500/20 backdrop-blur-sm py-4 overflow-hidden flex">
        <motion.div 
          className="flex gap-12 text-green-400 font-bold uppercase tracking-[0.2em] whitespace-nowrap text-lg"
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          <span>GeForce RTX 4090</span> • <span>Intel Core i9</span> • <span>Liquid Cooling</span> • <span>RGB Sync</span> • <span>Ultra Performance</span> • 
          <span>GeForce RTX 4090</span> • <span>Intel Core i9</span> • <span>Liquid Cooling</span> • <span>RGB Sync</span> • <span>Ultra Performance</span>
        </motion.div>
      </div>

      {/* 🟢 FEATURES SECTION (Блоки переваг) */}
      <div className="container mx-auto px-4 py-32 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {[
          { icon: <Cpu size={40} />, title: "Потужність", desc: "Тільки топові чіпи для максимальних задач." },
          { icon: <ShieldCheck size={40} />, title: "Гарантія", desc: "3 роки повної підтримки твого звіра." },
          { icon: <Zap size={40} />, title: "Швидкість", desc: "Збірка та доставка за 48 годин." }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
            className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-green-500/10 hover:border-green-500/50 transition-all group"
          >
            <div className="text-green-500 mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
              {item.icon}
            </div>
            <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
            <p className="text-gray-400">{item.desc}</p>
          </motion.div>
        ))}
      </div>

    </div>
  );
}