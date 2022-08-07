const fs = require('fs');
const innocent = require('./kanji_meta_bank_1.json');
for (i = 0; i < innocent.length; i++) {
  innocent[i][2] = `${i + 1}: ${innocent[i][2]}`;
}
// write back
fs.writeFileSync('./kanji_meta_bank_1.json', JSON.stringify(innocent, null, 2));