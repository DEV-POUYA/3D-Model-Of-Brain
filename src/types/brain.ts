export type Language = 'fa' | 'en';

export type BrainRegionId =
  | 'frontal'
  | 'parietal'
  | 'temporal'
  | 'occipital'
  | 'cerebellum'
  | 'midbrain'
  | 'pons'
  | 'medulla'
  | 'corpusCallosum'
  | 'ventricles'
  | 'thalamus'
  | 'hypothalamus'
  | 'pituitary'
  | 'pineal'
  | 'basalGanglia'
  | 'hippocampus'
  | 'amygdala';

export type BrainCategory =
  | 'Outer Cortex'
  | 'Limbic System'
  | 'Hindbrain'
  | 'Diencephalon'
  | 'Basal Ganglia'
  | 'Ventricular System';

export type AppMode = 'view' | 'edit' | 'quiz';

export interface BrainRegion {
  id: BrainRegionId;
  category: BrainCategory;
  latinName: string;
  title_fa: string;
  title_en: string;
  summary_fa: string;
  summary_en: string;
  functions_fa: string[];
  functions_en: string[];
  clinicalNotes_fa: string;
  clinicalNotes_en: string;
  color: string;
  isInternal: boolean;
}

export const BRAIN_CATEGORIES: BrainCategory[] = [
  'Outer Cortex',
  'Limbic System',
  'Diencephalon',
  'Basal Ganglia',
  'Hindbrain',
  'Ventricular System',
];

export const CATEGORY_LABELS: Record<BrainCategory, { fa: string; en: string }> = {
  'Outer Cortex': { fa: 'قشر بیرونی مغز', en: 'Outer Cortex' },
  'Limbic System': { fa: 'سیستم لیمبیک', en: 'Limbic System' },
  Diencephalon: { fa: 'دیانسفالون', en: 'Diencephalon' },
  'Basal Ganglia': { fa: 'عقده‌های قاعده‌ای', en: 'Basal Ganglia' },
  Hindbrain: { fa: 'مغز خلفی و ساقه', en: 'Hindbrain & Stem' },
  'Ventricular System': { fa: 'سیستم بطنی', en: 'Ventricular System' },
};

export const BRAIN_REGION_IDS: BrainRegionId[] = [
  'frontal',
  'parietal',
  'temporal',
  'occipital',
  'cerebellum',
  'midbrain',
  'pons',
  'medulla',
  'corpusCallosum',
  'ventricles',
  'thalamus',
  'hypothalamus',
  'pituitary',
  'pineal',
  'basalGanglia',
  'hippocampus',
  'amygdala',
];
