'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export const LOCALES = ['uz', 'ru', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_NAMES: Record<Locale, string> = { uz: 'Oʻzbekcha', ru: 'Русский', en: 'English' };

export interface Dict {
  brandTagline: string;
  nav: { home: string; search: string; map: string; favorites: string; profile: string };
  landing: {
    eyebrow: string; titlePre: string; titleAccent: string; subtitle: string;
    ctaStart: string; ctaHasAccount: string;
    f1Title: string; f1Desc: string; f2Title: string; f2Desc: string; f3Title: string; f3Desc: string; f4Title: string; f4Desc: string;
    howTitle: string; s1: string; s2: string; s3: string;
    citiesTitle: string;
    serviceFeeLabel: string; featuresEyebrow: string; featuresTitle: string;
    whyEyebrow: string; howEyebrow: string;
    bizEyebrow: string; bizTitle: string; bizDesc: string; bizPoint1: string; bizPoint2: string; bizPoint3: string;
  };
  auth: {
    title: string; subtitle: string; phone: string; phonePlaceholder: string; sendCode: string;
    code: string; codePlaceholder: string; verify: string; google: string; demo: string; or: string; tooShort: string; wrong: string;
  };
  onboarding: {
    title: string; subtitle: string;
    tourist: string; touristDesc: string; business: string; businessDesc: string; cont: string;
  };
  home: { hello: string; explore: string; categories: string; recommended: string; all: string; near: string; nearMe: string; getLoc: string; locating: string; locDenied: string; emptyAll: string; emptyApproved: string };
  search: { title: string; placeholder: string; results: string; empty: string; recent: string };
  categories: { all: string; hotel: string; restaurant: string; shop: string; pharmacy: string; attraction: string };
  detail: { back: string; call: string; about: string; gallery: string; hours: string; menu: string; route: string; reviews: string };
  reviews: { title: string; leave: string; placeholder: string; submit: string; none: string; you: string };
  booking: {
    open: string; signInFirst: string; title: string; date: string; time: string; guests: string; note: string;
    price: string; subtotal: string; tax: string; total: string; next: string; payTitle: string; payChoose: string;
    payme: string; click: string; pay: string; successTitle: string; successMsg: string; close: string; viewBookings: string; cancelWarning: string;
  };
  profile: {
    title: string; editName: string; namePlaceholder: string; save: string; changePhoto: string; tourist: string; business: string;
    myPlaces: string; noPlaces: string; addPlace: string; settings: string; myBookings: string; signOut: string; saved: string; noFavorites: string;
  };
  settings: { title: string; language: string; theme: string; light: string; dark: string; myBookings: string };
  bookings: { title: string; empty: string; cancel: string; on: string; guests: string; paid: string };
  create: {
    title: string; subtitle: string; pickLocation: string; pickHint: string; picked: string;
    name: string; namePh: string; category: string; description: string; descPh: string; descCount: string;
    photos: string; photosHint: string; hours: string; hoursPh: string; menu: string; menuPh: string;
    price: string; pricePh: string; fee: string; taxNote: string; submit: string; success: string; required: string;
    cityLabel: string; cityPh: string; addressLabel: string; addressPh: string; phoneLabel: string; phonePh: string;
    payTitle: string; paySubtitle: string; payWallet: string; payWalletBalance: string; payInsufficient: string;
    payPayme: string; payClick: string; payBtn: string; payContinue: string; payCancel: string;
  };
  route: {
    title: string; from: string; to: string; getLoc: string; locating: string; denied: string; loading: string;
    arriveIn: string; min: string; km: string; m: string; depart: string; arrive: string; left: string; right: string;
    straight: string; slightLeft: string; slightRight: string; sharpLeft: string; sharpRight: string; uturn: string; onto: string; head: string;
  };
  filters: { sort: string; reco: string; rating: string; priceLow: string; priceHigh: string; openNow: string; verifiedOnly: string };
  status: { openNow: string; closed: string; verified: string; pending: string };
  notif: { title: string; empty: string; markRead: string; clear: string; bookingTitle: string; bookingBody: string; placeTitle: string; placeBody: string; reminderTitle: string; reminderBody: string; rateNow: string; later: string };
  share: { share: string; copied: string };
  book2: { ref: string; confirmed: string; cancelled: string; cancel: string; cancelDone: string };
  trust: { statsPlaces: string; statsCities: string; statsLangs: string; whyTitle: string; why1T: string; why1D: string; why2T: string; why2D: string; why3T: string; why3D: string; secureTitle: string; secureDesc: string };
  foot: { product: string; company: string; about: string; help: string; terms: string; privacy: string; contact: string; rights: string };
  info: { back: string; aboutTitle: string; aboutLead: string; aboutP1: string; aboutP2: string; helpTitle: string; helpLead: string; termsTitle: string; termsLead: string; termsP1: string; termsP2: string; privacyTitle: string; privacyLead: string; privacyP1: string; privacyP2: string };
  faq: { q: string; a: string }[];
  wallet: {
    title: string; balance: string; available: string; earned7: string; earned30: string; totalEarned: string;
    history: string; noTx: string; cards: string; addCard: string; noCards: string; addFirstCard: string;
    withdraw: string; withdrawTitle: string; pickCard: string; amount: string; amountPh: string;
    min: string; max: string; submit: string; pending: string; approved: string; rejected: string;
    cardNumber: string; cardHolder: string; cardExpiry: string; cardNumberPh: string; cardHolderPh: string;
    saveCard: string; delete: string; defaultCard: string; commission: string;
    txBookingIn: string; txWithdrawal: string; txAdjustment: string;
    withdrawalHistory: string; cancelReq: string;
    notReadyTitle: string; notReadyDesc: string;
    businessOnly: string;
  };
  admin: {
    title: string; users: string; places: string; bookings: string; revenue: string; pendingPlaces: string;
    pendingWithdrawals: string; gross: string; ownerPaid: string; withdrawn: string; platformRevenue: string; listingRevenue: string; totalRevenue: string;
    topOwners: string; pendingPlacesTab: string; pendingWithdrawalsTab: string; statsTab: string;
    approve: string; reject: string; sum: string; card: string; for: string;
  };
  common: { mapLoading: string; soum: string };
}

const uz: Dict = {
  brandTagline: 'Oʻzbekiston boʻylab yoʻl boshlovchingiz',
  nav: { home: 'Bosh sahifa', search: 'Qidiruv', map: 'Xarita', favorites: 'Sevimlilar', profile: 'Profil' },
  landing: {
    eyebrow: 'Oʻzbekiston · Markaziy Osiyo · MDH',
    titlePre: 'Har bir manzilga', titleAccent: 'yoʻl boshlovchi',
    subtitle: 'Mehmonxona, restoran, doʻkon va dorixonalarni toping, baholang va bron qiling. Marshrut bilan manzilga oson yeting.',
    ctaStart: 'Boshlash', ctaHasAccount: 'Hisobingiz bormi? Kirish',
    f1Title: 'Toping', f1Desc: 'Yaqin atrofdagi joylarni kategoriya boʻyicha toping.',
    f2Title: 'Bron qiling', f2Desc: 'Mehmonxona va restoranlarni bir necha bosishda bron qiling.',
    f3Title: 'Marshrut', f3Desc: 'Joriy joylashuvingizdan manzilgacha qadam-baqadam yoʻl.',
    f4Title: 'Baholang', f4Desc: 'Sharh qoldiring va boshqalarning fikrini koʻring.',
    howTitle: 'Qanday ishlaydi',
    s1: 'Roʻyxatdan oʻting', s2: 'Joy tanlang', s3: 'Bron qiling va yeting',
    citiesTitle: 'Shaharlar',
    serviceFeeLabel: 'Xizmat haqi',
    featuresEyebrow: 'IMKONIYATLAR',
    featuresTitle: 'Hammasi bir sahifada',
    whyEyebrow: 'NIMA UCHUN YOʻLCHI',
    howEyebrow: 'OSON BOSHLASH',
    bizEyebrow: 'BIZNES EGALARI UCHUN',
    bizTitle: 'Joyingizni qoʻshing va daromad oling',
    bizDesc: 'Restoran, mehmonxona, doʻkon yoki diqqatga sazovor joyingiz bormi? Yoʻlchi orqali yangi mijozlarni topib, bronlardan daromad oling.',
    bizPoint1: 'Har bir brondan toʻlov toʻgʻridan-toʻgʻri hamyoningizga tushadi',
    bizPoint2: 'Faqat 5% komissiya — qolgani sizniki',
    bizPoint3: 'Istalgan paytda kartangizga pul yechib oling',
  },
  auth: {
    title: 'Hisobingizga kiring', subtitle: 'Telefon raqamingiz orqali tez va xavfsiz.', phone: 'Telefon raqami',
    phonePlaceholder: '+998 90 123 45 67', sendCode: 'Kod yuborish', code: 'Tasdiqlash kodi', codePlaceholder: '6 xonali kod',
    verify: 'Tasdiqlash', google: 'Google orqali kirish', demo: 'Demo: istalgan raqam, kod 123456', or: 'yoki',
    tooShort: 'Telefon raqami juda qisqa.', wrong: 'Kod notoʻgʻri. Demo kod: 123456',
  },
  onboarding: {
    title: 'Sizni qanday tanishtiramiz?', subtitle: 'Bu tajribangizni moslashtirishga yordam beradi.',
    tourist: 'Sayyoh', touristDesc: 'Joylarni qidiraman, bron qilaman va sayohat qilaman.',
    business: 'Biznes egasi', businessDesc: 'Oʻz joyimni qoʻshaman va bronlarni qabul qilaman.', cont: 'Davom etish',
  },
  home: { hello: 'Assalomu alaykum', explore: 'Bugun nimani kashf qilamiz?', categories: 'Kategoriyalar', recommended: 'Tavsiya etilganlar', all: 'Barcha joylar', near: 'Yaqin atrofda', nearMe: 'Menga yaqin joylar', getLoc: 'Joylashuvimni aniqlash', locating: 'Aniqlanmoqda…', locDenied: 'Joylashuvga ruxsat berilmadi.', emptyAll: 'Hozircha tasdiqlangan joylar yoʻq.', emptyApproved: 'Hozircha bu kategoriyada tasdiqlangan joylar yoʻq.' },
  search: { title: 'Qidiruv', placeholder: 'Joy, mehmonxona, dorixona…', results: 'Natijalar', empty: 'Hech narsa topilmadi.', recent: 'Mashhur' },
  categories: { all: 'Barchasi', hotel: 'Mehmonxona', restaurant: 'Restoran', shop: 'Doʻkon', pharmacy: 'Dorixona', attraction: 'Diqqatga sazovor' },
  detail: { back: 'Orqaga', call: 'Qoʻngʻiroq', about: 'Tavsif', gallery: 'Galereya', hours: 'Ish vaqti', menu: 'Menyu', route: 'Marshrut', reviews: 'Sharhlar' },
  reviews: { title: 'Sharhlar', leave: 'Sharh qoldiring', placeholder: 'Tajribangiz haqida yozing…', submit: 'Yuborish', none: 'Hozircha sharhlar yoʻq. Birinchi boʻlib fikr bildiring!', you: 'Siz' },
  booking: {
    open: 'Bron qilish', signInFirst: 'Bron qilish uchun tizimga kiring', title: 'Bron qilish', date: 'Sana', time: 'Vaqt', guests: 'Mehmonlar', note: 'Izoh (ixtiyoriy)',
    price: 'Narx', subtotal: 'Joy narxi', tax: 'Xizmat haqi (3%)', total: 'Jami', next: 'Toʻlovga oʻtish', payTitle: 'Toʻlov usuli', payChoose: 'Toʻlov tizimini tanlang',
    payme: 'Payme', click: 'Click', pay: 'Toʻlash', successTitle: 'Broningiz tasdiqlandi', successMsg: 'Toʻlov qabul qilindi. Tafsilotlar profilingizda.', close: 'Yopish', viewBookings: 'Mening bronlarim', cancelWarning: 'Diqqat: Bron qilingandan 10 daqiqa ichidagina bekor qila olasiz. Keyin bekor qilish tugmasi olib tashlanadi.',
  },
  profile: {
    title: 'Profil', editName: 'Ismni tahrirlash', namePlaceholder: 'Ismingiz', save: 'Saqlash', changePhoto: 'Rasm oʻzgartirish',
    tourist: 'Sayyoh', business: 'Biznes egasi', myPlaces: 'Mening joylarim', noPlaces: 'Hali joy qoʻshmagansiz.', addPlace: 'Joy qoʻshish',
    settings: 'Sozlamalar', myBookings: 'Mening bronlarim', signOut: 'Chiqish', saved: 'Saqlandi', noFavorites: 'Sevimlilar roʻyxati hali boʻsh.',
  },
  settings: { title: 'Sozlamalar', language: 'Til', theme: 'Mavzu', light: 'Yorugʻ', dark: 'Qorongʻu', myBookings: 'Mening bronlarim' },
  bookings: { title: 'Mening bronlarim', empty: 'Hali bron qilmagansiz.', cancel: 'Bekor qilish', on: 'sana', guests: 'mehmon', paid: 'Toʻlangan' },
  create: {
    title: 'Yangi joy qoʻshish', subtitle: 'Joyni xaritadan tanlang va maʼlumotlarni toʻldiring.',
    pickLocation: 'Joyni xaritadan tanlang', pickHint: 'Xaritani bosib markerni qoʻying', picked: 'Joy tanlandi',
    name: 'Joy nomi', namePh: 'Masalan, "Bibixonim Choyxona"', category: 'Toifa', description: 'Tavsif', descPh: 'Joy haqida (500 belgigacha)…', descCount: 'belgi',
    photos: 'Rasmlar', photosHint: '10 tagacha rasm', hours: 'Ish vaqti', hoursPh: '09:00 – 23:00', menu: 'Menyu (vergul bilan)', menuPh: 'Palov, Somsa, Choy',
    price: 'Bron narxi (soʻm)', pricePh: '100000', fee: 'Joy qoʻshish narxi: 30 000 soʻm', taxNote: 'Har bron uchun 3% xizmat haqi olinadi.',
    submit: 'Joyni eʼlon qilish (30 000 soʻm)', success: 'Joyingiz qoʻshildi va eʼlon qilindi!', required: 'Iltimos, majburiy maydonlarni toʻldiring.',
    cityLabel: 'Shahar', cityPh: 'Toshkent', addressLabel: 'Manzil', addressPh: 'Amir Temur koʻchasi 1', phoneLabel: 'Telefon raqami', phonePh: '+998 90 123 45 67',
    payTitle: 'Eʼlon haqi toʻlovi', paySubtitle: 'Joyni eʼlon qilish uchun 30 000 soʻm toʻlov amalga oshiriladi.',
    payWallet: 'Hamyondan toʻlash', payWalletBalance: 'Hamyon balansi', payInsufficient: 'Hamyon balansi yetmaydi',
    payPayme: 'Payme orqali', payClick: 'Click orqali', payBtn: 'Toʻlash va eʼlon qilish', payContinue: 'Toʻlovga oʻtish', payCancel: 'Orqaga',
  },
  route: {
    title: 'Marshrut', from: 'Sizning joyingiz', to: 'Manzil', getLoc: 'Joylashuvimni aniqlash', locating: 'Aniqlanmoqda…',
    denied: 'Joylashuvga ruxsat berilmadi. Standart nuqtadan koʻrsatilmoqda.', loading: 'Marshrut qurilmoqda…',
    arriveIn: 'Yetib borish', min: 'daq', km: 'km', m: 'm', depart: 'Yoʻlni boshlang', arrive: 'Manzilga yetib keldingiz',
    left: 'Chapga buriling', right: 'Oʻngga buriling', straight: 'Toʻgʻriga davom eting', slightLeft: 'Biroz chapga', slightRight: 'Biroz oʻngga',
    sharpLeft: 'Keskin chapga', sharpRight: 'Keskin oʻngga', uturn: 'Orqaga qayting', onto: '', head: 'Yoʻnaling',
  },
  filters: { sort: 'Saralash', reco: 'Tavsiya', rating: 'Reyting', priceLow: 'Avval arzon', priceHigh: 'Avval qimmat', openNow: 'Ochiq hozir', verifiedOnly: 'Tasdiqlangan' },
  status: { openNow: 'Ochiq', closed: 'Yopiq', verified: 'Tasdiqlangan', pending: 'Tekshiruvda' },
  notif: { title: 'Bildirishnomalar', empty: 'Hozircha bildirishnomalar yoʻq.', markRead: 'Hammasini oʻqilgan deb belgilash', clear: 'Tozalash', bookingTitle: 'Bron tasdiqlandi', bookingBody: 'Broningiz muvaffaqiyatli qabul qilindi.', placeTitle: 'Joy eʼlon qilindi', placeBody: 'Joyingiz tekshiruvga yuborildi.', reminderTitle: 'Joyni baholang', reminderBody: 'Siz bu joyni baholamadingiz. Iltimos, xizmat sifatini yaxshilashga yordam bering.', rateNow: 'Hozir baholash', later: 'Keyinroq' },
  share: { share: 'Ulashish', copied: 'Havola nusxalandi' },
  book2: { ref: 'Bron raqami', confirmed: 'Tasdiqlangan', cancelled: 'Bekor qilingan', cancel: 'Bronni bekor qilish', cancelDone: 'Bron bekor qilindi' },
  trust: { statsPlaces: 'Joylar', statsCities: 'Shaharlar', statsLangs: 'Tillar', whyTitle: 'Nega Yoʻlchi?', why1T: 'Tekshirilgan joylar', why1D: 'Tasdiqlangan bizneslar va haqiqiy maʼlumotlar.', why2T: 'Xavfsiz toʻlov', why2D: 'Payme va Click orqali himoyalangan toʻlovlar.', why3T: 'Ishonchli marshrut', why3D: 'Manzilga qadam-baqadam aniq yoʻl.', secureTitle: 'Xavfsiz va shaffof', secureDesc: 'Maʼlumotlaringiz himoyalangan, har bir bron tasdiqlanadi.' },
  foot: { product: 'Mahsulot', company: 'Kompaniya', about: 'Biz haqimizda', help: 'Yordam', terms: 'Foydalanish shartlari', privacy: 'Maxfiylik siyosati', contact: 'Aloqa', rights: 'Barcha huquqlar himoyalangan.' },
  info: {
    back: 'Orqaga',
    aboutTitle: 'Biz haqimizda', aboutLead: 'Yoʻlchi — Oʻzbekiston va MDH boʻylab joy topish va bron qilish platformasi.',
    aboutP1: 'Maqsadimiz — sayyohlar va mahalliy aholiga ishonchli joylarni topish, baholash va bron qilishni osonlashtirish. Har bir biznes tekshiruvdan oʻtadi.',
    aboutP2: 'Biznes egalari oʻz joylarini qoʻshib, mijozlardan bron qabul qila oladi. Marshrut funksiyasi manzilga yetib borishni osonlashtiradi.',
    helpTitle: 'Yordam markazi', helpLead: 'Tez-tez soʻraladigan savollar.',
    termsTitle: 'Foydalanish shartlari', termsLead: 'Yoʻlchi platformasidan foydalanish qoidalari.',
    termsP1: 'Platformadan foydalanib, siz haqiqiy maʼlumot kiritishga va qonuniy maqsadlarda foydalanishga rozilik bildirasiz.',
    termsP2: 'Bronlar va toʻlovlar tegishli biznes shartlariga muvofiq amalga oshiriladi. Yoʻlchi vositachi platforma hisoblanadi.',
    privacyTitle: 'Maxfiylik siyosati', privacyLead: 'Maʼlumotlaringiz qanday himoyalanadi.',
    privacyP1: 'Biz faqat xizmat koʻrsatish uchun zarur maʼlumotlarni yigʻamiz va ularni uchinchi tomonlarga sotmaymiz.',
    privacyP2: 'Toʻlov maʼlumotlari himoyalangan toʻlov tizimlari (Payme, Click) orqali qayta ishlanadi.',
  },
  faq: [
    { q: 'Bron qilish uchun nima kerak?', a: 'Telefon raqami orqali tizimga kiring, joyni tanlang va sana/vaqtni belgilab toʻlovni amalga oshiring.' },
    { q: 'Toʻlov xavfsizmi?', a: 'Ha, toʻlovlar Payme va Click orqali himoyalangan tarzda amalga oshiriladi.' },
    { q: 'Biznesimni qanday qoʻshaman?', a: 'Roʻyxatdan oʻtishda "Biznes egasi"ni tanlang, profildan "Joy qoʻshish" orqali joyingizni eʼlon qiling.' },
    { q: 'Bronni bekor qila olamanmi?', a: '"Mening bronlarim" boʻlimidan istalgan bronni bekor qilishingiz mumkin.' },
  ],
  wallet: {
    title: 'Hamyon', balance: 'Balans', available: 'Mavjud', earned7: '7 kun', earned30: '30 kun', totalEarned: 'Jami daromad',
    history: 'Tranzaksiyalar', noTx: 'Hozircha tranzaksiyalar yoʻq.', cards: 'Kartalar', addCard: 'Karta qoʻshish',
    noCards: 'Karta ulanmagan', addFirstCard: 'Pulni yechish uchun avval kartangizni ulang.',
    withdraw: 'Pul yechish', withdrawTitle: 'Pul yechish soʻrovi', pickCard: 'Kartani tanlang', amount: 'Summa',
    amountPh: '50000', min: 'Minimal: 10 000 soʻm', max: 'Maksimal', submit: 'Soʻrov yuborish',
    pending: 'Kutilmoqda', approved: 'Tasdiqlandi', rejected: 'Rad etildi',
    cardNumber: 'Karta raqami', cardHolder: 'Karta egasi', cardExpiry: 'Amal qilish muddati',
    cardNumberPh: '8600 1234 5678 9012', cardHolderPh: 'ISMINGIZ FAMILIYANGIZ',
    saveCard: 'Saqlash', delete: 'Oʻchirish', defaultCard: 'Asosiy', commission: 'Yoʻlchi komissiyasi',
    txBookingIn: 'Bron uchun toʻlov', txWithdrawal: 'Pul yechish', txAdjustment: 'Tuzatish',
    withdrawalHistory: 'Yechimlar tarixi', cancelReq: 'Bekor qilish',
    notReadyTitle: 'Faqat biznes egalari uchun',
    notReadyDesc: 'Hamyon faqat biznes egalariga koʻrinadi. Sayyoh hisobida bu boʻlim mavjud emas.',
    businessOnly: 'Faqat biznes',
  },
  admin: {
    title: 'Admin paneli', users: 'Foydalanuvchilar', places: 'Joylar', bookings: 'Bronlar', revenue: 'Daromad',
    pendingPlaces: 'Tasdiq kutayotgan joylar', pendingWithdrawals: 'Tasdiq kutayotgan yechimlar',
    gross: 'Umumiy aylanma', ownerPaid: 'Biznesga toʻlangan', withdrawn: 'Yechib olingan', platformRevenue: 'Bron komissiyasi', listingRevenue: 'Eʼlon daromadi', totalRevenue: 'Yoʻlchi jami daromadi',
    topOwners: 'Eng faol biznes egalari', pendingPlacesTab: 'Joylar', pendingWithdrawalsTab: 'Yechimlar', statsTab: 'Statistika',
    approve: 'Tasdiqlash', reject: 'Rad etish', sum: 'Summa', card: 'Karta', for: 'kim uchun',
  },
  common: { mapLoading: 'Xarita yuklanmoqda…', soum: 'soʻm' },
};

const ru: Dict = {
  brandTagline: 'Ваш проводник по Узбекистану',
  nav: { home: 'Главная', search: 'Поиск', map: 'Карта', favorites: 'Избранное', profile: 'Профиль' },
  landing: {
    eyebrow: 'Узбекистан · Центральная Азия · СНГ',
    titlePre: 'Проводник к каждому', titleAccent: 'месту',
    subtitle: 'Находите, оценивайте и бронируйте отели, рестораны, магазины и аптеки. Доберитесь легко с маршрутом.',
    ctaStart: 'Начать', ctaHasAccount: 'Уже есть аккаунт? Войти',
    f1Title: 'Находите', f1Desc: 'Места рядом по категориям.',
    f2Title: 'Бронируйте', f2Desc: 'Отели и рестораны в пару кликов.',
    f3Title: 'Маршрут', f3Desc: 'Пошаговый путь от вас до места.',
    f4Title: 'Оценивайте', f4Desc: 'Оставляйте отзывы и читайте чужие.',
    howTitle: 'Как это работает', s1: 'Зарегистрируйтесь', s2: 'Выберите место', s3: 'Забронируйте и доберитесь',
    citiesTitle: 'Города',
    serviceFeeLabel: 'Сервисный сбор',
    featuresEyebrow: 'ВОЗМОЖНОСТИ',
    featuresTitle: 'Всё в одном месте',
    whyEyebrow: 'ПОЧЕМУ YOʻLCHI',
    howEyebrow: 'ЛЁГКИЙ СТАРТ',
    bizEyebrow: 'ДЛЯ ВЛАДЕЛЬЦЕВ БИЗНЕСА',
    bizTitle: 'Добавьте своё место и зарабатывайте',
    bizDesc: 'У вас ресторан, отель, магазин или достопримечательность? Привлекайте новых клиентов и получайте доход с каждого бронирования.',
    bizPoint1: 'Оплата за каждую бронь поступает напрямую в ваш кошелёк',
    bizPoint2: 'Всего 5% комиссии — остальное ваше',
    bizPoint3: 'Выводите деньги на карту в любое время',
  },
  auth: {
    title: 'Войдите в аккаунт', subtitle: 'Быстро и безопасно по номеру телефона.', phone: 'Номер телефона',
    phonePlaceholder: '+998 90 123 45 67', sendCode: 'Отправить код', code: 'Код подтверждения', codePlaceholder: '6-значный код',
    verify: 'Подтвердить', google: 'Войти через Google', demo: 'Демо: любой номер, код 123456', or: 'или',
    tooShort: 'Слишком короткий номер.', wrong: 'Неверный код. Демо: 123456',
  },
  onboarding: {
    title: 'Как вас представить?', subtitle: 'Это поможет настроить ваш опыт.',
    tourist: 'Турист', touristDesc: 'Ищу места, бронирую и путешествую.',
    business: 'Владелец бизнеса', businessDesc: 'Добавляю своё место и принимаю брони.', cont: 'Продолжить',
  },
  home: { hello: 'Здравствуйте', explore: 'Что откроем сегодня?', categories: 'Категории', recommended: 'Рекомендуем', all: 'Все места', near: 'Рядом', nearMe: 'Места рядом со мной', getLoc: 'Определить местоположение', locating: 'Определяем…', locDenied: 'Доступ к локации запрещён.', emptyAll: 'Пока подтверждённых мест нет.', emptyApproved: 'Пока в этой категории подтверждённых мест нет.' },
  search: { title: 'Поиск', placeholder: 'Место, отель, аптека…', results: 'Результаты', empty: 'Ничего не найдено.', recent: 'Популярное' },
  categories: { all: 'Все', hotel: 'Отель', restaurant: 'Ресторан', shop: 'Магазин', pharmacy: 'Аптека', attraction: 'Достопримечательность' },
  detail: { back: 'Назад', call: 'Позвонить', about: 'Описание', gallery: 'Галерея', hours: 'Часы работы', menu: 'Меню', route: 'Маршрут', reviews: 'Отзывы' },
  reviews: { title: 'Отзывы', leave: 'Оставьте отзыв', placeholder: 'Расскажите о своём опыте…', submit: 'Отправить', none: 'Пока нет отзывов. Будьте первым!', you: 'Вы' },
  booking: {
    open: 'Забронировать', signInFirst: 'Войдите, чтобы забронировать', title: 'Бронирование', date: 'Дата', time: 'Время', guests: 'Гостей', note: 'Комментарий (необязательно)',
    price: 'Цена', subtotal: 'Цена места', tax: 'Сервисный сбор (3%)', total: 'Итого', next: 'Перейти к оплате', payTitle: 'Способ оплаты', payChoose: 'Выберите платёжную систему',
    payme: 'Payme', click: 'Click', pay: 'Оплатить', successTitle: 'Бронь подтверждена', successMsg: 'Оплата принята. Детали в профиле.', close: 'Закрыть', viewBookings: 'Мои брони', cancelWarning: 'Внимание: вы можете отменить бронь только в течение 10 минут. После этого кнопка отмены исчезнет.',
  },
  profile: {
    title: 'Профиль', editName: 'Изменить имя', namePlaceholder: 'Ваше имя', save: 'Сохранить', changePhoto: 'Сменить фото',
    tourist: 'Турист', business: 'Владелец бизнеса', myPlaces: 'Мои места', noPlaces: 'Вы ещё не добавили места.', addPlace: 'Добавить место',
    settings: 'Настройки', myBookings: 'Мои брони', signOut: 'Выйти', saved: 'Сохранено', noFavorites: 'В избранном пока пусто.',
  },
  settings: { title: 'Настройки', language: 'Язык', theme: 'Тема', light: 'Светлая', dark: 'Тёмная', myBookings: 'Мои брони' },
  bookings: { title: 'Мои брони', empty: 'У вас пока нет броней.', cancel: 'Отменить', on: 'дата', guests: 'гостей', paid: 'Оплачено' },
  create: {
    title: 'Добавить новое место', subtitle: 'Выберите место на карте и заполните данные.',
    pickLocation: 'Выберите место на карте', pickHint: 'Нажмите на карту, чтобы поставить маркер', picked: 'Место выбрано',
    name: 'Название', namePh: 'Например, «Чайхана Биби-Ханым»', category: 'Категория', description: 'Описание', descPh: 'О месте (до 500 символов)…', descCount: 'символов',
    photos: 'Фото', photosHint: 'до 10 фото', hours: 'Часы работы', hoursPh: '09:00 – 23:00', menu: 'Меню (через запятую)', menuPh: 'Плов, Самса, Чай',
    price: 'Цена брони (сум)', pricePh: '100000', fee: 'Стоимость добавления: 30 000 сум', taxNote: 'С каждой брони удерживается сервисный сбор 3%.',
    submit: 'Опубликовать (30 000 сум)', success: 'Ваше место добавлено и опубликовано!', required: 'Заполните обязательные поля.',
    cityLabel: 'Город', cityPh: 'Ташкент', addressLabel: 'Адрес', addressPh: 'улица Амира Темура 1', phoneLabel: 'Номер телефона', phonePh: '+998 90 123 45 67',
    payTitle: 'Оплата за публикацию', paySubtitle: 'Чтобы опубликовать место, оплачивается 30 000 сум.',
    payWallet: 'Оплатить из кошелька', payWalletBalance: 'Баланс кошелька', payInsufficient: 'Недостаточно средств',
    payPayme: 'Через Payme', payClick: 'Через Click', payBtn: 'Оплатить и опубликовать', payContinue: 'К оплате', payCancel: 'Назад',
  },
  route: {
    title: 'Маршрут', from: 'Вы здесь', to: 'Назначение', getLoc: 'Определить местоположение', locating: 'Определяем…',
    denied: 'Доступ к локации запрещён. Показан маршрут от точки по умолчанию.', loading: 'Строим маршрут…',
    arriveIn: 'В пути', min: 'мин', km: 'км', m: 'м', depart: 'Начните движение', arrive: 'Вы прибыли',
    left: 'Поверните налево', right: 'Поверните направо', straight: 'Продолжайте прямо', slightLeft: 'Чуть левее', slightRight: 'Чуть правее',
    sharpLeft: 'Резко налево', sharpRight: 'Резко направо', uturn: 'Развернитесь', onto: '', head: 'Двигайтесь',
  },
  filters: { sort: 'Сортировка', reco: 'Рекомендуем', rating: 'Рейтинг', priceLow: 'Сначала дешёвые', priceHigh: 'Сначала дорогие', openNow: 'Открыто сейчас', verifiedOnly: 'Проверенные' },
  status: { openNow: 'Открыто', closed: 'Закрыто', verified: 'Проверено', pending: 'На проверке' },
  notif: { title: 'Уведомления', empty: 'Пока нет уведомлений.', markRead: 'Отметить все прочитанными', clear: 'Очистить', bookingTitle: 'Бронь подтверждена', bookingBody: 'Ваша бронь успешно принята.', placeTitle: 'Место опубликовано', placeBody: 'Ваше место отправлено на проверку.', reminderTitle: 'Оцените место', reminderBody: 'Вы не оценили это место. Помогите улучшить качество сервиса.', rateNow: 'Оценить сейчас', later: 'Позже' },
  share: { share: 'Поделиться', copied: 'Ссылка скопирована' },
  book2: { ref: 'Номер брони', confirmed: 'Подтверждено', cancelled: 'Отменено', cancel: 'Отменить бронь', cancelDone: 'Бронь отменена' },
  trust: { statsPlaces: 'Места', statsCities: 'Города', statsLangs: 'Языка', whyTitle: 'Почему Yoʻlchi?', why1T: 'Проверенные места', why1D: 'Подтверждённый бизнес и реальные данные.', why2T: 'Безопасная оплата', why2D: 'Защищённые платежи через Payme и Click.', why3T: 'Надёжный маршрут', why3D: 'Точный пошаговый путь до места.', secureTitle: 'Безопасно и прозрачно', secureDesc: 'Ваши данные защищены, каждая бронь подтверждается.' },
  foot: { product: 'Продукт', company: 'Компания', about: 'О нас', help: 'Помощь', terms: 'Условия использования', privacy: 'Политика конфиденциальности', contact: 'Контакты', rights: 'Все права защищены.' },
  info: {
    back: 'Назад',
    aboutTitle: 'О нас', aboutLead: 'Yoʻlchi — платформа поиска и бронирования мест по Узбекистану и СНГ.',
    aboutP1: 'Наша цель — помочь туристам и местным жителям находить, оценивать и бронировать надёжные места. Каждый бизнес проходит проверку.',
    aboutP2: 'Владельцы бизнеса могут добавлять свои места и принимать брони. Функция маршрута упрощает дорогу до места.',
    helpTitle: 'Центр помощи', helpLead: 'Часто задаваемые вопросы.',
    termsTitle: 'Условия использования', termsLead: 'Правила использования платформы Yoʻlchi.',
    termsP1: 'Используя платформу, вы соглашаетесь предоставлять достоверные данные и использовать сервис в законных целях.',
    termsP2: 'Брони и оплаты осуществляются согласно условиям бизнеса. Yoʻlchi является посреднической платформой.',
    privacyTitle: 'Политика конфиденциальности', privacyLead: 'Как защищаются ваши данные.',
    privacyP1: 'Мы собираем только необходимые для сервиса данные и не продаём их третьим лицам.',
    privacyP2: 'Платёжные данные обрабатываются защищёнными системами (Payme, Click).',
  },
  faq: [
    { q: 'Что нужно для бронирования?', a: 'Войдите по номеру телефона, выберите место, укажите дату/время и оплатите.' },
    { q: 'Безопасна ли оплата?', a: 'Да, платежи проходят через защищённые системы Payme и Click.' },
    { q: 'Как добавить свой бизнес?', a: 'При регистрации выберите «Владелец бизнеса» и опубликуйте место через «Добавить место».' },
    { q: 'Можно ли отменить бронь?', a: 'Да, любую бронь можно отменить в разделе «Мои брони».' },
  ],
  wallet: {
    title: 'Кошелёк', balance: 'Баланс', available: 'Доступно', earned7: '7 дней', earned30: '30 дней', totalEarned: 'Всего заработано',
    history: 'Транзакции', noTx: 'Транзакций пока нет.', cards: 'Карты', addCard: 'Добавить карту',
    noCards: 'Карта не привязана', addFirstCard: 'Привяжите карту, чтобы выводить деньги.',
    withdraw: 'Вывести', withdrawTitle: 'Запрос на вывод', pickCard: 'Выберите карту', amount: 'Сумма',
    amountPh: '50000', min: 'Минимум: 10 000 сум', max: 'Максимум', submit: 'Отправить запрос',
    pending: 'В ожидании', approved: 'Одобрено', rejected: 'Отклонено',
    cardNumber: 'Номер карты', cardHolder: 'Держатель карты', cardExpiry: 'Срок действия',
    cardNumberPh: '8600 1234 5678 9012', cardHolderPh: 'ВАШЕ ИМЯ ФАМИЛИЯ',
    saveCard: 'Сохранить', delete: 'Удалить', defaultCard: 'Основная', commission: 'Комиссия Yoʻlchi',
    txBookingIn: 'Оплата за бронь', txWithdrawal: 'Вывод средств', txAdjustment: 'Корректировка',
    withdrawalHistory: 'История выводов', cancelReq: 'Отменить',
    notReadyTitle: 'Только для бизнеса',
    notReadyDesc: 'Кошелёк доступен только владельцам бизнеса. В аккаунте туриста этот раздел недоступен.',
    businessOnly: 'Только бизнес',
  },
  admin: {
    title: 'Админ-панель', users: 'Пользователи', places: 'Места', bookings: 'Брони', revenue: 'Доход',
    pendingPlaces: 'Места на проверке', pendingWithdrawals: 'Выводы на проверке',
    gross: 'Общий оборот', ownerPaid: 'Выплачено бизнесу', withdrawn: 'Выведено', platformRevenue: 'Комиссия с броней', listingRevenue: 'Доход с публикаций', totalRevenue: 'Общий доход Yoʻlchi',
    topOwners: 'Топ владельцы бизнеса', pendingPlacesTab: 'Места', pendingWithdrawalsTab: 'Выводы', statsTab: 'Статистика',
    approve: 'Одобрить', reject: 'Отклонить', sum: 'Сумма', card: 'Карта', for: 'кому',
  },
  common: { mapLoading: 'Загрузка карты…', soum: 'сум' },
};

const en: Dict = {
  brandTagline: 'Your guide across Uzbekistan',
  nav: { home: 'Home', search: 'Search', map: 'Map', favorites: 'Favorites', profile: 'Profile' },
  landing: {
    eyebrow: 'Uzbekistan · Central Asia · CIS',
    titlePre: 'Your guide to every', titleAccent: 'place',
    subtitle: 'Find, rate and book hotels, restaurants, shops and pharmacies. Get there easily with turn-by-turn routes.',
    ctaStart: 'Get started', ctaHasAccount: 'Have an account? Sign in',
    f1Title: 'Discover', f1Desc: 'Places near you by category.',
    f2Title: 'Book', f2Desc: 'Hotels and restaurants in a few taps.',
    f3Title: 'Route', f3Desc: 'Step-by-step path from you to the place.',
    f4Title: 'Rate', f4Desc: 'Leave reviews and read others.',
    howTitle: 'How it works', s1: 'Sign up', s2: 'Pick a place', s3: 'Book and arrive',
    citiesTitle: 'Cities',
    serviceFeeLabel: 'Service fee',
    featuresEyebrow: 'FEATURES',
    featuresTitle: 'Everything in one place',
    whyEyebrow: 'WHY YOʻLCHI',
    howEyebrow: 'EASY TO START',
    bizEyebrow: 'FOR BUSINESS OWNERS',
    bizTitle: 'List your place and earn money',
    bizDesc: 'Own a restaurant, hotel, shop or attraction? Reach new customers and earn from every booking through Yoʻlchi.',
    bizPoint1: 'Payment for every booking goes straight to your wallet',
    bizPoint2: 'Only 5% commission — the rest is yours',
    bizPoint3: 'Withdraw to your card anytime',
  },
  auth: {
    title: 'Sign in to your account', subtitle: 'Fast and secure with your phone number.', phone: 'Phone number',
    phonePlaceholder: '+998 90 123 45 67', sendCode: 'Send code', code: 'Verification code', codePlaceholder: '6-digit code',
    verify: 'Verify', google: 'Continue with Google', demo: 'Demo: any number, code 123456', or: 'or',
    tooShort: 'Phone number is too short.', wrong: 'Wrong code. Demo code: 123456',
  },
  onboarding: {
    title: 'How should we know you?', subtitle: 'This helps tailor your experience.',
    tourist: 'Tourist', touristDesc: 'I search places, book and travel.',
    business: 'Business owner', businessDesc: 'I add my place and accept bookings.', cont: 'Continue',
  },
  home: { hello: 'Hello', explore: 'What shall we discover today?', categories: 'Categories', recommended: 'Recommended', all: 'All places', near: 'Nearby', nearMe: 'Places near me', getLoc: 'Detect my location', locating: 'Locating…', locDenied: 'Location access denied.', emptyAll: 'No approved places yet.', emptyApproved: 'No approved places in this category yet.' },
  search: { title: 'Search', placeholder: 'Place, hotel, pharmacy…', results: 'Results', empty: 'Nothing found.', recent: 'Popular' },
  categories: { all: 'All', hotel: 'Hotel', restaurant: 'Restaurant', shop: 'Shop', pharmacy: 'Pharmacy', attraction: 'Attraction' },
  detail: { back: 'Back', call: 'Call', about: 'About', gallery: 'Gallery', hours: 'Hours', menu: 'Menu', route: 'Route', reviews: 'Reviews' },
  reviews: { title: 'Reviews', leave: 'Leave a review', placeholder: 'Tell us about your experience…', submit: 'Submit', none: 'No reviews yet. Be the first!', you: 'You' },
  booking: {
    open: 'Book now', signInFirst: 'Sign in to book', title: 'Book', date: 'Date', time: 'Time', guests: 'Guests', note: 'Note (optional)',
    price: 'Price', subtotal: 'Place price', tax: 'Service fee (3%)', total: 'Total', next: 'Go to payment', payTitle: 'Payment method', payChoose: 'Choose a payment system',
    payme: 'Payme', click: 'Click', pay: 'Pay', successTitle: 'Booking confirmed', successMsg: 'Payment received. Details in your profile.', close: 'Close', viewBookings: 'My bookings', cancelWarning: 'Warning: you can cancel only within 10 minutes of booking. After that, the cancel button disappears.',
  },
  profile: {
    title: 'Profile', editName: 'Edit name', namePlaceholder: 'Your name', save: 'Save', changePhoto: 'Change photo',
    tourist: 'Tourist', business: 'Business owner', myPlaces: 'My places', noPlaces: 'You have not added places yet.', addPlace: 'Add a place',
    settings: 'Settings', myBookings: 'My bookings', signOut: 'Sign out', saved: 'Saved', noFavorites: 'No favorites yet.',
  },
  settings: { title: 'Settings', language: 'Language', theme: 'Theme', light: 'Light', dark: 'Dark', myBookings: 'My bookings' },
  bookings: { title: 'My bookings', empty: 'You have no bookings yet.', cancel: 'Cancel', on: 'on', guests: 'guests', paid: 'Paid' },
  create: {
    title: 'Add a new place', subtitle: 'Pick the location on the map and fill in the details.',
    pickLocation: 'Pick location on the map', pickHint: 'Tap the map to drop a marker', picked: 'Location selected',
    name: 'Place name', namePh: 'e.g. "Bibikhanym Teahouse"', category: 'Category', description: 'Description', descPh: 'About the place (up to 500 chars)…', descCount: 'chars',
    photos: 'Photos', photosHint: 'up to 10 photos', hours: 'Working hours', hoursPh: '09:00 – 23:00', menu: 'Menu (comma separated)', menuPh: 'Plov, Samsa, Tea',
    price: 'Booking price (UZS)', pricePh: '100000', fee: 'Listing fee: 30,000 UZS', taxNote: 'A 3% service fee applies to each booking.',
    submit: 'Publish place (30,000 UZS)', success: 'Your place was added and published!', required: 'Please fill in the required fields.',
    cityLabel: 'City', cityPh: 'Tashkent', addressLabel: 'Address', addressPh: 'Amir Temur St. 1', phoneLabel: 'Phone number', phonePh: '+998 90 123 45 67',
    payTitle: 'Listing payment', paySubtitle: 'To publish your place, a fee of 30,000 UZS is charged.',
    payWallet: 'Pay from wallet', payWalletBalance: 'Wallet balance', payInsufficient: 'Insufficient balance',
    payPayme: 'Via Payme', payClick: 'Via Click', payBtn: 'Pay and publish', payContinue: 'Continue to payment', payCancel: 'Back',
  },
  route: {
    title: 'Route', from: 'Your location', to: 'Destination', getLoc: 'Detect my location', locating: 'Locating…',
    denied: 'Location access denied. Showing route from a default point.', loading: 'Building route…',
    arriveIn: 'Arrive in', min: 'min', km: 'km', m: 'm', depart: 'Start driving', arrive: 'You have arrived',
    left: 'Turn left', right: 'Turn right', straight: 'Continue straight', slightLeft: 'Slight left', slightRight: 'Slight right',
    sharpLeft: 'Sharp left', sharpRight: 'Sharp right', uturn: 'Make a U-turn', onto: '', head: 'Head',
  },
  filters: { sort: 'Sort', reco: 'Recommended', rating: 'Rating', priceLow: 'Price: low to high', priceHigh: 'Price: high to low', openNow: 'Open now', verifiedOnly: 'Verified' },
  status: { openNow: 'Open', closed: 'Closed', verified: 'Verified', pending: 'Under review' },
  notif: { title: 'Notifications', empty: 'No notifications yet.', markRead: 'Mark all as read', clear: 'Clear', bookingTitle: 'Booking confirmed', bookingBody: 'Your booking was successfully received.', placeTitle: 'Place published', placeBody: 'Your place was submitted for review.', reminderTitle: 'Rate this place', reminderBody: 'You haven\'t rated this place. Please help us improve service quality.', rateNow: 'Rate now', later: 'Later' },
  share: { share: 'Share', copied: 'Link copied' },
  book2: { ref: 'Booking ref', confirmed: 'Confirmed', cancelled: 'Cancelled', cancel: 'Cancel booking', cancelDone: 'Booking cancelled' },
  trust: { statsPlaces: 'Places', statsCities: 'Cities', statsLangs: 'Languages', whyTitle: 'Why Yoʻlchi?', why1T: 'Verified places', why1D: 'Confirmed businesses and real information.', why2T: 'Secure payment', why2D: 'Protected payments via Payme and Click.', why3T: 'Reliable routes', why3D: 'Accurate step-by-step path to the place.', secureTitle: 'Safe and transparent', secureDesc: 'Your data is protected and every booking is confirmed.' },
  foot: { product: 'Product', company: 'Company', about: 'About', help: 'Help', terms: 'Terms of Service', privacy: 'Privacy Policy', contact: 'Contact', rights: 'All rights reserved.' },
  info: {
    back: 'Back',
    aboutTitle: 'About us', aboutLead: 'Yoʻlchi is a discovery and booking platform across Uzbekistan and the CIS.',
    aboutP1: 'Our mission is to help travelers and locals find, rate and book trusted places. Every business is verified.',
    aboutP2: 'Business owners can add their places and accept bookings. The route feature makes getting there easy.',
    helpTitle: 'Help center', helpLead: 'Frequently asked questions.',
    termsTitle: 'Terms of Service', termsLead: 'Rules for using the Yoʻlchi platform.',
    termsP1: 'By using the platform you agree to provide accurate information and to use the service for lawful purposes.',
    termsP2: 'Bookings and payments are handled per each business terms. Yoʻlchi acts as an intermediary platform.',
    privacyTitle: 'Privacy Policy', privacyLead: 'How your data is protected.',
    privacyP1: 'We collect only the data needed to provide the service and never sell it to third parties.',
    privacyP2: 'Payment data is processed by secure payment systems (Payme, Click).',
  },
  faq: [
    { q: 'What do I need to book?', a: 'Sign in with your phone number, pick a place, choose date/time and pay.' },
    { q: 'Is payment secure?', a: 'Yes, payments go through the secure Payme and Click systems.' },
    { q: 'How do I add my business?', a: 'Choose "Business owner" at sign-up and publish your place via "Add a place".' },
    { q: 'Can I cancel a booking?', a: 'Yes, you can cancel any booking in the "My bookings" section.' },
  ],
  wallet: {
    title: 'Wallet', balance: 'Balance', available: 'Available', earned7: '7 days', earned30: '30 days', totalEarned: 'Total earned',
    history: 'Transactions', noTx: 'No transactions yet.', cards: 'Cards', addCard: 'Add card',
    noCards: 'No card linked', addFirstCard: 'Link a card to withdraw funds.',
    withdraw: 'Withdraw', withdrawTitle: 'Withdrawal request', pickCard: 'Pick a card', amount: 'Amount',
    amountPh: '50000', min: 'Minimum: 10,000 UZS', max: 'Maximum', submit: 'Submit request',
    pending: 'Pending', approved: 'Approved', rejected: 'Rejected',
    cardNumber: 'Card number', cardHolder: 'Cardholder name', cardExpiry: 'Expiry',
    cardNumberPh: '8600 1234 5678 9012', cardHolderPh: 'YOUR NAME SURNAME',
    saveCard: 'Save', delete: 'Delete', defaultCard: 'Default', commission: 'Yoʻlchi commission',
    txBookingIn: 'Booking payment', txWithdrawal: 'Withdrawal', txAdjustment: 'Adjustment',
    withdrawalHistory: 'Withdrawal history', cancelReq: 'Cancel',
    notReadyTitle: 'Business only',
    notReadyDesc: 'The wallet is only available to business owners.',
    businessOnly: 'Business only',
  },
  admin: {
    title: 'Admin panel', users: 'Users', places: 'Places', bookings: 'Bookings', revenue: 'Revenue',
    pendingPlaces: 'Places pending review', pendingWithdrawals: 'Withdrawals pending review',
    gross: 'Gross volume', ownerPaid: 'Paid to businesses', withdrawn: 'Withdrawn', platformRevenue: 'Booking commission', listingRevenue: 'Listing revenue', totalRevenue: 'Total Yoʻlchi revenue',
    topOwners: 'Top business owners', pendingPlacesTab: 'Places', pendingWithdrawalsTab: 'Withdrawals', statsTab: 'Stats',
    approve: 'Approve', reject: 'Reject', sum: 'Amount', card: 'Card', for: 'for',
  },
  common: { mapLoading: 'Loading map…', soum: 'UZS' },
};

const DICTS: Record<Locale, Dict> = { uz, ru, en };

interface I18nContextValue { lang: Locale; t: Dict; setLang: (l: Locale) => void }
const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Locale>('uz');
  useEffect(() => {
    const saved = (typeof window !== 'undefined' && window.localStorage.getItem('yolchi-lang')) as Locale | null;
    if (saved && LOCALES.includes(saved)) setLangState(saved);
  }, []);
  const setLang = (l: Locale) => {
    setLangState(l);
    if (typeof window !== 'undefined') window.localStorage.setItem('yolchi-lang', l);
    if (typeof document !== 'undefined') document.documentElement.lang = l;
  };
  return <I18nContext.Provider value={{ lang, t: DICTS[lang], setLang }}>{children}</I18nContext.Provider>;
}

export function useT(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useT must be used within LanguageProvider');
  return ctx;
}
