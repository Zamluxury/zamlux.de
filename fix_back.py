
content = open('src/App.tsx', 'r', encoding='utf-8').read()
idx = content.find('const handlePopState')
print(repr(content[idx:idx+100]))

