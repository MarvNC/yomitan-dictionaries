const fs = require('fs');
const axios = require('axios');
const csv = require('csvtojson');

const saveDict = require('../util/saveDict');
const japaneseUtils = require('../util/japaneseUtils');

const dictURL = 'https://cdn.ncaq.net/dic-nico-intersection-pixiv.txt';
(async function () {
  const response = await axios.get(dictURL);
  const jsonArray = await csv({
    delimiter: '\t',
    headers: ['reading', 'term', 'partOfSpeech', 'nicoPixiv'],
  }).fromString(response.data);

  // skip header
  jsonArray.splice(0, 6);

  const outputArray = [];
  for (const obj of jsonArray) {
    let { term, reading } = obj;
    reading = japaneseUtils.normalizeReading(term, reading);
    outputArray.push([
      term,
      reading,
      '',
      '',
      1,
      [
        {
          type: 'structured-content',
          content: [
            {
              tag: 'a',
              href: `https://dic.nicovideo.jp/l/${term}`,
              content: 'pixiv',
            },
            ' | ',
            {
              tag: 'a',
              href: `https://dic.pixiv.net/a/${term}`,
              content: 'niconico',
            },
          ],
        },
      ],
      0,
      '',
    ]);
  }

  const index = {
    title: 'Nico/Pixiv',
    revision: `nicoPixiv_${new Date().toISOString()}`,
    format: 3,
    url: 'https://github.com/ncaq/dic-nico-intersection-pixiv',
    description: `Parses words in niconico or pixiv's online dictionaries.\nCreated with https://github.com/MarvNC/yomichan-dictionaries`,
    attribution: 'ncaq, Marv',
  };

  saveDict(
    {
      'term_bank_1.json': outputArray,
      'index.json': index,
    },
    '[Other] Nico-Pixiv.zip'
  );
})();
