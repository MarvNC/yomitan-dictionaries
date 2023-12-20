const saveDict = require('../../../util/saveDict');

const wikiFreq = require('./wikipedia.json');
const outputZipName = '[Kanji Frequency] Wikipedia.zip';

(async function () {
  const outputData = [];
  const freqData = wikiFreq.slice(1);
  let rank = 1;
  for (let i = 0; i < freqData.length; i++) {
    const [kanji, occurences, percent] = freqData[i];
    if (i > 0 && occurences !== freqData[i - 1][1]) {
      rank = i + 1;
    }
    outputData.push([
      kanji,
      'freq',
      {
        value: rank,
        displayValue: `${rank} (${occurences})`,
      },
    ]);
  }
  // for (const [kanji, occurences, percent] of freqData) {
  //   rank++;
  // }
  const index = {
    title: 'Wikipedia Kanji',
    revision: 'kanjiFrequency1',
    format: 3,
    url: 'https://ja.wikipedia.org/wiki/%E3%83%A1%E3%82%A4%E3%83%B3%E3%83%9A%E3%83%BC%E3%82%B8',
    description:
      'Rank-based kanji frequency data from a May 2015 dump of Japanese Wikipedia.\nData from https://github.com/scriptin/kanji-frequency\nModified by https://github.com/MarvNC/yomichan-dictionaries',
    author: 'scriptin, Marv',
    attribution: 'JA Wikipedia',
    frequencyMode: 'rank-based',
  };

  saveDict(
    {
      'index.json': index,
      'kanji_meta_bank_1.json': outputData,
    },
    outputZipName
  );
})();
