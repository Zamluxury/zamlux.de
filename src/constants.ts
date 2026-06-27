export const PRODUCTS = [
  {
    id: 'p1',
    artNr: 'H07RN-F 3G1.5mm²',
    name: 'H07RN-F Baustellenkabel',
    gtin: '4270004984279',
    description: 'Vielseitiges Gummikabel ideal für den Anschluss von Handgeräten, Werkzeugen und leichten Maschinen auf Baustellen und im Garten. Offizielles Zamluxury GmbH Produkt.',
    image: '/images/H07RNF_3G15_1.png',
    gallery: [
      '/images/H07RNF_3G15_1.png',
      '/images/H07RNF_3G15_2.png',
      '/images/H07RNF_3G15_3.png'
    ],
    pricePerMeter: 0.80,
    availableLengths: [
      { length: 50, price: 40.00 },
      { length: 100, price: 80.00 }
    ],
    features: ['✓ Ölbeständig', '✓ UV-beständig', '✓ Wetterfest', '✓ Flexibel bei Kälte', '✓ Für Baustellen geeignet', '✓ Für Außenbereiche geeignet', '✓ Hoch belastbar', '✓ CE zertifiziert'],
    rating: 4.8,
    reviewsCount: 156,
    isBestseller: true
  },
  {
    id: 'p2',
    artNr: 'H07RN-F 3G2.5mm²',
    name: 'H07RN-F Baustellenkabel',
    gtin: '4270004984286',
    description: 'Verstärktes Baustellenkabel für erhöhte Lasten. Perfekt für Kompressoren, große Winkelschleifer und den Dauereinsatz im Freien. Made by Zamluxury GmbH.',
    image: '/images/H07RNF_3G25_1.png',
    gallery: [
      '/images/H07RNF_3G25_1.png',
      '/images/H07RNF_3G25_2.png',
      '/images/H07RNF_3G25_3.png'
    ],
    pricePerMeter: 1.09,
    availableLengths: [
      { length: 100, price: 109.00 }
    ],
    features: ['✓ Ölbeständig', '✓ UV-beständig', '✓ Wetterfest', '✓ Flexibel bei Kälte', '✓ Für Baustellen geeignet', '✓ Für Außenbereiche geeignet', '✓ Hoch belastbar', '✓ CE zertifiziert'],
    rating: 4.9,
    reviewsCount: 92,
    isBestseller: true
  },
  {
    id: 'p3',
    artNr: 'H07RN-F 5G2.5mm²',
    name: 'H07RN-F Baustellenkabel',
    gtin: '4170000207764',
    description: 'Hochleistungs-Starkstromkabel (Drehstrom) für Motoren, Pumpen und industrielle Anlagen. Extrem widerstandsfähig gegen mechanischen Druck. Premium Zamluxury Qualität.',
    image: '/images/H07RNF_5G25_1.png',
    gallery: [
      '/images/H07RNF_5G25_1.png',
      '/images/H07RNF_5G25_2.png',
      '/images/H07RNF_5G25_3.png'
    ],
    pricePerMeter: 1.49,
    availableLengths: [
      { length: 100, price: 149.00 }
    ],
    features: ['✓ Ölbeständig', '✓ UV-beständig', '✓ Wetterfest', '✓ Flexibel bei Kälte', '✓ Für Baustellen geeignet', '✓ Für Außenbereiche geeignet', '✓ Hoch belastbar', '✓ CE zertifiziert'],
    rating: 5.0,
    reviewsCount: 78,
    isBestseller: true
  }
];

export const COMPARISON_SPECS = [
  { key: 'type', label: 'Kabeltyp' },
  { key: 'crossSection', label: 'Leiterquerschnitt' },
  { key: 'voltage', label: 'Nennspannung' },
  { key: 'length', label: 'Länge' },
  { key: 'color', label: 'Mantelfarbe' },
  { key: 'application', label: 'Einsatzbereich' },
  { key: 'temperature', label: 'Temperaturbereich' },
  { key: 'material', label: 'Mantelmaterial' },
  { key: 'standard', label: 'Normen' },
];

export const PRODUCT_SPECS_DATA: Record<string, Record<string, string>> = {
  'p1': {
    type: 'H07RN-F',
    crossSection: '3G1.5 mm²',
    voltage: '450/750 V',
    length: '50m / 100m',
    gtin: '4270004984279',
    color: 'Schwarz',
    application: 'Werkstatt, Garten, leichte Baustelle, Außenbereich',
    temperature: '-25°C bis +60°C',
    material: 'Polychloropren-Kautschuk',
    standard: 'DIN VDE 0282 Teil 4',
    flexibility: 'Klasse 5 (feindrähtig)',
    resistance: 'Öl-, UV- und Ozonbeständig',
    usage: 'Werkstatt, Garten, leichte Baustelle, Außenbereich',
    certification: 'VDE, CE, RoHS zertifiziert',
    flameRetardant: 'Ja (nach EN 60332-1-2)',
    oilResistant: 'Ja (nach EN 60811-404)',
  },
  'p2': {
    type: 'H07RN-F',
    crossSection: '3G2.5 mm²',
    voltage: '450/750 V',
    length: '100m',
    gtin: '4270004984286',
    color: 'Schwarz',
    application: 'Baustelle, Werkstatt, Industrie, Außenbereich',
    temperature: '-25°C bis +60°C',
    material: 'Polychloropren-Kautschuk',
    standard: 'DIN VDE 0282 Teil 4',
    flexibility: 'Klasse 5 (feindrähtig)',
    resistance: 'Öl-, UV- und Ozonbeständig',
    usage: 'Baustelle, Werkstatt, Industrie, Außenbereich',
    certification: 'VDE, CE, RoHS zertifiziert',
    flameRetardant: 'Ja (nach EN 60332-1-2)',
    oilResistant: 'Ja (nach EN 60811-404)',
  },
  'p3': {
    type: 'H07RN-F',
    crossSection: '5G2.5 mm²',
    voltage: '450/750 V',
    length: '100m',
    gtin: '4170000207764',
    color: 'Schwarz',
    application: 'Industrie, professionelle Baustelle, Werkstatt, Starkstrom-Anwendungen',
    temperature: '-25°C bis +60°C',
    material: 'Polychloropren-Kautschuk',
    standard: 'DIN VDE 0282 Teil 4',
    flexibility: 'Klasse 5 (feindrähtig)',
    resistance: 'Öl-, UV- und Ozonbeständig',
    usage: 'Industrie, professionelle Baustelle, Werkstatt, Starkstrom-Anwendungen',
    certification: 'VDE, CE, RoHS zertifiziert',
    flameRetardant: 'Ja (nach EN 60332-1-2)',
    oilResistant: 'Ja (nach EN 60811-404)',
  }
};
