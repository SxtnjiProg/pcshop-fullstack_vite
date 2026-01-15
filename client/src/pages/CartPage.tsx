import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, removeFromCart, totalPrice } = useCart();

  // Якщо кошик порожній
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-6">
          <ShoppingBag size={64} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Кошик порожній</h2>
        <p className="text-gray-500 mb-8">Ви ще нічого не додали до замовлення.</p>
        <Link to="/catalog" className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition">
          Перейти до каталогу
        </Link>
      </div>
    );
  }

  return (
    // 👇 CONTAINER ТУТ
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <ShoppingBag /> Мій Кошик
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Список товарів */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 border border-gray-100">
              <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center p-2 flex-shrink-0">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain" />
              </div>
              
              <div className="flex-grow">
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <p className="text-gray-500 text-sm">Кількість: {item.quantity}</p>
                <div className="text-green-600 font-bold mt-1">{item.price * item.quantity} ₴</div>
              </div>

              <button 
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Сума */}
        <div className="bg-white p-6 rounded-2xl shadow-lg h-fit border border-gray-100 sticky top-24">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Підсумок</h3>
          
          <div className="flex justify-between mb-4 text-gray-600">
            <span>Товари ({items.length})</span>
            <span>{totalPrice} ₴</span>
          </div>
          
          <div className="border-t pt-4 mb-8 flex justify-between items-center">
            <span className="font-bold text-lg">До сплати</span>
            <span className="font-black text-2xl text-green-600">{totalPrice} ₴</span>
          </div>

          <button 
            onClick={() => alert('Це демо версія!')}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition active:scale-95"
          >
            Оформити
          </button>
        </div>

      </div>
    </div>
  );
}