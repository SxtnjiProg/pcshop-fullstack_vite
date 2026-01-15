import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, TrendingDown, Download } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

// --- ІНТЕРФЕЙСИ ---

interface ChartData {
  name: string;
  sales: number;
}

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  trends: {
    revenue: number | string;
    orders: number | string;
    users: number | string;
  };
  chartData: ChartData[];
}

// 🆕 Додаємо інтерфейс для Замовлення, щоб прибрати 'any'
interface Order {
  id: number;
  createdAt: string;
  total: number;
  status: string;
  user?: {
    fullName: string | null;
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError('Не вдалося завантажити статистику');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // --- ЛОГІКА ЕКСПОРТУ В CSV ---
  const handleExportCSV = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/orders');
      // Вказуємо, що відповідь - це масив Order[]
      const orders: Order[] = res.data; 

      // 🆕 Явно кажемо TypeScript, що це масив масивів рядків
      const csvRows: string[][] = []; 

      // Заголовки
      csvRows.push(['ID', 'Date', 'Client', 'Total (UAH)', 'Status']);

      // Дані
      orders.forEach((order) => {
        const date = new Date(order.createdAt).toLocaleDateString();
        const clientName = order.user?.fullName ? `"${order.user.fullName}"` : 'Guest';
        
        // Перетворюємо все в рядки (toString), щоб відповідати типу string[][]
        csvRows.push([
          order.id.toString(),
          date,
          clientName,
          order.total.toString(),
          order.status
        ]);
      });

      // Склеюємо
      const csvString = csvRows.map(e => e.join(',')).join('\n');

      // Скачуємо
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `orders_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (err) {
      alert('Помилка при експорті');
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) return <div className="text-red-500">{error}</div>;
  if (!stats) return null;

  // --- ГРАФІК ---
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
      x: { grid: { display: false } }
    },
    elements: { line: { tension: 0.4 } }
  };

  const chartData = {
    labels: stats.chartData ? stats.chartData.map(d => d.name) : [], 
    datasets: [{
      label: 'Продажі (₴)',
      data: stats.chartData ? stats.chartData.map(d => d.sales) : [],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
    }],
  };

  const renderTrend = (val: number | string) => {
    const value = Number(val);
    if (isNaN(value)) return null;
    const isPositive = value >= 0;
    return (
      <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
        {isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
        {value > 0 ? '+' : ''}{value}%
      </span>
    );
  };

  const cards = [
    {
      title: 'Загальний дохід',
      value: `${stats.totalRevenue.toLocaleString()} ₴`,
      icon: DollarSign,
      color: 'bg-green-500',
      trendValue: stats.trends?.revenue || 0,
    },
    {
      title: 'Замовлення',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      trendValue: stats.trends?.orders || 0,
    },
    {
      title: 'Клієнти',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-purple-500',
      trendValue: stats.trends?.users || 0,
    },
    {
      title: 'Товари в базі',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-orange-500',
      trendValue: null, 
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Дашборд</h1>
        <div className="text-sm text-gray-500">Статистика магазину</div>
      </div>

      {/* КАРТКИ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.color} text-white shadow-lg shadow-gray-200`}>
                <card.icon size={24} />
              </div>
              {card.trendValue !== null && renderTrend(card.trendValue)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ГРАФІК */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold mb-6">Динаміка продажів (6 місяців)</h3>
          <div className="flex-grow min-h-[300px]">
            <Line options={chartOptions} data={chartData} />
          </div>
        </div>

        {/* ШВИДКІ ДІЇ */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">Швидкі дії</h3>
          <div className="space-y-3">
             <button 
               onClick={() => navigate('/admin/products/new')} 
               className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition border border-gray-100 text-sm font-medium flex items-center gap-2 group"
             >
               <span className="bg-gray-100 p-1.5 rounded-lg group-hover:bg-green-100 group-hover:text-green-600 transition">📦</span>
               Додати новий товар
             </button>
             
             <button 
               onClick={() => navigate('/admin/users')} 
               className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition border border-gray-100 text-sm font-medium flex items-center gap-2 group"
             >
               <span className="bg-gray-100 p-1.5 rounded-lg group-hover:bg-purple-100 group-hover:text-purple-600 transition">👥</span>
               Переглянути нових клієнтів
             </button>
             
             <button 
               onClick={handleExportCSV}
               disabled={exporting}
               className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition border border-gray-100 text-sm font-medium flex items-center gap-2 group disabled:opacity-50"
             >
               <span className="bg-gray-100 p-1.5 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                 {exporting ? <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"/> : <Download size={16} />}
               </span>
               {exporting ? 'Експортуємо...' : 'Експорт замовлень (CSV)'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}