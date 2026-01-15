import { Cpu, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div>
          <div className="flex items-center gap-2 mb-4 text-white">
            <Cpu size={24} />
            <span className="text-xl font-bold">PC SHOP</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Ми створюємо найкращі комп'ютери для ігор та роботи.
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold mb-4">Ми в соцмережах</h3>
          <div className="flex gap-4">
            {/* Використовуємо іконки, щоб не було помилки "unused vars" */}
            <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-indigo-600 transition">
              <Facebook size={20} />
            </a>
            <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-pink-600 transition">
              <Instagram size={20} />
            </a>
            <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-blue-400 transition">
              <Twitter size={20} />
            </a>
          </div>
        </div>

      </div>
      
      <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-500">
        © 2025 PC SHOP. Всі права захищені.
      </div>
    </footer>
  );
}