import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Phone, MapPin, CreditCard, Loader2, Truck, Wallet, Store, X, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchCities, getWarehouses } from '../services/novaPoshta';
import type { Option } from '../services/novaPoshta'; // 👇 Виправлено імпорт типу

// 👇 Карта
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Переконайся, що імпорт працює (через main.tsx або тут)

// Фікс іконки маркера (стандартний баг Leaflet в React)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Компонент для центрування карти при зміні відділень
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ fullName: user?.fullName || '', phone: '' });
  const [deliveryMethod, setDeliveryMethod] = useState<'NP' | 'UP' | 'PICKUP'>('NP');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH'>('CARD');
  const [loading, setLoading] = useState(false);

  // NP Logic
  const [cityQuery, setCityQuery] = useState('');
  const [citiesList, setCitiesList] = useState<Option[]>([]);
  const [selectedCity, setSelectedCity] = useState<Option | null>(null);
  const [isCityListOpen, setIsCityListOpen] = useState(false);

  const [warehouseQuery, setWarehouseQuery] = useState('');
  const [warehousesList, setWarehousesList] = useState<Option[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Option | null>(null);
  const [isWarehouseListOpen, setIsWarehouseListOpen] = useState(false);

  // Для Укрпошти
  const [addressRaw, setAddressRaw] = useState('');

  // Пошук міст
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (cityQuery.length >= 2 && !selectedCity) {
        const results = await searchCities(cityQuery);
        setCitiesList(results);
        setIsCityListOpen(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [cityQuery, selectedCity]);

  // Пошук відділень (завантажуємо всі при виборі міста)
  useEffect(() => {
    if (selectedCity) {
      getWarehouses(selectedCity.ref).then(setWarehousesList);
    }
  }, [selectedCity]);

  // Фільтрація відділень при введенні тексту
  const filteredWarehouses = warehousesList.filter(w => 
    w.name.toLowerCase().includes(warehouseQuery.toLowerCase())
  );

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCost = deliveryMethod === 'PICKUP' ? 0 : (deliveryMethod === 'NP' ? 80 : 50);
  const total = subtotal + deliveryCost;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (deliveryMethod === 'NP' && (!selectedCity || !selectedWarehouse)) {
      toast.error('Оберіть місто та відділення');
      return;
    }

    let finalAddress = '';
    let finalCity = '';

    if (deliveryMethod === 'NP') {
        finalCity = selectedCity?.name || '';
        finalAddress = `${selectedCity?.name}, ${selectedWarehouse?.name}`;
    } else if (deliveryMethod === 'UP') {
        finalCity = 'По Україні';
        finalAddress = addressRaw;
    } else {
        finalCity = 'Київ';
        finalAddress = 'Самовивіз з магазину';
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/orders/checkout', {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        shippingInfo: {
          fullName: formData.fullName,
          phone: formData.phone,
          city: finalCity,
          address: finalAddress,
        },
        isCash: paymentMethod === 'CASH'
      });

      if (paymentMethod === 'CARD' && res.data.liqpay) {
        const { liqpay } = res.data;
        clearCart();
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://www.liqpay.ua/api/3/checkout';
        form.style.display = 'none';
        
        const dataInput = document.createElement('input');
        dataInput.name = 'data';
        dataInput.value = liqpay.data;
        form.appendChild(dataInput);

        const signatureInput = document.createElement('input');
        signatureInput.name = 'signature';
        signatureInput.value = liqpay.signature;
        form.appendChild(signatureInput);

        document.body.appendChild(form);
        form.submit();
      } else {
        clearCart();
        toast.success('Замовлення успішно створено!');
        navigate('/profile/orders'); 
      }
    } catch (error) {
      console.error(error);
      toast.error('Помилка оформлення');
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-green-600" size={48} /></div>;
  if (items.length === 0) return <div className="text-center p-20 text-gray-500">Кошик порожній</div>;

  return (
    <div className="bg-[#F3F4F6] min-h-screen py-10 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-900">Оформлення замовлення</h1>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          
          <div className="space-y-6">
            
            {/* 1. КОНТАКТИ */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <h2 className="text-lg font-bold mb-4 flex items-center gap-3">
                 <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">1</span>
                 Ваші контакти
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full border border-gray-200 rounded-xl pl-10 p-3 outline-none focus:ring-2 focus:ring-green-500 transition" placeholder="Ім'я та Прізвище" />
                  </div>
                  <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input required type="tel" placeholder="+380 99 123 45 67" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-200 rounded-xl pl-10 p-3 outline-none focus:ring-2 focus:ring-green-500 transition" />
                  </div>
               </div>
            </div>

            {/* 2. ДОСТАВКА */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                 <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">2</span>
                 Спосіб доставки
               </h2>

               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  {[
                    { id: 'NP', label: 'Нова Пошта', icon: <img src="./public/Nova_Poshta.webp" className="h-5" alt="NP"/> },
                    { id: 'UP', label: 'Укрпошта', icon: <Truck size={24} className="text-yellow-500"/> },
                    { id: 'PICKUP', label: 'Самовивіз', icon: <Store size={24} className="text-gray-600"/> }
                  ].map((method) => (
                    <div 
                      key={method.id}
                      // 👇 Виправлено типізацію
                      onClick={() => setDeliveryMethod(method.id as 'NP' | 'UP' | 'PICKUP')}
                      className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${deliveryMethod === method.id ? 'border-green-500 bg-green-50/50 shadow-sm' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                      {method.icon}
                      <span className="font-bold text-sm text-gray-700">{method.label}</span>
                    </div>
                  ))}
               </div>

               {/* НОВА ПОШТА */}
               {deliveryMethod === 'NP' && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Місто</label>
                        <div className="relative">
                           <input 
                              type="text"
                              value={cityQuery}
                              onChange={(e) => {
                                setCityQuery(e.target.value);
                                setSelectedCity(null);
                                setSelectedWarehouse(null);
                                setWarehouseQuery('');
                              }}
                              placeholder="Введіть місто..."
                              className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500 transition"
                           />
                           {selectedCity ? (
                             <button type="button" onClick={() => { setCityQuery(''); setSelectedCity(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"><X size={18} /></button>
                           ) : (
                             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                           )}
                        </div>
                        {isCityListOpen && citiesList.length > 0 && !selectedCity && (
                          <div className="absolute z-20 w-full bg-white border border-gray-100 rounded-xl shadow-xl mt-1 max-h-60 overflow-y-auto">
                            {citiesList.map((city) => (
                              <div key={city.ref} onClick={() => { setSelectedCity(city); setCityQuery(city.name); setIsCityListOpen(false); }} className="p-3 hover:bg-green-50 cursor-pointer border-b border-gray-50 text-sm last:border-0">{city.name}</div>
                            ))}
                          </div>
                        )}
                    </div>

                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Відділення</label>
                        <input 
                            type="text"
                            disabled={!selectedCity}
                            value={warehouseQuery}
                            onClick={() => selectedCity && setIsWarehouseListOpen(true)}
                            onChange={(e) => { setWarehouseQuery(e.target.value); setSelectedWarehouse(null); }}
                            placeholder={selectedCity ? "Оберіть зі списку або на карті" : "Спочатку оберіть місто"}
                            className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500 transition disabled:bg-gray-50 disabled:text-gray-400"
                        />
                        {isWarehouseListOpen && warehousesList.length > 0 && !selectedWarehouse && (
                           <div className="absolute z-20 w-full bg-white border border-gray-100 rounded-xl shadow-xl mt-1 max-h-60 overflow-y-auto">
                             {filteredWarehouses.slice(0, 50).map((wh) => (
                               <div key={wh.ref} onClick={() => { setSelectedWarehouse(wh); setWarehouseQuery(wh.name); setIsWarehouseListOpen(false); }} className="p-3 hover:bg-green-50 cursor-pointer border-b border-gray-50 text-sm last:border-0">{wh.name}</div>
                             ))}
                           </div>
                        )}
                    </div>

                    {/* 🗺️ КАРТА (Виправлена логіка координат) */}
                    {warehousesList.length > 0 && (
                      <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-200 mt-4 shadow-inner">
                        <MapContainer 
                          center={
                            (warehousesList[0].lat && warehousesList[0].lng) 
                              ? [warehousesList[0].lat, warehousesList[0].lng] 
                              : [50.4501, 30.5234]
                          } 
                          zoom={12} 
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                          
                          {(warehousesList[0].lat && warehousesList[0].lng) && (
                             <ChangeView center={[warehousesList[0].lat, warehousesList[0].lng]} />
                          )}
                          
                          {warehousesList.slice(0, 50).map((wh) => (
                             (wh.lat && wh.lng) ? (
                               <Marker 
                                 key={wh.ref} 
                                 position={[wh.lat, wh.lng]}
                                 eventHandlers={{
                                   click: () => {
                                     setSelectedWarehouse(wh);
                                     setWarehouseQuery(wh.name);
                                   }
                                 }}
                               >
                                 <Popup>
                                   <div className="text-xs font-bold">{wh.name}</div>
                                   <button type="button" onClick={() => {setSelectedWarehouse(wh); setWarehouseQuery(wh.name);}} className="text-green-600 font-bold text-xs mt-1 underline">Обрати це відділення</button>
                                 </Popup>
                               </Marker>
                             ) : null
                          ))}
                        </MapContainer>
                      </div>
                    )}
                 </div>
               )}

               {deliveryMethod === 'UP' && (
                 <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Адреса доставки</label>
                    <textarea required value={addressRaw} onChange={e => setAddressRaw(e.target.value)} placeholder="Індекс, область, місто, вулиця, будинок" className="w-full border border-gray-200 rounded-xl p-3 outline-none h-24 resize-none focus:ring-2 focus:ring-green-500 transition" />
                 </div>
               )}

               {deliveryMethod === 'PICKUP' && (
                 <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 flex items-start gap-3 border border-gray-200">
                    <MapPin className="shrink-0 text-green-600" />
                    <div><p className="font-bold text-gray-900">Магазин "PCShop"</p><p>м. Київ, вул. Хрещатик, 1</p></div>
                 </div>
               )}
            </div>

            {/* 3. ОПЛАТА */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                 <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">3</span>
                 Метод оплати
               </h2>
               <div className="space-y-3">
                  <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-green-500 bg-green-50/30' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'CARD' ? 'border-green-600' : 'border-gray-300'}`}>
                        {paymentMethod === 'CARD' && <div className="w-2.5 h-2.5 bg-green-600 rounded-full" />}
                    </div>
                    <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} />
                    <div className="flex items-center gap-3 flex-1">
                       <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm"><CreditCard size={20} className="text-purple-600"/></div>
                       <div><p className="font-bold text-gray-900">Оплата карткою</p><p className="text-xs text-gray-500">LiqPay, Apple Pay, Google Pay</p></div>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'CASH' ? 'border-green-500 bg-green-50/30' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'CASH' ? 'border-green-600' : 'border-gray-300'}`}>
                        {paymentMethod === 'CASH' && <div className="w-2.5 h-2.5 bg-green-600 rounded-full" />}
                    </div>
                    <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod('CASH')} />
                    <div className="flex items-center gap-3 flex-1">
                       <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm"><Wallet size={20} className="text-green-600"/></div>
                       <div><p className="font-bold text-gray-900">При отриманні</p><p className="text-xs text-gray-500">Готівкою або карткою у відділенні</p></div>
                    </div>
                  </label>
               </div>
            </div>
          </div>

          {/* ПРАВА ЧАСТИНА */}
          <div className="h-fit space-y-4">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                <h3 className="font-bold text-gray-800 mb-6 text-xl border-b border-gray-100 pb-4">Ваше замовлення</h3>
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                   {items.map(item => (
                     <div key={item.id} className="flex gap-3">
                        <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 shrink-0">
                           <img src={item.image} alt="" className="max-w-full max-h-full object-contain p-1" />
                        </div>
                        <div className="flex-1 text-sm">
                           <p className="line-clamp-2 font-medium text-gray-800">{item.title}</p>
                           <div className="flex justify-between mt-1 text-gray-500">
                             <span>{item.quantity} шт.</span>
                             <span className="font-bold text-gray-900">{(item.price * item.quantity).toLocaleString()} ₴</span>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
                <div className="space-y-3 pt-4 border-t border-gray-100">
                   <div className="flex justify-between text-gray-600 text-sm"><span>Вартість товарів:</span><span className="font-medium">{subtotal.toLocaleString()} ₴</span></div>
                   <div className="flex justify-between text-gray-600 text-sm"><span>Доставка:</span><span className={deliveryCost === 0 ? 'text-green-600 font-bold' : 'font-medium'}>{deliveryCost === 0 ? 'Безкоштовно' : `~${deliveryCost} ₴`}</span></div>
                   <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between items-end"><span className="font-bold text-lg text-gray-800">До сплати:</span><span className="font-black text-3xl text-gray-900">{total.toLocaleString()} <span className="text-base font-medium text-gray-400">₴</span></span></div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#00a046] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#008a3c] transition shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed">
                   {loading ? <Loader2 className="animate-spin" /> : (
                     <>
                        <Check size={20} /> Підтвердити замовлення
                     </>
                   )}
                </button>
                <p className="text-xs text-center text-gray-400 mt-4 leading-tight">Підтверджуючи замовлення, я погоджуюсь з умовами публічної оферти</p>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
}