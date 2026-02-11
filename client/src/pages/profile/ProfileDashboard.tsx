import { useAuth } from '../../context/AuthContext';
import { Save, User, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileDashboard() {
  const { user } = useAuth();
  
  // Розрахунок заповненості
  const filledFields = [user?.fullName, user?.email, user?.phone].filter(Boolean).length;
  const totalFields = 4; // Ім'я, Email, Телефон, Адреса
  const progress = (filledFields / totalFields) * 100;

  return (
    <div className="space-y-6">
      
      {/* 1. Блок прогресу */}
      {progress < 100 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-end mb-2">
             <h3 className="font-bold text-gray-800">Заповніть профіль</h3>
             <span className="text-green-600 font-bold">{progress}%</span>
           </div>
           <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
             <motion.div 
               initial={{ width: 0 }} 
               animate={{ width: `${progress}%` }} 
               className="bg-green-500 h-2.5 rounded-full"
             />
           </div>
           <p className="text-sm text-gray-500 mt-3">
             Додайте адресу доставки, щоб оформлювати замовлення в 1 клік.
           </p>
        </div>
      )}

      {/* 2. Особисті дані */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
         <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
           <User className="text-green-600" /> Особисті дані
         </h2>

         <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700">Прізвище та ім'я</label>
               <div className="relative">
                 <User size={18} className="absolute left-3 top-3 text-gray-400" />
                 <input type="text" defaultValue={user?.fullName} className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700">Email</label>
               <div className="relative">
                 <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                 <input type="email" defaultValue={user?.email} disabled className="w-full pl-10 p-2.5 border rounded-lg bg-gray-50 text-gray-500" />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700">Телефон</label>
               <div className="relative">
                 <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                 <input type="tel" placeholder="+380..." defaultValue={user?.phone} className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
               </div>
            </div>
            
            <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700">Адреса (місто)</label>
               <div className="relative">
                 <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                 <input type="text" placeholder="Київ" className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
               </div>
            </div>

            <div className="md:col-span-2 pt-4">
               <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition">
                 <Save size={18} /> Зберегти зміни
               </button>
            </div>
         </form>
      </div>
    </div>
  );
}