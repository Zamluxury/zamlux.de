const fs = require('fs');
let c = fs.readFileSync('public/feed_new.csv', 'utf8');

c = c.replace('kab3-25-100m-sw', 'TEMP1');
c = c.replace('kab3-25-100m-or', 'TEMP2');
c = c.replace('kab5-25-100m-sw', 'TEMP3');
c = c.replace('kab5-25-100m-or', 'TEMP4');
c = c.replace('kab3-15-100m-or', 'TEMP5');
c = c.replace('kab3-15-50m-or', 'TEMP6');

c = c.replace('TEMP1', 'kab3-25-100m-sw').replace('H07RNF_3G15_1.png', 'H07RNF_3G25_1.png');
c = c.replace('TEMP2', 'kab3-25-100m-or').replace('H07RNF_3G15_1.png', 'H07RNF_3G25_2.png');
c = c.replace('TEMP3', 'kab5-25-100m-sw').replace('H07RNF_3G15_1.png', 'H07RNF_5G25_1.png');
c = c.replace('TEMP4', 'kab5-25-100m-or').replace('H07RNF_3G15_1.png', 'H07RNF_5G25_2.png');
c = c.replace('TEMP5', 'kab3-15-100m-or').replace('H07RNF_3G15_1.png', 'H07RNF_3G15_2.png');
c = c.replace('TEMP6', 'kab3-15-50m-or').replace('H07RNF_3G15_1.png', 'H07RNF_3G15_2.png');

fs.writeFileSync('public/feed_new.csv', c);
console.log('Done');