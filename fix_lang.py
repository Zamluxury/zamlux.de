content = open('src/App.tsx', 'r', encoding='utf-8').read()

# Remove language switcher div
start = content.find('            {/* Language Switcher */}')
end = content.find('            </div>\n              \n', start) + len('            </div>\n              \n')
# find closing div of the language switcher
end2 = content.find('</div>\n          {/* Action', start)
end3 = end2 + len('</div>\n')
content = content[:start] + content[end3:]

open('src/App.tsx', 'w', encoding='utf-8').write(content)
print('Done, length:', len(content))
