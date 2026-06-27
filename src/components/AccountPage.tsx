import { useState, useEffect } from 'react';
import { useApp } from '../context';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, User, ShoppingBag, LogOut, CheckCircle, 
  MapPin, Phone, Mail, Calendar, CreditCard, Save, RefreshCw
} from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

export default function AccountPage({ onClose }: { onClose: () => void }) {
  const { 
    user, 
    userProfile, 
    userOrders, 
    updateUserProfile, 
    logout, 
    locale 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  
  // Profile form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [strasse, setStrasse] = useState('');
  const [plz, setPlz] = useState('');
  const [stadt, setStadt] = useState('');
  const [land, setLand] = useState('Deutschland');
  const [telefon, setTelefon] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync profile data to form state
  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
      setStrasse(userProfile.strasse || '');
      setPlz(userProfile.plz || '');
      setStadt(userProfile.stadt || '');
      setLand(userProfile.land || 'Deutschland');
      setTelefon(userProfile.telefon || '');
    }
  }, [userProfile]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 font-medium">Sie sind nicht angemeldet.</p>
          <Button onClick={onClose} className="w-full bg-blue-600 text-white">Zurück zum Shop</Button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await updateUserProfile({
        firstName,
        lastName,
        strasse,
        plz,
        stadt,
        land,
        telefon
      });
      setSuccessMessage(locale === 'en' ? 'Profile updated successfully!' : 'Profil erfolgreich aktualisiert!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(locale === 'en' ? 'Failed to update profile.' : 'Fehler beim Aktualisieren des Profils.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'shipped':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getStatusLabel = (status: string) => {
    if (locale === 'en') {
      switch (status) {
        case 'paid': return 'Paid';
        case 'shipped': return 'Shipped';
        case 'cancelled': return 'Cancelled';
        case 'pending':
        default: return 'Pending';
      }
    } else {
      switch (status) {
        case 'paid': return 'Bezahlt';
        case 'shipped': return 'Versandt';
        case 'cancelled': return 'Storniert';
        case 'pending':
        default: return 'Ausstehend';
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Upper Navigation/Banner */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-black text-gray-700 hover:text-blue-700 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            {locale === 'en' ? 'Back to Shop' : 'Zurück zum Shop'}
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 font-bold hidden sm:inline">{user.email}</span>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 font-bold text-xs transition-colors uppercase tracking-wider"
            >
              <LogOut size={14} strokeWidth={2.5} />
              {locale === 'en' ? 'Log Out' : 'Abmelden'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 mt-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Side Profile Info Card */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mx-auto mb-4 font-black text-xl">
                {(firstName[0] || '').toUpperCase()}{(lastName[0] || '').toUpperCase() || 'U'}
              </div>
              <h3 className="text-lg font-black text-gray-900 leading-tight">
                {firstName} {lastName}
              </h3>
              <p className="text-xs text-gray-400 font-semibold mt-1 truncate">{user.email}</p>
              
              <div className="mt-6 pt-6 border-t border-gray-100 text-left space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-gray-500 font-bold">
                  <Mail size={14} className="text-gray-400 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {telefon && (
                  <div className="flex items-center gap-2.5 text-xs text-gray-500 font-bold">
                    <Phone size={14} className="text-gray-400 shrink-0" />
                    <span>{telefon}</span>
                  </div>
                )}
                {strasse && (
                  <div className="flex items-center gap-2.5 text-xs text-gray-500 font-bold items-start">
                    <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">
                      {strasse}<br />
                      {plz} {stadt}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tab Navigation Menu */}
            <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm flex flex-row md:flex-col gap-1">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                  activeTab === 'orders' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ShoppingBag size={15} />
                {locale === 'en' ? 'My Purchases' : 'Meine Einkäufe'}
              </button>
              
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                  activeTab === 'profile' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User size={15} />
                {locale === 'en' ? 'Profile & Address' : 'Profil & Adresse'}
              </button>
            </div>
          </div>

          {/* Active Tab View */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'orders' ? (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase">
                      {locale === 'en' ? 'Order History' : 'Bestellverlauf'}
                    </h2>
                    <span className="text-xs bg-gray-100 text-gray-500 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {userOrders.length} {userOrders.length === 1 ? (locale === 'en' ? 'Order' : 'Bestellung') : (locale === 'en' ? 'Orders' : 'Bestellungen')}
                    </span>
                  </div>

                  {userOrders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm text-center space-y-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto">
                        <ShoppingBag size={28} />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-lg">
                          {locale === 'en' ? 'No orders found' : 'Keine Bestellungen gefunden'}
                        </h4>
                        <p className="text-gray-500 text-sm mt-1">
                          {locale === 'en' ? 'You have not placed any orders yet.' : 'Sie haben bisher noch keine Einkäufe getätigt.'}
                        </p>
                      </div>
                      <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 rounded-xl text-xs uppercase tracking-wider mt-2">
                        {locale === 'en' ? 'Explore Shop' : 'Jetzt einkaufen'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userOrders.map((order) => {
                        const orderDate = order.createdAt?.seconds 
                          ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
                          : '';

                        return (
                          <div 
                            key={order.id}
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                          >
                            {/* Card Header */}
                            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center">
                              <div className="space-y-1">
                                <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                  {locale === 'en' ? 'Order Number' : 'Bestellnummer'}
                                </div>
                                <div className="text-xs font-mono font-bold text-gray-700">{order.id}</div>
                              </div>
                              
                              {orderDate && (
                                <div className="space-y-1">
                                  <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                    {locale === 'en' ? 'Date' : 'Datum'}
                                  </div>
                                  <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                    <Calendar size={12} className="text-gray-400" />
                                    {orderDate}
                                  </div>
                                </div>
                              )}

                              <div className="space-y-1">
                                <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                  {locale === 'en' ? 'Total Amount' : 'Gesamtsumme'}
                                </div>
                                <div className="text-xs font-black text-blue-700">{formatPrice(order.total)}</div>
                              </div>

                              <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${getStatusBadgeColor(order.status)}`}>
                                {getStatusLabel(order.status)}
                              </span>
                            </div>

                            {/* Order Items List */}
                            <div className="p-6 divide-y divide-gray-100">
                              {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="py-3 flex justify-between items-center first:pt-0 last:pb-0 gap-4">
                                  <div className="space-y-1">
                                    <h4 className="text-sm font-black text-gray-900 tracking-tight">{item.name}</h4>
                                    <div className="flex flex-wrap gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                      <span>Farbe: {item.color || 'Schwarz'}</span>
                                      <span>&bull;</span>
                                      <span>Länge: {item.length}m</span>
                                      <span>&bull;</span>
                                      <span>Menge: {item.quantity}x</span>
                                    </div>
                                  </div>
                                  <div className="text-xs font-black text-gray-700 shrink-0">
                                    {formatPrice((item.price || 0) * (item.quantity || 1))}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Payment details if any */}
                            {order.paymentMethod && (
                              <div className="bg-slate-50/30 px-6 py-3 border-t border-gray-100 text-[11px] font-bold text-gray-500 flex items-center gap-2">
                                <CreditCard size={12} className="text-gray-400" />
                                <span>
                                  {locale === 'en' ? 'Paid via' : 'Zahlungsart'}: <span className="text-gray-900 font-black uppercase tracking-wider">{order.paymentMethod}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase">
                      {locale === 'en' ? 'Profile & Delivery Details' : 'Profil & Lieferadresse'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      {locale === 'en' 
                        ? 'Manage your personal details and shipping destination for a faster checkout.' 
                        : 'Verwalten Sie Ihre Lieferanschrift, um Bestellungen zukünftig noch schneller abzuschließen.'}
                    </p>
                  </div>

                  {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-xs font-black flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600 shrink-0" />
                      {successMessage}
                    </div>
                  )}

                  {errorMessage && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold">
                      {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Vorname</label>
                        <Input 
                          placeholder="Vorname" 
                          value={firstName} 
                          onChange={e => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Nachname</label>
                        <Input 
                          placeholder="Nachname" 
                          value={lastName} 
                          onChange={e => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Straße & Hausnummer</label>
                      <Input 
                        placeholder="Straße und Hausnummer" 
                        value={strasse} 
                        onChange={e => setStrasse(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5 col-span-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">PLZ</label>
                        <Input 
                          placeholder="PLZ" 
                          value={plz} 
                          onChange={e => setPlz(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Stadt</label>
                        <Input 
                          placeholder="Stadt" 
                          value={stadt} 
                          onChange={e => setStadt(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Land</label>
                        <Input 
                          placeholder="Land" 
                          value={land} 
                          onChange={e => setLand(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Telefonnummer</label>
                        <Input 
                          placeholder="Telefonnummer" 
                          value={telefon} 
                          onChange={e => setTelefon(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2"
                      >
                        {isSaving ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Save size={14} />
                        )}
                        {locale === 'en' ? 'Save Profile' : 'Profil speichern'}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
