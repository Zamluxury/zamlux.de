content = open('src/components/ProductPage.tsx', 'r', encoding='utf-8').read()
old = "  const { addToCart } = useApp();\n  React.useEffect(() => {\n    window.history.pushState(null, '', window.location.href);\n    const handleBack = () => { window.location.href = '/'; };\n    window.addEventListener('popstate', handleBack);\n    return () => window.removeEventListener('popstate', handleBack);\n  }, []);"
new = "  const { addToCart } = useApp();"
content = content.replace(old, new)
open('src/components/ProductPage.tsx', 'w', encoding='utf-8').write(content)
print('Done')
