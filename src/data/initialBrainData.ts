import { BrainRegion } from '../types/brain';

export const INITIAL_BRAIN_REGIONS: BrainRegion[] = [
  {
    id: 'frontal',
    category: 'Outer Cortex',
    latinName: 'Lobus frontalis',
    title_fa: 'لوب پیشانی',
    title_en: 'Frontal Lobe',
    summary_fa:
      'بزرگ‌ترین بخش قشر مخ که در جلوی شیار مرکزی (رولاندو) قرار دارد و مرکز کنترل عملکردهای اجرایی، تصمیم‌گیری، برنامه‌ریزی، تولید گفتار و حرکات ارادی بدن است.',
    summary_en:
      'The largest lobe of the cerebral cortex situated anterior to the central sulcus, governing executive decision-making, voluntary motor control, speech production, and personality.',
    functions_fa: [
      'برنامه‌ریزی، استدلال منطقی، حل مسئله و تصمیم‌گیری پیشرفته',
      'اجرای حرکات ارادی عضلات اسکلتی از طریق قشر حرکتی اولیه (شکنج پیش‌مرکزی)',
      'تولید گفتار روان‌ و دستور زبان (ناحیه بروکا در نیمکره غالب)',
      'تنظیم رفتارهای اجتماعی، کنترل تکانه‌ها و حافظه کاری',
    ],
    functions_en: [
      'Executive planning, abstract reasoning, and complex decision-making',
      'Voluntary skeletal muscle movement via the primary motor cortex',
      'Articulate speech production and syntax (Broca’s area)',
      'Impulse inhibition, emotional regulation, and working memory',
    ],
    clinicalNotes_fa:
      'آسیب به لوب پیشانی می‌تواند باعث تغییرات شخصیتی، اختلال در برنامه‌ریزی (سندرم دیزگزکیوتیو)، ضعف حرکتی سمت مقابل بدن یا آفازی بیانی (بروکا) شود.',
    clinicalNotes_en:
      'Damage can result in executive dysfunction, behavioral disinhibition, contralateral motor weakness, or expressive (Broca’s) aphasia.',
    color: '#38bdf8',
    isInternal: false,
  },
  {
    id: 'parietal',
    category: 'Outer Cortex',
    latinName: 'Lobus parietalis',
    title_fa: 'لوب آهیانه‌ای',
    title_en: 'Parietal Lobe',
    summary_fa:
      'در بخش فوقانی-میانی نیمکره‌های مغز و پشت شیار مرکزی قرار گرفته و مسئول پردازش حس‌های پیکری، آگاهی فضایی سه‌بعدی و یکپارچه‌سازی اطلاعات چندحسی است.',
    summary_en:
      'Positioned posterior to the central sulcus and superior to the occipital lobe, integrating somatosensory input, spatial awareness, and visuomotor coordination.',
    functions_fa: [
      'دریافت و تحلیل حس‌های لمس، فشار، دما، ارتعاش و درد (قشر حسی-پیکری اولیه)',
      'درک موقعیت بدن در فضا (حس عمقی) و جهت‌یابی سه‌بعدی',
      'پردازش مفاهیم ریاضی، محاسبات عددی و درک ساختار فضایی اشیا',
      'هدایت حرکات دقیق دست و چشم هنگام لمس یا گرفتن ابزار',
    ],
    functions_en: [
      'Processing touch, temperature, proprioception, and pain (somatosensory cortex)',
      'Spatial orientation, body schema awareness, and 3D navigation',
      'Numerical calculation, reading comprehension, and multisensory integration',
      'Visuomotor guidance for reaching and grasping objects',
    ],
    clinicalNotes_fa:
      'ضایعات لوب آهیانه‌ای (به‌ویژه در نیمکره راست) ممکن است سبب سندرم غفلت یک‌طرفه فضایی، آگنوزی لمسی یا اختلال در خواندن و حساب (سندرم گرستمن) شود.',
    clinicalNotes_en:
      'Lesions—especially in the non-dominant hemisphere—often cause contralateral hemispatial neglect, astereognosis, or Gerstmann syndrome.',
    color: '#818cf8',
    isInternal: false,
  },
  {
    id: 'temporal',
    category: 'Outer Cortex',
    latinName: 'Lobus temporalis',
    title_fa: 'لوب گیجگاهی',
    title_en: 'Temporal Lobe',
    summary_fa:
      'در ناحیه جانبی و تحتانی مخ و زیر شیار جانبی (سیلویوس) واقع شده و نقش محوری در پردازش شنوایی، درک گفتار، بازشناسی چهره‌ها و تشکیل خاطرات دارد.',
    summary_en:
      'Located inferior to the lateral (Sylvian) fissure, essential for auditory processing, spoken language comprehension, facial recognition, and declarative memory encoding.',
    functions_fa: [
      'پردازش صداها، موسیقی و تفکیک فرکانس‌های شنوایی (قشر شنوایی اولیه)',
      'درک معنای کلمات و جملات گفتاری و نوشتاری (ناحیه ورنیکه)',
      'تشخیص چهره‌ها و اشیای پیچیده در مسیر بینایی شکمی',
      'همکاری ساختاری با هیپوکامپ برای تثبیت حافظه بلندمدت',
    ],
    functions_en: [
      'Primary auditory perception, pitch discrimination, and sound localization',
      'Comprehension of spoken and written language (Wernicke’s area)',
      'Visual recognition of faces and complex objects along the ventral stream',
      'Declarative memory consolidation in close concert with the medial temporal structures',
    ],
    clinicalNotes_fa:
      'صرع لوب گیجگاهی شایع‌ترین نوع صرع کانونی است و آسیب به ناحیه ورنیکه موجب زبان‌پریشی درکی (گفتار روان اما بی‌معنا) می‌شود.',
    clinicalNotes_en:
      'Temporal lobe epilepsy is the most common focal epilepsy; damage to Wernicke’s area leads to fluent receptive aphasia.',
    color: '#2dd4bf',
    isInternal: false,
  },
  {
    id: 'occipital',
    category: 'Outer Cortex',
    latinName: 'Lobus occipitalis',
    title_fa: 'لوب پس‌سری',
    title_en: 'Occipital Lobe',
    summary_fa:
      'در انتهای خلفی نیمکره‌های مخ و بر روی چادرینه مخچه قرار دارد و مرکز اصلی دریافت، رمزگشایی و تفسیر سیگنال‌های بینایی از شبکیه چشم است.',
    summary_en:
      'The posterior-most pole of the cerebral cortex resting over the tentorium cerebelli, dedicated to receiving, decoding, and interpreting visual information.',
    functions_fa: [
      'دریافت امپالس‌های بینایی از هسته زانویی جانبی تالاموس در قشر V1',
      'تفکیک رنگ، کنتراست، لبه‌ها، عمق میدان و جهت حرکت',
      'ارسال اطلاعات بینایی به مسیرهای پشتی (موقعیت فضایی) و شکمی (شناسایی شیء)',
    ],
    functions_en: [
      'Receiving retinotopic projections from the thalamus into primary visual cortex (V1)',
      'Extracting edge orientation, color, depth disparity, and motion vectors',
      'Distributing visual streams to parietal (where) and temporal (what) cortices',
    ],
    clinicalNotes_fa:
      'آسیب دوطرفه قشر بینایی اولیه می‌تواند رغم سلامت کامل چشم‌ها به کوری قشری منجر شود؛ ضایعات یک‌طرفه سبب همی‌آנוپی هم‌نام طرف مقابل می‌گردند.',
    clinicalNotes_en:
      'Unilateral lesions cause contralateral homonymous hemianopia, whereas bilateral V1 damage produces cortical blindness despite intact eyes.',
    color: '#fb923c',
    isInternal: false,
  },
  {
    id: 'cerebellum',
    category: 'Hindbrain',
    latinName: 'Cerebellum',
    title_fa: 'مخچه',
    title_en: 'Cerebellum',
    summary_fa:
      'ساختاری چین‌خورده با شیارهای افقی (فولیا) در حفره خلفی جمجمه، زیر لوب پس‌سری و پشت پل مغزی، که بیش از نیمی از نورون‌های کل مغز را در خود جای داده است.',
    summary_en:
      'A densely folded, foliated hindbrain structure nestled beneath the occipital lobe and posterior to the pons, containing over half of all neurons in the human brain.',
    functions_fa: [
      'هماهنگی ظریف زمان‌بندی، نیرو و دقت حرکات ارادی بدن',
      'حفظ تعادل، وضعیت ایستاده (پوسچر) و تنظیم تون عضلانی',
      'یادگیری و خودکارسازی مهارت‌های حرکتی پیچیده (مانند نواختن ساز)',
      'تنظیم حرکات دقیق چشم و هماهنگی عضلات گفتاری',
    ],
    functions_en: [
      'Fine-tuning timing, force, and smooth trajectory of voluntary movements',
      'Maintaining postural balance, equilibrium, and muscle tone',
      'Procedural motor learning and automaticity of skilled actions',
      'Coordinating saccadic eye movements and speech articulation',
    ],
    clinicalNotes_fa:
      'آسیب مخچه‌ای به علائمی چون آتاکسی (تلوتلو خوردن در راه رفتن)، لرزش قصدی هنگام رسیدن دست به هدف، دیس‌متری و گفتار بریده‌بریده می‌انجامد.',
    clinicalNotes_en:
      'Cerebellar pathology manifests as gait ataxia, intention tremor, dysmetria (overshooting targets), and scanning dysarthria.',
    color: '#f472b6',
    isInternal: false,
  },
  {
    id: 'midbrain',
    category: 'Hindbrain',
    latinName: 'Mesencephalon',
    title_fa: 'مغز میانی',
    title_en: 'Midbrain (Mesencephalon)',
    summary_fa:
      'بالاترین بخش ساقه مغز که دیانسفالون را به پل مغزی متصل می‌کند و حاوی برجستگی‌های چهارگانه (کولیکولوس‌ها)، ماده سیاه و مجرای مغزی است.',
    summary_en:
      'The rostral-most segment of the brainstem linking the diencephalon to the pons, housing the superior/inferior colliculi, substantia nigra, and cerebral aqueduct.',
    functions_fa: [
      'کنترل بازتاب‌های سریع بینایی (حرکت سر و چشم به سوی نور) و شنوایی',
      'تولید دوپامین در ماده سیاه برای آغاز و روانی حرکات ارادی',
      'تنظیم رفلکس مردمک چشم و حرکات چشمی از طریق اعصاب جمجمه‌ای III و IV',
      'انتقال راه‌های عصبی حرکتی و حسی میان قشر و ساقه مغز',
    ],
    functions_en: [
      'Mediating rapid visual and auditory orienting reflexes (tectal colliculi)',
      'Dopamine synthesis in the substantia nigra for motor initiation',
      'Controlling pupillary light reflexes and extraocular eye muscles (CN III & IV)',
      'Conveying ascending sensory and descending corticospinal tracts',
    ],
    clinicalNotes_fa:
      'تحلیل نورون‌های دوپامینرژیک ماده سیاه در مغز میانی عامل اصلی بیماری پارکینسون است و انسداد مجرای مغزی سیلویوس می‌تواند هیدروسفالی ایجاد کند.',
    clinicalNotes_en:
      'Degeneration of dopaminergic neurons in the substantia nigra underlies Parkinson’s disease; aqueductal stenosis leads to obstructive hydrocephalus.',
    color: '#64748b',
    isInternal: false,
  },
  {
    id: 'pons',
    category: 'Hindbrain',
    latinName: 'Pons',
    title_fa: 'پل مغزی (پونز)',
    title_en: 'Pons',
    summary_fa:
      'بخش برجسته میانی ساقه مغز بین مغز میانی و بصل‌النخاع که با الیاف عرضی فراوان به عنوان پل ارتباطی قشر مخ و مخچه عمل می‌کند.',
    summary_en:
      'The bulbous middle segment of the brainstem between the midbrain and medulla, serving as a transverse relay bridge between the cerebral cortex and cerebellum.',
    functions_fa: [
      'انتقال پیام‌های حرکتی قشر مخ به مخچه برای تصحیح و هماهنگی حرکت',
      'تنظیم الگوی تنفس و انتقال نرم میان دم و بازدم (مراکز پنوموتاکسیک)',
      'تنظیم چرخه خواب و به‌ویژه خواب REM همراه با بیداری',
      'میزبانی هسته‌های اعصاب جمجمه‌ای صورت، جویدن، تعادل و شنوایی (V تا VIII)',
    ],
    functions_en: [
      'Relaying cortical motor commands to the cerebellum via pontine nuclei',
      'Modulating respiratory rhythm and smooth inhalation-exhalation transitions',
      'Regulating REM sleep generation and arousal pathways',
      'Housing cranial nerve nuclei V–VIII for facial sensation, expression, and hearing',
    ],
    clinicalNotes_fa:
      'ضایعات وسیع پل مغزی می‌توانند سندرم «قفل‌شدگی» (Locked-in) را ایجاد کنند که در آن بیمار هوشیار است اما تنها قادر به حرکت عمودی چشم‌ها است.',
    clinicalNotes_en:
      'Ventral pontine infarction can cause locked-in syndrome, preserving consciousness and vertical eye movement while paralyzing voluntary musculature.',
    color: '#94a3b8',
    isInternal: false,
  },
  {
    id: 'medulla',
    category: 'Hindbrain',
    latinName: 'Medulla oblongata',
    title_fa: 'بصل‌النخاع',
    title_en: 'Medulla Oblongata',
    summary_fa:
      'پایین‌ترین بخش ساقه مغز که به نخاع می‌پیوندد و حاوی حیاتی‌ترین مراکز خودکار تنظیم تنفس، ضربان قلب و فشار خون است.',
    summary_en:
      'The caudal-most segment of the brainstem continuous with the spinal cord, containing essential autonomic centers for respiration, heart rate, and blood pressure.',
    functions_fa: [
      'کنترل خودکار ریتم تنفس، ضربان قلب و انقباض عروق خونی',
      'مدیریت رفلکس‌های حیاتی بلع، سرفه، عطسه و استفراغ',
      'تقاطع راه‌های حرکتی هرمی (دکوزاسیون اهرام) که کنترل طرف مقابل بدن را برقرار می‌کند',
      'میزبانی هسته‌های اعصاب جمجمه‌ای IX تا XII (زبان، حلق و عصب واگ)',
    ],
    functions_en: [
      'Autonomic regulation of breathing rate, heart rate, and vasomotor tone',
      'Coordinating protective airway reflexes including swallowing, coughing, and sneezing',
      'Pyramidal decussation of corticospinal fibers controlling contralateral limbs',
      'Housing lower cranial nerve nuclei IX–XII including the vagus nerve',
    ],
    clinicalNotes_fa:
      'آسیب یا فشار شدید به بصل‌النخاع (مانند فتق لوزه‌های مخچه‌ای) به دلیل توقف مراکز تنفس و قلب فوراً تهدیدکننده حیات است.',
    clinicalNotes_en:
      'Compression or infarction of the medulla rapidly threatens life due to failure of respiratory and cardiovascular rhythm generators.',
    color: '#cbd5e1',
    isInternal: false,
  },
  {
    id: 'corpusCallosum',
    category: 'Diencephalon',
    latinName: 'Corpus callosum',
    title_fa: 'جسم پینه‌ای',
    title_en: 'Corpus Callosum',
    summary_fa:
      'بزرگ‌ترین دسته‌تار عصبی ماده سفید در مغز انسان (متشکل از حدود ۲۰۰ میلیون آکسون) که به شکل قوس C-شکل دو نیمکره راست و چپ را به هم متصل می‌کند.',
    summary_en:
      'The largest white-matter commissural tract in the brain (~200 million myelinated axons), forming a C-shaped arch uniting the left and right cerebral hemispheres.',
    functions_fa: [
      'تبادل آنی اطلاعات حسی، حرکتی و شناختی میان دو نیمکره مغز',
      'هماهنگ‌سازی حرکات دو دست و یکپارچه‌سازی میدان بینایی چپ و راست',
      'برقراری ارتباط میان مراکز زبان نیمکره چپ و پردازش فضایی-هیجانی نیمکره راست',
    ],
    functions_en: [
      'Rapid interhemispheric transfer of sensory, motor, and cognitive signals',
      'Coordinating bimanual motor tasks and unifying left/right visual fields',
      'Linking left-hemisphere language networks with right-hemisphere spatial processing',
    ],
    clinicalNotes_fa:
      'قطع جسم پینه‌ای (کالوزوتومی) برای مهار صرع‌های مقاوم موجب سندرم «مغز دوپاره» می‌شود و عدم تشکیل مادرزادی آن می‌تواند به تأخیر شناختی بینجامد.',
    clinicalNotes_en:
      'Surgical callosotomy produces split-brain disconnection phenomena; congenital agenesis can alter interhemispheric integration.',
    color: '#fde047',
    isInternal: true,
  },
  {
    id: 'ventricles',
    category: 'Ventricular System',
    latinName: 'Ventriculi cerebri',
    title_fa: 'بطن‌های مغزی (جانبی و سوم)',
    title_en: 'Ventricles (Lateral & Third)',
    summary_fa:
      'حفره‌های به‌هم‌پیوسته در عمق مغز شامل دو بطن جانبی قوسی‌شکل و بطن سوم میانی که مایع مغزی-نخاعی (CSF) را تولید، ذخیره و به گردش درمی‌آورند.',
    summary_en:
      'Interconnected deep cerebral cavities—paired C-shaped lateral ventricles and the midline slit-like third ventricle—producing and circulating cerebrospinal fluid (CSF).',
    functions_fa: [
      'تولید مایع مغزی-نخاعی توسط شبکه کوروئید درون بطن‌ها',
      'ایجاد شناوری مکانیکی برای کاهش وزن مؤثر مغز و محافظت از ضربه',
      'پاک‌سازی مواد زائد متابولیک و حفظ تعادل شیمیایی بافت عصبی',
    ],
    functions_en: [
      'Continuous secretion of cerebrospinal fluid (CSF) by the choroid plexus',
      'Providing buoyant mechanical cushioning that reduces effective brain weight',
      'Clearing metabolic waste and regulating the brain’s extracellular milieu',
    ],
    clinicalNotes_fa:
      'اختلال در بازجذب یا انسداد مسیر جریان CSF موجب تجمع مایع و اتساع بطن‌ها (هیدروسفالی) و افزایش خطرناک فشار داخل جمجمه می‌شود.',
    clinicalNotes_en:
      'Obstruction of CSF outflow or impaired absorption causes ventricular dilation (hydrocephalus) and elevated intracranial pressure.',
    color: '#22d3ee',
    isInternal: true,
  },
  {
    id: 'thalamus',
    category: 'Diencephalon',
    latinName: 'Thalamus',
    title_fa: 'تالاموس',
    title_en: 'Thalamus',
    summary_fa:
      'یک جفت توده خاکستری تخم‌مرغی‌شکل در دو طرف بطن سوم که به عنوان ایستگاه رله، فیلتر و توزیع‌کننده اصلی پیام‌های حسی به قشر مغز عمل می‌کند.',
    summary_en:
      'Paired egg-shaped gray-matter nuclear complexes flanking the third ventricle, acting as the brain’s central sensory relay, gating filter, and thalamocortical hub.',
    functions_fa: [
      'بازپخش تمامی پیام‌های حسی (بینایی، شنوایی، لمس و چشایی) به قشر مربوطه',
      'فیلتر کردن محرک‌های غیرضروری و تنظیم توجه آگاهانه',
      'مشارکت در مدارهای حرکتی همراه با عقده‌های قاعده‌ای و مخچه',
      'تنظیم ریتم خواب، بیداری و همگام‌سازی امواج الکتریکی قشر',
    ],
    functions_en: [
      'Relaying all sensory modalities (except olfaction) to specialized cortical areas',
      'Gating sensory salience and modulating selective conscious attention',
      'Integrating motor feedback loops between basal ganglia, cerebellum, and cortex',
      'Coordinating cortical oscillations across sleep-wake states',
    ],
    clinicalNotes_fa:
      'سکته یا آسیب تالاموسی می‌تواند به سندرم درد مرکزی تالاموسی (درد شدید و سوزاننده در سمت مقابل بدن) یا کاهش گسترده هوشیاری منجر شود.',
    clinicalNotes_en:
      'Thalamic stroke can cause Dejerine-Roussy central post-stroke pain syndrome or profound contralateral sensory loss.',
    color: '#a78bfa',
    isInternal: true,
  },
  {
    id: 'hypothalamus',
    category: 'Diencephalon',
    latinName: 'Hypothalamus',
    title_fa: 'هیپوتالاموس',
    title_en: 'Hypothalamus',
    summary_fa:
      'ساختاری کوچک اما حیاتی در زیر تالاموس و بالای ساقه هیپوفیز که تعادل حیاتی بدن (هموستاز)، دمای بدن، گرسنگی، تشنگی و محور غدد درون‌ریز را هدایت می‌کند.',
    summary_en:
      'A compact diencephalic control center directly ventral to the thalamus, maintaining physiological homeostasis, thermoregulation, circadian rhythm, and endocrine command.',
    functions_fa: [
      'تنظیم دقیق دمای بدن (لرز یا تعریق)، تشنگی و تعادل آب و الکترولیت‌ها',
      'کنترل احساس گرسنگی، سیری و متابولیسم انرژی بدن',
      'هدایت غده هیپوفیز از طریق ترشح هورمون‌های آزادکننده و مهارکننده',
      'تنظیم ساعت زیستی شبانه‌روزی (هسته سوپراکیاسماتیک) و پاسخ استرس خودمختار',
    ],
    functions_en: [
      'Homeostatic regulation of core body temperature, thirst, and fluid balance',
      'Controlling appetite, satiety, and systemic energy expenditure',
      'Directing pituitary hormone secretion via releasing and inhibiting factors',
      'Driving circadian sleep-wake rhythms (suprachiasmatic nucleus) and autonomic tone',
    ],
    clinicalNotes_fa:
      'ضایعات هیپوتالاموس ممکن است باعث دیابت بی‌مزه، اختلال شدید تنظیم دمای بدن، چاقی مفرط عصبی یا به‌هم‌ریختگی ریتم خواب شوند.',
    clinicalNotes_en:
      'Hypothalamic lesions can lead to central diabetes insipidus, poikilothermia (impaired thermoregulation), hyperphagia, or circadian disruption.',
    color: '#fb7185',
    isInternal: true,
  },
  {
    id: 'pituitary',
    category: 'Diencephalon',
    latinName: 'Hypophysis',
    title_fa: 'غده هیپوفیز',
    title_en: 'Pituitary Gland',
    summary_fa:
      'غده درون‌ریز دو‌لوبی به اندازه یک نخود در قاعده مغز (در زین ترکی) که توسط ساقه هیپوفیزی به هیپوتالاموس متصل است و رهبر ارکستر هورمونی بدن محسوب می‌شود.',
    summary_en:
      'A pea-sized bilobed endocrine gland suspended beneath the hypothalamus by the infundibular stalk, widely known as the body’s master endocrine gland.',
    functions_fa: [
      'ترشح هورمون رشد (GH)، پرولاکتین و هورمون محرک تیروئید (TSH) از لب قدامی',
      'تنظیم غدد فوق‌کلیوی (ACTH) و گنادها (LH و FSH)',
      'ذخیره و آزادسازی اکسی‌توسین و هورمون ضدادراری (ADH) در لب خلفی',
    ],
    functions_en: [
      'Secreting growth hormone (GH), TSH, ACTH, FSH, LH, and prolactin (anterior lobe)',
      'Regulating thyroid, adrenal cortex, and reproductive endocrine axes',
      'Releasing hypothalamic oxytocin and vasopressin/ADH (posterior lobe)',
    ],
    clinicalNotes_fa:
      'آدنوم‌های هیپوفیز با ترشح بیش‌ازحد یا کمبود هورمون‌ها و همچنین فشار بر کیاسمای بینایی (باعث اختلال دید دوگیجگاهی) شناخته می‌شوند.',
    clinicalNotes_en:
      'Pituitary adenomas cause hormonal hypersecretion or hypopituitarism and frequently compress the optic chiasm, producing bitemporal hemianopia.',
    color: '#fbbf24',
    isInternal: true,
  },
  {
    id: 'pineal',
    category: 'Diencephalon',
    latinName: 'Glandula pinealis',
    title_fa: 'غده صنوبری (اپوفیز)',
    title_en: 'Pineal Gland',
    summary_fa:
      'غده‌ای کوچک و مخروطی‌شکل در خط وسط و بخش خلفی تالاموس (بالای برجستگی‌های مغز میانی) که با ترشح ملاتونین چرخه خواب و بیداری را تنظیم می‌کند.',
    summary_en:
      'A small pinecone-shaped epithalamic gland tucked posteriorly behind the third ventricle and superior to the midbrain colliculi, synthesizing melatonin.',
    functions_fa: [
      'ترشح هورمون ملاتونین در پاسخ به تاریکی شب برای القای خواب',
      'همگام‌سازی ریتم‌های شبانه‌روزی (سیرکادین) بدن با چرخه نور و تاریکی محیط',
      'اثر تعدیل‌کننده بر زمان‌بندی بلوغ و محورهای فصلی/هورمونی',
    ],
    functions_en: [
      'Synthesizing and secreting melatonin during darkness to signal physiological night',
      'Entraining circadian rhythms to ambient light-dark cycles',
      'Modulating seasonal biological clocks and neuroendocrine maturation',
    ],
    clinicalNotes_fa:
      'کلسیفیکاسیون غده صنوبری در بزرگسالان یک یافته طبیعی رادیولوژیک است، اما تومورهای این ناحیه (پینه‌آلوما) می‌توانند مسیر آب مغزی را مسدود کنند.',
    clinicalNotes_en:
      'Physiologic calcification is common in adults; pineal region tumors can compress the superior colliculi (Parinaud syndrome) and obstruct CSF flow.',
    color: '#e879f9',
    isInternal: true,
  },
  {
    id: 'basalGanglia',
    category: 'Basal Ganglia',
    latinName: 'Nuclei basales (Striatum)',
    title_fa: 'عقده‌های قاعده‌ای (جسم مخطط)',
    title_en: 'Basal Ganglia (Striatum / Putamen)',
    summary_fa:
      'مجموعه‌ای از هسته‌های عمقی شامل هسته دمدار، پوتامن و گلوبوس پالیدوس در طرفین تالاموس که در انتخاب، آغاز و مهار حرکات ارادی و شکل‌گیری عادت‌ها نقش اساسی دارند.',
    summary_en:
      'Deep subcortical nuclei—comprising the caudate, putamen, and globus pallidus lateral to the thalamus—that gate movement initiation, motor habits, and procedural learning.',
    functions_fa: [
      'تسهیل آغاز حرکات ارادی مطلوب و مهار حرکات اضافی و ناخواسته',
      'تنظیم سرعت، روانی و هماهنگی الگوهای حرکتی خودکار',
      'شکل‌گیری عادت‌ها، یادگیری پاداش-محور و پردازش رویه‌ای',
    ],
    functions_en: [
      'Selecting desired motor programs while suppressing unwanted competing movements',
      'Regulating movement amplitude, velocity, and automatic motor habits',
      'Reward-based reinforcement learning and procedural skill acquisition',
    ],
    clinicalNotes_fa:
      'اختلال در مدار عقده‌های قاعده‌ای در بیماری‌های پارکینسون (کندی حرکت و لرزش) و هانتینگتون (حرکات رقص‌گونه کره) دیده می‌شود.',
    clinicalNotes_en:
      'Basal ganglia dysfunction produces hypokinetic disorders like Parkinson’s disease or hyperkinetic syndromes such as Huntington’s chorea.',
    color: '#60a5fa',
    isInternal: true,
  },
  {
    id: 'hippocampus',
    category: 'Limbic System',
    latinName: 'Hippocampus',
    title_fa: 'هیپوکامپ',
    title_en: 'Hippocampus',
    summary_fa:
      'ساختاری منحنی‌شکل (شبیه اسب دریایی) در عمق بخش میانی لوب گیجگاهی که مرکز اصلی تبدیل حافظه کوتاه‌مدت به حافظه بلندمدت و نقشه‌برداری فضایی محیط است.',
    summary_en:
      'A paired seahorse-shaped arch inside the medial temporal lobe essential for consolidating short-term experiences into long-term episodic memory and spatial mapping.',
    functions_fa: [
      'تثبیت خاطرات جدید رویدادی (اپیزودیک) و اطلاعات معنایی',
      'ایجاد نقشه شناختی محیط و جهت‌یابی فضایی از طریق سلول‌های مکان',
      'پیوند دادن زمینه‌های زمانی و مکانی به خاطرات برای یادآوری دقیق',
    ],
    functions_en: [
      'Consolidating new declarative and episodic memories into cortical networks',
      'Constructing cognitive spatial maps via place and grid cell circuits',
      'Binding contextual temporal and spatial details during memory retrieval',
    ],
    clinicalNotes_fa:
      'هیپوکامپ یکی از نخستین نواحی‌ای است که در بیماری آلزایمر دچار تحلیل می‌شود و آسیب دوطرفه آن فراموشی پیش‌گستر شدید ایجاد می‌کند.',
    clinicalNotes_en:
      'Among the earliest structures affected by Alzheimer’s pathology; bilateral damage causes profound anterograde amnesia.',
    color: '#34d399',
    isInternal: true,
  },
  {
    id: 'amygdala',
    category: 'Limbic System',
    latinName: 'Corpus amygdaloideum',
    title_fa: 'آمیگدال (بادامه مغز)',
    title_en: 'Amygdala',
    summary_fa:
      'یک جفت هسته بادامی‌شکل در راس قدامی هیپوکامپ که مسئول تشخیص خطر، پردازش ترس و هیجانات بنیادین و پیوند دادن بار عاطفی به خاطرات است.',
    summary_en:
      'Paired almond-shaped nuclear complexes directly anterior to the hippocampus, evaluating environmental threats, fear conditioning, and emotional salience.',
    functions_fa: [
      'ارزیابی سریع خطرات و فعال‌سازی پاسخ «جنگ یا گریز»',
      'پردازش هیجانات ترس، اضطراب، خشم و برانگیختگی عاطفی',
      'تقویت ماندگاری خاطرات دارای بار هیجانی شدید در همکاری با هیپوکامپ',
      'تشخیص حالات عاطفی چهره و نشانه‌های اجتماعی دیگران',
    ],
    functions_en: [
      'Rapid threat detection and initiation of autonomic fight-or-flight responses',
      'Processing fear conditioning, anxiety, and emotional arousal',
      'Enhancing emotional memory consolidation via hippocampal modulation',
      'Interpreting facial emotional expressions and social salience cues',
    ],
    clinicalNotes_fa:
      'بیش‌فعالی آمیگدال با اختلالات اضطرابی، فوبیا و PTSD مرتبط است و آسیب دوطرفه آن (سندرم کلوور-بوسی) ترس‌پذیری را کاهش می‌دهد.',
    clinicalNotes_en:
      'Hyperreactivity is implicated in PTSD and anxiety disorders, whereas bilateral lesions (Klüver-Bucy syndrome) blunt fear perception.',
    color: '#f87171',
    isInternal: true,
  },
];
