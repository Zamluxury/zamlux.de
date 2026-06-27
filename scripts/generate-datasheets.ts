import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

// This is a simplified version for the script since we can't easily import from the app's source if it has many dependencies
const PRODUCTS = [
  { id: 'p1', artNr: 'H07RN-F 3G1.5mm²', name: 'H07RN-F Gummikabel Baustellenkabel', gtin: '4270004984279' },
  { id: 'p2', artNr: 'H07RN-F 3G2.5mm²', name: 'H07RN-F Gummikabel Baustellenkabel', gtin: '4270004984286' },
  { id: 'p3', artNr: 'H07RN-F 5G2.5mm²', name: 'H07RN-F Gummikabel Baustellenkabel', gtin: '4270004984293' },
];

const PRODUCT_SPECS_DATA: Record<string, any> = {
  'p1': { 
    crossSection: '3G1.5 mm²', 
    voltage: '450/750 V', 
    standard: 'DIN VDE 0282 Teil 4', 
    flexibility: 'Klasse 5 (feindrähtig)', 
    usage: 'Werkstatt, Garten, leichte Baustelle, Außenbereich', 
    certification: 'VDE, CE, RoHS zertifiziert',
    material: 'Polychloropren-Kautschuk',
    resistance: 'Öl-, UV- und Ozonbeständig',
    description: 'Vielseitiges Gummikabel ideal für den Anschluss von Handgeräten, Werkzeugen und leichten Maschinen auf Baustellen und im Garten.'
  },
  'p2': { 
    crossSection: '3G2.5 mm²', 
    voltage: '450/750 V', 
    standard: 'DIN VDE 0282 Teil 4', 
    flexibility: 'Klasse 5 (feindrähtig)', 
    usage: 'Baustelle, Werkstatt, Industrie, Außenbereich', 
    certification: 'VDE, CE, RoHS zertifiziert',
    material: 'Polychloropren-Kautschuk',
    resistance: 'Öl-, UV- und Ozonbeständig',
    description: 'Verstärktes Baustellenkabel für erhöhte Lasten. Perfekt für Kompressoren, große Winkelschleifer und den Dauereinsatz im Freien.'
  },
  'p3': { 
    crossSection: '5G2.5 mm²', 
    voltage: '450/750 V', 
    standard: 'DIN VDE 0282 Teil 4', 
    flexibility: 'Klasse 5 (feindrähtig)', 
    usage: 'Industrie, professionelle Baustelle, Werkstatt, Starkstrom-Anwendungen', 
    certification: 'VDE, CE, RoHS zertifiziert',
    material: 'Polychloropren-Kautschuk',
    resistance: 'Öl-, UV- und Ozonbeständig',
    description: 'H07RN-F Baustellenkabel 5G2,5 mm² 100m – Premium Qualität für höchste Ansprüche. Hochleistungs-Starkstromkabel (Drehstrom) for Motoren, Pumpen und industrielle Anlagen. Extrem widerstandsfähig gegen mechanischen Druck.'
  },
};

async function generatePDFs() {
  const outputDir = path.join(process.cwd(), 'public', 'datasheets');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const product of PRODUCTS) {
    const specs = PRODUCT_SPECS_DATA[product.id];
    try {
      const doc = new jsPDF();
      
      // Header Branding
      doc.setFontSize(24);
      doc.setTextColor(17, 24, 39); // Gray 900
      doc.setFont('helvetica', 'bold');
      doc.text('Zamluxury GmbH', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // Gray 500
      doc.setFont('helvetica', 'normal');
      doc.text('PREMIUM INDUSTRIAL CABLE SOLUTIONS', 105, 26, { align: 'center' });
      
      doc.setDrawColor(37, 99, 235); // Blue 600
      doc.setLineWidth(1);
      doc.line(20, 35, 190, 35);
      
      // Title Section
      doc.setFontSize(18);
      doc.setTextColor(17, 24, 39);
      doc.setFont('helvetica', 'bold');
      doc.text('TECHNISCHES DATENBLATT', 20, 48);
      
      doc.setFontSize(14);
      doc.setTextColor(37, 99, 235);
      doc.text(`${product.name} ${specs.crossSection} (100m)`, 20, 58);
      
      // Description
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81); // Gray 700
      doc.setFont('helvetica', 'italic');
      const splitDescription = doc.splitTextToSize(specs.description, 170);
      doc.text(splitDescription, 20, 70);
      
      // Spec Table
      const tableData = [
        ['Eigenschaft', 'Detail Information / Wert'],
        ['Kabel-Typ', 'H07RN-F Gummischlauchleitung'],
        ['Artikelnummer', product.artNr],
        ['EAN / GTIN', product.gtin],
        ['Leiterquerschnitt', specs.crossSection],
        ['Nennspannung (U0/U)', specs.voltage],
        ['Prüfspannung', '2500 V'],
        ['Normen', specs.standard],
        ['Leiter-Flexibilität', specs.flexibility],
        ['Mantelmaterial', specs.material],
        ['Beständigkeit', specs.resistance],
        ['Einsatzbereich (primär)', specs.usage],
        ['Zertifizierung', specs.certification],
        ['Flammwidrigkeit', 'Nach EN 60332-1-2'],
        ['Ölbeständigkeit', 'Nach EN 60811-404'],
      ];
      
      autoTable(doc, {
        startY: 90,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
      });
      
      // Application Areas
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setTextColor(17, 24, 39);
      doc.setFont('helvetica', 'bold');
      doc.text('Einsatzgebiete & Anwendung:', 20, finalY);
      
      doc.setFontSize(9);
      doc.setTextColor(55, 65, 81);
      doc.setFont('helvetica', 'normal');
      const apps = `H07RN-F Gummischlauchleitungen dieses Typs (${specs.crossSection}) sind speziell für folgende Bereiche optimiert: ${specs.usage}. Das Kabel ist konzipiert für professionelle Anwendungen unter extremen mechanischen Bedingungen. Ideal geeignet für Bauwesen, Landwirtschaft, Werkstätten, Industrieanlagen sowie für den dauerhaften Einsatz im Freien under Einwirkung von Feuchtigkeit, Fetten und Ölen.`;
      doc.text(doc.splitTextToSize(apps, 170), 20, finalY + 7);
      
      // Footer Branding Large
      doc.setDrawColor(229, 231, 235);
      doc.line(20, 275, 190, 275);
      
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text('Alle Angaben basieren auf aktuellen VDE-Normen und Herstellerdaten. Technische Änderungen vorbehalten.', 105, 280, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39);
      doc.text('ZAMLUXURY GERMANY | INDUSTRIE- UND BAUBEDARF | WWW.ZAMLUX.DE', 105, 285, { align: 'center' });

      // Naming convention requested: H07RN-F-5G2.5-100m.pdf
      const fileName = `H07RN-F-${specs.crossSection.replace(/\s/g, '').replace('mm²', '')}-100m.pdf`;
      const filePath = path.join(outputDir, fileName);
      
      const buffer = doc.output('arraybuffer');
      fs.writeFileSync(filePath, Buffer.from(buffer));
      console.log(`Generated: ${fileName}`);
    } catch (e) {
      console.error(`Error generating PDF for ${product.id}:`, e);
    }
  }
}

generatePDFs();

