content = open('src/App.tsx', 'r', encoding='utf-8').read()
old = '<CartDrawer isOpen={isCartOpen}'
new = '<AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />\n          <CartDrawer isOpen={isCartOpen}'
content = content.replace(old, new)
open('src/App.tsx', 'w', encoding='utf-8').write(content)
print('Done')
