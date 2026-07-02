import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";

const dict = {
  en: {
    brand: "QTRENDZ",
    tagline: "By destination",
    heroSub: "Viral gadgets, daily essentials & finds from TikTok, Snapchat and Instagram. Pay cash on delivery.",
    shopNow: "Shop trending",
    browseAll: "Browse all products",
    categories: "Categories",
    trending: "Trending now",
    all: "All products",
    addToCart: "Add to cart",
    outOfStock: "Out of stock",
    cart: "Cart",
    emptyCart: "Your cart is empty",
    checkout: "Checkout",
    continueShopping: "Continue shopping",
    subtotal: "Subtotal",
    delivery: "Delivery",
    total: "Total",
    fullName: "Full name",
    phone: "Phone number",
    address: "Delivery address",
    zone: "Delivery zone",
    selectZone: "Select your area",
    notes: "Order notes (optional)",
    placeOrder: "Place order — Cash on delivery",
    codBadge: "Cash on Delivery",
    orderPlaced: "Order placed!",
    orderRef: "Your order number is",
    contactSoon: "We'll call you shortly to confirm delivery.",
    admin: "Admin",
    signIn: "Sign in",
    signOut: "Sign out",
    email: "Email",
    password: "Password",
    dashboard: "Dashboard",
    products: "Products",
    orders: "Orders",
    newProduct: "New product",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    footerFollow: "Follow the trends",
    remove: "Remove",
    qty: "Qty",
    home: "Home",
    price: "Price",
    stock: "Stock",
    category: "Category",
    image: "Image URL",
    active: "Active",
    markTrending: "Trending",
    status: "Status",
    orderDetails: "Order details",
    customer: "Customer",
    items: "Items",
  },
  ar: {
    brand: "QTRENDZ",
    tagline: "By destination",
    heroSub: "أدوات رائجة وضروريات يومية ومنتجات فيروسية من تيك توك وسناب شات وإنستغرام. الدفع عند الاستلام.",
    shopNow: "تسوّق الآن",
    browseAll: "تصفح كل المنتجات",
    categories: "الفئات",
    trending: "الأكثر رواجاً",
    all: "كل المنتجات",
    addToCart: "أضف إلى السلة",
    outOfStock: "غير متوفر",
    cart: "السلة",
    emptyCart: "سلتك فارغة",
    checkout: "إتمام الطلب",
    continueShopping: "متابعة التسوق",
    subtotal: "المجموع الفرعي",
    delivery: "التوصيل",
    total: "الإجمالي",
    fullName: "الاسم الكامل",
    phone: "رقم الهاتف",
    address: "عنوان التوصيل",
    zone: "منطقة التوصيل",
    selectZone: "اختر منطقتك",
    notes: "ملاحظات (اختياري)",
    placeOrder: "تأكيد الطلب — الدفع عند الاستلام",
    codBadge: "الدفع عند الاستلام",
    orderPlaced: "تم تأكيد طلبك!",
    orderRef: "رقم الطلب هو",
    contactSoon: "سنتواصل معك قريباً لتأكيد التوصيل.",
    admin: "الإدارة",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    dashboard: "لوحة التحكم",
    products: "المنتجات",
    orders: "الطلبات",
    newProduct: "منتج جديد",
    edit: "تعديل",
    delete: "حذف",
    save: "حفظ",
    cancel: "إلغاء",
    footerFollow: "تابعنا",
    remove: "إزالة",
    qty: "الكمية",
    home: "الرئيسية",
    price: "السعر",
    stock: "المخزون",
    category: "الفئة",
    image: "رابط الصورة",
    active: "مفعّل",
    markTrending: "رائج",
    status: "الحالة",
    orderDetails: "تفاصيل الطلب",
    customer: "العميل",
    items: "المنتجات",
  },
} as const;

type Dict = typeof dict["en"];

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: keyof Dict) => string;
  dir: "ltr" | "rtl";
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (saved === "ar" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };

  const t = (k: keyof Dict) => dict[lang][k] ?? String(k);

  return <Ctx.Provider value={{ lang, setLang, t, dir: lang === "ar" ? "rtl" : "ltr" }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n must be used inside I18nProvider");
  return c;
}

export function formatQAR(n: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "ar" ? "ar-QA" : "en-QA", {
    style: "currency",
    currency: "QAR",
    maximumFractionDigits: 2,
  }).format(n);
}

export function pickName<T extends { name_en: string; name_ar: string }>(o: T, lang: Lang) {
  return lang === "ar" ? o.name_ar : o.name_en;
}
export function pickDesc<T extends { description_en?: string | null; description_ar?: string | null }>(o: T, lang: Lang) {
  return (lang === "ar" ? o.description_ar : o.description_en) ?? "";
}