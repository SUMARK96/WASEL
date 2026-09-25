import type { Emirate, DriverProfile, CustomerProfile, DeliveryRequest, SubscriptionPlan } from '../types';

export const UAE_EMIRATES: Emirate[] = [
  'أبوظبي',
  'دبي',
  'الشارقة',
  'عجمان',
  'أم القيوين',
  'رأس الخيمة',
  'الفجيرة'
];

export const INITIAL_CUSTOMERS: CustomerProfile[] = [];

export const PACKAGE_TYPES = [
  'طرد مستندات ووثائق هامة',
  'أجهزة إلكترونية وهواتف',
  'قطع غيار ومعدات',
  'هدايا ومقتنيات شخصية',
  'ملابس وبضائع تجارية',
  'أثاث ومستلزمات منزلية',
  'طعام ومواد مبردة'
];

export const VEHICLE_TRANSLATIONS = {
  sedan: 'صالون (Sedan)',
  suv: 'دفع رباعي (SUV)',
  van: 'فان نقل (Van)',
  pickup: 'بيك أب (Pickup)'
};

export const UNIFIED_SUBSCRIPTION_PLAN: SubscriptionPlan = {
  id: 'unified',
  name: 'باقة واصل الموحدة للسائقين',
  price: 199,
  features: [
    'عمولة 0% على جميع طلبات التوصيل',
    'تقديم عروض أسعار غير محدودة لجميع العملاء',
    'تواصل مباشر وفوري عبر الواتساب والمكالمات الهاتفية',
    'إشعارات فورية بكل طلب توصيل جديد في كافة الإمارات',
    'الأولوية في تصدر العروض لدى العميل وفقاً لتقييمك المرتفع ⭐',
    'توثيق الهوية ورخصة القيادة وشارة "سائق معتمد"'
  ],
  recommended: true
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  UNIFIED_SUBSCRIPTION_PLAN
];

export const INITIAL_EXEMPTION_CODES: import('../types').ExemptionCode[] = [
  {
    id: 'code-1',
    code: 'WASEL2026',
    months: 2,
    maxDrivers: 50,
    usedDriversCount: 8,
    usedDriverIds: ['drv-101', 'drv-102'],
    isActive: true,
    createdAt: '2026-09-01',
    notes: 'كود إعفاء ترويجي لانطلاق المنصة (شهرين مجاناً)'
  },
  {
    id: 'code-2',
    code: 'FREE1M',
    months: 1,
    maxDrivers: 20,
    usedDriversCount: 3,
    usedDriverIds: ['drv-103'],
    isActive: true,
    createdAt: '2026-09-10',
    notes: 'كود إعفاء شهر مجاني للسائقين الجدد'
  }
];

export const INITIAL_DRIVERS: DriverProfile[] = [
  {
    id: 'drv-101',
    name: 'محمد سعيد العبدولي',
    phone: '+971 50 123 4567',
    whatsappPhone: '971501234567',
    callPhone: '+971 50 123 4567',
    email: 'm.saeed@wasel.ae',
    password: '123456',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    emirate: 'دبي',
    vehicleType: 'pickup',
    vehicleModel: 'تويوتا هيلوكس 2023',
    vehiclePlate: 'دبي X 84920',
    rating: 4.95,
    reviewsCount: 84,
    completedDeliveries: 128,
    isVerified: true,
    subscriptionStatus: 'active',
    subscriptionPlan: 'unified',
    subscriptionExpiry: '2026-10-24',
    joinedDate: '2025-01-10',
    lastPaymentDate: '2026-09-24',
    bio: 'سائق محترف متخصص في نقل الطرود بين دبي وأبوظبي والشارقة. الالتزام بالوقت وسلامة الطرد أولويتي.'
  },
  {
    id: 'drv-102',
    name: 'راشد أحمد الظاهري',
    phone: '+971 52 987 6543',
    whatsappPhone: '971529876543',
    callPhone: '+971 52 987 6543',
    email: 'rasheed.dhaheri@wasel.ae',
    password: '123456',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    emirate: 'أبوظبي',
    vehicleType: 'suv',
    vehicleModel: 'نيسان باترول 2022',
    vehiclePlate: 'أبوظبي 12-4910',
    rating: 4.88,
    reviewsCount: 62,
    completedDeliveries: 95,
    isVerified: true,
    subscriptionStatus: 'active',
    subscriptionPlan: 'unified',
    subscriptionExpiry: '2026-11-24',
    joinedDate: '2025-02-15',
    lastPaymentDate: '2026-09-24',
    usedExemptionCode: 'WASEL2026',
    isExemptionActive: true,
    bio: 'توصيل سريع وآمن بين جميع إمارات الدولة. خبرة 5 سنوات في التوصيل بين أبوظبي والإمارات الشمالية.'
  },
  {
    id: 'drv-103',
    name: 'خالد الكعبي',
    phone: '+971 55 444 3322',
    whatsappPhone: '971554443322',
    callPhone: '+971 55 444 3322',
    email: 'khalid.kaabi@wasel.ae',
    password: '123456',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    emirate: 'الشارقة',
    vehicleType: 'van',
    vehicleModel: 'تويوتا هايس مغلقة 2024',
    vehiclePlate: 'الشارقة 5 77123',
    rating: 4.98,
    reviewsCount: 110,
    completedDeliveries: 210,
    isVerified: true,
    subscriptionStatus: 'active',
    subscriptionPlan: 'unified',
    subscriptionExpiry: '2026-09-28',
    joinedDate: '2024-11-01',
    lastPaymentDate: '2026-08-28',
    usedExemptionCode: 'FREE1M',
    isExemptionActive: true,
    bio: 'فان نقل مغلق ومكيف للطرود الحساسة والأجهزة والأثاث. رحلات يومية بين الشارقة وعجمان ودبي ورأس الخيمة.'
  },
  {
    id: 'drv-104',
    name: 'طارق زياد منصور',
    phone: '+971 56 777 8899',
    whatsappPhone: '971567778899',
    callPhone: '+971 56 777 8899',
    email: 'tariq.m@wasel.ae',
    password: '123456',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    emirate: 'عجمان',
    vehicleType: 'sedan',
    vehicleModel: 'كامري 2023',
    vehiclePlate: 'عجمان B 3910',
    rating: 4.75,
    reviewsCount: 38,
    completedDeliveries: 45,
    isVerified: true,
    subscriptionStatus: 'suspended',
    subscriptionPlan: 'unified',
    subscriptionExpiry: '2026-09-20',
    joinedDate: '2025-05-12',
    lastPaymentDate: '2026-08-20',
    usedExemptionCode: 'FREE1M',
    isExemptionActive: true,
    bio: 'توصيل المستندات والطرود الصغيرة والسريعة بين الإمارات.'
  }
];

export const INITIAL_REQUESTS: DeliveryRequest[] = [
  {
    id: 'req-201',
    title: 'توصيل طرد قطع غيار سيارات من أبوظبي إلى الشارقة',
    customerName: 'سلطان المزروعي',
    customerPhone: '+971 50 999 1122',
    pickupEmirate: 'أبوظبي',
    pickupArea: 'منطقة المصفح الصناعية - 14',
    deliveryEmirate: 'الشارقة',
    deliveryArea: 'منطقة الصناعية 4 - قرب شارع الملك فيصل',
    packageType: 'قطع غيار ومعدات',
    packageSize: 'medium',
    packageWeight: '12 كجم',
    deliveryDate: 'اليوم - قبل الساعة 7 مساءً',
    urgency: 'express',
    notes: 'الصندوق يحتوي على قطع غيار جديدة ومغلفة جيدا. يرجى توخي الحذر أثناء النقل والاستلام من المعرض مباشرة.',
    status: 'open',
    createdAt: 'منذ ساعتين',
    offers: [
      {
        id: 'off-301',
        requestId: 'req-201',
        driverId: 'drv-101',
        driverName: 'محمد سعيد العبدولي',
        driverAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        driverRating: 4.9,
        driverVehicle: 'تويوتا هيلوكس بيك أب (دبي X 84920)',
        driverVehicleType: 'pickup',
        driverPhone: '+971 50 123 4567',
        driverWhatsappPhone: '971501234567',
        driverCallPhone: '+971 50 123 4567',
        driverCompletedCount: 128,
        driverVerified: true,
        price: 170,
        estimatedDeliveryTime: 'وصول خلال 3 ساعات مع التوثيق بالصور',
        note: 'أنا متواجد حالياً في أبوظبي ومتجه للشارقة بعد ساعة، أستطيع استلام القطعة فوراً.',
        createdAt: 'منذ ساعة',
        status: 'pending'
      },
      {
        id: 'off-302',
        requestId: 'req-201',
        driverId: 'drv-103',
        driverName: 'خالد الكعبي',
        driverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
        driverRating: 4.95,
        driverVehicle: 'فان تويوتا مغلق ومكيف (الشارقة 5 77123)',
        driverVehicleType: 'van',
        driverPhone: '+971 55 444 3322',
        driverWhatsappPhone: '971554443322',
        driverCallPhone: '+971 55 444 3322',
        driverCompletedCount: 210,
        driverVerified: true,
        price: 190,
        estimatedDeliveryTime: 'التسليم المباشر خلال ساعتين ونصف',
        note: 'لدي فان مغلق يحمي القطع من الحرارة والغبار والتسليم باب لباب.',
        createdAt: 'منذ 30 دقيقة',
        status: 'pending'
      }
    ]
  },
  {
    id: 'req-202',
    title: 'نقل طرد مستندات وعقود رسمية عاجلة من دبي إلى رأس الخيمة',
    customerName: 'شركة النور للاستشارات',
    customerPhone: '+971 4 333 4455',
    pickupEmirate: 'دبي',
    pickupArea: 'الخليج التجاري (Business Bay) - برج الأفق',
    deliveryEmirate: 'رأس الخيمة',
    deliveryArea: 'منطقة النخيل - الدائرة الاقتصادية',
    packageType: 'طرد مستندات ووثائق هامة',
    packageSize: 'small',
    packageWeight: '1.5 كجم',
    deliveryDate: 'غداً صباحاً - 9.30 AM',
    urgency: 'same_day',
    notes: 'مغلف رسمي مغلق، يتطلب توقيع المستلم.',
    status: 'open',
    createdAt: 'منذ 4 ساعات',
    offers: [
      {
        id: 'off-303',
        requestId: 'req-202',
        driverId: 'drv-104',
        driverName: 'طارق زياد منصور',
        driverAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
        driverRating: 4.7,
        driverVehicle: 'تويوتا كامري 2023 (عجمان B 3910)',
        driverVehicleType: 'sedan',
        driverPhone: '+971 56 777 8899',
        driverWhatsappPhone: '971567778899',
        driverCallPhone: '+971 56 777 8899',
        driverCompletedCount: 45,
        driverVerified: true,
        price: 140,
        estimatedDeliveryTime: 'تسليم في الموعد المحدد غداً 9:00 صباحاً',
        note: 'جاهز لاستلام المغلف اليوم مساءً وتسليمه أول الدوام غداً في رأس الخيمة.',
        createdAt: 'منذ ساعتين',
        status: 'pending'
      }
    ]
  }
];
