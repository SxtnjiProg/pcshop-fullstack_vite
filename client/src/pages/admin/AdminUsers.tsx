import { useEffect, useState } from 'react';
import axios from 'axios';
import { User as UserIcon, Shield, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface User {
  id: number;
  fullName: string | null;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = () => {
    axios.get('http://localhost:5000/api/admin/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (user: User) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Змінити роль ${user.email} на ${newRole}?`)) return;

    try {
      await axios.put(`http://localhost:5000/api/admin/users/${user.id}/role`, { role: newRole });
      fetchUsers();
    } catch (err) { 
      console.error(err);
      alert('Помилка зміни ролі'); 
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Видалити цього користувача назавжди?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
      fetchUsers();
    } catch (err) { 
      console.error(err);
      alert('Помилка видалення (можливо, у юзера є замовлення)'); 
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900">Клієнти та Адміністратори</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs">
            <tr>
              <th className="p-4">Користувач</th>
              <th className="p-4">Роль</th>
              <th className="p-4">Дата реєстрації</th>
              <th className="p-4 text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-900">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${u.role === 'ADMIN' ? 'bg-black' : 'bg-gray-300'}`}>
                      {u.fullName?.[0] || <UserIcon size={16} />}
                    </div>
                    <div>
                      <div className="font-medium">{u.fullName || 'Гість'}</div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {u.role === 'ADMIN' ? (
                    <span className="inline-flex items-center gap-1 bg-black text-white px-2 py-1 rounded-md text-xs font-bold">
                      <Shield size={12} /> ADMIN
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold">
                      USER
                    </span>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  {currentUser?.id !== u.id && (
                    <>
                      <button 
                        onClick={() => toggleRole(u)}
                        title={u.role === 'ADMIN' ? "Забрати права" : "Зробити адміном"}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black transition"
                      >
                        {u.role === 'ADMIN' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id)}
                        title="Видалити"
                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}