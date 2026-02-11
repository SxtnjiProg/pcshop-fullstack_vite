import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
} from 'lucide-react';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  /* ================= EMPTY ================= */

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-gray-100 p-8 rounded-full mb-6">
          <ShoppingBag size={56} className="text-gray-400" />
        </div>

        <h2 className="text-3xl font-bold mb-2">
          Ваш кошик порожній
        </h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Додайте товари до кошика, щоб швидко оформити
          замовлення.
        </p>

        <Link
          to="/catalog"
          className="bg-green-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-green-700 transition shadow-lg shadow-green-200"
        >
          Перейти до каталогу
        </Link>
      </div>
    );
  }

  /* ================= PAGE ================= */

  return (
    <div className="bg-[#f6f6f6] min-h-screen py-10">
      <div className="container mx-auto px-4">
        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <ShoppingBag className="text-green-600" />
          Кошик
          <span className="text-gray-400 text-lg font-normal">
            {items.length} товар(и)
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
          {/* ================= PRODUCTS ================= */}
          <div className="space-y-4">
            {items.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row gap-6"
              >
                {/* IMAGE */}
                <Link
                  to={`/product/${item.slug}`}
                  className="w-28 h-28 bg-gray-50 rounded-xl border flex items-center justify-center shrink-0"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-contain p-2"
                  />
                </Link>

                {/* INFO */}
                <div className="flex-grow">
                  <Link
                    to={`/product/${item.slug}`}
                    className="text-lg font-semibold hover:text-green-600 transition block mb-1"
                  >
                    {item.title}
                  </Link>

                  <p className="text-sm text-gray-500 mb-4">
                    Код товару: {item.productId}
                  </p>

                  {/* QTY */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-xl overflow-hidden">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="px-3 py-2 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="px-4 font-bold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity + 1
                          )
                        }
                        className="px-3 py-2 text-gray-500 hover:bg-gray-100"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        removeFromCart(item.productId)
                      }
                      className="text-sm text-gray-400 hover:text-red-500 transition flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Видалити
                    </button>
                  </div>
                </div>

                {/* PRICE */}
                <div className="text-right min-w-[120px]">
                  <p className="text-xl font-bold whitespace-nowrap">
                    {(item.price * item.quantity).toLocaleString()} ₴
                  </p>
                  <p className="text-xs text-gray-400">
                    {item.price.toLocaleString()} ₴ / шт
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ================= SUMMARY ================= */}
          <div className="space-y-4 lg:sticky lg:top-24 h-fit">
            {/* TOTAL */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">Сума:</span>
                <span className="font-bold">
                  {total.toLocaleString()} ₴
                </span>
              </div>

              <div className="flex justify-between text-sm text-gray-500">
                <span>Доставка:</span>
                <span>Розраховується</span>
              </div>

              <div className="border-t pt-4 flex justify-between text-xl font-bold">
                <span>До сплати:</span>
                <span>{total.toLocaleString()} ₴</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center justify-center gap-2"
              >
                Оформити замовлення
                <ArrowRight size={20} />
              </button>

              <p className="text-xs text-center text-gray-400">
                Безпечна оплата та захист даних
              </p>
            </div>

            {/* TRUST */}
            <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <Truck className="text-green-600" size={20} />
                Швидка доставка по Україні
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck
                  className="text-green-600"
                  size={20}
                />
                100% безпечна оплата
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
