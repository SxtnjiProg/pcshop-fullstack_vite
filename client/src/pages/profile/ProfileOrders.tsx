import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Package,
  CreditCard,
  Truck,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* =======================
   TYPES
======================= */

interface OrderItem {
  id: number;
  quantity: number;
  product: {
    title: string;
    images?: string[];
  };
}

interface Order {
  id: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED';
  total: number;
  createdAt: string;
  ttn?: string;
  items?: OrderItem[];
}

/* =======================
   DELIVERY STEPS
======================= */

const steps = [
  { key: 'PENDING', label: 'Оформлено', icon: Package },
  { key: 'PAID', label: 'Оплачено', icon: CreditCard },
  { key: 'SHIPPED', label: 'В дорозі', icon: Truck },
  { key: 'DELIVERED', label: 'Доставлено', icon: MapPin },
] as const;

/* =======================
   COMPONENT
======================= */

export default function ProfileOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/orders/my')
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Завантаження...</div>;
  }

  const getStepIndex = (status: Order['status']) =>
    steps.findIndex(s => s.key === status);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Мої замовлення</h2>

      {orders.length === 0 && (
        <div className="text-center py-16 border rounded-xl bg-white">
          <Package className="mx-auto mb-4 text-gray-300" size={48} />
          <p className="text-gray-500">Замовлень поки немає</p>
        </div>
      )}

      {orders.map(order => {
        const isOpen = openId === order.id;
        const currentStep = getStepIndex(order.status);

        const hasItems = Array.isArray(order.items) && order.items.length > 0;
        const mainItem = hasItems ? order.items![0] : null;
        const moreCount = hasItems ? order.items!.length - 1 : 0;

        return (
          <div
            key={order.id}
            className="bg-white border rounded-2xl shadow-sm overflow-hidden"
          >
            {/* =======================
               COLLAPSED VIEW
            ======================= */}
            <button
              onClick={() => setOpenId(isOpen ? null : order.id)}
              className="w-full px-6 py-5 flex justify-between items-center gap-6 hover:bg-gray-50 transition"
            >
              {/* PRODUCT PREVIEW */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-xl border bg-gray-50 flex items-center justify-center shrink-0">
                  {mainItem ? (
                    <img
                      src={
                        mainItem.product.images?.[0] ||
                        '/placeholder.png'
                      }
                      alt={mainItem.product.title}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <Package className="text-gray-300" />
                  )}
                </div>

                <div className="text-left min-w-0">
                  <p className="font-semibold line-clamp-1">
                    {mainItem
                      ? mainItem.product.title
                      : 'Товари формуються'}
                  </p>

                  {moreCount > 0 && (
                    <p className="text-xs text-gray-500">
                      + ще {moreCount} товар(и)
                    </p>
                  )}

                  <p className="text-sm text-gray-500">
                    {steps[currentStep]?.label}
                  </p>
                </div>
              </div>

              {/* PRICE + TOGGLE */}
              <div className="flex items-center gap-4">
                <p className="font-bold whitespace-nowrap">
                  {order.total.toLocaleString()} ₴
                </p>
                <ChevronDown
                  className={`transition ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* =======================
               EXPANDED VIEW
            ======================= */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="border-t"
                >
                  <div className="p-6 space-y-8">
                    {/* TIMELINE */}
                    <div>
                      <p className="text-sm font-semibold mb-4">
                        Статус доставки
                      </p>

                      <div className="relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200" />
                        <motion.div
                          className="absolute top-1/2 left-0 h-1 bg-green-500"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(currentStep / 3) * 100}%`,
                          }}
                          transition={{ duration: 0.6 }}
                        />

                        <div className="flex justify-between relative">
                          {steps.map((step, idx) => {
                            const Icon = step.icon;
                            const active = idx <= currentStep;

                            return (
                              <div
                                key={step.key}
                                className="flex flex-col items-center gap-2 bg-white px-2"
                              >
                                <div
                                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                                    active
                                      ? 'bg-green-500 border-green-500 text-white'
                                      : 'bg-white border-gray-300 text-gray-400'
                                  }`}
                                >
                                  <Icon size={18} />
                                </div>
                                <span
                                  className={`text-xs font-semibold ${
                                    active
                                      ? 'text-green-600'
                                      : 'text-gray-400'
                                  }`}
                                >
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* DELIVERY INFO */}
                    {order.ttn && (
                      <div className="bg-gray-50 rounded-xl p-5">
                        <p className="text-xs text-gray-400 font-bold uppercase">
                          Номер ТТН
                        </p>
                        <p className="font-mono">{order.ttn}</p>
                        <a
                          href={`https://novaposhta.ua/tracking/?cargo_number=${order.ttn}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block mt-2 text-sm font-semibold text-blue-600 hover:underline"
                        >
                          Відстежити →
                        </a>
                      </div>
                    )}

                    {/* ALL ITEMS */}
                    {hasItems && (
                      <div>
                        <p className="text-sm font-semibold mb-4">
                          Товари в замовленні
                        </p>

                        <div className="space-y-3">
                          {order.items!.map(item => (
                            <div
                              key={item.id}
                              className="flex items-center gap-4"
                            >
                              <div className="w-12 h-12 border rounded-lg p-1">
                                <img
                                  src={
                                    item.product.images?.[0] ||
                                    '/placeholder.png'
                                  }
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {item.product.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.quantity} шт.
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
