export type BuilderStep = 'cpu' | 'motherboard' | 'cooler' | 'ram' | 'gpu' | 'storage' | 'psu' | 'case';

export const STEPS: BuilderStep[] = ['cpu', 'motherboard', 'cooler', 'ram', 'gpu', 'storage', 'psu', 'case'];

export const STEP_LABELS: Record<BuilderStep, string> = {
  cpu: 'Процесор',
  motherboard: 'Материнська плата',
  cooler: 'Охолодження',
  ram: 'Оперативна пам\'ять',
  gpu: 'Відеокарта',
  storage: 'Накопичувач',
  psu: 'Блок живлення',
  case: 'Корпус',
};

// Перевірте, чи ці слаги співпадають з вашою БД!
export const CATEGORY_SLUGS: Record<BuilderStep, string> = {
  cpu: 'protsesory',
  motherboard: 'materyns-ki-platy',
  cooler: 'systemy-okholodzhennya',
  ram: 'operatyvna-pam-iat',
  gpu: 'videokarty',
  storage: 'ssd-nakopychuvachi',
  psu: 'bloky-zhyvlennya',
  case: 'korpusy',
};