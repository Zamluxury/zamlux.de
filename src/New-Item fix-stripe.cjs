const fs = require('fs');
const path = 'src/App.tsx';

console.log('--- START ---');
let content = fs.readFileSync(path, 'utf8');

const oldBlock = "const items = cart.map((item) => ({\n        name: `${product.name} ${item.length}m ${item.color || 'Schwarz'}`,\n        price: lengthData.price,\n        quantity: item.quantity,\n      }));";

const newBlock = [
  "const items = cart.map((item) => {",
  "        const product = PRODUCTS.find((p) => p.id === item.productId);",
  "        const lengthData = product?.availableLengths.find((l) => l.length === item.length);",
  "        return {",
  "          name: `${product?.name} ${item.length}m ${item.color || 'Schwarz'}`,",
  "          price: lengthData?.price || 0,",
  "          quantity: item.quantity,",
  "        };",
  "      });",
].join('\n      ');

console.log('Old block found:', content.includes(oldBlock));

if (content.includes(newBlock.slice(0, 30))) {
  console.log('Already fixed, skipping.');
} else if (content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync(path, content, 'utf8');
  console.log('DONE - fixed successfully');
} else {
  console.log('FAILED - exact old block not found, trying loose match');
  // Try a looser regex match as fallback
  const re = /const items = cart\.map\(\(item\) => \(\{[\s\S]*?\}\)\);/;
  if (re.test(content)) {
    content = content.replace(re, newBlock);
    fs.writeFileSync(path, content, 'utf8');
    console.log('DONE - fixed with loose match');
  } else {
    console.log('FAILED - could not find pattern at all, manual fix needed');
  }
}
console.log('--- END ---');
