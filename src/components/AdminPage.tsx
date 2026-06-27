import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context';
import { PRODUCTS } from '../constants';
import { db, auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, query, orderBy, serverTimestamp, writeBatch } from 'firebase/firestore';
import { 
  ArrowLeft, Lock, Save, Plus, Minus, ShieldCheck, RefreshCw, AlertTriangle, 
  TrendingUp, Archive, Search, Filter, Calendar, Users, FileText, ShoppingBag, 
  Download, Upload, CheckCircle, XCircle, Barcode, Trash2, PieChart, BarChart2, 
  DollarSign, Settings, Bell, ChevronRight, Play, Check, ShieldAlert, Globe
} from 'lucide-react';
import { ADMIN_TRANSLATIONS, AdminLocale, translate, formatAdminDate } from '../locales/adminTranslations';

interface OrderItem {
  productId: string;
  name: string;
  length: number;
  color?: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    vorname: string;
    nachname: string;
    email: string;
    strasse: string;
    plz: string;
    stadt: string;
    land: string;
    telefon?: string;
  };
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  createdAt: any;
}

interface StockHistoryEntry {
  id: string;
  productId: string;
  color: string;
  length: number;
  previousStock: number;
  newStock: number;
  changeQuantity: number;
  reason: string;
  user: string;
  orderNumber?: string;
  createdAt: any;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success';
  time: string;
}

export default function AdminPage({ onClose }: { onClose: () => void }) {
  const { stock, sold, updateStock } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'Admin' | 'Employee' | null>(null);
  const [error, setError] = useState('');
  
  // Localization State - Default is Russian ('ru')
  const [locale, setLocale] = useState<AdminLocale>(() => {
    const saved = localStorage.getItem('zamlux_admin_locale');
    return (saved as AdminLocale) || 'ru';
  });

  const t = (key: string, params?: Record<string, string | number>) => translate(locale, key, params);

  const getLocalizedColor = (col: string) => {
    if (locale === 'ru') {
      return col === 'Schwarz' ? 'Черный' : col === 'Orange' ? 'Оранжевый' : col;
    }
    if (locale === 'en') {
      return col === 'Schwarz' ? 'Black' : col === 'Orange' ? 'Orange' : col;
    }
    return col; // 'Schwarz' or 'Orange' (German)
  };

  const formatCurrency = (val: number) => {
    const locStr = locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-US' : 'de-DE';
    return val.toLocaleString(locStr, { style: 'currency', currency: 'EUR' });
  };

  // Tab Management
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'orders' | 'history' | 'stats' | 'settings'>('dashboard');

  // Firestore Collections State
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistoryEntry[]>([]);
  const [lowStockLimit, setLowStockLimit] = useState<number>(10);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStockStatus, setFilterStockStatus] = useState('All'); // All, Low, OutOfStock, Healthy
  const [barcodeSearch, setBarcodeSearch] = useState('');

  // Editing state
  const [editingVariant, setEditingVariant] = useState<{
    productId: string;
    color: 'Schwarz' | 'Orange';
    length: number;
    currentStock: number;
    currentSold: number;
  } | null>(null);
  const [newStockVal, setNewStockVal] = useState<string>('');
  const [newSoldVal, setNewSoldVal] = useState<string>('');
  const [editReason, setEditReason] = useState<string>('Manual Update');
  const [isSaving, setIsSaving] = useState(false);

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // CSV Drag and Drop
  const [isDragOver, setIsDragOver] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; msg?: string } | null>(null);

  // Global scanner support state
  const [isScannerListening, setIsScannerListening] = useState(true);
  const scanBuffer = useRef<string>('');
  const lastKeyTime = useRef<number>(0);

  // Notifications List
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // System success and error alert banners
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Sound generator
  const playBeep = (freq = 800, dur = 120) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur / 1000);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + dur / 1000);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  };

  // Check session on mount
  useEffect(() => {
    const adminSession = localStorage.getItem('zamlux_admin_session');
    const savedRole = localStorage.getItem('zamlux_admin_role');
    const savedLimit = localStorage.getItem('zamlux_low_stock_limit');
    if (savedLimit) {
      setLowStockLimit(parseInt(savedLimit, 10));
    }
    if (adminSession === 'active' && savedRole) {
      // If there is already an active user session in Auth, we can use it directly without re-auth
      if (auth.currentUser) {
        setIsLoggedIn(true);
        setUserRole(savedRole as 'Admin' | 'Employee');
        return;
      }

      // Silently authenticate with Firebase Auth to ensure real-time Firestore access works
      const runAuth = async () => {
        const adminEmail = 'm20850610@gmail.com';
        const pw1 = '6f1e9c9CCC.';
        const pw2 = '6f1e9c9CCC';
        try {
          await signInWithEmailAndPassword(auth, adminEmail, pw1);
          setIsLoggedIn(true);
          setUserRole(savedRole as 'Admin' | 'Employee');
        } catch {
          try {
            await signInWithEmailAndPassword(auth, adminEmail, pw2);
            setIsLoggedIn(true);
            setUserRole(savedRole as 'Admin' | 'Employee');
          } catch {
            try {
              // Auto-create the admin user in Firebase Auth if they don't exist yet
              await createUserWithEmailAndPassword(auth, adminEmail, pw1);
              setIsLoggedIn(true);
              setUserRole(savedRole as 'Admin' | 'Employee');
            } catch (err) {
              console.warn("Background admin auth and registration skipped/failed:", err);
              // Fallback: don't block user interface in case of dev/offline environment, but we warn
              setIsLoggedIn(true);
              setUserRole(savedRole as 'Admin' | 'Employee');
            }
          }
        }
      };
      runAuth();
    }
  }, []);

  // Sync real-time orders and history
  useEffect(() => {
    if (!isLoggedIn) return;

    // Listen to orders
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const fetchedOrders: Order[] = [];
      snapshot.forEach(docSnap => {
        fetchedOrders.push({ id: docSnap.id, ...docSnap.data() } as any);
      });
      setOrders(fetchedOrders);
    }, (error) => {
      console.warn("Error listening to orders in AdminPage (non-blocking fallback active):", error);
    });

    // Listen to stock history
    const qHist = query(collection(db, 'stock_history'), orderBy('createdAt', 'desc'));
    const unsubHist = onSnapshot(qHist, (snapshot) => {
      const fetchedHist: StockHistoryEntry[] = [];
      snapshot.forEach(docSnap => {
        fetchedHist.push({ id: docSnap.id, ...docSnap.data() } as any);
      });
      setStockHistory(fetchedHist);
    }, (error) => {
      console.warn("Error listening to stock history in AdminPage:", error);
    });

    return () => {
      unsubOrders();
      unsubHist();
    };
  }, [isLoggedIn]);

  // Handle auto notifications from inventory levels
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const newNotifications: Notification[] = [];
    let idCounter = 1;

    // Check low stock
    ALL_VARIANTS.forEach(v => {
      const stockVal = stock[`${v.productId}_${v.color}_${v.length}`] ?? v.defaultStock;
      if (stockVal === 0) {
        newNotifications.push({
          id: `notif_out_${idCounter++}`,
          title: locale === 'ru' ? '🚨 КРИТИЧЕСКИЙ: Оповещение о запасах' : locale === 'en' ? '🚨 CRITICAL: Stock Alarm' : '🚨 CRITICAL: Bestandsalarm',
          message: locale === 'ru' 
            ? `${v.productName} (${getLocalizedColor(v.color)}, ${v.length}м) полностью распродан!` 
            : locale === 'en' 
              ? `${v.productName} (${getLocalizedColor(v.color)}, ${v.length}m) is completely out of stock!` 
              : `${v.productName} (${v.color}, ${v.length}m) ist vollständig ausverkauft!`,
          type: 'warning',
          time: locale === 'ru' ? 'Сейчас' : locale === 'en' ? 'Now' : 'Jetzt'
        });
      } else if (stockVal < lowStockLimit) {
        newNotifications.push({
          id: `notif_low_${idCounter++}`,
          title: locale === 'ru' ? '⚠️ Предупреждение: Низкий запас' : locale === 'en' ? '⚠️ Warning: Low Stock' : '⚠️ Warnung: Niedriger Bestand',
          message: locale === 'ru' 
            ? `${v.productName} (${getLocalizedColor(v.color)}, ${v.length}м) осталось всего ${stockVal} шт.` 
            : locale === 'en' 
              ? `${v.productName} (${getLocalizedColor(v.color)}, ${v.length}m) has only ${stockVal} pcs left.` 
              : `${v.productName} (${v.color}, ${v.length}m) hat nur noch ${stockVal} Stück auf Lager.`,
          type: 'info',
          time: locale === 'ru' ? 'Сейчас' : locale === 'en' ? 'Now' : 'Jetzt'
        });
      }
    });

    setNotifications(newNotifications);
  }, [stock, lowStockLimit, isLoggedIn, locale]);

  // Setup Global Barcode Keyboard Listener
  useEffect(() => {
    if (!isLoggedIn || !isScannerListening) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      
      // If interval between keys is short (<50ms), it's probably a hardware scanner typing
      if (currentTime - lastKeyTime.current > 50) {
        scanBuffer.current = '';
      }
      
      lastKeyTime.current = currentTime;

      if (e.key === 'Enter') {
        if (scanBuffer.current.length >= 8) {
          const barcode = scanBuffer.current.trim();
          handleBarcodeScanned(barcode);
          scanBuffer.current = '';
        }
      } else if (/^\d$/.test(e.key)) {
        scanBuffer.current += e.key;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isLoggedIn, isScannerListening]);

  // Process a successfully scanned barcode
  const handleBarcodeScanned = (ean: string) => {
    playBeep(1200, 150);
    setBarcodeSearch(ean);
    setSearchQuery(ean);
    setActiveTab('inventory');
    
    // Check which variant has this EAN/GTIN
    const matched = ALL_VARIANTS.find(v => v.gtin === ean);
    if (matched) {
      showSuccess(t('barcode_scanned', { name: matched.productName, color: getLocalizedColor(matched.color) }));
      // Highlight or open editor
      const currentStock = stock[`${matched.productId}_${matched.color}_${matched.length}`] ?? matched.defaultStock;
      const currentSold = sold[`${matched.productId}_${matched.color}_${matched.length}`] ?? 0;
      setEditingVariant({
        productId: matched.productId,
        color: matched.color,
        length: matched.length,
        currentStock,
        currentSold
      });
      setNewStockVal(String(currentStock));
      setNewSoldVal(String(currentSold));
      setEditReason('Restock');
    } else {
      showError(t('barcode_not_found', { ean }));
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorBanner(msg);
    setTimeout(() => setErrorBanner(null), 5000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const isAdminEmail = cleanEmail === 'm20850610@gmail.com' || cleanEmail === 'a10062085@gmail.com';
    if (isAdminEmail && (cleanPassword === '6f1e9c9CCC.' || cleanPassword === '6f1e9c9CCC')) {
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      } catch (authErr: any) {
        console.warn("Auth sign-in failed, trying to auto-create user in Auth:", authErr);
        try {
          await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        } catch (createErr: any) {
          console.warn("Firebase Auth creation failed:", createErr);
        }
      }

      setIsLoggedIn(true);
      setUserRole('Admin');
      localStorage.setItem('zamlux_admin_session', 'active');
      localStorage.setItem('zamlux_admin_role', 'Admin');
      setError('');
      playBeep(900, 150);
    } else {
      setError(t('wrong_password'));
      playBeep(300, 300);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error("Error signing out from auth:", err);
    }
    setIsLoggedIn(false);
    setUserRole(null);
    localStorage.removeItem('zamlux_admin_session');
    localStorage.removeItem('zamlux_admin_role');
  };

  // Setup list of 8 variants
  const ALL_VARIANTS = [
    { productId: 'p1', productName: 'H07RN-F 3G1.5mm²', color: 'Schwarz' as const, length: 50, gtin: '4270004984279', sku: 'ZAM-H07-3G15-B50', defaultStock: 75 },
    { productId: 'p1', productName: 'H07RN-F 3G1.5mm²', color: 'Schwarz' as const, length: 100, gtin: '4270004984279', sku: 'ZAM-H07-3G15-B100', defaultStock: 75 },
    { productId: 'p1', productName: 'H07RN-F 3G1.5mm²', color: 'Orange' as const, length: 50, gtin: '4270004984279-O50', sku: 'ZAM-H07-3G15-O50', defaultStock: 50 },
    { productId: 'p1', productName: 'H07RN-F 3G1.5mm²', color: 'Orange' as const, length: 100, gtin: '4270004984279-O100', sku: 'ZAM-H07-3G15-O100', defaultStock: 50 },
    { productId: 'p2', productName: 'H07RN-F 3G2.5mm²', color: 'Schwarz' as const, length: 100, gtin: '4270004984286', sku: 'ZAM-H07-3G25-B100', defaultStock: 120 },
    { productId: 'p2', productName: 'H07RN-F 3G2.5mm²', color: 'Orange' as const, length: 100, gtin: '4270004984286-O100', sku: 'ZAM-H07-3G25-O100', defaultStock: 80 },
    { productId: 'p3', productName: 'H07RN-F 5G2.5mm²', color: 'Schwarz' as const, length: 100, gtin: '4270004984293', sku: 'ZAM-H07-5G25-B100', defaultStock: 85 },
    { productId: 'p3', productName: 'H07RN-F 5G2.5mm²', color: 'Orange' as const, length: 100, gtin: '4270004984293-O100', sku: 'ZAM-H07-5G25-O100', defaultStock: 50 },
  ];

  // Calculated Stats
  const totalProductsCount = PRODUCTS.length;
  
  // Total physical stock across all variants
  const totalPhysicalStock = ALL_VARIANTS.reduce((sum, v) => sum + (stock[`${v.productId}_${v.color}_${v.length}`] ?? v.defaultStock), 0);
  
  // Total stock value
  const totalStockValue = ALL_VARIANTS.reduce((sum, v) => {
    const stockVal = stock[`${v.productId}_${v.color}_${v.length}`] ?? v.defaultStock;
    // Find variant price
    const prod = PRODUCTS.find(p => p.id === v.productId);
    const lenData = prod?.availableLengths.find(l => l.length === v.length);
    const price = lenData?.price ?? 0;
    return sum + (stockVal * price);
  }, 0);

  // Today vs Month Sales
  const today = new Date();
  today.setHours(0,0,0,0);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const todayOrders = orders.filter(o => {
    if (!o.createdAt) return false;
    const date = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
    return date >= today && o.status !== 'cancelled';
  });

  const monthOrders = orders.filter(o => {
    if (!o.createdAt) return false;
    const date = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
    return date >= startOfMonth && o.status !== 'cancelled';
  });

  const todaySalesVal = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const monthSalesVal = monthOrders.reduce((sum, o) => sum + o.total, 0);

  const lowStockCount = ALL_VARIANTS.filter(v => {
    const stockVal = stock[`${v.productId}_${v.color}_${v.length}`] ?? v.defaultStock;
    return stockVal > 0 && stockVal < lowStockLimit;
  }).length;

  const outOfStockCount = ALL_VARIANTS.filter(v => {
    const stockVal = stock[`${v.productId}_${v.color}_${v.length}`] ?? v.defaultStock;
    return stockVal === 0;
  }).length;

  // Save manual stock changes
  const saveVariantEdit = async () => {
    if (!editingVariant) return;
    setIsSaving(true);
    try {
      const stockInt = parseInt(newStockVal, 10);
      const soldInt = parseInt(newSoldVal, 10);

      if (isNaN(stockInt) || stockInt < 0 || isNaN(soldInt) || soldInt < 0) {
        showError(t('invalid_stock_values'));
        setIsSaving(false);
        return;
      }

      // Keep original role terminology for db stability but user role in human-readable localized format
      const userLabel = userRole === 'Admin' 
        ? (locale === 'ru' ? 'Администратор' : locale === 'en' ? 'Administrator' : 'Administrator')
        : (locale === 'ru' ? 'Сотрудник' : locale === 'en' ? 'Employee' : 'Mitarbeiter');

      await updateStock(
        editingVariant.productId,
        editingVariant.color,
        editingVariant.length,
        stockInt,
        soldInt,
        editReason,
        `${userLabel} (${userRole})`
      );

      const locReason = locale === 'ru' 
        ? (editReason === 'Manual Update' ? 'Ручная корректировка' : editReason === 'Restock' ? 'Поставка' : 'Возврат') 
        : editReason;

      showSuccess(t('stock_update_success', { reason: locReason }));
      setEditingVariant(null);
    } catch (e) {
      showError(t('stock_update_error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel order & restore stock
  const cancelOrderAndRestore = async (order: Order) => {
    if (userRole !== 'Admin') {
      showError(t('only_admins_can_cancel'));
      return;
    }

    if (order.status === 'cancelled') {
      showError(t('order_already_cancelled'));
      return;
    }

    const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
    if (!window.confirm(t('order_cancel_confirm', { orderNumber: order.orderNumber, qty: totalQty }))) {
      return;
    }

    setIsSaving(true);
    try {
      // Restore stock for each item
      for (const item of order.items) {
        const colorVal = (item.color as any) || 'Schwarz';
        const key = `${item.productId}_${colorVal}_${item.length}`;
        const currentStockVal = stock[key] ?? (item.productId === 'p1' ? (colorVal === 'Schwarz' ? 75 : 50) : item.productId === 'p2' ? (colorVal === 'Schwarz' ? 120 : 80) : (colorVal === 'Schwarz' ? 85 : 50));
        const currentSoldVal = sold[key] ?? 0;

        await updateStock(
          item.productId,
          colorVal,
          item.length,
          currentStockVal + item.quantity,
          Math.max(0, currentSoldVal - item.quantity),
          'Return',
          `System (Cancellation #${order.orderNumber})`
        );
      }

      // Update order status to cancelled
      await setDoc(doc(db, 'orders', order.id), { status: 'cancelled' }, { merge: true });

      showSuccess(t('order_cancel_success', { orderNumber: order.orderNumber }));
      setSelectedOrder(null);
    } catch (e) {
      showError(t('order_cancel_error'));
    } finally {
      setIsSaving(false);
    }
  };

  // CSV Exporter
  const exportToCSV = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      if (locale === 'ru') {
        csvContent += "SKU,Товар,Цвет,Длина,EAN,Запас,Продано,Статус\n";
      } else if (locale === 'en') {
        csvContent += "SKU,Product,Color,Length,EAN,Stock,Sold,Status\n";
      } else {
        csvContent += "SKU,Produkt,Farbe,Laenge,EAN,Lagerbestand,Verkauft,Status\n";
      }

      ALL_VARIANTS.forEach(v => {
        const stockVal = stock[`${v.productId}_${v.color}_${v.length}`] ?? v.defaultStock;
        const soldVal = sold[`${v.productId}_${v.color}_${v.length}`] ?? 0;
        
        let status = '';
        if (stockVal === 0) {
          status = t('status_out');
        } else if (stockVal < lowStockLimit) {
          status = t('status_low');
        } else {
          status = t('status_healthy');
        }
        
        const locColor = getLocalizedColor(v.color);
        csvContent += `"${v.sku}","${v.productName}","${locColor}",${v.length},"${v.gtin}",${stockVal},${soldVal},"${status}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `zamluxury_inventory_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess(t('export_success'));
    } catch (e) {
      showError(t('export_error'));
    }
  };

  // Drag & Drop File CSV parsing
  const handleCSVImport = (file: File) => {
    setImportStatus(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        let updateCount = 0;

        // Skip headers, process lines
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Simple comma or semicolon splitter
          const parts = line.split(/[,;]/);
          if (parts.length < 6) continue;

          // Expect: SKU, Name, Color, Length, EAN, Stock
          const sku = parts[0].replace(/"/g, '').trim();
          const stockStr = parts[5].replace(/"/g, '').trim();
          const stockNum = parseInt(stockStr, 10);

          if (isNaN(stockNum)) continue;

          // Find matching variant
          const matched = ALL_VARIANTS.find(v => v.sku === sku || v.gtin === sku);
          if (matched) {
            await updateStock(
              matched.productId,
              matched.color,
              matched.length,
              stockNum,
              sold[`${matched.productId}_${matched.color}_${matched.length}`] ?? 0,
              'Restock',
              `System (Bulk CSV Import - ${file.name})`
            );
            updateCount++;
          }
        }

        if (updateCount > 0) {
          showSuccess(t('import_success', { count: updateCount }));
          setImportStatus({ success: true, msg: t('import_success_msg', { count: updateCount }) });
        } else {
          showError(t('import_error'));
          setImportStatus({ success: false, msg: t('import_error_msg') });
        }
      } catch (err) {
        showError(t('import_read_error'));
        setImportStatus({ success: false, msg: t('import_format_error') });
      }
    };
    reader.readAsText(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        handleCSVImport(file);
      } else {
        showError(t('import_invalid_file'));
      }
    }
  };

  const handleManualFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleCSVImport(files[0]);
    }
  };

  // Helper to format timestamps gracefully based on language
  const formatTime = (firebaseTimestamp: any) => {
    return formatAdminDate(locale, firebaseTimestamp);
  };

  // Filter and search logic on variants list
  const filteredVariants = ALL_VARIANTS.filter(v => {
    const stockVal = stock[`${v.productId}_${v.color}_${v.length}`] ?? v.defaultStock;
    
    // Search query matches SKU, EAN, Name or Color
    const matchesSearch = 
      v.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.gtin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getLocalizedColor(v.color).toLowerCase().includes(searchQuery.toLowerCase());

    // Category Filter (p1, p2, p3)
    const matchesCategory = filterCategory === 'All' || v.productId === filterCategory;

    // Stock Status filter
    let matchesStatus = true;
    if (filterStockStatus === 'Low') {
      matchesStatus = stockVal > 0 && stockVal < lowStockLimit;
    } else if (filterStockStatus === 'OutOfStock') {
      matchesStatus = stockVal === 0;
    } else if (filterStockStatus === 'Healthy') {
      matchesStatus = stockVal >= lowStockLimit;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (!isLoggedIn) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center p-4 bg-[#0B1220] text-white">
        <div className="w-full max-w-md bg-[#101828] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-[-30%] left-[-20%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[90px] pointer-events-none" />
          
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-blue-600/15 border border-blue-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <ShieldCheck className="text-blue-500 w-8 h-8" />
            </div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white">{t('wms_title')}</h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1 uppercase tracking-widest font-bold">{t('erp_subtitle')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-3">
              <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 block mb-1">
                E-Mail & Passwort
              </label>
              
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="E-Mail"
                className="w-full h-12 px-4 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all font-medium text-sm"
                required
              />

              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t('password_placeholder')}
                className="w-full h-12 px-4 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all font-medium text-sm"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2 font-semibold">
                <AlertTriangle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
            >
              {t('btn_login')}
            </button>
          </form>

          <button
            onClick={onClose}
            className="w-full h-11 border border-white/10 hover:bg-white/5 text-slate-300 rounded-xl font-black uppercase tracking-widest text-[10px] mt-3 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft size={12} />
            {t('btn_back_to_shop')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white pb-16">
      
      {/* Dynamic Alerts Banner */}
      {successBanner && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-green-500/90 backdrop-blur border border-green-500 text-white text-xs md:text-sm rounded-xl flex items-center gap-3 font-bold shadow-2xl animate-fade-in max-w-md">
          <CheckCircle size={18} />
          <span>{successBanner}</span>
        </div>
      )}
      {errorBanner && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-red-500/90 backdrop-blur border border-red-500 text-white text-xs md:text-sm rounded-xl flex items-center gap-3 font-bold shadow-2xl animate-fade-in max-w-md">
          <AlertTriangle size={18} />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Header Container */}
      <div className="border-b border-white/5 bg-[#101828]/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/30 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-blue-500 w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-black uppercase tracking-wider text-white">ZAMLUXURY WMS / ERP</h1>
                <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded ${userRole === 'Admin' ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400' : 'bg-orange-500/20 border border-orange-500/30 text-orange-400'}`}>
                  {userRole === 'Admin' ? t('user_role_admin') : t('user_role_employee')}
                </span>
              </div>
              <p className="text-slate-400 text-[10px] md:text-xs mt-0.5 uppercase tracking-widest font-semibold">{t('secure_access')}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Language Selector */}
            <div className="flex bg-slate-900 border border-white/5 rounded-lg p-0.5 text-xs text-slate-400 items-center h-9" title={t('lang_switcher')}>
              <Globe size={11} className="text-slate-500 ml-2 mr-1" />
              <select
                value={locale}
                onChange={e => {
                  const newLoc = e.target.value as AdminLocale;
                  setLocale(newLoc);
                  localStorage.setItem('zamlux_admin_locale', newLoc);
                  playBeep(900, 100);
                }}
                className="bg-transparent text-white font-black text-[9px] uppercase tracking-wider px-2 py-1 focus:outline-none cursor-pointer appearance-none pr-5 relative"
                style={{ 
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8' fill='none' stroke='white' stroke-width='1.5'><path d='M1 2.5L4 5.5L7 2.5'/></svg>")`, 
                  backgroundRepeat: 'no-repeat', 
                  backgroundPosition: 'right 4px center' 
                }}
              >
                <option value="ru" className="bg-[#101828] text-white">RU (По умолчанию)</option>
                <option value="de" className="bg-[#101828] text-white">DE (Deutsch)</option>
                <option value="en" className="bg-[#101828] text-white">EN (English)</option>
              </select>
            </div>

            <div className="flex bg-slate-900 border border-white/5 rounded-lg p-0.5 text-xs text-slate-400">
              <button 
                onClick={() => { setIsScannerListening(!isScannerListening); playBeep(800, 80); }}
                className={`px-3 py-1.5 rounded-md font-bold uppercase tracking-widest text-[9px] flex items-center gap-1.5 transition-all ${isScannerListening ? 'bg-blue-600 text-white' : 'hover:text-white'}`}
                title="Simulates and listens for hardware keyboard EAN scanners"
              >
                <Barcode size={10} />
                <span>{isScannerListening ? t('scanner_active') : t('scanner_silent')}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="h-9 px-4 border border-white/10 hover:bg-white/5 text-slate-300 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft size={10} />
              {t('shop_view')}
            </button>
            <button
              onClick={handleLogout}
              className="h-9 px-4 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all cursor-pointer"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Navigation Sidebar & Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Navigation Sub-Menu Rail */}
          <div className="lg:col-span-3 bg-[#101828] border border-white/10 rounded-2xl p-4 space-y-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-3 mb-3">{t('main_menu')}</span>
            {[
              { id: 'dashboard', label: t('tab_dashboard'), icon: ShieldCheck },
              { id: 'inventory', label: t('tab_inventory'), icon: Archive },
              { id: 'orders', label: t('tab_orders'), icon: ShoppingBag },
              { id: 'history', label: t('tab_history'), icon: FileText },
              { id: 'stats', label: t('tab_stats'), icon: BarChart2 },
              { id: 'settings', label: t('tab_settings'), icon: Settings },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); playBeep(900, 60); }}
                  className={`w-full h-11 px-3 rounded-xl font-black uppercase tracking-wider text-[10px] flex items-center gap-3 transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/15' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Icon size={14} className={isActive ? 'text-white' : 'text-slate-500'} />
                  <span>{tab.label}</span>
                  {tab.id === 'inventory' && lowStockCount + outOfStockCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                      {lowStockCount + outOfStockCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Main Workspace Frame */}
          <div className="lg:col-span-9 space-y-6">

            {/* TAB 1: DASHBOARD WORKSPACE */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Statistics Cards Ribbon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  <div className="bg-[#101828] border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-xl">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block">{t('stat_total_value')}</span>
                      <div className="text-xl font-black text-white">
                        {formatCurrency(totalStockValue)}
                      </div>
                      <span className="text-[8px] text-slate-500 block">{t('stat_variants_count', { count: totalPhysicalStock })}</span>
                    </div>
                    <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center justify-center">
                      <DollarSign size={18} />
                    </div>
                  </div>

                  <div className="bg-[#101828] border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-xl">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block">{t('stat_revenue_today')}</span>
                      <div className="text-xl font-black text-white">
                        {formatCurrency(todaySalesVal)}
                      </div>
                      <span className="text-[8px] text-blue-400 font-bold block">{t('stat_orders_today', { count: todayOrders.length })}</span>
                    </div>
                    <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center animate-pulse">
                      <TrendingUp size={18} />
                    </div>
                  </div>

                  <div className="bg-[#101828] border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-xl">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block">{t('stat_low_stock')}</span>
                      <div className="text-xl font-black text-orange-400">
                        {lowStockCount} {t('unit_pcs')}
                      </div>
                      <span className="text-[8px] text-slate-500 block">{t('stat_low_stock_limit', { limit: lowStockLimit })}</span>
                    </div>
                    <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center">
                      <AlertTriangle size={18} />
                    </div>
                  </div>

                  <div className="bg-[#101828] border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-xl">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block">{t('stat_out_of_stock')}</span>
                      <div className="text-xl font-black text-red-500">
                        {outOfStockCount} {t('unit_pcs')}
                      </div>
                      <span className="text-[8px] text-slate-500 block">{t('stat_restock_now')}</span>
                    </div>
                    <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center justify-center">
                      <Trash2 size={18} />
                    </div>
                  </div>

                </div>

                {/* Dashboard Alarm Center & Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left Column: Alarms and Quick Restock */}
                  <div className="bg-[#101828] border border-white/10 rounded-2xl p-5 md:p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <Bell className="text-red-500 w-4.5 h-4.5 animate-bounce" />
                        <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-white">{t('critical_alarms', { limit: lowStockLimit })}</h2>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-[8px] font-black text-red-400 uppercase tracking-widest">{t('action_required')}</span>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {ALL_VARIANTS.filter(v => {
                        const sVal = stock[`${v.productId}_${v.color}_${v.length}`] ?? v.defaultStock;
                        return sVal < lowStockLimit;
                      }).length === 0 ? (
                        <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-white/5 space-y-2">
                          <CheckCircle className="text-green-500 mx-auto" size={24} />
                          <p className="text-slate-300 text-xs font-black uppercase tracking-wider">{t('everything_healthy')}</p>
                          <p className="text-slate-500 text-[10px]">{t('no_low_stock_currently')}</p>
                        </div>
                      ) : (
                        ALL_VARIANTS.filter(v => {
                          const sVal = stock[`${v.productId}_${v.color}_${v.length}`] ?? v.defaultStock;
                          return sVal < lowStockLimit;
                        }).map(v => {
                          const sVal = stock[`${v.productId}_${v.color}_${v.length}`] ?? v.defaultStock;
                          return (
                            <div key={v.sku} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-between gap-4">
                              <div>
                                <h3 className="text-xs font-black text-white uppercase">{v.productName}</h3>
                                <p className="text-[9px] text-slate-400 mt-0.5">{getLocalizedColor(v.color)} &bull; {v.length}м &bull; SKU: {v.sku}</p>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded ${sVal === 0 ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-400'}`}>
                                    {t('col_stock_level')}: {sVal}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={async () => {
                                  await updateStock(v.productId, v.color, v.length, sVal + 10, sold[`${v.productId}_${v.color}_${v.length}`] ?? 0, 'Restock', 'System Schnellbuchung');
                                  showSuccess(t('stock_update_success', { reason: locale === 'ru' ? 'Быстрое пополнение' : 'Quick Restock' }));
                                }}
                                className="h-8 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black text-[9px] uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Plus size={10} />
                                <span>{t('btn_restock_ten')}</span>
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right Column: Real-time System Log Feed */}
                  <div className="bg-[#101828] border border-white/10 rounded-2xl p-5 md:p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="text-blue-500 w-4.5 h-4.5" />
                        <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-white">{t('latest_activities')}</h2>
                      </div>
                      <button 
                        onClick={() => setActiveTab('history')}
                        className="text-[8px] font-black text-blue-400 hover:underline uppercase tracking-widest flex items-center gap-1"
                      >
                        {t('btn_all_logs')} <ChevronRight size={10} />
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {stockHistory.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-xs">
                          {t('no_logs_yet')}
                        </div>
                      ) : (
                        stockHistory.slice(0, 5).map(log => {
                          const isPositive = log.changeQuantity > 0;
                          return (
                            <div key={log.id} className="p-3 bg-[#0B1220] rounded-xl border border-white/5 flex items-start justify-between gap-3 text-xs">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded ${
                                    log.reason === 'Sale' ? 'bg-blue-600/10 text-blue-400' :
                                    log.reason === 'Restock' ? 'bg-green-600/10 text-green-400' : 'bg-yellow-600/10 text-yellow-400'
                                  }`}>
                                    {log.reason === 'Sale' ? t('log_sale') : log.reason === 'Restock' ? t('log_restock') : log.reason === 'Return' ? t('log_return') : log.reason === 'Manual Update' ? t('reason_manual') : log.reason}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-bold">{formatTime(log.createdAt)}</span>
                                </div>
                                <p className="text-[10px] text-slate-300 font-bold mt-1">
                                  {PRODUCTS.find(p => p.id === log.productId)?.name || log.productId} ({getLocalizedColor(log.color)}, {log.length}м)
                                </p>
                                <p className="text-[9px] text-slate-500">{t('changed_by')} {log.user}</p>
                              </div>

                              <span className={`text-xs font-black shrink-0 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                {isPositive ? '+' : ''}{log.changeQuantity}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>

                {/* Simulated Barcode Trigger Playground */}
                <div className="bg-[#101828] border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-[-30%] right-[-10%] w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                    <div>
                      <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                        <Barcode className="text-blue-500" size={16} /> {t('scanner_simulator')}
                      </h2>
                      <p className="text-[10px] text-slate-400 mt-1">{t('scanner_sim_subtitle')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                    {ALL_VARIANTS.map(v => (
                      <button
                        key={v.sku}
                        onClick={() => handleBarcodeScanned(v.gtin)}
                        className="bg-slate-900 hover:bg-slate-850 border border-white/10 hover:border-blue-500 p-2.5 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[90px]"
                      >
                        <Barcode size={16} className="text-slate-400 mb-1" />
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight block truncate w-full">{v.productName.split(' ')[1]}</span>
                        <span className="text-[8px] font-black text-blue-400 block mt-1">{getLocalizedColor(v.color) === 'Черный' ? 'SW/Ч' : 'OR/О'} {v.length}м</span>
                        <span className="bg-blue-500/10 text-blue-500 px-1 py-0.5 text-[7px] font-black uppercase rounded mt-1.5 w-full block truncate">{t('scan_btn_label', { sku: v.sku.split('-').pop() || '' })}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: INVENTORY LIST & SEARCH */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                
                {/* Search and Filters Strip */}
                <div className="bg-[#101828] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex flex-col md:flex-row gap-3">
                    
                    {/* Search bar */}
                    <div className="flex-1 relative">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs font-medium focus:border-blue-500 focus:outline-none"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white font-black text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Filter Category */}
                    <div className="w-full md:w-48 relative">
                      <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="w-full h-11 px-3 bg-slate-900 border border-white/10 rounded-xl text-white text-xs font-medium focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="All">{t('filter_all_types')}</option>
                        <option value="p1">{t('filter_cable_3g15')}</option>
                        <option value="p2">{t('filter_cable_3g25')}</option>
                        <option value="p3">{t('filter_cable_5g25')}</option>
                      </select>
                    </div>

                    {/* Filter Stock Level */}
                    <div className="w-full md:w-48 relative">
                      <select
                        value={filterStockStatus}
                        onChange={e => setFilterStockStatus(e.target.value)}
                        className="w-full h-11 px-3 bg-slate-900 border border-white/10 rounded-xl text-white text-xs font-medium focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="All">{t('filter_all_stock')}</option>
                        <option value="Healthy">{t('filter_stock_healthy')}</option>
                        <option value="Low">{t('filter_stock_low')}</option>
                        <option value="OutOfStock">{t('filter_stock_out')}</option>
                      </select>
                    </div>

                  </div>
                </div>

                {/* Variants Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredVariants.length === 0 ? (
                    <div className="col-span-2 bg-[#101828] border border-white/10 rounded-2xl p-12 text-center text-slate-400 text-xs">
                      {t('no_variants_found')}
                    </div>
                  ) : (
                    filteredVariants.map(v => {
                      const stockKey = `${v.productId}_${v.color}_${v.length}`;
                      const stockVal = stock[stockKey] ?? v.defaultStock;
                      const soldVal = sold[stockKey] ?? 0;

                      let stockBadgeColor = "bg-green-500/15 border-green-500/30 text-green-400";
                      let stockBadgeText = t('status_healthy');
                      if (stockVal === 0) {
                        stockBadgeColor = "bg-red-500/15 border-red-500/30 text-red-400";
                        stockBadgeText = t('status_out');
                      } else if (stockVal < lowStockLimit) {
                        stockBadgeColor = "bg-orange-500/15 border-orange-500/30 text-orange-400";
                        stockBadgeText = t('status_low');
                      }

                      return (
                        <div 
                          key={v.sku}
                          className={`bg-[#101828] border rounded-2xl p-5 space-y-4 shadow-xl transition-all ${
                            stockVal === 0 ? 'border-red-500/25 bg-red-950/5' : stockVal < lowStockLimit ? 'border-orange-500/25 bg-orange-950/5' : 'border-white/10'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{v.sku}</span>
                              <h3 className="text-sm font-black text-white uppercase mt-0.5">{v.productName}</h3>
                              <p className="text-[10px] text-slate-400 font-bold mt-1">{t('property_color')} {getLocalizedColor(v.color)} &bull; {t('property_length')} {v.length}м</p>
                            </div>

                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded border ${stockBadgeColor}`}>
                              {stockBadgeText}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 bg-[#0B1220]/50 p-3 rounded-xl border border-white/5">
                            <div>
                              <span className="text-[8px] text-slate-400 font-black uppercase block">{t('col_stock_level')}</span>
                              <span className="text-base font-black text-white">{stockVal} {t('unit_pcs')}</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-400 font-black uppercase block">{t('col_sold_level')}</span>
                              <span className="text-base font-black text-blue-400">{soldVal} {t('unit_pcs')}</span>
                            </div>
                          </div>

                          <div className="text-[9px] text-slate-500 flex items-center gap-1">
                            <Barcode size={12} />
                            <span>EAN/GTIN: {v.gtin}</span>
                          </div>

                          <button
                            onClick={() => {
                              setEditingVariant({
                                productId: v.productId,
                                color: v.color,
                                length: v.length,
                                currentStock: stockVal,
                                currentSold: soldVal
                              });
                              setNewStockVal(String(stockVal));
                              setNewSoldVal(String(soldVal));
                              setEditReason('Manual Update');
                              playBeep(900, 80);
                            }}
                            className="w-full h-9 bg-slate-900 border border-white/10 hover:border-blue-500 hover:text-white text-slate-300 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
                          >
                            <Settings size={12} />
                            <span>{t('btn_edit_qty')}</span>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Secure Edit Variant Overlay (Modal) */}
                {editingVariant && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[#101828] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-5 relative">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="text-blue-500 w-5 h-5" />
                          <h3 className="text-xs md:text-sm font-black uppercase tracking-wider text-white">{t('modal_edit_title')}</h3>
                        </div>
                        <button 
                          onClick={() => setEditingVariant(null)}
                          className="text-slate-500 hover:text-white font-black"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="p-3.5 bg-slate-900/60 border border-white/5 rounded-xl text-xs space-y-1">
                        <p className="font-bold text-white uppercase">
                          {PRODUCTS.find(p => p.id === editingVariant.productId)?.name || editingVariant.productId}
                        </p>
                        <p className="text-slate-400">{t('tbl_variant')}: {getLocalizedColor(editingVariant.color)} &bull; {editingVariant.length}м</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">{t('modal_field_stock')}</label>
                          <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl p-1.5 justify-between">
                            <button
                              type="button"
                              onClick={() => setNewStockVal(prev => String(Math.max(0, parseInt(prev || '0', 10) - 1)))}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
                            >
                              <Minus size={12} />
                            </button>
                            <input
                              type="text"
                              value={newStockVal}
                              onChange={e => setNewStockVal(e.target.value.replace(/\D/g, ''))}
                              className="w-12 text-center bg-transparent text-white font-black text-sm border-none focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setNewStockVal(prev => String(parseInt(prev || '0', 10) + 1))}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">{t('modal_field_sold')}</label>
                          <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl p-1.5 justify-between">
                            <button
                              type="button"
                              onClick={() => setNewSoldVal(prev => String(Math.max(0, parseInt(prev || '0', 10) - 1)))}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
                            >
                              <Minus size={12} />
                            </button>
                            <input
                              type="text"
                              value={newSoldVal}
                              onChange={e => setNewSoldVal(e.target.value.replace(/\D/g, ''))}
                              className="w-12 text-center bg-transparent text-blue-400 font-black text-sm border-none focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setNewSoldVal(prev => String(parseInt(prev || '0', 10) + 1))}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">{t('modal_field_reason')}</label>
                        <select
                          value={editReason}
                          onChange={e => setEditReason(e.target.value)}
                          className="w-full h-10 px-3 bg-slate-900 border border-white/10 rounded-xl text-white text-xs font-bold focus:border-blue-500 focus:outline-none"
                        >
                          <option value="Manual Update">{t('reason_manual')}</option>
                          <option value="Restock">{t('reason_restock')}</option>
                          <option value="Return">{t('reason_return')}</option>
                        </select>
                      </div>

                      <div className="bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-xl text-[9px] text-yellow-400 font-bold leading-relaxed">
                        {t('modal_warning_audit')}
                      </div>

                      <div className="flex gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingVariant(null)}
                          className="flex-1 h-10 border border-white/10 hover:bg-white/5 text-slate-300 rounded-xl font-black uppercase tracking-widest text-[9px]"
                        >
                          {t('btn_cancel')}
                        </button>
                        <button
                          type="button"
                          onClick={saveVariantEdit}
                          disabled={isSaving}
                          className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                          {t('btn_save')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 3: ORDERS & CANCEL INTEGRATION */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                
                {/* Orders Panel Description */}
                <div className="bg-[#101828] border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-wider text-white">{t('orders_title')}</h2>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t('orders_subtitle')}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300 border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                          <th className="py-3 px-2">{t('tbl_order_number')}</th>
                          <th className="py-3 px-2">{t('tbl_date')}</th>
                          <th className="py-3 px-2">{t('tbl_customer')}</th>
                          <th className="py-3 px-2">{t('tbl_qty')}</th>
                          <th className="py-3 px-2">{t('tbl_total')}</th>
                          <th className="py-3 px-2">{t('tbl_status')}</th>
                          <th className="py-3 px-2 text-right">{t('tbl_action')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-500">
                              {t('no_orders_yet')}
                            </td>
                          </tr>
                        ) : (
                          orders.map(o => {
                            const totalQty = o.items.reduce((sum, item) => sum + item.quantity, 0);
                            return (
                              <tr key={o.id} className="hover:bg-white/5 transition-colors">
                                <td className="py-3.5 px-2 font-black text-white">{o.orderNumber}</td>
                                <td className="py-3.5 px-2 text-slate-400">{formatTime(o.createdAt)}</td>
                                <td className="py-3.5 px-2 font-bold text-slate-200">
                                  {o.customer.vorname} {o.customer.nachname}
                                </td>
                                <td className="py-3.5 px-2 font-bold">{totalQty} {locale === 'ru' ? 'катушка(и)' : locale === 'en' ? 'reel(s)' : 'Trommel(n)'}</td>
                                <td className="py-3.5 px-2 font-black text-blue-400">
                                  {formatCurrency(o.total)}
                                </td>
                                <td className="py-3.5 px-2">
                                  <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded border ${
                                    o.status === 'paid' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                    o.status === 'cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                  }`}>
                                    {o.status === 'paid' ? t('status_paid') : o.status === 'cancelled' ? t('status_cancelled') : o.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-2 text-right">
                                  <button
                                    onClick={() => { setSelectedOrder(o); playBeep(900, 80); }}
                                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-black text-[9px] uppercase tracking-wider cursor-pointer transition-colors"
                                  >
                                    {t('btn_details')}
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Order Detail Modal */}
                {selectedOrder && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
                    <div className="w-full max-w-xl bg-[#101828] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="text-blue-500 w-5 h-5" />
                          <h3 className="text-xs md:text-sm font-black uppercase tracking-wider text-white">{t('order_details_title', { orderNumber: selectedOrder.orderNumber })}</h3>
                        </div>
                        <button 
                          onClick={() => setSelectedOrder(null)}
                          className="text-slate-500 hover:text-white font-black"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-slate-900/50 rounded-xl space-y-1.5">
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-1">{t('customer_label')}</span>
                          <p className="font-bold text-slate-100">{selectedOrder.customer.vorname} {selectedOrder.customer.nachname}</p>
                          <p className="text-slate-400 leading-relaxed">
                            {selectedOrder.customer.strasse}<br/>
                            {selectedOrder.customer.plz} {selectedOrder.customer.stadt}<br/>
                            {selectedOrder.customer.land}
                          </p>
                        </div>

                        <div className="p-3 bg-slate-900/50 rounded-xl space-y-1.5">
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-1">{t('system_interface')}</span>
                          <p className="font-bold text-slate-100">{t('payment_method')} <span className="uppercase text-blue-400">{selectedOrder.paymentMethod}</span></p>
                          <p className="text-slate-400">{t('customer_email')} {selectedOrder.customer.email}</p>
                          <p className="text-slate-400">{t('customer_phone')} {selectedOrder.customer.telefon || t('not_provided')}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-1">{t('purchased_items')}</span>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                          {selectedOrder.items.map((item, index) => {
                            const col = item.color || 'Schwarz';
                            const skuCode = `ZAM-H07-${item.productId === 'p1' ? '3G15' : item.productId === 'p2' ? '3G25' : '5G25'}-${col === 'Schwarz' ? 'B' : 'O'}${item.length}`;
                            return (
                              <div key={index} className="p-3 bg-[#0B1220] rounded-xl border border-white/5 flex items-center justify-between text-xs">
                                <div>
                                  <h4 className="font-black text-white uppercase">{item.name}</h4>
                                  <p className="text-[9px] text-slate-500 mt-0.5">{t('property_color')} {getLocalizedColor(col)} &bull; {t('property_length')} {item.length}м &bull; SKU: {skuCode}</p>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-white">{item.quantity}x</div>
                                  <div className="text-[10px] text-blue-400 font-bold">{formatCurrency(item.price * item.quantity)}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-white/5">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400">{t('total_with_vat')}</span>
                        <span className="text-xl font-black text-blue-400">{formatCurrency(selectedOrder.total)}</span>
                      </div>

                      {/* Cancel Order Action */}
                      <div className="flex gap-2 pt-2 border-t border-white/5">
                        {selectedOrder.status !== 'cancelled' && userRole === 'Admin' && (
                          <button
                            onClick={() => cancelOrderAndRestore(selectedOrder)}
                            disabled={isSaving}
                            className="w-full h-11 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
                          >
                            <Trash2 size={12} />
                            <span>{t('btn_cancel_order')}</span>
                          </button>
                        )}
                        {selectedOrder.status === 'cancelled' && (
                          <div className="w-full p-3 bg-red-500/5 border border-red-500/10 text-red-400 text-center text-xs rounded-xl font-black uppercase tracking-wider">
                            {t('order_already_restored')}
                          </div>
                        )}
                        {selectedOrder.status !== 'cancelled' && userRole !== 'Admin' && (
                          <div className="w-full p-2.5 bg-slate-900 border border-white/5 text-slate-500 text-center text-[9px] rounded-xl font-bold uppercase tracking-widest">
                            {t('only_admins_can_cancel')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 4: REVISION AUDIT LOG (STOCK HISTORY) */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                
                {/* Audit Logs Table */}
                <div className="bg-[#101828] border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-wider text-white">{t('audit_title')}</h2>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t('audit_subtitle')}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300 border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                          <th className="py-3 px-2">{t('tbl_timestamp')}</th>
                          <th className="py-3 px-2">{t('tbl_product')}</th>
                          <th className="py-3 px-2">{t('tbl_variant')}</th>
                          <th className="py-3 px-2">{t('tbl_change')}</th>
                          <th className="py-3 px-2">{t('tbl_stock_diff')}</th>
                          <th className="py-3 px-2">{t('tbl_reason')}</th>
                          <th className="py-3 px-2">{t('tbl_user')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {stockHistory.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-500">
                              {t('no_activities_yet')}
                            </td>
                          </tr>
                        ) : (
                          stockHistory.map(log => {
                            const isPositive = log.changeQuantity > 0;
                            const prodName = PRODUCTS.find(p => p.id === log.productId)?.name || log.productId;
                            return (
                              <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                <td className="py-3.5 px-2 text-slate-400 font-bold">{formatTime(log.createdAt)}</td>
                                <td className="py-3.5 px-2 font-black text-white">{prodName}</td>
                                <td className="py-3.5 px-2 text-slate-400">{getLocalizedColor(log.color)} &bull; {log.length}м</td>
                                <td className="py-3.5 px-2">
                                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                                    isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                  }`}>
                                    {isPositive ? '+' : ''}{log.changeQuantity} {t('unit_pcs')}
                                  </span>
                                </td>
                                <td className="py-3.5 px-2 text-slate-300">
                                  {log.previousStock} &rarr; {log.newStock}
                                </td>
                                <td className="py-3.5 px-2">
                                  <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded ${
                                    log.reason === 'Sale' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' :
                                    log.reason === 'Restock' ? 'bg-green-600/10 text-green-400 border border-green-500/20' : 'bg-yellow-600/10 text-yellow-400 border border-yellow-500/20'
                                  }`}>
                                    {log.reason === 'Sale' ? t('log_sale') : log.reason === 'Restock' ? t('log_restock') : log.reason === 'Return' ? t('log_return') : log.reason === 'Manual Update' ? t('reason_manual') : log.reason}
                                  </span>
                                </td>
                                <td className="py-3.5 px-2 font-medium text-slate-400">{log.user}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 5: STATISTICS & ANALYTICS CHARTS */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                
                {/* SVG Charts section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left Chart: Bestselling Products */}
                  <div className="bg-[#101828] border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
                    <h3 className="text-xs md:text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <TrendingUp className="text-green-400" size={14} /> {t('stats_bestselling')}
                    </h3>
                    
                    <div className="space-y-4 pt-4">
                      {ALL_VARIANTS.map(v => {
                        const stockKey = `${v.productId}_${v.color}_${v.length}`;
                        const soldVal = sold[stockKey] ?? 0;
                        const maxSold = Math.max(...ALL_VARIANTS.map(va => sold[`${va.productId}_${va.color}_${va.length}`] ?? 0), 1);
                        const percent = (soldVal / maxSold) * 100;

                        return (
                          <div key={v.sku} className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-slate-200">{v.productName} ({getLocalizedColor(v.color)}, {v.length}м)</span>
                              <span className="font-black text-blue-400">{t('stats_sold_count', { count: soldVal })}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                              <div 
                                className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Chart: Current Stock Distribution */}
                  <div className="bg-[#101828] border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
                    <h3 className="text-xs md:text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <Archive className="text-blue-400" size={14} /> {t('stats_distribution')}
                    </h3>

                    <div className="space-y-4 pt-4">
                      {ALL_VARIANTS.map(v => {
                        const stockKey = `${v.productId}_${v.color}_${v.length}`;
                        const stockVal = stock[stockKey] ?? v.defaultStock;
                        const maxStock = Math.max(...ALL_VARIANTS.map(va => stock[`${va.productId}_${va.color}_${va.length}`] ?? va.defaultStock), 1);
                        const percent = (stockVal / maxStock) * 100;

                        return (
                          <div key={v.sku} className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-slate-200">{v.productName} ({getLocalizedColor(v.color)}, {v.length}м)</span>
                              <span className={`font-black ${stockVal === 0 ? 'text-red-500' : stockVal < lowStockLimit ? 'text-orange-400' : 'text-slate-300'}`}>
                                {stockVal} {t('unit_pcs')}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  stockVal === 0 ? 'bg-red-500' : stockVal < lowStockLimit ? 'bg-orange-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Slow-moving stock checker */}
                <div className="bg-[#101828] border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
                  <h3 className="text-xs md:text-sm font-black uppercase tracking-wider text-white">{t('stats_turnover_title')}</h3>
                  <p className="text-[10px] text-slate-400">{t('stats_turnover_subtitle')}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {ALL_VARIANTS.map(v => {
                      const stockKey = `${v.productId}_${v.color}_${v.length}`;
                      const stockVal = stock[stockKey] ?? v.defaultStock;
                      const soldVal = sold[stockKey] ?? 0;
                      
                      // Turnover ratio score (0 is worst/slow-moving, higher is healthier)
                      const turnoverScore = soldVal === 0 ? 0 : (soldVal / (stockVal || 1)).toFixed(2);
                      const isSlow = soldVal === 0 || Number(turnoverScore) < 0.1;

                      return (
                        <div key={v.sku} className={`p-4 rounded-xl border ${isSlow ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-slate-900/60 border-white/5'} space-y-2`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{v.sku}</span>
                            <span className={`px-1.5 py-0.5 text-[7px] font-black uppercase rounded ${isSlow ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                              {isSlow ? t('turnover_slow') : t('turnover_fast')}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-white uppercase">{v.productName}</h4>
                          <p className="text-[9px] text-slate-400 font-bold">{getLocalizedColor(v.color)} &bull; {v.length}м</p>
                          <div className="flex items-center justify-between pt-1 border-t border-white/5 mt-2 text-[10px]">
                            <span className="text-slate-500">{t('turnover_ratio')}</span>
                            <span className={`font-black ${isSlow ? 'text-yellow-400' : 'text-green-400'}`}>
                              {turnoverScore}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 6: BULK IMPORT / EXPORT CSV */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                
                {/* Drag and Drop Bulk Importer */}
                <div className="bg-[#101828] border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl space-y-6">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-white">{t('import_export_title')}</h2>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t('import_export_subtitle')}</p>
                  </div>

                  {/* Drag and drop active region */}
                  <div 
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                      isDragOver ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-white/20 bg-slate-900/40'
                    }`}
                  >
                    <Upload className="text-blue-500 mx-auto w-10 h-10 mb-3 animate-pulse" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">{t('csv_drop_zone_title')}</h3>
                    <p className="text-slate-400 text-[10px] mt-1">{t('csv_drop_zone_subtitle')}</p>
                    
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleManualFileUpload}
                      className="hidden"
                      id="manual-file-upload"
                    />
                    <label
                      htmlFor="manual-file-upload"
                      className="inline-block mt-4 h-9 px-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest text-[9px] rounded-xl cursor-pointer transition-all active:scale-95 flex-none"
                    >
                      {t('btn_select_file')}
                    </label>
                  </div>

                  {importStatus && (
                    <div className={`p-4 rounded-xl border ${importStatus.success ? 'bg-green-500/10 border-green-500/25 text-green-400' : 'bg-red-500/10 border-red-500/25 text-red-400'} text-xs font-bold flex items-center gap-3`}>
                      {importStatus.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      <span>{importStatus.msg}</span>
                    </div>
                  )}

                  <div className="space-y-3 bg-[#0B1220]/50 p-4 rounded-xl border border-white/5 text-xs text-slate-400">
                    <p className="font-bold text-white uppercase tracking-wider text-[9px]">{t('csv_spec_title')}</p>
                    <p className="text-[10px]">{t('csv_spec_subtitle')}</p>
                    <code className="block bg-slate-900 p-2.5 rounded-lg text-[9px] font-mono text-blue-400 leading-relaxed overflow-x-auto">
                      SKU,Produkt,Farbe,Laenge,EAN,Lagerbestand,Verkauft<br/>
                      ZAM-H07-3G15-B50,"H07RN-F 3G1.5mm²",Schwarz,50,"4270004984279",85,0
                    </code>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={exportToCSV}
                      className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.97]"
                    >
                      <Download size={12} />
                      <span>{t('btn_export_csv')}</span>
                    </button>
                  </div>
                </div>

                {/* Configurations Card */}
                <div className="bg-[#101828] border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
                  <h3 className="text-xs md:text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <Settings className="text-slate-400" size={14} /> {t('settings_title')}
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">{t('settings_low_stock_label')}</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="3"
                          max="30"
                          value={lowStockLimit}
                          onChange={e => {
                            const val = parseInt(e.target.value, 10);
                            setLowStockLimit(val);
                            localStorage.setItem('zamlux_low_stock_limit', String(val));
                            showSuccess(t('low_stock_limit_changed', { val }));
                          }}
                          className="flex-1 h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <span className="w-12 text-center bg-slate-900 px-3 py-1.5 border border-white/10 rounded-xl text-xs font-black text-blue-400">
                          {lowStockLimit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
