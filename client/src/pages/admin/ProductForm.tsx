import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useForm, useFieldArray } from 'react-hook-form'; // <--- Додали useFieldArray
import { Save, X, Plus, Trash2, FileText, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

// --- ІНТЕРФЕЙСИ ---
interface Category {
  id: number;
  name: string;
}

interface SpecificationItem {
  key: string;
  value: string;
}

interface ProductFormData {
  title: string;
  price: string | number;
  categoryId: string | number;
  images: string[];
  specifications: SpecificationItem[];
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Додаємо 'control' з useForm
  const { register, control, handleSubmit, setValue, reset } = useForm<ProductFormData>({
    defaultValues: {
      title: '',
      price: '',
      categoryId: '',
      images: [],
      specifications: []
    }
  });

  // 2. Використовуємо useFieldArray для характеристик замість watch
  const { fields, append, remove } = useFieldArray({
    control,
    name: "specifications"
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [imageInput, setImageInput] = useState('');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/categories').then(res => setCategories(res.data));
    
    if (isEdit) {
      const loadingToast = toast.loading('Завантаження товару...');
      axios.get(`http://localhost:5000/api/products/${id}`)
        .then(res => {
          const p = res.data;
          const imgArray = Array.isArray(p.images) ? p.images : [p.images || p.imageUrl].filter(Boolean);
          
          reset({
            title: p.title,
            price: p.price,
            categoryId: p.categoryId,
            images: imgArray,
            specifications: p.specifications 
              ? Object.entries(p.specifications).map(([key, value]) => ({ key, value: String(value) }))
              : []
          });
          setImages(imgArray);
          toast.dismiss(loadingToast);
        })
        .catch((err) => {
          console.error(err);
          toast.dismiss(loadingToast);
          toast.error('Не вдалося завантажити товар');
        });
    }
  }, [id, isEdit, reset]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseProductFile(text);
    };
    reader.readAsText(file);
  };

  const parseProductFile = (text: string) => {
    try {
      const lines = text.split('\n');
      const newSpecs: SpecificationItem[] = []; // Тимчасовий масив для характеристик
      
      lines.forEach(line => {
        const [key, ...valParts] = line.split(':');
        if (!key || valParts.length === 0) return;
        
        const value = valParts.join(':').trim();
        const lowerKey = key.trim().toLowerCase();

        if (lowerKey.includes('назва') || lowerKey === 'title') setValue('title', value);
        else if (lowerKey.includes('ціна') || lowerKey === 'price') setValue('price', value);
        else if (lowerKey.includes('фото') || lowerKey === 'image') {
           setImages(prev => [...prev, value]);
        }
        else {
          newSpecs.push({ key: key.trim(), value });
        }
      });

      // Оновлюємо характеристики через setValue (це працює і з useFieldArray)
      setValue('specifications', newSpecs);
      
      toast.success('Дані з файлу успішно імпортовано!', { icon: '📄' });
    } catch (err) {
      console.error(err);
      toast.error('Помилка читання файлу');
    }
  };

  const addImageUrl = () => {
    if (!imageInput) return;
    setImages([...images, imageInput]);
    setImageInput('');
    toast.success('Фото додано');
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages([...images, reader.result as string]);
        toast.success('Фото з комп\'ютера додано');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    toast('Фото видалено', { icon: '🗑️' });
  };

  const onSubmit = async (data: ProductFormData) => {
    const loadingToast = toast.loading('Збереження...');
    
    // Перетворюємо масив [{key, value}] назад у об'єкт {key: value}
    const specsObj = data.specifications.reduce((acc: Record<string, string>, item: SpecificationItem) => {
      if (item.key && item.value) acc[item.key] = item.value;
      return acc;
    }, {});

    const payload = {
      ...data,
      price: parseFloat(String(data.price)),
      categoryId: Number(data.categoryId),
      images: images,
      specifications: specsObj
    };

    try {
      if (isEdit) {
        await axios.put(`http://localhost:5000/api/products/${id}`, payload);
        toast.success('Товар оновлено!');
      } else {
        await axios.post('http://localhost:5000/api/products', payload);
        toast.success('Товар створено!');
      }
      toast.dismiss(loadingToast);
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error('Помилка збереження');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{isEdit ? 'Редагування товару' : 'Новий товар'}</h1>
        
        <div className="relative">
          <input 
            type="file" 
            accept=".txt" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 transition font-medium"
          >
            <FileText size={18} /> Імпорт з файлу (.txt)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-bold text-lg mb-4">Основна інформація</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Назва товару</label>
              <input {...register('title', { required: true })} className="w-full p-3 border rounded-xl" placeholder="Gaming PC Ultra..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ціна (₴)</label>
                <input {...register('price', { required: true })} type="number" className="w-full p-3 border rounded-xl" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Категорія</label>
                <select {...register('categoryId', { required: true })} className="w-full p-3 border rounded-xl bg-white">
                  <option value="">Оберіть категорію</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Характеристики</h2>
              {/* Використовуємо append замість setValues */}
              <button type="button" onClick={() => append({ key: '', value: '' })} className="text-sm text-green-600 hover:underline flex items-center gap-1">
                <Plus size={16} /> Додати поле
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Рендеримо поля через .map(fields) */}
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3">
                  <input 
                    placeholder="Назва (напр. Процесор)" 
                    {...register(`specifications.${index}.key`)}
                    className="flex-1 p-2 border rounded-lg text-sm"
                  />
                  <input 
                    placeholder="Значення (напр. Intel i9)" 
                    {...register(`specifications.${index}.value`)}
                    className="flex-1 p-2 border rounded-lg text-sm"
                  />
                  {/* Використовуємо remove замість фільтрації */}
                  <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {fields.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Характеристик немає. Додайте вручну або імпортуйте з файлу.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-lg mb-4">Галерея</h2>
            
            <div className="flex gap-2 mb-3">
              <input 
                value={imageInput}
                onChange={e => setImageInput(e.target.value)}
                placeholder="https://..." 
                className="flex-1 p-2 border rounded-lg text-sm"
              />
              <button type="button" onClick={addImageUrl} className="bg-black text-white p-2 rounded-lg">
                <Plus size={18} />
              </button>
            </div>

            <div className="relative mb-6">
               <input type="file" accept="image/*" onChange={handleImageFile} className="absolute inset-0 opacity-0 cursor-pointer" />
               <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition">
                 <div className="flex justify-center mb-2 text-gray-400"><ImageIcon /></div>
                 <span className="text-xs text-gray-500">Натисніть або перетягніть фото сюди</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={12} />
                  </button>
                  {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-1">Головна</span>}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-500 transition flex items-center justify-center gap-2">
            <Save size={20} /> Зберегти товар
          </button>
        </div>

      </form>
    </div>
  );
}