const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const oldCode = ` useEffect(() => {
  const page = pathToPage[window.location.pathname] || 'home';
  setCurrentPage(page);

  const handlePopState = () => { setCurrentProductSlug(null); window.history.replaceState({}, "", "/");
    const page = pathToPage[window.location.pathname] || 'home';
    setCurrentPage(page);
  };`;

const newCode = ` useEffect(() => {
  const path = window.location.pathname;
  if (path.startsWith('/produkt/')) {
    setCurrentProductSlug(path.replace('/produkt/', ''));
  } else {
    setCurrentPage(pathToPage[path] || 'home');
  }

  const handlePopState = () => {
    const p = window.location.pathname;
    if (p.startsWith('/produkt/')) {
      setCurrentProductSlug(p.replace('/produkt/', ''));
    } else {
      setCurrentProductSlug(null);
      setCurrentPage(pathToPage[p] || 'home');
    }
  };`;

app = app.replace(oldCode, newCode);
fs.writeFileSync('src/App.tsx', app);
console.log('Done:', app.includes("startsWith('/produkt/')"));