import { useApp } from '../context';
import { PRODUCTS, PRODUCT_SPECS_DATA } from '../constants';
import { ShoppingCart, Star, Truck, ShieldCheck, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { motion } from 'motion/react';

const PRODUCT_URL_MAP: Record<string, { productId: string; color: 'Schwarz' | 'Orange'; length: number }> = {
  'kab3-15-50m-sw':  { productId: 'p1', color: 'Schwarz', length: 50 },
  'kab3-15-100m-sw': { productId: 'p1', color: 'Schwarz', length: 100 },
  'kab3-15-50m-or':  { productId: 'p1', color: 'Orange',  length: 50 },
  'kab3-15-100m-or': { productId: 'p1', color: 'Orange',  length: 100 },
  'kab3-25-100m-sw': { productId: 'p2', color: 'Schwarz', length: 100 },
  'kab3-25-100m-or': { productId: 'p2', color: 'Orange',  length: 100 },
  'kab5-25-100m-sw': { productId: 'p3', color: 'Schwarz', length: 100 },
  'kab5-25-100m-or': { productId: 'p3', color: 'Orange',  length: 100 },
};

export default function ProductPage({ slug, onClose, onCartClick }: { slug: string; onClose: () => void; onCartClick?: () => void }) {
  const { addToCart } = useApp();
  const mapping = PRODUCT_URL_MAP[slug];

  if (!mapping) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-2xl font-black text-gray-900">Produkt nicht gefunden</p>
        <Button onClick={onClose}>ZurГјck zur Startseite</Button>
      </div>
    );
  }

  const product = PRODUCTS.find(p => p.id === mapping.productId)!;
  const specs = PRODUCT_SPECS_DATA[mapping.productId];
  const lengthData = product.availableLengths.find(l => l.length === mapping.length)!;
  const [added, setAdded] = useState(false);

  const image = mapping.color === 'Orange' ? (product.gallery?.[1] || product.image) : product.image;

    setAdded(true);
    if (onCartClick) onCartClick();
    setTimeout(() => setAdded(false), 2000);
    setTimeout(() => setAdded(false), 2000);


  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100 py-3">
        <div className="container mx-auto px-4 flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          <button onClick={onClose} className="hover:text-blue-600 flex items-center gap-1">
            <ArrowLeft size={12} /> Startseite
          </button>
          <span>/</span>
          <span className="text-gray-900">{product.name} {specs.crossSection} {mapping.length}m {mapping.color}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Bild */}
          <div className="bg-gray-50 rounded-3xl p-8 flex items-center justify-center border border-gray-100">
            <img src={image} alt={product.name} className="max-h-80 object-contain drop-shadow-xl" />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div>
              <Badge className="bg-blue-100 text-blue-700 border-none mb-3 text-[10px] font-black uppercase tracking-widest">
                {mapping.color === 'Orange' ? 'рџџ  Orange' : 'вљ« Schwarz'}
              </Badge>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                <span className="text-blue-600">H07RN-F</span> Gummikabel Baustellenkabel
              </h1>
              <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">
                {specs.crossSection} В· {mapping.length}m В· {specs.voltage}
              </p>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-2">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={16} fill={s <= product.rating ? "#F59E0B" : "none"} color={s <= product.rating ? "#F59E0B" : "#E2E8F0"} />
              ))}
              <span className="text-sm font-bold text-gray-500">({product.reviewsCount} Bewertungen)</span>
            </div>

            {/* Price */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Bestellpreis</div>
              <div className="text-4xl font-black text-gray-900">{lengthData.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
              <div className="text-xs text-gray-400 font-bold mt-1">inkl. 19% MwSt. В· Kostenlose Lieferung</div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Kabeltyp', value: specs.type },
                { label: 'Querschnitt', value: specs.crossSection },
                { label: 'Spannung', value: specs.voltage },
                { label: 'LГ¤nge', value: `${mapping.length}m` },
                { label: 'Farbe', value: mapping.color },
                { label: 'EAN', value: specs.gtin },
              ].map((s, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{s.label}</div>
                  <div className="text-sm font-black text-gray-900 mt-0.5">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Buy Button */}
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                onClick={handleBuy}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-xl shadow-blue-600/20"
              >
                {added ? (
                  <span className="flex items-center gap-2"><Check size={18} /> In den Warenkorb gelegt!</span>
                ) : (
                  <span className="flex items-center gap-2"><ShoppingCart size={18} /> In den Warenkorb</span>
                )}
              </Button>
            </motion.div>

            {/* Trust */}
            <div className="flex gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <Truck size={14} className="text-blue-600" /> 1вЂ“3 Werktage
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <ShieldCheck size={14} className="text-green-600" /> CE & RoHS
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
