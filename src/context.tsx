import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, doc, setDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { db, auth } from './firebase';
import { Locale, CLIENT_TRANSLATIONS } from './locales/clientTranslations';

// --- Cookie Helper Utilities ---
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

// --- Browser Language Detection ---
function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'de';

  // 1. URL Path check
  const pathname = window.location.pathname;
  if (pathname.startsWith('/de') || pathname === '/de/') {
    return 'de';
  }
  if (pathname.startsWith('/en') || pathname === '/en/') {
    return 'en';
  }

  // 2. LocalStorage check
  const savedLoc = localStorage.getItem('locale');
  if (savedLoc === 'de' || savedLoc === 'en') {
    return savedLoc as Locale;
  }

  // 3. Cookie check
  const cookieLoc = getCookie('locale');
  if (cookieLoc === 'de' || cookieLoc === 'en') {
    return cookieLoc as Locale;
  }

  // 4. Browser preference check
  const navLang = navigator.language || (navigator as any).userLanguage || '';
  if (navLang.toLowerCase().includes('en')) {
    return 'en';
  }
  if (navLang.toLowerCase().includes('de')) {
    return 'de';
  }

  // 5. Default Fallback
  return 'de';
}

interface CartItem {
  productId: string;
  length: number;
  quantity: number;
  color?: 'Schwarz' | 'Orange';
}

interface AppContextType {
  cart: CartItem[];
  comparisonList: string[];
  addToCart: (productId: string, length: number, quantity?: number, color?: 'Schwarz' | 'Orange') => void;
  removeFromCart: (productId: string, length: number, color?: 'Schwarz' | 'Orange') => void;
  toggleComparison: (productId: string) => void;
  removeFromComparison: (productId: string) => void;
  clearCart: () => void;
  stock: Record<string, number>;
  sold: Record<string, number>;
  updateStock: (
    productId: string, 
    color: 'Schwarz' | 'Orange', 
    length: number, 
    newStock: number, 
    newSold?: number,
    reason?: string,
    username?: string
  ) => Promise<void>;
  locale: Locale;
  setLocale: (lang: Locale) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  user: FirebaseUser | null;
  userProfile: any | null;
  userOrders: any[];
  isLoadingUser: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<{ firstName: string; lastName: string; strasse: string; plz: string; stadt: string; land: string; telefon: string }>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [comparisonList, setComparisonList] = useState<string[]>([]);
  const [stock, setStock] = useState<Record<string, number>>({
    p1_Schwarz: 150,
    p1_Orange: 100,
    p2_Schwarz: 120,
    p2_Orange: 80,
    p3_Schwarz: 85,
    p3_Orange: 50,
    p1_Schwarz_50: 75,
    p1_Schwarz_100: 75,
    p1_Orange_50: 50,
    p1_Orange_100: 50,
    p2_Schwarz_100: 120,
    p2_Orange_100: 80,
    p3_Schwarz_100: 85,
    p3_Orange_100: 50,
  });
  const [sold, setSold] = useState<Record<string, number>>({
    p1_Schwarz: 0,
    p1_Orange: 0,
    p2_Schwarz: 0,
    p2_Orange: 0,
    p3_Schwarz: 0,
    p3_Orange: 0,
    p1_Schwarz_50: 0,
    p1_Schwarz_100: 0,
    p1_Orange_50: 0,
    p1_Orange_100: 0,
    p2_Schwarz_100: 0,
    p2_Orange_100: 0,
    p3_Schwarz_100: 0,
    p3_Orange_100: 0,
  });

  const [locale, setLocaleState] = useState<Locale>(detectInitialLocale);

  const setLocale = (lang: Locale) => {
    setLocaleState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', lang);
      setCookie('locale', lang);

      // Seamlessly transition the URL prefix for SEO
      const pathname = window.location.pathname;
      const parts = pathname.split('/').filter(Boolean);
      if (parts[0] === 'de' || parts[0] === 'en') {
        parts[0] = lang;
        const newPath = '/' + parts.join('/') + window.location.search + window.location.hash;
        window.history.pushState(null, '', newPath);
      } else {
        const newPath = `/${lang}${pathname === '/' ? '/' : pathname}${window.location.search}${window.location.hash}`;
        window.history.pushState(null, '', newPath);
      }
    }
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const dict = CLIENT_TRANSLATIONS[locale] || CLIENT_TRANSLATIONS['de'];
    let val = dict[key] || CLIENT_TRANSLATIONS['de'][key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        val = val.replace(`{${k}}`, String(v));
      });
    }
    return val;
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      const stockData: Record<string, number> = {};
      const soldData: Record<string, number> = {};
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        stockData[docSnap.id] = data.stock ?? 0;
        soldData[docSnap.id] = data.sold ?? 0;
      });
      setStock(prev => ({ ...prev, ...stockData }));
      setSold(prev => ({ ...prev, ...soldData }));
    }, (error) => {
      console.error("Error watching inventory:", error);
    });
    return () => unsubscribe();
  }, []);

  const updateStock = async (
    productId: string, 
    color: 'Schwarz' | 'Orange', 
    length: number, 
    newStock: number, 
    newSold?: number,
    reason: string = 'Manual Update',
    username: string = 'Admin'
  ) => {
    try {
      const docId = `${productId}_${color}_${length}`;
      const stockKey = docId;
      const previousStock = stock[stockKey] ?? (
        productId === 'p1' ? (color === 'Schwarz' ? 75 : 50) : productId === 'p2' ? (color === 'Schwarz' ? 120 : 80) : (color === 'Schwarz' ? 85 : 50)
      );
      const changeQty = newStock - previousStock;

      const updateData: any = {
        productId,
        color,
        length,
        stock: Math.max(0, newStock),
        updatedAt: serverTimestamp()
      };
      if (typeof newSold === 'number') {
        updateData.sold = Math.max(0, newSold);
      }
      
      await setDoc(doc(db, 'inventory', docId), updateData, { merge: true });

      const histRef = doc(collection(db, 'stock_history'));
      await setDoc(histRef, {
        productId,
        color,
        length,
        previousStock,
        newStock: Math.max(0, newStock),
        changeQuantity: changeQty,
        reason,
        user: username,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating stock:", error);
      throw error;
    }
  };

  const addToCart = (productId: string, length: number, quantity = 1, color: 'Schwarz' | 'Orange' = 'Schwarz') => {
    const stockKey = `${productId}_${color}_${length}`;
    const legacyStockKey = `${productId}_${color}`;
    const defaultStock = productId === 'p1' ? (color === 'Schwarz' ? 75 : 50) : productId === 'p2' ? (color === 'Schwarz' ? 120 : 80) : (color === 'Schwarz' ? 85 : 50);
    const currentStock = stock[stockKey] ?? stock[legacyStockKey] ?? defaultStock;
    if (currentStock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.productId === productId && item.length === length && (item.color || 'Schwarz') === color);
      if (existing) {
        const newQuantity = existing.quantity + quantity;
        const cappedQuantity = Math.min(newQuantity, currentStock);
        return prev.map(item => 
          (item.productId === productId && item.length === length && (item.color || 'Schwarz') === color) 
            ? { ...item, quantity: cappedQuantity } 
            : item
        );
      }
      return [...prev, { productId, length, quantity: Math.min(quantity, currentStock), color }];
    });
  };

  const removeFromCart = (productId: string, length: number, color: 'Schwarz' | 'Orange' = 'Schwarz') => {
    setCart(prev => prev.filter(item => !(item.productId === productId && item.length === length && (item.color || 'Schwarz') === color)));
  };

  const toggleComparison = (productId: string) => {
    setComparisonList(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      if (prev.length >= 4) return prev;
      return [...prev, productId];
    });
  };

  const removeFromComparison = (productId: string) => {
    setComparisonList(prev => prev.filter(id => id !== productId));
  };

  const clearCart = () => setCart([]);

  // --- Firebase User Auth & Profile Integration ---
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setUserProfile(null);
        setUserOrders([]);
        setIsLoadingUser(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Listen to profile
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      } else {
        setUserProfile(null);
      }
      setIsLoadingUser(false);
    }, (err) => {
      console.error("Error listening to profile:", err);
      setIsLoadingUser(false);
    });

    // Listen to orders matching this user's email
    const q = query(collection(db, 'orders'), where('customer.email', '==', user.email));
    const unsubOrders = onSnapshot(q, (snapshot) => {
      const ordersList: any[] = [];
      snapshot.forEach((docSnap) => {
        ordersList.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort orders by createdAt desc
      ordersList.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds : 0;
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds : 0;
        return timeB - timeA;
      });
      setUserOrders(ordersList);
    }, (err) => {
      console.error("Error listening to orders:", err);
    });

    return () => {
      unsubProfile();
      unsubOrders();
    };
  }, [user]);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (email: string, pass: string, firstName: string, lastName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await setDoc(doc(db, 'users', cred.user.uid), {
        firstName,
        lastName,
        email,
        createdAt: serverTimestamp()
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (data: Partial<{ firstName: string; lastName: string; strasse: string; plz: string; stadt: string; land: string; telefon: string }>) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  return (
    <AppContext.Provider value={{ 
      cart, 
      comparisonList, 
      addToCart, 
      removeFromCart, 
      toggleComparison, 
      removeFromComparison,
      clearCart,
      stock,
      sold,
      updateStock,
      locale,
      setLocale,
      t,
      user,
      userProfile,
      userOrders,
      isLoadingUser,
      login,
      register,
      logout,
      updateUserProfile
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
