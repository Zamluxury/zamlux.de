import React from 'react';
import ProductPage from './components/ProductPage';
import { 
  Truck, 
  ShieldCheck, 
  Star, 
  HelpCircle, 
  User, 
  ShoppingCart, 
  CheckCircle2,
  Check,
  Lock,
  RotateCcw,
  Package,
  ArrowRight,
  BarChart2,
  X,
  ChevronUp,
  ChevronDown,
  Mail,
  Phone,
  Clock,
  MessageSquare,
  Plus,
  Minus,
  AlertCircle,
  Box,
  RefreshCw,
  Menu,
  ChevronRight,
  CreditCard,
  Search,
  FileText,
  Building2,
  Settings2,
  Construction,
  Zap,
  Home,
  Snowflake,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AppProvider, useApp } from './context';
import { PRODUCTS, COMPARISON_SPECS, PRODUCT_SPECS_DATA } from './constants';
import { LEGAL_CONTENT, LEGAL_CONTENT_EN } from './legal_content';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { saveContactMessage, saveOrder } from './firebase';
import AdminPage from './components/AdminPage';
import AccountPage from './components/AccountPage';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// --- Price Helper ---
const formatPrice = (price: number, locale: string = 'de') => {
  const bruto = price;
  const neto = bruto / 1.19;
  const vat = bruto - neto;
  const lang = locale === 'en' ? 'en-US' : 'de-DE';

  return {
    neto: neto.toLocaleString(lang, { style: 'currency', currency: 'EUR' }),
    bruto: bruto.toLocaleString(lang, { style: 'currency', currency: 'EUR' }),
    vat: vat.toLocaleString(lang, { style: 'currency', currency: 'EUR' }),
    value: bruto.toLocaleString(lang, { style: 'currency', currency: 'EUR' }),
    taxLabel: locale === 'en' ? 'incl. VAT' : 'inkl. MwSt.'
  };
};

// --- Page Types ---
type PageType = 'home' | keyof typeof LEGAL_CONTENT | 'kontakt' | 'versand' | 'rueckgabe' | 'faq' | 'account';

// --- Components ---

const FeatureHighlights = () => {
  const { t } = useApp();
  const items = [
    { 
      type: "H07RN-F", 
      label: t('black_cable_title'), 
      description: t('black_cable_desc'),
      icon: <Activity size={18} strokeWidth={2.5} />,
      image: "/H07RN-F.png",
      highlighted: true
    },
    { 
      type: "H07RN-F", 
      label: t('orange_cable_title'), 
      description: t('orange_cable_desc'),
      icon: <Snowflake size={18} strokeWidth={2.5} />,
      image: "/H07BQ-F.png",
      highlighted: true
    }
  ];

  return (
    <section className="pt-2 pb-1 md:pt-8 md:pb-6 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-4 md:mb-10 max-w-4xl mx-auto pt-0.5 md:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <h2 className="text-[22px] md:text-[52px] font-black text-[#1e293b] uppercase tracking-[0.01em] md:tracking-[0.02em] leading-[0.95] md:leading-[1.1] text-center mb-2 md:mb-6">
              {t('hero_title')}
            </h2>
            
            <div className="w-8 h-[2px] md:w-20 md:h-1.5 bg-blue-700 rounded-full mb-4 md:mb-8 shadow-sm" />
            
            <p className="text-[9.5px] md:text-sm font-black text-gray-700 md:text-gray-500 uppercase tracking-[0.25em] md:tracking-[0.35em] opacity-80 md:opacity-70">
              {t('hero_subtitle')}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto md:px-0">
          {items.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className={cn(
                "relative bg-white border border-gray-100 rounded-xl transition-all duration-500 overflow-hidden shadow-sm flex flex-row md:flex-col items-center w-full max-w-[340px] md:max-w-[270px] mx-auto min-h-[80px] md:min-h-[65px] p-3 md:p-2.5 gap-3.5 md:gap-0",
                item.highlighted && "ring-1 ring-blue-500/20 border-blue-100 shadow-lg shadow-blue-900/5"
              )}
            >
              <div className="flex-1 md:w-full flex flex-col md:absolute md:top-1.5 md:left-3 md:z-20">
                <span className="text-[8px] md:text-[9px] font-black text-blue-600 md:text-slate-300 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-0.5">
                  {item.type}
                </span>
                <h3 className="text-[11px] md:hidden font-bold text-gray-900 leading-none mb-1">
                  {item.label}
                </h3>
                <p className="text-[9px] md:hidden text-gray-500 leading-tight line-clamp-2 opacity-80">
                  {item.description}
                </p>
              </div>

              {/* Photo Area */}
              <div className="shrink-0 w-[70px] h-[70px] md:w-full md:flex-1 relative pointer-events-none flex items-center justify-center bg-slate-50/50 md:bg-transparent rounded-lg md:rounded-none">
                <img 
                  src={item.image} 
                  alt={item.type} 
                  className="w-full h-full max-h-[60px] md:max-h-none object-contain drop-shadow-[5px_10px_20px_rgba(30,41,59,0.05)] md:drop-shadow-[15px_30px_45px_rgba(30,41,59,0.1)] transition-all duration-1000 p-1 md:p-0"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Lightbox = ({ image, onClose, layoutId }: { image: string; onClose: () => void; layoutId?: string }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = image ? 'hidden' : 'unset';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [image, onClose]);

  return (
    <AnimatePresence>
      {image && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 md:bg-white/40 md:backdrop-blur-lg p-4 md:p-4 overflow-hidden"
          onClick={onClose}
        >
          {/* Close Button UI */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 md:top-6 md:right-6 text-white/40 hover:text-white md:text-gray-400 md:hover:text-gray-900 transition-all hover:scale-110 p-2.5 bg-white/5 hover:bg-white/10 md:bg-white/90 md:shadow-md md:border-gray-100 rounded-full border border-white/10 z-[1001]"
          >
            <X size={24} className="md:w-5 md:h-5" />
          </button>

          {/* Controls hint for premium feel */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/5 md:bg-white/90 md:shadow-sm backdrop-blur px-5 py-2 rounded-full border border-white/10 md:border-gray-100 text-white/40 md:text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] pointer-events-none select-none">
            <span className="flex items-center gap-2 font-mono">ESC</span>
            <span className="w-1 h-1 rounded-full bg-white/20 md:bg-gray-300" />
            Schließen
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 35, 
              stiffness: 300,
              mass: 0.8
            }}
            className="relative flex items-center justify-center pointer-events-none"
          >
            <motion.img 
              src={image} 
              alt="Detail Ansicht" 
              className="w-auto h-auto max-w-[95vw] max-h-[85vh] md:max-w-[520px] md:max-h-[82vh] object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)] md:drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] select-none pointer-events-auto cursor-default font-normal border-2 md:border-[6px] border-white rounded-xl"

              onClick={(e) => e.stopPropagation()}
              referrerPolicy="no-referrer"
              layoutId={layoutId}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ProductGallery = ({ product, selectedColor = 'Schwarz' }: { product: typeof PRODUCTS[0]; selectedColor?: 'Schwarz' | 'Orange' }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedColor === 'Orange') {
      setActiveImageIndex(1);
    } else {
      setActiveImageIndex(0);
    }
  }, [selectedColor]);

  const images = (product.gallery || [product.image]).slice(0, 3);
  const activeImage = images[activeImageIndex] || product.image;

  return (
    <div className="space-y-2">
      {/* Main Image Container */}
      <div 
        className={cn(
          "relative aspect-[3/2] md:aspect-[4/3] rounded-lg bg-white flex items-center justify-center border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-xl group/gallery cursor-zoom-in md:cursor-default overflow-hidden",
          product.id === 'p1' ? "p-1" : "p-4"
        )}
        onClick={() => {
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setLightboxImage(activeImage);
          }
        }}
      >
        <motion.div
          className="w-full h-full flex items-center justify-center relative z-10"
          whileHover={{ scale: 1.2 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <motion.img 
            key={activeImageIndex}
            layoutId={`product-img-${product.id}-${activeImageIndex}`}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            src={activeImage} 
            alt={product.name} 
            className="w-full h-full object-contain pointer-events-none select-none drop-shadow-sm" 
            referrerPolicy="no-referrer" 
          />
        </motion.div>

        {/* Zoom Hint */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-md border border-gray-100 opacity-0 md:hidden group-hover/gallery:opacity-100 transition-all duration-300 translate-y-2 group-hover/gallery:translate-y-0 z-20">
          <Search size={18} className="text-blue-600" />
        </div>

        {/* Quality Badge */}
        <div className="absolute bottom-4 left-4 bg-gray-50/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-gray-200 opacity-0 md:hidden group-hover/gallery:opacity-100 transition-opacity duration-300 z-20">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Detail Ansicht</span>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-3 gap-2.5 md:max-w-[235px] md:mx-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onMouseEnter={() => setActiveImageIndex(i)}
              onClick={() => setActiveImageIndex(i)}
              className={cn(
                "aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 bg-white p-1 hover:scale-105 active:scale-95",
                activeImageIndex === i 
                  ? "border-blue-600 shadow-md ring-2 ring-blue-50" 
                  : "border-gray-100 opacity-70 hover:opacity-100"
              )}
            >
              <img src={img} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>
      )}

      <Lightbox 
        image={lightboxImage || ''} 
        onClose={() => setLightboxImage(null)} 
        layoutId={`product-img-${product.id}-${activeImageIndex}`}
      />
    </div>
  );
};

const Breadcrumbs = ({ page, onHomeClick }: { page: string; onHomeClick?: () => void }) => {
  const { t } = useApp();
  return (
    <div className="bg-gray-50 border-b border-gray-100 py-3">
      <div className="container mx-auto px-4 flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
        <button onClick={onHomeClick} className="hover:text-blue-600 flex items-center gap-1">{t('nav_home')}</button>
        <ChevronRight size={12} />
        <span className="text-gray-900">{page}</span>
      </div>
    </div>
  );
};

const LegalPage = ({ type, onClose }: { type: keyof typeof LEGAL_CONTENT; onClose: () => void }) => {
  const { locale, t } = useApp();
  const content = locale === 'en' ? LEGAL_CONTENT_EN[type] : LEGAL_CONTENT[type];
  return (
    <div className="bg-white min-h-[60vh] py-10">
      <Breadcrumbs page={content.title} onHomeClick={onClose} />
      <div className="container mx-auto px-4 max-w-4xl mt-12">
        <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tight">{content.title}</h1>
        <div className="prose prose-blue max-w-none text-gray-600 font-medium leading-relaxed whitespace-pre-line bg-gray-50 p-8 rounded-3xl border border-gray-100">
          {content.content}
        </div>
        <div className="mt-12">
          <Button onClick={onClose} variant="outline" className="font-bold border-2 border-gray-100 rounded-xl">
             {t('back_to_home')}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- KONTAKT PAGE ---
const KontaktPage = ({ onClose }: { onClose: () => void }) => {
  const { t } = useApp();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [honeypot, setHoneypot] = useState('');

  const [error, setError] = useState<string | null>(null);

  const openingHours = [
    { day: t('ct_mon_fri'), time: "08:00 – 18:00", open: true },
    { day: t('ct_sat'), time: "10:00 – 14:00", open: true },
    { day: t('ct_sun_holidays'), time: t('ct_closed'), open: false },
  ];

  const handleSubmit = async () => {
    // Anti-spam check
    if (honeypot) {
      console.warn('Spam detected via honeypot');
      setSent(true); 
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) return;
    
    setLoading(true);
    setError(null);
    try {
      await saveContactMessage(formData);
      setSent(true);
    } catch (err: any) {
      console.error('Submit Error:', err);
      setError(t('ct_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-[60vh]">
      <Breadcrumbs page={t('nav_contact')} onHomeClick={onClose} />
      <div className="container mx-auto px-4 max-w-6xl py-16">
        <div className="mb-12">
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none mb-4 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">Support</Badge>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">{t('ct_title')}</h1>
          <p className="text-gray-500 font-medium max-w-xl">{t('ct_subtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {[
            {
              icon: <Phone size={24} className="text-blue-600" />,
              title: t('ct_phone_label').replace(':', ''),
              main: "+49 155 604 45708",
              sub: "Mo–Fr, 8:00–17:00 Uhr",
              color: "bg-blue-50 border-blue-100"
            },
            {
              icon: <Mail size={24} className="text-blue-600" />,
              title: t('ct_email_label').replace(':', ''),
              main: "info@zamlux.de",
              sub: t('ct_response_time') + ": " + t('ct_response_val'),
              color: "bg-blue-50 border-blue-100"
            },
          ].map((item, i) => (
            <div key={i} className={`rounded-2xl border p-8 ${item.color} flex flex-col gap-4`}>
              <div className="bg-white rounded-xl p-3 w-fit shadow-sm border border-white">{item.icon}</div>
              <div>
                <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.title}</div>
                <div className="text-xl font-black text-gray-900">{item.main}</div>
                <div className="text-sm text-gray-500 font-medium mt-1">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">{t('ct_write_us')}</h2>
            <p className="text-gray-500 font-medium mb-8">{t('ct_write_sub')}</p>

            {sent ? (
              <AnimatePresence mode="wait">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-gray-100 rounded-[2rem] p-12 flex flex-col items-center text-center gap-8 shadow-2xl shadow-blue-500/5"
                >
                  <div className="relative">
                    <motion.div 
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                      className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl shadow-green-200"
                    >
                      <CheckCircle2 size={48} className="text-white" />
                    </motion.div>
                    <motion.div 
                      animate={{ scale: [1, 1.4, 1], opacity: [0, 0.3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-green-400 rounded-full -z-10"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">{t('ct_confirm_sent')}</h3>
                    <div className="space-y-2">
                      <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
                        {t('ct_confirm_desc')}
                      </p>
                      <p className="text-blue-600 font-bold">
                        {t('ct_confirm_hours')}
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-sm font-bold shadow-sm">
                     <Mail size={16} /> {t('ct_check_inbox').replace('{email}', formData.email)}
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button 
                      onClick={() => { setSent(false); setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' }); }} 
                      variant="ghost" 
                      size="sm"
                      className="font-bold text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <RefreshCw size={14} className="mr-2" />
                      {t('ct_new_msg')}
                    </Button>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="space-y-4">
                {/* Honeypot field (hidden from users) */}
                <div className="hidden" aria-hidden="true">
                  <input 
                    type="text" 
                    name="website" 
                    tabIndex={-1} 
                    autoComplete="off" 
                    value={honeypot} 
                    onChange={e => setHoneypot(e.target.value)} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{t('ct_first_name')}</label>
                    <Input 
                      placeholder="Max" 
                      className="rounded-xl border-gray-200 h-11"
                      value={formData.firstName}
                      onChange={e => setFormData(d => ({...d, firstName: e.target.value}))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{t('ct_last_name')}</label>
                    <Input 
                      placeholder="Mustermann" 
                      className="rounded-xl border-gray-200 h-11"
                      value={formData.lastName}
                      onChange={e => setFormData(d => ({...d, lastName: e.target.value}))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{t('ct_email')}</label>
                  <Input 
                    type="email" 
                    placeholder="max@beispiel.de" 
                    className="rounded-xl border-gray-200 h-11"
                    value={formData.email}
                    onChange={e => setFormData(d => ({...d, email: e.target.value}))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{t('ct_subject')}</label>
                  <Input 
                    placeholder={t('ct_subject_placeholder')} 
                    className="rounded-xl border-gray-200 h-11"
                    value={formData.subject}
                    onChange={e => setFormData(d => ({...d, subject: e.target.value}))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{t('ct_message')}</label>
                  <textarea 
                    placeholder={t('ct_msg_placeholder')} 
                    rows={5}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 resize-none"
                    value={formData.message}
                    onChange={e => setFormData(d => ({...d, message: e.target.value}))}
                  />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium animate-pulse">
                    {error}
                  </div>
                )}
                <Button 
                  onClick={handleSubmit}
                  disabled={loading || !formData.firstName || !formData.lastName || !formData.email || !formData.message}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-black rounded-xl shadow-lg shadow-blue-200/50 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                       <RefreshCw className="animate-spin" size={18} />
                       {t('ct_sending')}
                    </div>
                  ) : t('ct_send_btn')}
                </Button>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-3xl border border-gray-100 p-8">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-blue-600" /> {t('ct_opening_hours')}
            </h3>
            <div className="space-y-3">
              {openingHours.map((row, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                  <span className="text-sm font-bold text-gray-700">{row.day}</span>
                  <span className={cn("text-sm font-black", row.open ? "text-green-600" : "text-gray-400")}>{row.time}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 bg-blue-600 rounded-2xl p-6 text-white">
              <div className="text-[11px] font-black uppercase tracking-widest opacity-70 mb-1">{t('ct_response_time')}</div>
              <div className="text-3xl font-black">{t('ct_response_val')}</div>
              <div className="text-sm opacity-70 mt-1">{t('ct_response_sub')}</div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <Button onClick={onClose} variant="outline" className="font-bold border-2 border-gray-100 rounded-xl">
            {t('back_to_home')}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- VERSAND PAGE ---
// --- VERSAND PAGE ---
const VersandPage = ({ onClose }: { onClose: () => void }) => {
  const { t } = useApp();
  return (
    <div className="bg-white min-h-[60vh]">
      <Breadcrumbs page={t('vs_free_shipping')} onHomeClick={onClose} />
      <div className="container mx-auto px-4 max-w-5xl py-16">
        <div className="mb-12 text-center">
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none mb-4 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">Lieferung</Badge>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">{t('vs_free_shipping')}</h1>
          <p className="text-gray-500 font-medium max-w-xl mx-auto text-center">{t('vs_subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {[
            { icon: <Truck size={28} className="text-blue-600" />, title: t('vs_days'), sub: t('vs_days_desc') },
            { icon: <Package size={28} className="text-blue-600" />, title: t('vs_free'), sub: t('vs_free_desc') },
            { icon: <ShieldCheck size={28} className="text-blue-600" />, title: t('vs_insured'), sub: t('vs_insured_desc') },
          ].map((item, i) => (
            <div key={i} className="bg-blue-50 border border-blue-100 rounded-2xl p-8 flex flex-col gap-4">
              <div className="bg-white rounded-xl p-3 w-fit shadow-sm">{item.icon}</div>
              <div>
                <div className="text-xl font-black text-gray-900">{item.title}</div>
                <div className="text-sm text-gray-500 font-medium mt-1">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-3xl border border-gray-100 overflow-hidden mb-12 max-w-3xl mx-auto shadow-sm">
          <div className="p-8 border-b border-gray-100 text-center">
            <h2 className="text-2xl font-black text-gray-900">{t('vs_overview')}</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100/60">
                <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">{t('vs_cart_value')}</th>
                <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">{t('vs_shipping_costs')}</th>
                <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">{t('vs_delivery_time')}</th>
              </tr>
            </thead>
            <tbody>
              {[
                { range: t('vs_range'), cost: t('vs_free'), time: t('vs_days') },
              ].map((row, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-blue-50/20 transition-colors text-center">
                  <td className="px-8 py-4 font-bold text-gray-900">{row.range}</td>
                  <td className="px-8 py-4 font-black text-blue-700">{row.cost}</td>
                  <td className="px-8 py-4 font-medium text-gray-600">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center">
          <Button onClick={onClose} variant="outline" className="font-bold border-2 border-gray-100 rounded-xl px-8">
            {t('back_to_home')}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- RUCKGABE PAGE ---
const RueckgabePage = ({ onClose }: { onClose: () => void }) => {
  const { t } = useApp();
  return (
    <div className="bg-white min-h-[60vh]">
      <Breadcrumbs page={t('rt_title')} onHomeClick={onClose} />
      <div className="container mx-auto px-4 max-w-5xl py-16">
        <div className="mb-12">
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none mb-4 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">{t('rt_badge')}</Badge>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">{t('rt_title')}</h1>
          <p className="text-gray-500 font-medium max-w-xl">{t('rt_desc')}</p>
        </div>

        <div className="bg-gray-50 rounded-3xl border border-gray-100 p-10 mb-10">
          <h2 className="text-2xl font-black text-gray-900 mb-8">{t('rt_steps_title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: t('rt_step1_num'), title: t('rt_step1_title'), desc: t('rt_step1_desc') },
              { step: t('rt_step2_num'), title: t('rt_step2_title'), desc: t('rt_step2_desc') },
              { step: t('rt_step3_num'), title: t('rt_step3_title'), desc: t('rt_step3_desc') },
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="text-6xl font-black text-blue-100 leading-none">{item.step}</div>
                <div>
                  <div className="text-lg font-black text-gray-900 mb-2">{item.title}</div>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={onClose} variant="outline" className="font-bold border-2 border-gray-100 rounded-xl">
          {t('back_to_home')}
        </Button>
      </div>
    </div>
  );
};

// --- FAQ PAGE ---
const FAQ_ITEMS_DE = [
  {
    category: "Experten-Wissen zu H07RN-F",
    items: [
      {
        q: "Was ist H07RN-F?",
        a: "H07RN-F ist eine schwere Gummischlauchleitung für höchste mechanische Belastung. Die Bezeichnung steht für harmonisierte Leitung (H), 450/750V Nennspannung (07), Natur- oder Synthetik-Kautschuk-Isolierung (R) und Außenmantel aus Polychloropren-Kautschuk (N), flexibel (F)."
      },
      {
        q: "Für den Außenbereich geeignet?",
        a: "Ja, H07RN-F Kabel sind nach VDE-Standard für den dauerhaften Einsatz im Freien zugelassen. Sie sind UV-beständig, witterungsfest und widerstandsfähig gegen Ozon und Öle."
      },
      {
        q: "Für Baustellen geeignet?",
        a: "Absolut. Diese Leitung ist speziell als Baustellenkabel konzipiert. Sie hält mechanischen Beanspruchungen durch schwere Geräte, Werkzeuge und raue Untergründe problemlos stand."
      },
      {
        q: "Unterschied 3G1.5, 3G2.5 und 5G2.5?",
        a: "Die Zahl vor dem 'G' steht für die Anzahl der Adern, 'G' bedeutet mit Schutzleiter (Grün-Gelb), und die Zahl danach für den Querschnitt in mm². 3G-Kabel werden für 230V Wechselstrom (z.B. Werkstattgeräte) genutzt, 5G-Kabel für 400V Drehstrom (Starkstrom)."
      },
      {
        q: "Lieferzeit innerhalb Deutschlands?",
        a: "Wir versenden direkt aus unserem Lager in Deutschland. Die Regellieferzeit mit DHL oder Hermes beträgt 1 bis 3 Werktage nach Bestellung."
      }
    ]
  },
  {
    category: "Bestellung & Zahlung",
    items: [
      { q: "Welche Zahlungsmethoden akzeptieren Sie?", a: "Wir akzeptieren sichere Zahlungen per PayPal, Visa, Mastercard, Apple Pay, Google Pay, Klarna sowie SEPA-Banküberweisung." },
      { q: "Gibt es einen Mindestbestellwert?", a: "Ja, der Mindestbestellwert beträgt 50 €. Die Lieferung ist für Sie immer kostenlos." },
    ]
  },
  {
    category: "Versand & Lieferung",
    items: [
      { q: "Wie lange dauert die Lieferung?", a: "Standardbestellungen werden innerhalb von 1–3 Werktagen geliefert." },
    ]
  },
];

const FAQ_ITEMS_EN = [
  {
    category: "Expert Knowledge on H07RN-F",
    items: [
      {
        q: "What is H07RN-F?",
        a: "H07RN-F is a heavy-duty rubber-sheathed cable designed for maximum mechanical stress. The designation stands for harmonized cable (H), 450/750V rated voltage (07), natural or synthetic rubber insulation (R), and polychloroprene rubber outer sheath (N), flexible (F)."
      },
      {
        q: "Is it suitable for outdoor use?",
        a: "Yes, H07RN-F cables are approved for permanent outdoor use according to VDE standards. They are UV-resistant, weatherproof, and resistant to ozone and oils."
      },
      {
        q: "Is it suitable for construction sites?",
        a: "Absolutely. This cable is specifically designed as a construction site cable. It can easily withstand mechanical stress from heavy equipment, tools, and rough surfaces."
      },
      {
        q: "Difference between 3G1.5, 3G2.5, and 5G2.5?",
        a: "The number before 'G' indicates the number of cores, 'G' means with a protective conductor (green-yellow), and the number after is the cross-section in mm². 3G cables are used for 230V AC (e.g. workshop equipment), and 5G cables for 400V three-phase current (heavy power)."
      },
      {
        q: "Delivery time within Germany?",
        a: "We ship directly from our warehouse in Germany. The standard delivery time with DHL or Hermes is 1 to 3 business days after ordering."
      }
    ]
  },
  {
    category: "Ordering & Payment",
    items: [
      { q: "Which payment methods do you accept?", a: "We accept secure payments via PayPal, Visa, Mastercard, Apple Pay, Google Pay, Klarna, and SEPA bank transfer." },
      { q: "Is there a minimum order value?", a: "Yes, the minimum order value is €50. Delivery is always free of charge for you." },
    ]
  },
  {
    category: "Shipping & Delivery",
    items: [
      { q: "How long does delivery take?", a: "Standard orders are delivered within 1–3 business days." },
    ]
  },
];

const FAQPage = ({ onClose }: { onClose: () => void }) => {
  const { t, locale } = useApp();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggle = (key: string) => {
    setOpenItems(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const faqItems = locale === 'en' ? FAQ_ITEMS_EN : FAQ_ITEMS_DE;

  return (
    <div className="bg-white min-h-[60vh]">
      <Breadcrumbs page={t('nav_faq')} onHomeClick={onClose} />
      <div className="container mx-auto px-4 max-w-4xl py-16">
        <h1 className="text-4xl font-black text-gray-900 mb-12 tracking-tight">{t('faq_title_main') || "Häufig gestellte Fragen"}</h1>
        <div className="space-y-10 mb-14">
          {faqItems.map((category) => (
            <div key={category.category}>
              <h2 className="text-xl font-black text-gray-900 mb-4">{category.category}</h2>
              <div className="space-y-2">
                {category.items.map((item, idx) => {
                  const key = `${category.category}-${idx}`;
                  const isOpen = openItems.includes(key);
                  return (
                    <div key={key} className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
                      <button className="w-full flex items-center justify-between p-6 text-left" onClick={() => toggle(key)}>
                        <span className="font-black text-gray-900 text-sm">{item.q}</span>
                        {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                      </button>
                      {isOpen && <div className="px-6 pb-6 text-sm text-gray-600 font-medium">{item.a}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <Button onClick={onClose} variant="outline" className="font-bold border-2 border-gray-100 rounded-xl">
          {t('back_to_home')}
        </Button>
      </div>
    </div>
  );
};


const CartDrawer = ({ isOpen, onClose, onCheckoutClick }: { isOpen: boolean; onClose: () => void; onCheckoutClick: () => void }) => {
  const { cart, removeFromCart } = useApp();
  
  const totalBruto = cart.reduce((acc, item) => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    const lengthData = product?.availableLengths.find(l => l.length === item.length);
    return acc + (lengthData?.price || 0) * item.quantity;
  }, 0);

  const subtotalNeto = totalBruto / 1.19;
  const vat = totalBruto - subtotalNeto;

  const format = (num: number) => num.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#0B1220] text-white">
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} className="text-blue-500" />
                <h2 className="text-lg font-black uppercase tracking-widest">Warenkorb</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                  <Package size={48} strokeWidth={1} />
                  <p className="font-bold text-sm uppercase tracking-widest">Ihr Warenkorb ist leer</p>
                  <Button onClick={onClose} variant="outline" className="rounded-xl font-bold">Jetzt einkaufen</Button>
                </div>
              ) : (
                cart.map((item, i) => {
                  const product = PRODUCTS.find(p => p.id === item.productId)!;
                  const lengthData = product.availableLengths.find(l => l.length === item.length)!;
                  return (
                    <div key={`${item.productId}-${item.length}-${item.color || 'Schwarz'}`} className="flex gap-4 group">
                      <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 p-2 overflow-hidden relative">
                        <img 
                          src={item.color === 'Orange' ? (product.gallery?.[1] || product.image) : product.image} 
                          alt={product.name} 
                          className="max-w-full max-h-full object-contain" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-black text-gray-900 uppercase leading-snug mb-1">{product.name}</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">{item.length}m &bull; {item.color || 'Schwarz'} &bull; Menge: {item.quantity}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-blue-600">{format(lengthData.price * item.quantity)}</span>
                          <button 
                            onClick={() => removeFromCart(item.productId, item.length, item.color || 'Schwarz')}
                            className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-widest"
                          >
                            Entfernen
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <span>Zwischensumme (Netto)</span>
                    <span className="text-gray-900">{format(subtotalNeto)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <span>MwSt. (19%)</span>
                    <span className="text-gray-900">{format(vat)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between items-end">
                    <div>
                      <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Gesamtbetrag</div>
                      <div className="text-2xl font-black text-gray-900 leading-none tracking-tighter">{format(totalBruto)}</div>
                      <div className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-tight">Alle Preise inkl. gesetzlicher MwSt.</div>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    onClose();
                    onCheckoutClick();
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-sm font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all text-white"
                >
                  Zur Kasse gehen
                </Button>
                <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-widest">
                  Sichere SSL-Verschlüsselung &bull; Kauf auf Rechnung möglich
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const GlobalReviews = () => {
  const reviews = [
    { name: "Thomas M.", date: "Gestern", rating: 5, text: "Hervorragende Qualität der H07RN-F Leitung. Schneller Versand (2 Tage) und top verpackt. Sehr zu empfehlen!" },
    { name: "Bauservice Wagner", date: "Vor 3 Tagen", rating: 5, text: "Wir beziehen unsere Baustellenkabel nur noch über Zamluxury. Robuste Mäntel und faire Preise. Absolut zuverlässig." },
    { name: "Klaus H.", date: "Letzte Woche", rating: 5, text: "Die H05VV-F Leitung ist perfekt für meine Zwecke. Sehr flexibel und gut zu verarbeiten. Markenqualität eben." },
    { name: "Elektro-Schmidt", date: "Vor 2 Wochen", rating: 5, text: "High-End Qualität. Die PUR Leitung H07BQ-F ist unzerstörbar auf unseren Baustellen. Schnelle Lieferung direkt ab Lager Berlin." },
  ];

  return (
    <section className="py-10 md:py-12 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-10">
          <Badge className="bg-blue-600/10 text-blue-600 hover:bg-blue-600/10 border-none mb-4 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest">Kundenstimmen</Badge>
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight uppercase">Was unsere Kunden sagen</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="#F59E0B" color="#F59E0B" />)}
              </div>
              <p className="text-gray-600 font-medium leading-relaxed italic mb-6">"{rev.text}"</p>
              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <span className="font-black text-gray-900 text-sm uppercase">{rev.name}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{rev.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Header = ({ onAuthClick, onCartClick, onPageChange }: { onAuthClick: () => void, onCartClick: () => void, onPageChange: (page: PageType) => void }) => {
  const { cart, locale, setLocale, t, user, userProfile } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    const lengthData = product?.availableLengths.find(l => l.length === item.length);
    return acc + (lengthData?.price || 0) * item.quantity;
  }, 0);

  const formattedTotal = formatPrice(cartTotal, locale);

  return (
    <header className="bg-white">
      {/* Middle Bar: Logo, Search, Actions */}
      <div className="container mx-auto px-4 py-1.5 md:py-6">
        <div className="flex flex-row items-center justify-between gap-4 md:gap-8">
          {/* Logo Section */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0 cursor-pointer select-none group">
            <button 
              className="lg:hidden p-1.5 -ml-1.5 text-gray-700 hover:text-blue-700 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
            </button>
            <div className="flex flex-col group/logo" onClick={() => onPageChange('home')}>
              <div className="flex items-center gap-2 md:gap-4">
                <div className="text-[28px] md:text-[40px] font-black text-blue-700 group-hover/logo:text-blue-600 transition-all cursor-pointer tracking-tight leading-none">
                  ZAMLUX
                </div>
                <div className="flex flex-col w-[20px] h-[12px] md:w-[42px] md:h-[26px] overflow-hidden rounded-[1px] md:rounded-[2px] shadow-sm border border-black/10 shrink-0 group-hover/logo:border-blue-500/30 transition-colors">
                  <div className="h-1/3 bg-black w-full" />
                  <div className="h-1/3 bg-[#FF0000] w-full" />
                  <div className="h-1/3 bg-[#FFCC00] w-full" />
                </div>
              </div>
              <div className="text-[9px] md:text-[12px] uppercase font-black text-gray-400 tracking-[0.35em] md:tracking-[0.55em] mt-0.5 md:mt-2 border-t border-gray-100 pt-0.5 md:pt-1 text-center w-full group-hover/logo:text-blue-600/60 transition-colors">
                {locale === 'en' ? 'Online Power Cable Shop' : 'Online Stromkabel Shop'}
              </div>
            </div>
          </div>

          {/* Search Section (Desktop only) */}
          <div className="flex-1 w-full max-w-2xl hidden md:flex items-center">
            <div className="flex w-full items-center h-12 bg-[#F8F9FA] border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <input 
                type="text" 
                placeholder={t('search_placeholder')} 
                className="flex-1 px-5 bg-transparent border-none outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
              />
              <div className="h-full px-4 border-l border-gray-200 flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="text-xs font-bold text-gray-600">{locale === 'en' ? 'All Categories' : 'Alle Kategorien'}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
              <button className="h-full bg-blue-700 hover:bg-blue-800 px-6 text-white transition-colors flex items-center justify-center">
                <Search size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Action Actions Section */}
          <div className="flex items-center gap-3 md:gap-6 lg:gap-10 shrink-0">
            <div 
              onClick={() => {
                if (user) {
                  onPageChange('account');
                } else {
                  onAuthClick();
                }
              }} 
              className="flex items-center gap-1.5 md:gap-3 cursor-pointer group"
            >
              <User size={20} className="text-blue-700 group-hover:scale-110 transition-transform md:w-[26px] md:h-[26px]" />
              <div className="hidden lg:block">
                <div className="text-[11px] text-gray-500 font-bold leading-tight">
                  {user ? (locale === 'en' ? 'My Cabinet' : 'Mein Bereich') : t('my_account')}
                </div>
                <div className="text-[13px] font-black text-gray-900 uppercase">
                  {user ? (userProfile?.firstName || user.email?.split('@')[0]) : t('login_register').split('/')[0].trim()}
                </div>
              </div>
            </div>
            
            <div onClick={onCartClick} className="flex items-center gap-1.5 md:gap-3 cursor-pointer group relative">
              <div className="p-1.5 md:p-3 rounded-full bg-blue-700 group-hover:bg-blue-800 transition-all relative text-white shadow-lg shadow-blue-200">
                <ShoppingCart size={18} strokeWidth={2.5} className="md:w-[22px] md:h-[22px]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 md:-top-1.5 md:-right-1.5 bg-blue-500 text-white text-[8px] md:text-[10px] font-black px-1 md:px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden lg:block">
                <div className="text-[13px] font-black text-gray-900 uppercase leading-tight">{t('cart')}</div>
                <div className="text-[14px] font-black text-gray-900">
                  {cartTotal > 0 && (
                    <>
                      {formattedTotal.value} 
                      <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Zap size={10} className="inline text-gray-400" />
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav: Links (Desktop) */}
      <nav className="border-t lg:border-t-0 border-gray-100 bg-white lg:bg-transparent">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="hidden lg:flex items-center justify-center gap-12 xl:gap-20">
              {[
                { label: locale === 'en' ? 'About Us' : 'Über uns', id: 'ueber_uns' },
                { label: t('vs_free_shipping'), id: 'versand' },
                { label: t('rt_badge'), id: 'rueckgabe' },
                { label: t('nav_contact'), id: 'kontakt' },
                { label: t('nav_faq'), id: 'faq' },
              ].map((link) => (
                <button 
                  key={link.id}
                  onClick={() => onPageChange(link.id as PageType)}
                  className="text-[14px] md:text-[15px] font-black text-gray-900 hover:text-blue-700 transition-all py-3 relative group/nav uppercase tracking-[0.05em] whitespace-nowrap"
                >
                  {link.label}
                  <span className="absolute bottom-2 left-0 w-0 h-[2px] bg-blue-700 transition-all group-hover/nav:w-full" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <nav className="p-4 flex flex-col gap-1">
              {[
                { label: locale === 'en' ? 'Home' : 'Startseite', id: 'home' },
                { label: locale === 'en' ? 'About Us' : 'Über uns', id: 'ueber_uns' },
                { label: t('vs_free_shipping'), id: 'versand' },
                { label: t('rt_badge'), id: 'rueckgabe' },
                { label: t('nav_contact'), id: 'kontakt' },
                { label: t('nav_faq'), id: 'faq' },
                { label: locale === 'en' ? 'T&C' : 'AGB', id: 'agb' },
                { label: locale === 'en' ? 'Privacy Policy' : 'Datenschutz', id: 'datenschutz' },
                { label: locale === 'en' ? 'Legal Notice' : 'Impressum', id: 'impressum' },
                { label: locale === 'en' ? 'Cancellation' : 'Widerruf', id: 'widerruf' },
                { label: locale === 'en' ? 'Buyer Protection' : 'Käuferschutz', id: 'kaeuferschutz' },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    onPageChange(link.id as PageType);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-3 px-4 text-xs font-black text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl uppercase tracking-widest transition-all"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const ProductSection = ({ setCurrentProductSlug }: { setCurrentProductSlug: (slug: string | null) => void }) => {
  const { toggleComparison, comparisonList, addToCart, stock } = useApp();
  const [selectedLengths, setSelectedLengths] = useState<Record<string, number>>(
    PRODUCTS.reduce((acc, p) => ({ ...acc, [p.id]: p.availableLengths[0].length }), {})
  );
  const [selectedColors, setSelectedColors] = useState<Record<string, 'Schwarz' | 'Orange'>>(
    PRODUCTS.reduce((acc, p) => ({ ...acc, [p.id]: 'Schwarz' }), {})
  );
  const [specModalProduct, setSpecModalProduct] = useState<string | null>(null);

  // --- Structured SEO Data ---
  useEffect(() => {
    const scriptId = 'structured-data-products';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://zamlux.de"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "H07RN-F Gummikabel",
          "item": "https://zamlux.de/#products"
        }
      ]
    };

    const faqData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Was ist H07RN-F Gummikabel?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "H07RN-F ist eine schwere Gummischlauchleitung für höchste mechanische Beanspruchung. Sie ist ölbeständig, flammwidrig und für den Einsatz im Freien sowie auf Baustellen nach VDE zertifiziert."
          }
        },
        {
          "@type": "Question",
          "name": "Ist das Kabel für den Außenbereich geeignet?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Ja, H07RN-F Gummikabel sind speziell für den dauerhaften Einsatz im Freien konzipiert. Sie sind UV-beständig, wasserfest und extrem witterungsbeständig."
          }
        },
        {
          "@type": "Question",
          "name": "Ist es für die Baustelle geeignet?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolut. Unsere Kabel sind als Baustellenkabel klassifiziert und halten der Belastung durch Maschinen, Fahrzeuge und raue Oberflächen stand."
          }
        }
      ]
    };

    const structuredData = {
      "@context": "https://schema.org/",
      "@graph": [
        ...PRODUCTS.map((product) => ({
          "@type": "Product",
          "name": `${product.name} ${PRODUCT_SPECS_DATA[product.id].crossSection} ${PRODUCT_SPECS_DATA[product.id].length} ${PRODUCT_SPECS_DATA[product.id].voltage}`,
          "image": product.image,
          "description": product.description,
          "sku": product.artNr,
          "gtin13": product.gtin,
          "brand": {
            "@type": "Brand",
            "name": "Zamluxury GmbH"
          },
          "offers": {
            "@type": "Offer",
            "url": `${window.location.origin}/#product-${product.id}`,
            "priceCurrency": "EUR",
            "price": product.availableLengths[0].price,
            "itemCondition": "https://schema.org/NewCondition",
            "availability": "https://schema.org/InStock",
            "priceValidUntil": "2026-12-31",
            "shippingDetails": {
              "@type": "OfferShippingDetails",
              "shippingRate": {
                "@type": "MonetaryAmount",
                "value": 0,
                "currency": "EUR"
              },
              "deliveryTime": {
                "@type": "ShippingDeliveryTime",
                "handlingTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 0,
                  "maxValue": 1,
                  "unitCode": "DAY"
                },
                "transitTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 1,
                  "maxValue": 3,
                  "unitCode": "DAY"
                }
              }
            },
            "hasMerchantReturnPolicy": {
              "@type": "MerchantReturnPolicy",
              "applicableCountry": "DE",
              "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnPeriod",
              "merchantReturnDays": 14,
              "returnMethod": "https://schema.org/ReturnByMail",
              "returnFees": "https://schema.org/FreeReturn"
            },
            "seller": {
              "@type": "Organization",
              "name": "Zamluxury GmbH"
            }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.rating,
            "reviewCount": product.reviewsCount,
            "bestRating": "5",
            "worstRating": "1"
          }
        })),
        breadcrumbData,
        faqData
      ]
    };

    script.text = JSON.stringify(structuredData);

    return () => {
    };
  }, []);

  return (
    <section id="products" 
      className="py-2 md:py-8 relative overflow-hidden border-b border-gray-100"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center mb-2 md:mb-6">
          <h2 className="text-xl md:text-5xl font-black text-[#1e293b] uppercase tracking-tight mb-1.5 md:mb-4">
            Unsere Top Produkte
          </h2>
          <div className="w-12 md:w-20 h-0.5 md:h-2 bg-blue-700 rounded-full shadow-sm shadow-blue-700/20" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {PRODUCTS.map((product, idx) => {
            const currentLength = selectedLengths[product.id];
            const lengthData = product.availableLengths.find(l => l.length === currentLength)!;
            const priceInfo = formatPrice(lengthData.price);
            
            return (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: idx * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                className="group relative bg-white rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-[0_32px_64px_-12px_rgba(37,99,235,0.12)] transition-all duration-500 flex flex-col h-full overflow-hidden"
              >
                {/* Product Header & Gallery */}
                <div className="p-2 md:p-3 pb-0 bg-white">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-4 text-[8px] md:text-[9px] font-black uppercase tracking-widest font-mono">
                        <span className="text-gray-300">ArtNr. {product.artNr}</span>
                        <span className="text-blue-400">GTIN: {product.gtin}</span>
                      </div>
                      <div className="min-h-[2.5rem] md:min-h-[3.5rem]">
                        <h3 className="text-sm md:text-lg font-black text-gray-900 leading-tight tracking-tight uppercase">
                          <span className="text-blue-600">H07RN-F</span> Gummikabel Baustellenkabel
                        </h3>
                        <div className="text-[10px] md:text-xs font-bold text-gray-500 mt-1 flex flex-wrap items-center gap-x-2 opacity-80 uppercase tracking-wider">
                          <span>{PRODUCT_SPECS_DATA[product.id].crossSection}</span>
                          <span className="text-blue-200 inline">•</span>
                          <span>{PRODUCT_SPECS_DATA[product.id].length}</span>
                          <span className="text-blue-200 inline">•</span>
                          <span>{PRODUCT_SPECS_DATA[product.id].voltage}</span>
                        </div>
                      </div>
                    </div>
                    {product.isBestseller && (
                      <Badge className="bg-blue-600 text-white hover:bg-blue-600 border-none px-2 py-0.5 text-[8px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">Bestseller</Badge>
                    )}
                  </div>

                  {/* Gallery Container */}
                  <div className="mb-0 relative">
                    <ProductGallery product={product} selectedColor={selectedColors[product.id] || 'Schwarz'} />
                  </div>
                  
                  <div className="flex justify-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all translate-y-0 lg:translate-y-2 lg:group-hover:translate-y-0 pb-1 mt-0">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="rounded-full bg-white/90 backdrop-blur shadow-sm font-bold text-[9px] h-7 px-3 border border-gray-100"
                      onClick={() => toggleComparison(product.id)}
                    >
                      <BarChart2 size={10} className="mr-1.5" /> {comparisonList.includes(product.id) ? 'Entfernen' : 'Vergleichen'}
                    </Button>
                  </div>
                </div>

                {/* Product Meta */}
                <div className="px-3 pb-2 pt-0 md:px-5 md:pb-4 md:pt-0 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={10} fill={s <= product.rating ? "#F59E0B" : "none"} color={s <= product.rating ? "#F59E0B" : "#E2E8F0"} />
                      ))}
                    </div>
                    <span className="text-[9px] md:text-[10px] text-gray-400 font-bold ml-1 uppercase tracking-widest">({product.reviewsCount} REVIEWS)</span>
                  </div>

                  <p className="text-[11px] md:text-[12px] text-gray-500 font-medium leading-relaxed mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Technical Area */}
                  <div className="mb-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <FileText size={14} className="text-blue-600" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Technische Daten</span>
                        </div>
                        <button 
                          onClick={() => setSpecModalProduct(product.id)}
                          className="text-[8px] md:text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1 group"
                        >
                          Vollständige Spezifikation 
                          <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-2 bg-white rounded-2xl p-2 md:p-3 border border-gray-100">
                      {[
                        { label: 'Kabeltyp', value: PRODUCT_SPECS_DATA[product.id].type },
                        { label: 'Querschnitt', value: PRODUCT_SPECS_DATA[product.id].crossSection },
                        { label: 'Spannung', value: PRODUCT_SPECS_DATA[product.id].voltage },
                        { label: 'Farbe', value: selectedColors[product.id] || 'Schwarz' },
                        { label: 'Länge', value: `${currentLength}m` },
                        { label: 'EAN', value: currentLength === 50 ? '4270004984200' : PRODUCT_SPECS_DATA[product.id].gtin },
                        { label: 'Einsatz', value: PRODUCT_SPECS_DATA[product.id].application, full: true },
                      ].map((spec, i) => (
                        <div key={i} className={cn("flex flex-col", spec.full && "col-span-2")}>
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{spec.label}</span>
                          <span className="text-[10px] md:text-[11px] font-bold text-gray-900 truncate">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div className="mb-4 bg-gray-50/70 p-2.5 rounded-2xl border border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none block mb-2">Mantelfarbe wählen</span>
                    <div className="flex gap-2">
                      {['Schwarz', 'Orange'].map((colorName) => {
                        const isSelected = (selectedColors[product.id] || 'Schwarz') === colorName;
                        return (
                          <button
                            key={colorName}
                            onClick={() => setSelectedColors(prev => ({ ...prev, [product.id]: colorName as 'Schwarz' | 'Orange' }))}
                            className={cn(
                              "flex-1 py-1.5 px-3 rounded-xl border text-center font-black text-[10px] md:text-xs transition-all duration-300 uppercase tracking-wider flex items-center justify-center gap-1.5",
                              isSelected 
                                ? colorName === 'Orange' 
                                  ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10" 
                                  : "bg-gray-950 border-gray-950 text-white shadow-md shadow-gray-950/10"
                                : "bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                            )}
                          >
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full border border-white/20",
                              colorName === 'Orange' ? "bg-orange-400" : "bg-black"
                            )} />
                            {colorName}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Length Selection */}
                  {product.availableLengths.length > 1 && (
                    <div className="mb-4 bg-gray-50/70 p-2.5 rounded-2xl border border-gray-100">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none block mb-2">Kabellänge wählen</span>
                      <div className="flex gap-2">
                        {product.availableLengths.map((lenObj) => {
                          const isSelected = currentLength === lenObj.length;
                          return (
                            <button
                              key={lenObj.length}
                              onClick={() => setSelectedLengths(prev => ({ ...prev, [product.id]: lenObj.length }))}
                              className={cn(
                                "flex-1 py-1.5 px-3 rounded-xl border text-center font-black text-[10px] md:text-xs transition-all duration-300 uppercase tracking-wider",
                                isSelected 
                                  ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/10" 
                                  : "bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                              )}
                            >
                              {lenObj.length}m
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Footer Action */}
                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 leading-none">Bestellpreis</div>
                        <div className="flex items-baseline gap-1.5">
                          <div className="text-xl md:text-2xl font-black text-gray-900 leading-none tracking-tighter">
                            {priceInfo.value}
                          </div>
                          <div className="text-[8px] md:text-[9px] font-black text-blue-500 uppercase tracking-widest whitespace-nowrap">
                            ({(lengthData.price / currentLength).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €/m)
                          </div>
                        </div>
                        <div className="text-[7px] md:text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-tight">
                          Alle Preise inkl. gesetzlicher MwSt.
                        </div>
                      </div>
                    {(() => {
                      const selectedColor = selectedColors[product.id] || 'Schwarz';
                      const stockKey = `${product.id}_${selectedColor}_${currentLength}`;
                      const legacyStockKey = `${product.id}_${selectedColor}`;
                      const getDefaultStockVal = (pId: string, col: string, len: number) => {
                        if (pId === 'p1') return col === 'Schwarz' ? (len === 50 ? 75 : 75) : 50;
                        if (pId === 'p2') return col === 'Schwarz' ? 120 : 80;
                        return col === 'Schwarz' ? 85 : 50;
                      };
                      const productStock = stock[stockKey] ?? stock[legacyStockKey] ?? getDefaultStockVal(product.id, selectedColor, currentLength);
                      return (
                        <Button 
                            onClick={() => { const SLUG_MAP = { p1: { Schwarz: { 50: "kab3-15-50m-sw", 100: "kab3-15-100m-sw" }, Orange: { 50: "kab3-15-50m-or", 100: "kab3-15-100m-or" } }, p2: { Schwarz: { 100: "kab3-25-100m-sw" }, Orange: { 100: "kab3-25-100m-or" } }, p3: { Schwarz: { 100: "kab5-25-100m-sw" }, Orange: { 100: "kab5-25-100m-or" } } }; addToCart(product.id, currentLength, 1, selectedColor); const slug = SLUG_MAP[product.id]?.[selectedColor]?.[currentLength]; if (slug) window.history.pushState({}, "", "/produkt/" + slug); setCurrentProductSlug(slug); }}
                          disabled={productStock === 0}
                          className={cn(
                            "h-10 md:h-11 rounded-xl px-4 font-black gap-2 shadow-lg active:scale-95 transition-all text-[10px] uppercase tracking-widest text-white cursor-pointer",
                            productStock === 0 
                              ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed opacity-60 shadow-none" 
                              : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                          )}
                        >
                          <ShoppingCart size={14} />
                          <span>{productStock === 0 ? 'Ausverkauft' : 'Kaufen'}</span>
                        </Button>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <SpecModal 
          isOpen={!!specModalProduct} 
          onClose={() => setSpecModalProduct(null)} 
          productId={specModalProduct} 
        />
      </div>
    </section>
  );
};

const ComparisonPanel = () => {
  const { comparisonList, removeFromComparison } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  if (comparisonList.length === 0) return null;
  const comparedProducts = comparisonList.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean) as typeof PRODUCTS;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 flex justify-center pointer-events-none">
      <div className="bg-white border-2 border-blue-600 rounded-2xl shadow-2xl p-4 flex items-center gap-4 pointer-events-auto max-w-2xl w-full">
        <div className="flex-1 flex gap-2">
          {comparedProducts.map(p => (
            <div key={p.id} className="relative">
              <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 p-1">
                <img src={p.image} className="max-h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <button onClick={() => removeFromComparison(p.id)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={10} /></button>
            </div>
          ))}
        </div>
        <Button onClick={() => setIsOpen(true)}>Vergleichen ({comparedProducts.length})</Button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed inset-0 bg-white z-[70] flex flex-col pointer-events-auto overflow-auto p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black">Produktvergleich</h2>
              <Button variant="ghost" onClick={() => setIsOpen(false)}><X size={32} /></Button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="p-2 md:p-3 border-b">Feature</th>
                  {comparedProducts.map(p => <th key={p.id} className="p-2 md:p-3 border-b text-center">{p.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_SPECS.map(spec => (
                  <tr key={spec.key} className="hover:bg-gray-50">
                    <td className="p-2 md:p-3 font-bold border-b">{spec.label}</td>
                    {comparedProducts.map(p => <td key={p.id} className="p-2 md:p-3 border-b text-center">{PRODUCT_SPECS_DATA[p.id][spec.key]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CookieBanner = () => {
  const [accepted, setAccepted] = useState(true);
  useEffect(() => {
    if (!localStorage.getItem('cookies-accepted')) setAccepted(false);
  }, []);
  const handleAccept = () => { localStorage.setItem('cookies-accepted', 'true'); setAccepted(true); };
  if (accepted) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 flex justify-center">
      <div className="bg-white border shadow-2xl p-6 max-w-4xl w-full flex items-center gap-6 rounded-2xl">
        <div className="flex-1 text-sm">Wir verwenden Cookies für ein optimales Erlebnis.</div>
        <Button onClick={handleAccept}>Akzeptieren</Button>
      </div>
    </div>
  );
};

const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { login, register, t } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!firstName.trim() || !lastName.trim()) {
          throw new Error('Bitte füllen Sie Vorname und Nachname aus.');
        }
        if (password !== confirmPassword) {
          throw new Error('Die Passwörter stimmen nicht überein.');
        }
        if (password.length < 6) {
          throw new Error('Das Passwort muss mindestens 6 Zeichen lang sein.');
        }
        await register(email, password, firstName, lastName);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || 'Ein Fehler ist aufgetreten.';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'Diese E-Mail-Adresse wird bereits verwendet.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'Ungültige E-Mail-Adresse oder falsches Passwort.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Die E-Mail-Adresse ist ungültig.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Das Passwort ist zu schwach (mindestens 6 Zeichen erforderlich).';
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60" onClick={onClose} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white max-w-md w-full p-8 rounded-3xl relative z-10 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">{isLogin ? 'Anmelden' : 'Registrieren'}</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="Vorname" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)}
                    required
                  />
                  <Input 
                    placeholder="Nachname" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)}
                    required
                  />
                </div>
              )}
              <Input 
                placeholder="E-Mail" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Input 
                type="password" 
                placeholder="Passwort" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                required
              />
              {!isLogin && (
                <Input 
                  type="password" 
                  placeholder="Passwort wiederholen" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              )}
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-bold rounded-xl mt-2 flex items-center justify-center text-white"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  isLogin ? 'Anmelden' : 'Konto erstellen'
                )}
              </Button>
              
              <div className="pt-4 text-center">
                <p className="text-sm text-gray-500">
                  {isLogin ? 'Noch kein Konto?' : 'Bereits ein Konto?'}
                  <button 
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError(null);
                    }}
                    className="ml-2 text-blue-600 font-bold hover:underline"
                  >
                    {isLogin ? 'Jetzt registrieren' : 'Hier anmelden'}
                  </button>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const SpecModal = ({ isOpen, onClose, productId }: { isOpen: boolean; onClose: () => void; productId: string | null }) => {
  if (!productId) return null;
  const product = PRODUCTS.find(p => p.id === productId);
  const specs = PRODUCT_SPECS_DATA[productId];
  if (!product || !specs) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 rounded-3xl relative z-10 shadow-2xl custom-scrollbar"
          >
            <div className="flex justify-between items-start mb-8 sticky top-0 bg-white z-10 pb-4 border-b border-gray-100">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-black uppercase tracking-widest border border-blue-100/50">
                    <Truck size={10} />
                    Versand DE
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-600 rounded text-[8px] font-black uppercase tracking-widest border border-green-100/50">
                    <Building2 size={10} />
                    Industrie & Bau
                  </div>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                  Technische Spezifikation
                </h2>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                   <p className="text-[10px] md:text-xs font-bold text-blue-600 uppercase tracking-widest">
                     {product.name} {specs.crossSection}
                   </p>
                   <p className="text-[9px] font-mono font-bold text-gray-400">
                     GTIN/EAN: {product.gtin}
                   </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Technical Details Column */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Settings2 size={14} className="text-blue-600" />
                    Produktidentifikation
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { label: 'Artikelnummer', value: product.artNr },
                      { label: 'EAN / GTIN', value: product.gtin },
                      { label: 'Status', value: 'Ab Lager verfügbar (DE)' },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100 border-dashed">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{item.label}</span>
                        <span className="text-[11px] font-black text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Zap size={14} className="text-blue-600" />
                    Elektrische Parameter
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { label: 'Nennspannung', value: specs.voltage },
                      { label: 'Prüfspannung', value: '2500 V' },
                      { label: 'Leiterquerschnitt', value: specs.crossSection },
                      { label: 'Aderanzahl', value: specs.crossSection.split('G')[0] },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-500">{item.label}</span>
                        <span className="text-[11px] font-black text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Physical Properties Column */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Construction size={14} className="text-blue-600" />
                    Qualitätsmerkmale
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { label: 'Zertifikate', value: specs.certification },
                      { label: 'Flexibilität', value: specs.flexibility },
                      { label: 'UV-Beständig', value: 'Ja' },
                      { label: 'Eignung', value: specs.usage },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col gap-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">{item.label}</span>
                        <span className="text-[11px] font-black text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-gray-900 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-white">Datenblätter</span>
                  </div>
                  <div className="space-y-2">
                    <a 
                      href={`/datasheets/H07RN-F-${specs.crossSection.replace(/\s/g, '').replace('mm²', '')}-100m.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 text-[10px] font-black">PDF</div>
                        <div className="text-left">
                          <div className="text-[10px] font-black text-white uppercase tracking-tight">Technisches Datenblatt</div>
                          <div className="text-[8px] text-white/40 font-bold uppercase tracking-tighter">H07RN-F-{specs.crossSection.replace(/\s/g, '').replace('mm²', '')}-100m.pdf</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest hidden md:inline">Download</span>
                        <ChevronRight size={14} className="text-white/20 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[10px] text-gray-400 font-medium italic">
                Alle Angaben basieren auf VDE-Richtlinien und Herstellerangaben. Irrtümer vorbehalten.
              </p>
              <Button onClick={onClose} className="w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700 px-8 h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-600/20">
                Fenster schließen
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};



function MainContent({ onAuthClick, onCartClick, onCheckoutClick, currentPage, setCurrentPage, currentProductSlug, setCurrentProductSlug }: any) {
  const goHome = () => setCurrentPage('home');

  if (currentPage === 'admin') {
    return <AdminPage onClose={goHome} />;
  }

  if (currentProductSlug) { return <ProductPage slug={currentProductSlug} onCartClick={onCartClick} onClose={() => { setCurrentProductSlug(null); }} />; }
  if (currentPage === 'account') {
    return <AccountPage onClose={goHome} />;
  }

  const renderPage = () => {
    if (currentPage === 'home') {
      return (
        <>
          <div
            style={{ 
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.85)), url("/zadniy fon.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            className="relative"
          >
            <FeatureHighlights />
            <ProductSection setCurrentProductSlug={setCurrentProductSlug} />
          </div>
          <GlobalReviews />
        </>
      );
    }
    if (currentPage === 'kontakt') return <KontaktPage onClose={goHome} />;
    if (currentPage === 'versand') return <VersandPage onClose={goHome} />;
    if (currentPage === 'rueckgabe') return <RueckgabePage onClose={goHome} />;
  
    if (currentPage === 'faq') return <FAQPage onClose={goHome} />;
    return <LegalPage type={currentPage as keyof typeof LEGAL_CONTENT} onClose={goHome} />;
  };

  return (
    <>
      <Header onAuthClick={onAuthClick} onCartClick={onCartClick} onPageChange={setCurrentPage} />
      <main>{renderPage()}</main>

      <footer className="relative bg-[#0B1220] bg-gradient-to-br from-[#101828] via-[#0F172A] to-[#0B1220] overflow-hidden text-white pt-8 pb-2 mt-2 md:mt-4 border-t border-white/10">
        {/* Subtle Industrial Glow Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-4 md:mb-8">
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-3 md:mb-4 cursor-pointer group/footer-brand" onClick={() => setCurrentPage('home')}>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="text-[22px] md:text-[27px] font-black text-blue-500 group-hover/footer-brand:text-blue-400 transition-all tracking-tight flex items-center gap-2 md:gap-3">
                  ZAMLUX
                  <div className="flex flex-col w-[26px] h-[16px] md:w-[31px] md:h-[19px] overflow-hidden rounded-[2px] shadow-sm border border-white/10 shrink-0">
                    <div className="h-1/3 bg-black w-full" />
                    <div className="h-1/3 bg-[#FF0000] w-full" />
                    <div className="h-1/3 bg-[#FFCC00] w-full" />
                  </div>
                </div>
              </div>
              <div className="text-[6px] md:text-[6.5px] uppercase font-black text-white/20 tracking-[0.4em] mt-1 pt-1 border-t border-white/5 w-fit group-hover/footer-brand:text-blue-400/50 transition-colors">
                Zamluxury GmbH &bull; Premium Industriekabel
              </div>
            </div>
            <div className="text-slate-400 text-[11px] md:text-[13px] space-y-1.5 md:space-y-2 font-medium">
              <p className="flex items-center gap-2.5 group cursor-default">
                <span className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-blue-600/20 group-hover:border-blue-500/50 transition-all duration-300">
                  <Phone size={13} className="text-blue-400" />
                </span>
                <span className="group-hover:text-blue-400 transition-colors">+49 155 604 45708</span>
              </p>
              <p className="flex items-center gap-2.5 group cursor-default">
                <span className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-blue-600/20 group-hover:border-blue-500/50 transition-all duration-300">
                  <Mail size={13} className="text-blue-400" />
                </span>
                <span className="group-hover:text-blue-400 transition-colors">info@zamlux.de</span>
              </p>
              <div className="pt-1 space-y-2">
                <div className="flex flex-col group cursor-default">
                  <div className="flex items-center gap-2 mb-0.5">
                    <FileText size={12} className="text-blue-500/70 group-hover:text-blue-400 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-white/30 group-hover:text-blue-400/50 transition-colors">Steuernummer</span>
                  </div>
                  <span className="text-[12px] text-slate-400 font-bold ml-5 group-hover:text-blue-400/80 transition-colors">29/603/30724</span>
                </div>
                <div className="flex flex-col group cursor-default">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Building2 size={12} className="text-blue-500/70 group-hover:text-blue-400 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-white/30 group-hover:text-blue-400/50 transition-colors">USt-IdNr.</span>
                  </div>
                  <span className="text-[12px] text-slate-400 font-bold ml-5 group-hover:text-blue-400/80 transition-colors">DE353283405</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] mb-2 md:mb-4 text-white/50 hover:text-blue-400 transition-colors cursor-default">Shop Service</h4>
            <ul className="text-slate-400 text-[11px] md:text-[13px] space-y-1.5 md:space-y-2 font-medium">
              <li><button onClick={() => setCurrentPage('ueber_uns')} className="hover:text-blue-400 transition-colors">Über uns</button></li>
              <li><button onClick={() => setCurrentPage('versand')} className="hover:text-blue-400 transition-colors">Kostenlose Lieferung</button></li>
              <li><button onClick={() => setCurrentPage('rueckgabe')} className="hover:text-blue-400 transition-colors">Rückgabe</button></li>
              <li><button onClick={() => setCurrentPage('kontakt')} className="hover:text-blue-400 transition-colors">Kontakt</button></li>
              <li><button onClick={() => setCurrentPage('faq')} className="hover:text-blue-400 transition-colors">FAQ</button></li>
              <li><button onClick={() => setCurrentPage('admin')} className="hover:text-blue-400 transition-colors">Lagerverwaltung</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] mb-2 md:mb-4 text-white/50 hover:text-blue-400 transition-colors cursor-default">Rechtliches</h4>
            <ul className="text-slate-400 text-[11px] md:text-[13px] space-y-1.5 md:space-y-2 font-medium">
              <li><button onClick={() => setCurrentPage('agb')} className="hover:text-blue-400 transition-colors">AGB</button></li>
              <li><button onClick={() => setCurrentPage('datenschutz')} className="hover:text-blue-400 transition-colors">Datenschutz</button></li>
              <li><button onClick={() => setCurrentPage('impressum')} className="hover:text-blue-400 transition-colors">Impressum</button></li>
              <li><button onClick={() => setCurrentPage('widerruf')} className="hover:text-blue-400 transition-colors">Widerrufsbelehrung</button></li>
              <li><button onClick={() => setCurrentPage('kaeuferschutz')} className="hover:text-blue-400 transition-colors">Käuferschutz</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] mb-2 md:mb-4 text-white/50 hover:text-blue-400 transition-colors cursor-default">Trust & Qualität</h4>
            <div className="space-y-1.5 md:space-y-2">
              {[
                { icon: <Truck className="w-4 h-4" />, text: "Versand DE", desc: "1-3 Werktage" },
                { icon: <Box className="w-4 h-4" />, text: "Direkt ab Lager", desc: "Sofort verfügbar" },
                { icon: <Zap className="w-4 h-4" />, text: "Hersteller-Direkt", desc: "Bester Preis" },
                { icon: <ShieldCheck className="w-4 h-4" />, text: "VDE zertifiziert", desc: "Höchste Qualität" },
                { icon: <div className="text-[11px] font-black tracking-tighter leading-none border-[1.5px] border-current px-1 rounded-[1px]">CE</div>, text: "CE & RoHS", desc: "Zertifiziert" },
                { icon: <User className="w-4 h-4" />, text: "B2B & B2C", desc: "Grosshandel" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 group cursor-default">
                  <div className="text-slate-500 transition-all duration-300 flex-shrink-0 group-hover:scale-110 group-hover:text-blue-500">
                    {item.icon}
                  </div>
                  <span className="text-[13px] font-medium text-slate-400 truncate group-hover:text-blue-400 transition-colors">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Partners & Information */}
        <div className="border-t border-white/10 pt-4 pb-2 container mx-auto px-4">
          <div className="flex flex-col items-center">
            {/* Logos Grid */}
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4 mb-6">
              {[
                { name: 'DHL', text: <div className="text-[14px] font-black italic tracking-tighter flex items-center group-hover:scale-105 transition-all hover:drop-shadow-[0_0_10px_rgba(255,204,0,0.4)]"><span className="text-[#FFCC00]">DHL</span><span className="text-[#D40511] ml-0.5 text-[10px] not-italic">EXPRESS</span></div> },
                { name: 'HERMES', text: <div className="text-[14px] font-black tracking-tighter text-[#00A6DE] group-hover:scale-105 transition-all hover:drop-shadow-[0_0_10px_rgba(0,166,222,0.4)]">Hermes</div> },
                { name: 'PAYPAL', text: <div className="text-[15px] font-black italic text-[#003087] group-hover:scale-105 transition-all hover:drop-shadow-[0_0_10px_rgba(0,156,222,0.4)]">Pay<span className="text-[#009CDE]">Pal</span></div> },
                { name: 'VISA', text: <div className="flex items-center gap-1 group-hover:scale-105 transition-all hover:drop-shadow-[0_0_10px_rgba(37,71,150,0.4)]"><div className="bg-[#1A1F71] px-1.5 py-0.5 rounded-[2px]"><span className="text-[11px] font-black text-white italic">VISA</span></div></div> },
                { name: 'MASTERCARD', text: <div className="flex items-center gap-2 group-hover:scale-105 transition-all hover:drop-shadow-[0_0_10px_rgba(235,0,27,0.3)]"><div className="flex -space-x-1.5"><div className="w-4 h-4 bg-[#EB001B] rounded-full" /><div className="w-4 h-4 bg-[#F79E1B] rounded-full opacity-90" /></div><span className="text-[11px] font-black text-white italic tracking-tighter lowercase">mastercard</span></div> },
                { name: 'APPLEPAY', text: <div className="flex items-center gap-1 group-hover:scale-105 transition-all bg-black px-2 py-0.5 rounded border border-white/10"><div className="w-3.5 h-3.5 bg-white rounded-full opacity-100 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black rounded-full" /></div><span className="text-[11px] font-bold text-white tracking-tighter italic">Pay</span></div> },
                { name: 'GOOGLEPAY', text: <div className="flex items-center gap-1.5 group-hover:scale-105 transition-all bg-white/5 px-2 py-1 rounded border border-white/10"><span className="flex items-center font-bold tracking-tight"><span className="text-[#4285F4]">G</span><span className="text-[#EA4335]">o</span><span className="text-[#FBBC05]">o</span><span className="text-[#4285F4]">g</span><span className="text-[#34A853]">l</span><span className="text-[#EA4335]">e</span></span><span className="text-[10px] font-black text-white/90">Pay</span></div> },
                { name: 'KLARNA', text: <div className="text-[14px] font-black text-[#FFB3C7] group-hover:scale-105 transition-all hover:drop-shadow-[0_0_10px_rgba(255,179,199,0.5)] tracking-tight">Klarna.</div> },
                { name: 'SEPA', text: <div className="bg-[#003087] px-2 py-1 rounded border border-white/20 flex items-center gap-1.5 group-hover:scale-105 transition-all"><div className="w-3 h-2 border border-white rounded-[1px] relative overflow-hidden"><div className="absolute inset-0 bg-white/20 flex items-center justify-center"><div className="w-1 h-1 bg-white rounded-full" /></div></div><span className="text-[10px] font-black text-white tracking-widest">SEPA</span></div> }
              ].map((logo, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-center transition-all duration-300 opacity-60 hover:opacity-100 cursor-default group"
                >
                  <div className="hover:scale-110 transition-transform duration-300">
                    {logo.text}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="w-12 h-[1px] bg-white/10 mb-4" />

            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] mb-3 leading-none">
              &copy; {new Date().getFullYear()} Zamluxury GmbH &mdash; Premium Industriekabel aus Deutschland
            </p>

            <button
              onClick={() => setCurrentPage('admin')}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-600/30 active:scale-95 cursor-pointer"
            >
              <ShieldCheck size={13} className="text-white animate-pulse" />
              <span>Lagerverwaltung (Admin)</span>
            </button>
          </div>
        </div>
      </footer>
      <ComparisonPanel />
      <CookieBanner />
    </>
  );
}

const CheckoutModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { cart, clearCart, user, userProfile } = useApp();
  const [step, setStep] = useState<'shipping' | 'payment' | 'review' | 'success'>('shipping');
  const [formData, setFormData] = useState({
    vorname: '',
    nachname: '',
    strasse: '',
    plz: '',
    stadt: '',
    land: 'Deutschland',
    email: '',
    telefon: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        vorname: userProfile.firstName || '',
        nachname: userProfile.lastName || '',
        strasse: userProfile.strasse || '',
        plz: userProfile.plz || '',
        stadt: userProfile.stadt || '',
        land: userProfile.land || 'Deutschland',
        email: userProfile.email || user?.email || '',
        telefon: userProfile.telefon || ''
      });
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }));
    }
  }, [user, userProfile]);

  const totalBruto = cart.reduce((acc, item) => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    const lengthData = product?.availableLengths.find(l => l.length === item.length);
    return acc + (lengthData?.price || 0) * item.quantity;
  }, 0);

  const subtotalNeto = totalBruto / 1.19;
  const vat = totalBruto - subtotalNeto;
  const format = (num: number) => num.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  
  const handleStripeCheckout = async () => {
    try {
      const items = cart.map((item) => {
              const product = PRODUCTS.find((p) => p.id === item.productId);
              const lengthData = product?.availableLengths.find((l) => l.length === item.length);
              return {
                name: `${product?.name} ${item.length}m ${item.color || 'Schwarz'}`,
                price: lengthData?.price || 0,
                quantity: item.quantity,
              };
            });

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customerEmail: formData.email }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Es gab ein Problem bei der Zahlung. Bitte versuchen Sie es erneut.');
      }
    } catch (err) {
      console.error('Stripe checkout request failed:', err);
      alert('Es gab ein Problem bei der Zahlung. Bitte versuchen Sie es erneut.');
    }
  };
  const handlePlaceOrder = async (extraDetails?: any) => {
    try {
      const orderData = {
        userId: user ? user.uid : null,
        customer: formData,
        items: cart.map(item => {
          const product = PRODUCTS.find(p => p.id === item.productId)!;
          const lengthData = product.availableLengths.find(l => l.length === item.length)!;
          return {
            productId: item.productId,
            name: product.name,
            length: item.length,
            color: item.color || 'Schwarz',
            quantity: item.quantity,
            price: lengthData.price
          };
        }),
        total: totalBruto,
        paymentMethod: paymentMethod,
        paymentDetails: extraDetails
      };
      
      await saveOrder(orderData);
      setStep('success');
      clearCart();
    } catch (err) {
      console.error('Order placement error:', err);
      setError('Ihre Bestellung konnte nicht gespeichert werden. Bitte kontaktieren Sie uns.');
    }
  };

  const createPayPalOrder = async () => {
    setError(null);
    try {
      const cartItems = cart.map(item => {
        const product = PRODUCTS.find(p => p.id === item.productId)!;
        const lengthData = product.availableLengths.find(l => l.length === item.length)!;
        return {
          name: product.name,
          price: lengthData.price,
          quantity: item.quantity
        };
      });

      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: cartItems }),
      });
      const orderData = await response.json();
      if (!response.ok) {
        console.error('PayPal createOrder failed:', orderData);
        throw new Error(orderData.error || 'Order creation failed');
      }
      return orderData.id;
    } catch (err: any) {
      console.error('PayPal createOrder error:', err);
      setError('PayPal-Zahlung fehlgeschlagen. Bitte prüfen Sie Ihre Zahlungsdaten oder wählen Sie eine andere Zahlungsart.');
      throw err;
    }
  };

  const onPayPalApprove = async (data: any) => {
    try {
      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID: data.orderID }),
      });
      const details = await response.json();
      if (!response.ok) {
        console.error('PayPal capture failed:', details);
        throw new Error(details.error || 'Payment capture failed');
      }
      if (details.status === 'COMPLETED') {
        await handlePlaceOrder(details);
      } else {
        throw new Error('PayPal payment status not COMPLETED');
      }
    } catch (err: any) {
      console.error('PayPal capture error:', err);
      setError('PayPal-Zahlung fehlgeschlagen. Bitte prüfen Sie Ihre Zahlungsdaten oder wählen Sie eine andere Zahlungsart.');
    }
  };

  const onPayPalError = (err: any) => {
    console.error('PayPal SDK error:', err);
    setError('PayPal-Zahlung fehlgeschlagen. Bitte prüfen Sie Ihre Zahlungsdaten oder wählen Sie eine andere Zahlungsart.');
  };

  const onPayPalCancel = () => {
    setError('Der Zahlungsvorgang wurde abgebrochen.');
  };

  const isShippingValid = formData.vorname && formData.nachname && formData.strasse && formData.plz && formData.stadt && formData.email;

  const paymentOptions = [
    { id: 'paypal', label: 'PayPal', icon: <div className="flex -space-x-1.5 items-center"><div className="w-5 h-5 bg-[#003087] rounded-full border border-white shadow-sm flex items-center justify-center"><span className="text-[10px] text-white font-black italic">P</span></div><div className="w-5 h-5 bg-[#009CDE] rounded-full border border-white shadow-sm flex items-center justify-center"><span className="text-[10px] text-white font-black italic">P</span></div></div> },
    { id: 'visa', label: 'Visa', icon: <CreditCard size={22} className="text-[#1A1F71]" /> },
    { id: 'mastercard', label: 'Mastercard', icon: <div className="flex -space-x-2.5"><div className="w-6 h-6 bg-[#EB001B] rounded-full" /><div className="w-6 h-6 bg-[#F79E1B] rounded-full opacity-90" /></div> },
    { id: 'applepay', label: 'Apple Pay', icon: <div className="w-10 h-6 bg-black rounded flex items-center justify-center"><div className="w-3 h-3 bg-white rounded-full opacity-20" /></div> },
    { id: 'googlepay', label: 'Google Pay', icon: <div className="w-10 h-6 bg-gray-50 border border-gray-200 rounded flex items-center justify-center gap-0.5"><div className="w-2 h-2 bg-blue-500 rounded-full" /><div className="w-2 h-2 bg-red-500 rounded-full" /></div> },
    { id: 'klarna', label: 'Klarna', icon: <div className="px-2 py-0.5 bg-[#FFB3C7] rounded-full text-[10px] font-black text-black italic">K.</div> },
    { id: 'sepa', label: 'SEPA', icon: <div className="w-10 h-6 border-2 border-gray-900 rounded flex items-center justify-center"><span className="text-[7px] font-black tracking-tighter">BANK</span></div> }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-900/80 backdrop-blur-md" 
          onClick={onClose} 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-[2.5rem] relative z-10 shadow-2xl flex flex-col md:flex-row"
        >
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <div className="flex items-center gap-3 md:gap-6">
                {['shipping', 'payment', 'review'].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                     <div className={cn(
                       "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all",
                       step === s ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : i < ['shipping', 'payment', 'review'].indexOf(step) ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
                     )}>
                       {i < ['shipping', 'payment', 'review'].indexOf(step) ? <Check size={12} strokeWidth={3} /> : i + 1}
                     </div>
                     <span className={cn(
                       "text-[9px] font-black uppercase tracking-[0.2em] hidden sm:block",
                       step === s ? "text-gray-900" : "text-gray-300"
                     )}>
                       {s === 'shipping' ? 'Versand' : s === 'payment' ? 'Zahlung' : 'Prüfen'}
                     </span>
                  </div>
                ))}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600"
              >
                <div className="shrink-0 mt-0.5"><X size={16} className="text-red-500" /></div>
                <div className="text-xs font-bold leading-relaxed">{error}</div>
                <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><X size={14} /></button>
              </motion.div>
            )}

            {step === 'shipping' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">Lieferadresse</h2>
                  <p className="text-gray-500 text-sm font-medium">Wohin dürfen wir Ihre Bestellung senden?</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                  <div className="space-y-1 text-black">
                    <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vorname</label>
                    <Input 
                      placeholder="Max" 
                      className="rounded-xl border-gray-200 h-10 md:h-12 focus:ring-blue-600/10 focus:border-blue-600 text-black placeholder:text-gray-400"
                      value={formData.vorname}
                      onChange={e => setFormData(d => ({ ...d, vorname: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1 text-black">
                    <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nachname</label>
                    <Input 
                      placeholder="Mustermann" 
                      className="rounded-xl border-gray-200 h-10 md:h-12 focus:ring-blue-600/10 focus:border-blue-600 text-black placeholder:text-gray-400"
                      value={formData.nachname}
                      onChange={e => setFormData(d => ({ ...d, nachname: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1 text-black">
                    <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Straße und Hausnummer</label>
                    <Input 
                      placeholder="Musterweg 123" 
                      className="rounded-xl border-gray-200 h-10 md:h-12 focus:ring-blue-600/10 focus:border-blue-600 text-black placeholder:text-gray-400"
                      value={formData.strasse}
                      onChange={e => setFormData(d => ({ ...d, strasse: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1 text-black">
                    <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PLZ</label>
                    <Input 
                      placeholder="12345" 
                      className="rounded-xl border-gray-200 h-10 md:h-12 focus:ring-blue-600/10 focus:border-blue-600 text-black placeholder:text-gray-400"
                      value={formData.plz}
                      onChange={e => setFormData(d => ({ ...d, plz: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1 text-black">
                    <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stadt</label>
                    <Input 
                      placeholder="Berlin" 
                      className="rounded-xl border-gray-200 h-10 md:h-12 focus:ring-blue-600/10 focus:border-blue-600 text-black placeholder:text-gray-400"
                      value={formData.stadt}
                      onChange={e => setFormData(d => ({ ...d, stadt: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1 text-black">
                    <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Land</label>
                    <Input 
                      placeholder="Deutschland" 
                      readOnly
                      className="rounded-xl border-gray-200 h-10 md:h-12 bg-gray-50 text-gray-500 font-bold"
                      value={formData.land}
                    />
                  </div>
                  <div className="md:col-span-2 grid md:grid-cols-2 gap-3 md:gap-5 pt-3 md:pt-4 border-t border-gray-100">
                    <div className="space-y-1 text-black">
                      <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-Mail Adresse</label>
                      <Input 
                        type="email"
                        placeholder="max@beispiel.de" 
                        className="rounded-xl border-gray-200 h-10 md:h-12 focus:ring-blue-600/10 focus:border-blue-600 text-black placeholder:text-gray-400"
                        value={formData.email}
                        onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1 text-black">
                      <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Telefon (optional)</label>
                      <Input 
                        placeholder="+49 123 456789" 
                        className="rounded-xl border-gray-200 h-10 md:h-12 focus:ring-blue-600/10 focus:border-blue-600 text-black placeholder:text-gray-400"
                        value={formData.telefon}
                        onChange={e => setFormData(d => ({ ...d, telefon: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-6">
                  <Button 
                    disabled={!isShippingValid}
                    onClick={() => setStep('payment')}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-sm font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all text-white border-none"
                  >
                    Weiter zur Zahlung
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">Zahlungsart</h2>
                  <p className="text-gray-500 text-sm font-medium">Wie möchten Sie bezahlen?</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {paymentOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setPaymentMethod(option.id)}
                      className={cn(
                        "flex items-center justify-between h-14 md:h-16 p-4 md:p-5 rounded-2xl border-2 transition-all text-left group",
                        paymentMethod === option.id 
                          ? "border-blue-600 bg-blue-50/30 ring-4 ring-blue-50" 
                          : "border-gray-50 hover:border-gray-200 bg-white"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          paymentMethod === option.id ? "border-blue-600 bg-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.1)]" : "border-gray-200 group-hover:border-gray-300"
                        )}>
                          {paymentMethod === option.id && <div className="w-2 h-2 rounded-full bg-white transition-transform scale-110" />}
                        </div>
                        <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{option.label}</span>
                      </div>
                      <div className="shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        {option.icon}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="pt-6 flex gap-4">
                  <Button variant="outline" onClick={() => setStep('shipping')} className="flex-1 h-14 rounded-xl border-gray-200 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Zurück</Button>
                  
                  <div className="flex-[2]">
                    {paymentMethod === 'paypal' ? (
                      <PayPalButtons
                        style={{ layout: 'horizontal', color: 'blue', shape: 'pill', label: 'pay', height: 55 }}
                        createOrder={createPayPalOrder}
                        onApprove={onPayPalApprove}
                        onError={onPayPalError}
                        onCancel={onPayPalCancel}
                      />
                    ) : (
                      <Button 
                        disabled={!paymentMethod}
                        onClick={() => setStep('review')}
                        className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-sm font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all text-white border-none"
                      >
                        Bestellung prüfen
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'review' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">Zusammenfassung</h2>
                  <p className="text-gray-500 text-sm font-medium">Bitte prüfen Sie Ihre Angaben ein letztes Mal.</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lieferadresse</h3>
                        <button onClick={() => setStep('shipping')} className="text-[9px] font-black text-blue-600 uppercase hover:underline">Ändern</button>
                      </div>
                      <div className="text-sm font-bold text-gray-900 leading-relaxed">
                        {formData.vorname} {formData.nachname}<br/>
                        {formData.strasse}<br/>
                        {formData.plz} {formData.stadt}<br/>
                        {formData.land}
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zahlungsart</h3>
                        <button onClick={() => setStep('payment')} className="text-[9px] font-black text-blue-600 uppercase hover:underline">Ändern</button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                         <span className="text-sm font-black text-gray-900 uppercase tracking-tight">
                           {paymentOptions.find(o => o.id === paymentMethod)?.label}
                         </span>
                         <div className="scale-90 opacity-80">
                           {paymentOptions.find(o => o.id === paymentMethod)?.icon}
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Bestellte Artikel</h3>
                    <div className="space-y-3">
                      {cart.map(item => {
                        const product = PRODUCTS.find(p => p.id === item.productId)!;
                        const lengthData = product.availableLengths.find(l => l.length === item.length)!;
                        return (
                          <div key={`${item.productId}-${item.length}-${item.color || 'Schwarz'}`} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                            <div className="w-12 h-12 bg-gray-50 rounded-lg p-1 flex items-center justify-center shrink-0 relative">
                               <img 
                                 src={item.color === 'Orange' ? (product.gallery?.[1] || product.image) : product.image} 
                                 className="max-h-full object-contain" 
                                 referrerPolicy="no-referrer" 
                               />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] font-black text-gray-900 uppercase truncate leading-none mb-1">{product.name}</div>
                              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{item.length}m &bull; {item.color || 'Schwarz'} &bull; {item.quantity}x</div>
                            </div>
                            <div className="text-xs font-black text-blue-600">{format(lengthData.price * item.quantity)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" onClick={() => setStep('payment')} className="flex-1 h-14 rounded-xl border-gray-200 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Zurück</Button>
                  <Button 
                    onClick={handleStripeCheckout}
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 h-14 text-sm font-black uppercase tracking-[0.2em] rounded-xl shadow-2xl shadow-blue-600/30 active:scale-[0.98] transition-all text-white border-none"
                  >
                    Bestellung zahlungspflichtig abschließen
                  </Button>
                </div>
              </motion.div>
            )}

            {(step as string) === 'success' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-200">
                  <CheckCircle2 size={40} className="text-white" strokeWidth={3} />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-4">Vielen Dank für Ihre Bestellung!</h2>
                  <p className="text-gray-500 text-lg font-medium max-w-md mx-auto">
                    Wir haben Ihre Bestellung erhalten и eine Bestätigung an <span className="text-blue-600 font-bold">{formData.email}</span> gesendet.
                  </p>
                </div>
                <div className="pt-8">
                  <Button 
                    onClick={onClose}
                    className="bg-gray-900 hover:bg-gray-800 h-14 px-10 text-sm font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-gray-200 text-white"
                  >
                    Zurück zum Shop
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Pricing Info Area */}
          <div className="w-full md:w-80 lg:w-96 bg-gray-50 border-l border-gray-100 p-4 pt-4 md:p-10 flex flex-col">
              <div className="flex-1">
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 mb-3 md:mb-6 flex items-center gap-2">
                  <ShoppingCart size={14} className="text-blue-600" />
                  Ihre Bestellung
                </h3>
                <div className="space-y-1 md:space-y-4 mb-4 md:mb-10">
                   <div className="flex justify-between items-center text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                     <span>Zwischensumme (Netto)</span>
                     <span className="text-gray-900">{format(subtotalNeto)}</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                     <span>MwSt. (19%)</span>
                     <span className="text-gray-900">{format(vat)}</span>
                   </div>
                </div>
              </div>
              
              <div className="pt-3 md:pt-6 border-t border-gray-200">
                <div className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-0.5 md:mb-1">Gesamtbetrag (Brutto)</div>
                <div className="text-xl md:text-4xl font-black text-gray-900 tracking-tighter leading-none">{format(totalBruto)}</div>
                <div className="text-[8px] md:text-[9px] font-bold text-gray-400 mt-1.5 md:mt-3 uppercase tracking-tight leading-[1.3] max-w-[280px]">
                  Die Gesamtsumme beinhaltet die gesetzliche Mehrwertsteuer von 19 %.
                </div>
              </div>

              <div className="hidden md:block mt-10 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
                 <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-green-500" />
                    <span className="text-[10px] font-black text-gray-900 uppercase">Sicherer Checkout</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Truck size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black text-gray-900 uppercase">DHL & Hermes 1–3 Tage</span>
                 </div>
              </div>
            </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default function App() {
const [currentPage, setCurrentPage] = useState<PageType>('home');
const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentProductSlug, setCurrentProductSlug] = useState<string | null>(() => { const m = window.location.pathname.match(/^\/produkt\/(.+)$/); return m ? m[1] : null; });
const [isCartOpen, setIsCartOpen] = useState(false);
const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
const pageToPath: Record<string, string> = {
  home: '/',
  ueber_uns: '/about',
  versand: '/delivery',
  rueckgabe: '/returns',
  kontakt: '/contact',
  faq: '/faq',
  agb: '/agb',
  datenschutz: '/datenschutz',
  impressum: '/impressum',
  widerruf: '/widerruf',
  kaeuferschutz: '/kaeuferschutz',
  account: '/account',
};
const pathToPage: Record<string, PageType> = {
  '/': 'home',
  '/about': 'ueber_uns',
  '/delivery': 'rueckgabe',
  '/returns': 'versand',
  '/contact': 'kontakt',
  '/faq': 'faq',
  '/agb': 'agb',
  '/datenschutz': 'datenschutz',
  '/impressum': 'impressum',
  '/widerruf': 'widerruf',
  '/kaeuferschutz': 'kaeuferschutz',
  '/account': 'account',
};
const changePage = (page: PageType) => {
  window.history.pushState({}, '', pageToPath[page] || '/');
  setCurrentPage(page);
};
 useEffect(() => {
  const page = pathToPage[window.location.pathname] || 'home';
  setCurrentPage(page);

  const handlePopState = () => { setCurrentProductSlug(null); window.history.replaceState({}, "", "/");
    const page = pathToPage[window.location.pathname] || 'home';
    setCurrentPage(page);
  };

  window.addEventListener('popstate', handlePopState);

  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
}, []);

useEffect(() => {
  window.scrollTo(0, 0);
}, [currentPage]);

  const initialOptions = {
    "clientId": import.meta.env.VITE_PAYPAL_CLIENT_ID || "AbzUGaZVN6IptGzc1fbGL7Am8gGaSCwZW1wETiG74-L2wBRglLvxKt9o7BYHwJkekeo3PL6ORxXvlEwM",
    "currency": "EUR",
    "intent": "capture",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <AppProvider>
        <div className="font-sans text-gray-900 bg-white">
            <MainContent
            onAuthClick={() => setIsAuthOpen(true)} 
            onCartClick={() => setIsCartOpen(true)}
            onCheckoutClick={() => setIsCheckoutOpen(true)}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            currentProductSlug={currentProductSlug}
            setCurrentProductSlug={setCurrentProductSlug}
          />
          <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
          <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckoutClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} />
          <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
        </div>
      </AppProvider>
    </PayPalScriptProvider>
  );
}



