import { Star } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
  className?: string;
}

export default function StarRating({
  value,
  onChange,
  size = 24,
  readOnly = false,
  className = '',
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  
  const displayValue = hoverValue ?? value;

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    if (readOnly || !onChange) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    
    setHoverValue(index + (isHalf ? 0.5 : 1));
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    if (readOnly || !onChange) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;

    onChange(index + (isHalf ? 0.5 : 1));
  };

  return (
    <div 
      className={`flex items-center gap-1 select-none ${className}`} 
      onMouseLeave={() => setHoverValue(null)}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const isFull = displayValue >= i + 1;
        const isHalf = displayValue >= i + 0.5 && !isFull;

        return (
          <motion.button
            key={i}
            type="button"
            whileTap={!readOnly ? { scale: 0.8 } : undefined}
            whileHover={!readOnly ? { scale: 1.1 } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            
            className={`relative flex items-center justify-center outline-none transition-colors 
              ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
            style={{ width: size, height: size }}
            
            onClick={(e) => handleClick(e, i)}
            onMouseMove={(e) => handleMouseMove(e, i)}
            disabled={readOnly}
          >
            {/* СІРА ПІДКЛАДКА (Фон) */}
            <Star 
              size={size} 
              className="text-gray-200 fill-gray-100 absolute inset-0" 
              strokeWidth={1.5}
            />

            {/* КОЛЬОРОВА ЗІРКА (Накладання) */}
            <div 
              className="absolute inset-0 overflow-hidden transition-[width] duration-200 ease-out"
              style={{ 
                width: isFull ? '100%' : isHalf ? '50%' : '0%' 
              }}
            >
              <Star 
                size={size} 
                className="text-[#ffa900] fill-[#ffa900]" 
                strokeWidth={1.5}
              />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}