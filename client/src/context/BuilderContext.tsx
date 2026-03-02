import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { STEPS, type BuilderStep } from '../constants/builder';

export interface BuilderProduct {
  id: number;
  title: string;
  price: number;
  images: string[];
  specifications?: Record<string, string | number | boolean>;
}

// Тип для фільтрів, щоб уникнути any
type CompatibilityFilters = Record<string, string | number | boolean>;

interface BuilderContextType {
  currentStep: number;
  build: Record<BuilderStep, BuilderProduct | null>;
  totalPrice: number;
  nextStep: () => void;
  prevStep: () => void;
  selectComponent: (step: BuilderStep, product: BuilderProduct) => void;
  removeComponent: (step: BuilderStep) => void;
  getCompatibilityFilters: () => CompatibilityFilters; // Замінено any
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [build, setBuild] = useState<Record<BuilderStep, BuilderProduct | null>>({
    cpu: null, motherboard: null, cooler: null, ram: null, gpu: null, storage: null, psu: null, case: null
  });

  const currentStepKey = STEPS[currentStepIndex];

  const selectComponent = (step: BuilderStep, product: BuilderProduct) => {
    setBuild(prev => ({ ...prev, [step]: product }));
    if (currentStepIndex < STEPS.length - 1) setCurrentStepIndex(p => p + 1);
  };

  const removeComponent = (step: BuilderStep) => {
    setBuild(prev => ({ ...prev, [step]: null }));
  };

  const getCompatibilityFilters = useCallback(() => {
    const filters: CompatibilityFilters = {};

    // 1. ЛОГІКА ДЛЯ МАТЕРИНСЬКОЇ ПЛАТИ (Дивимось на CPU)
    if (currentStepKey === 'motherboard' && build.cpu?.specifications) {
      const cpuSocket = build.cpu.specifications['Сокет'];
      if (cpuSocket) filters['Сокет'] = cpuSocket;
    }

    // 2. ЛОГІКА ДЛЯ ОПЕРАТИВКИ (Дивимось на Материнку)
    if (currentStepKey === 'ram' && build.motherboard?.specifications) {
      const moboMemoryType = build.motherboard.specifications["Тип пам'яті"];
      if (moboMemoryType) {
        // МАГІЯ ТУТ: Ми беремо значення "DDR4" з материнки, 
        // але серверу кажемо шукати його в полі "Тип" (як у ОЗУ в БД)
        filters['Тип'] = moboMemoryType; 
      }
    }

    // 3. ЛОГІКА ДЛЯ КУЛЕРА (Дивимось на CPU)
    if (currentStepKey === 'cooler' && build.cpu?.specifications) {
      const cpuSocket = build.cpu.specifications['Сокет'];
      if (cpuSocket) filters['Сокет'] = cpuSocket;
    }

    // 4. ЛОГІКА ДЛЯ БЖ
    if (currentStepKey === 'psu') {
      const cpuTdp = Number(build.cpu?.specifications?.['TDP']) || 100;
      const gpuTdp = Number(build.gpu?.specifications?.['TDP']) || 200;
      filters.minWattage = cpuTdp + gpuTdp + 150;
    }

    console.log("🚀 ФІЛЬТРИ ДЛЯ API:", filters);
    return filters;
  }, [currentStepKey, build.cpu, build.motherboard, build.gpu]);

  const totalPrice = Object.values(build).reduce((sum, item) => sum + (Number(item?.price) || 0), 0);

  return (
    <BuilderContext.Provider value={{ 
      currentStep: currentStepIndex, 
      build, 
      totalPrice, 
      nextStep: () => setCurrentStepIndex(p => p + 1), 
      prevStep: () => setCurrentStepIndex(p => p - 1), 
      selectComponent, 
      removeComponent,
      getCompatibilityFilters 
    }}>
      {children}
    </BuilderContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) throw new Error('useBuilder must be used within BuilderProvider');
  return context;
};