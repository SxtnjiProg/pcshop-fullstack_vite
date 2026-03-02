import { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Calendar, MapPin, ChevronDown, ChevronUp, ExternalLink, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderItem {
  id: number;
  product: { title: string; price: number; slug: string };
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  ttn?: string;
  city: string;
}

export default function ProfileOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/orders/my')
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggleOrder = (id: number) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      'PENDING': { 
        color: 'text-amber-600', 
        bg: 'bg-amber-50', 
        icon: Clock,
        text: 'Очікує',
        step: 0
      },
      'PAID': { 
        color: 'text-blue-600', 
        bg: 'bg-blue-50', 
        icon: CheckCircle2,
        text: 'Оплачено',
        step: 1
      },
      'SHIPPED': { 
        color: 'text-purple-600', 
        bg: 'bg-purple-50', 
        icon: Truck,
        text: 'Відправлено',
        step: 2
      },
      'DELIVERED': { 
        color: 'text-green-600', 
        bg: 'bg-green-50', 
        icon: CheckCircle2,
        text: 'Доставлено',
        step: 3
      },
      'CANCELLED': { 
        color: 'text-red-600', 
        bg: 'bg-red-50', 
        icon: XCircle,
        text: 'Скасовано',
        step: -1
      }
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  const orderSteps = [
    { label: 'Підтверджено', icon: CheckCircle2 },
    { label: 'Оплачено', icon: CheckCircle2 },
    { label: 'Відправлено', icon: Truck },
    { label: 'Доставлено', icon: Package }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="text-gray-400" size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Немає замовлень</h3>
        <p className="text-sm text-gray-500 mb-6">Ви ще не зробили жодної покупки</p>
        <a href="/" className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Почати покупки
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Мої замовлення</h2>
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          const StatusIcon = statusConfig.icon;
          const isExpanded = expandedOrder === order.id;
          const currentStep = statusConfig.step;
          
          return (
            <motion.div 
              layout
              key={order.id} 
              className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 overflow-hidden"
            >
              {/* Header - Clickable */}
              <div 
                onClick={() => toggleOrder(order.id)}
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-gray-600">#{order.id}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${statusConfig.bg}`}>
                          <StatusIcon size={12} className={statusConfig.color} />
                          <span className={`text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.text}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(order.createdAt).toLocaleDateString('uk-UA')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin size={12} />
                        <span className="truncate">{order.city}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {order.total.toLocaleString()} ₴
                      </div>
                    </div>
                    
                    <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp size={18} className="text-gray-600" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="border-t border-gray-100">
                      {/* Progress Bar Section */}
                      {order.status !== 'CANCELLED' && (
                        <div className="p-4 bg-gray-50">
                          <div className="relative mb-2">
                            {/* Progress Line */}
                            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                                style={{ width: `${(currentStep / (orderSteps.length - 1)) * 100}%` }}
                              />
                            </div>

                            {/* Steps */}
                            <div className="relative flex justify-between">
                              {orderSteps.map((step, index) => {
                                const StepIcon = step.icon;
                                const isCompleted = index <= currentStep;
                                const isCurrent = index === currentStep;
                                
                                return (
                                  <div key={index} className="flex flex-col items-center" style={{ width: '70px' }}>
                                    <div 
                                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                        isCompleted 
                                          ? 'bg-gradient-to-br from-blue-500 to-green-500 border-transparent text-white shadow-md' 
                                          : 'bg-white border-gray-300 text-gray-400'
                                      } ${isCurrent ? 'ring-2 ring-blue-200' : ''}`}
                                    >
                                      <StepIcon size={14} />
                                    </div>
                                    <div className={`mt-1.5 text-[10px] text-center font-medium leading-tight ${
                                      isCompleted ? 'text-gray-900' : 'text-gray-500'
                                    }`}>
                                      {step.label}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TTN Tracking */}
                      {order.ttn && (
                        <div className="px-4 pb-3">
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <Truck size={16} className="text-blue-600 flex-shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-[10px] text-gray-600 mb-0.5">ТТН</div>
                                  <div className="font-mono text-xs font-semibold text-gray-900 truncate">{order.ttn}</div>
                                </div>
                              </div>
                              <a 
                                href={`https://novaposhta.ua/tracking/?cargo_number=${order.ttn}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors flex-shrink-0"
                              >
                                Трекінг
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Order Items */}
                      <div className="px-4 pb-4">
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div 
                              key={item.id} 
                              className="flex items-center justify-between gap-3 p-2 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center flex-shrink-0 border border-gray-100">
                                  <Package size={16} className="text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {item.product.title}
                                  </h4>
                                  <div className="text-xs text-gray-500">
                                    {item.quantity} шт × {item.price.toLocaleString()} ₴
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-sm font-semibold text-gray-900">
                                  {(item.quantity * item.price).toLocaleString()} ₴
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Total */}
                        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                          <span className="text-sm text-gray-700 font-medium">Разом:</span>
                          <span className="text-xl font-bold text-gray-900">
                            {order.total.toLocaleString()} ₴
                          </span>
                        </div>
                      </div>

                  
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}