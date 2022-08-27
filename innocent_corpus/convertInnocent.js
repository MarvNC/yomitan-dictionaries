const fs = require('fs');
const JSZip = require('jszip');

const saveDict = require('../util/saveDict');

const folderPath = 'innocent_corpus/';
const corpusFile = 'innocent_corpus.zip';
const kanjiBank = 'kanji_meta_bank_1.json';
const outputZipName = '[Kanji Frequency] Innocent Corpus Kanji.zip';

fs.readFile(folderPath + corpusFile, function (err, data) {
  if (err) throw err;
  JSZip.loadAsync(data).then(async function (zip) {
    // read kanji_meta_bank_1.json
    zip
      .file(kanjiBank)
      .async('string')
      .then((string) => {
        const data = JSON.parse(string);
        console.log(`Read kanji freq data with ${data.length} entries`);
        const outputData = [];
        for (i = 0; i < data.length; i++) {
          // https://github.com/FooSoft/yomichan/blob/master/ext/data/schemas/dictionary-kanji-meta-bank-v3-schema.json
          const [kanji, freqString, timesUsed] = data[i];
          const freqArrElement = [];
          // kanji
          freqArrElement.push(kanji);
          freqArrElement.push('freq');
          const freq = i + 1;
          freqArrElement.push({ value: freq, displayValue: `${freq} (${timesUsed})` });
          outputData.push(freqArrElement);
        }

        const index = {
          title: 'Innocent Corpus Kanji',
          revision: 'kanjiFrequency1',
          format: 3,
          url: 'https://web.archive.org/web/20190309073023/https://forum.koohii.com/thread-9459.html#pid168613',
          description:
            'Rank-based kanji frequency data from the innocent corpus\nModified by https://github.com/MarvNC/yomichan-dictionaries',
          author: 'cb4960, Marv',
          attribution: 'Innocent Corpus Novels',
          frequencyMode: 'rank-based',
        };

        saveDict(
          {
            'index.json': index,
            'kanji_meta_bank_1.json': outputData,
          },
          outputZipName
        );
      });
  });
});
