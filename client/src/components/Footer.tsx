import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Twitter, 
  Phone, 
  Mail, 
  MapPin,  
  Send, 
  Clock,
  Smartphone,
  Monitor
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#111] text-gray-400 text-sm border-t border-gray-800 font-sans">
      
      {/* 1. БЛОК ПІДПИСКИ (Telemart style) */}
      <div className="bg-[#1a1a1a] border-b border-gray-800">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-600/10 p-3 rounded-full text-green-500">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Дізнавайтесь про акції першими!</h3>
              <p className="text-gray-500">Отримуйте персональні пропозиції та знижки.</p>
            </div>
          </div>
          
          <div className="w-full md:w-auto flex-1 max-w-md">
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Ваш Email" 
                className="w-full bg-black/30 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-green-600 transition-colors"
              />
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2">
                Підписатись <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 2. ОСНОВНИЙ КОНТЕНТ */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* КОЛОНКА 1: КОНТАКТИ */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <Phone size={20} className="text-green-500" /> Контакти
            </h4>
            
            <div className="space-y-4">
              <div>
                <a href="tel:0800123456" className="text-2xl font-black text-white hover:text-green-500 transition-colors block">
                  0 (800) 123-456
                </a>
                <span className="text-xs text-gray-500 block mt-1">Безкоштовно по Україні</span>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={18} className="mt-0.5 text-gray-500" />
                <div>
                  <p className="text-white">Пн-Пт: 09:00 - 20:00</p>
                  <p>Сб-Нд: 10:00 - 18:00</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 text-gray-500" />
                <div>
                  <p className="text-white">м. Київ, вул. Хрещатик, 1</p>
                  <a href="#" className="text-green-500 text-xs hover:underline">Показати на мапі</a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gray-500" />
                <a href="mailto:support@pcshop.ua" className="hover:text-white transition-colors">
                  support@pcshop.ua
                </a>
              </div>
            </div>
          </div>

          {/* КОЛОНКА 2: КЛІЄНТАМ */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Клієнтам</h4>
            <ul className="space-y-3">
              <li><Link to="/profile" className="hover:text-green-500 transition-colors">Особистий кабінет</Link></li>
              <li><Link to="/profile/orders" className="hover:text-green-500 transition-colors">Мої замовлення</Link></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Оплата та доставка</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Гарантія та сервіс</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Обмін та повернення</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Кредит та розстрочка</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Корпоративним клієнтам</a></li>
            </ul>
          </div>

          {/* КОЛОНКА 3: КАТАЛОГ ТА ПОСЛУГИ */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Каталог</h4>
            <ul className="space-y-3">
              <li><Link to="/catalog?category=pc" className="hover:text-green-500 transition-colors">Ігрові ПК</Link></li>
              <li><Link to="/catalog?category=laptops" className="hover:text-green-500 transition-colors">Ноутбуки</Link></li>
              <li><Link to="/catalog?category=components" className="hover:text-green-500 transition-colors">Комплектуючі</Link></li>
              <li><Link to="/catalog?category=monitors" className="hover:text-green-500 transition-colors">Монітори</Link></li>
              <li className="pt-2">
                <span className="text-white font-bold block mb-2">Послуги</span>
                <ul className="space-y-2">
                   <li><a href="#" className="hover:text-green-500 transition-colors flex items-center gap-2"><Monitor size={14}/> Збірка ПК</a></li>
                   <li><a href="#" className="hover:text-green-500 transition-colors">Чистка та діагностика</a></li>
                </ul>
              </li>
            </ul>
          </div>

          {/* КОЛОНКА 4: ПРО КОМПАНІЮ ТА СОЦМЕРЕЖІ */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Про компанію</h4>
            <ul className="space-y-3 mb-8">
              <li><a href="#" className="hover:text-green-500 transition-colors">Про нас</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Вакансії</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Новини та огляди</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Контакти</a></li>
            </ul>

            <h5 className="text-white font-bold mb-4">Ми в соцмережах</h5>
            <div className="flex gap-3">
              <SocialLink icon={<Facebook size={20} />} color="hover:bg-[#1877F2]" />
              <SocialLink icon={<Instagram size={20} />} color="hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-red-500 hover:to-purple-500" />
              <SocialLink icon={<Youtube size={20} />} color="hover:bg-[#FF0000]" />
              <SocialLink icon={<Twitter size={20} />} color="hover:bg-[#1DA1F2]" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. НИЖНІЙ БАР (Оплата + Копірайт) */}
      <div className="bg-black py-6 border-t border-gray-900">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-600 text-center md:text-left">
            <p className="mb-1">© 2025 PC SHOP. Всі права захищені.</p>
            <p>Використання матеріалів сайту можливе тільки з посиланням на джерело.</p>
          </div>

          <div className="flex items-center gap-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
             {/* Імітація логотипів платіжних систем */}
             <div className="flex items-center gap-1 font-bold text-white italic"><span className="text-blue-600">VISA</span></div>
             <div className="flex items-center gap-1 font-bold text-white"><span className="text-red-500">Master</span><span className="text-yellow-500">Card</span></div>
             <div className="flex items-center gap-1 font-bold text-white"><span className="text-green-500">Privat</span>Bank</div>
             <div className="bg-black border border-white/20 rounded px-1 text-[10px] font-mono text-white">MONO</div>
             <div className="flex items-center text-white"><Smartphone size={16}/> ApplePay</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Допоміжний компонент для соцмереж
function SocialLink({ icon, color }: { icon: React.ReactNode, color: string }) {
  return (
    <a 
      href="#" 
      className={`bg-gray-800 text-white p-2.5 rounded-lg transition-all duration-300 hover:-translate-y-1 ${color}`}
    >
      {icon}
    </a>
  );
}