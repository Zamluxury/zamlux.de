content = open('src/App.tsx', 'r', encoding='utf-8').read()
start = content.find('            {/* Language Switcher */}')
end = content.find('            <div \n              onClick={() => {', start)
content = content[:start] + content[end:]
open('src/App.tsx', 'w', encoding='utf-8').write(content)
print('Done')
