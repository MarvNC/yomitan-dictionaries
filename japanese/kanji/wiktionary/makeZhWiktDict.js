const saveDict = require('../util/saveDict');

const data = require('./hanziData.json');

const index = {
  title: 'ZH Wiktionary Hanzi',
  revision: `ZH_Wikt_Hanzi${new Date().toISOString()}`,
  format: 3,
  url: 'https://zh.wiktionary.org/wiki/Category:%E6%BC%A2%E5%AD%97%E5%AD%97%E5%85%83',
  description:
    'Hanzi data scraped from zh.wiktionary.org\nParsed/converted by https://github.com/MarvNC/yomichan-dictionaries',
  author: 'Wiktionary, Wikimedia Foundation, Marv',
  attribution: 'ZH Wiktionary',
};

(async function () {
  const outputKanjiBank = [];
  for (const hanzi of Object.keys(data)) {
    const lines = data[hanzi].split('\n');
    // move wiktionary url to the end
    lines.push(lines.shift());
    outputKanjiBank.push([hanzi, '', '', '', lines, {}]);
  }
  saveDict(
    {
      'kanji_bank_1.json': outputKanjiBank,
      'index.json': index,
    },
    '[Hanzi] Wiktionary.zip'
  );
})();
