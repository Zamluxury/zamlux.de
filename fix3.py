content = open('src/App.tsx', 'r', encoding='utf-8').read()
old = 'const handlePopState = () => { if (!window.location.pathname.startsWith("/produkt/")) { setCurrentProductSlug(null); }'
new = 'const handlePopState = () => { setCurrentProductSlug(null); window.history.replaceState({}, "", "/");'
content = content.replace(old, new)
open('src/App.tsx', 'w', encoding='utf-8').write(content)
print('Done')
