import { useState } from 'react';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfileAI() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Привіт, ${user?.fullName}! Я твій персональний помічник. Я проаналізував твої вподобання. Чим можу допомогти?` }
  ]);
  const [input, setInput] = useState('');

  const suggestions = [
    "Підбери ноутбук для роботи",
    "Яка відеокарта краща: 4060 чи 3070?",
    "Знайди аксесуари до мого останнього замовлення",
    "Що зараз в тренді?"
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Додаємо повідомлення юзера
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Імітація відповіді (тут буде запит на бекенд)
    setTimeout(() => {
       setMessages(prev => [...prev, { role: 'ai', text: 'Це цікаве запитання! Зараз проаналізую базу товарів...' }]);
    }, 1000);
  };

  return (
    <div className="h-[600px] flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
       {/* Header */}
       <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center gap-3 text-white">
          <div className="bg-white/20 p-2 rounded-lg">
             <Bot size={24} />
          </div>
          <div>
             <h3 className="font-bold">PCShop AI Assistant</h3>
             <p className="text-xs text-purple-100 opacity-80">Online • Знає історію твоїх покупок</p>
          </div>
       </div>

       {/* Chat Body */}
       <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4">
          {messages.map((msg, idx) => (
             <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                   ${msg.role === 'ai' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-600'}`}>
                   {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed
                   ${msg.role === 'ai' 
                      ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm' 
                      : 'bg-purple-600 text-white rounded-tr-none shadow-md'}`}>
                   {msg.text}
                </div>
             </div>
          ))}
       </div>

       {/* Suggestions & Input */}
       <div className="p-4 bg-white border-t border-gray-100">
          {messages.length < 3 && (
             <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                {suggestions.map((s, i) => (
                   <button 
                     key={i} 
                     onClick={() => setInput(s)}
                     className="whitespace-nowrap px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-full hover:bg-purple-100 transition border border-purple-100 flex items-center gap-1"
                   >
                     <Sparkles size={12} /> {s}
                   </button>
                ))}
             </div>
          )}

          <div className="relative">
             <input 
               type="text" 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder="Запитайте будь-що про техніку..."
               className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition"
             />
             <button 
               onClick={handleSend}
               className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
             >
                <Send size={16} />
             </button>
          </div>
       </div>
    </div>
  );
}