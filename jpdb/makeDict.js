const fs = require('fs');
const wrap = require('word-wrap');

const saveDict = require('../util/saveDict');

const folderPath = './jpdb/';
const allKanjiFilePath = 'allKanji.json';
const kanjiDataFilePath = 'kanjiData.json';

const outputFreqZipName = '[Kanji Frequency] JPDB Kanji.zip';
const outputKanjiZipName = '[Kanji] JPDB Kanji.zip';

const kanjiReadingUrl = (kanji, reading) => `${jpdbURL}kanji-reading/${kanji}/${reading}`;
const kanjiData = require(`./${kanjiDataFilePath}`);

const index = {
  revision: `jpdb_kanji_${new Date().toISOString()}`,
  format: 3,
  url: 'https://jpdb.io',
  attribution: 'jpdb, Marv',
};

const args = process.argv.slice(2);
if (args.length > 0) {
  switch (args[0]) {
    case 'freq':
      makeFreq();
      break;
    case 'dict':
      makeDict();
      break;
  }
} else {
  console.log('No args');
}

function makeFreq() {
  const outputData = [];
  for (const kanji of Object.keys(kanjiData)) {
    const frequency = kanjiData[kanji].frequency;
    const outputArrElem = [kanji, 'freq'];
    if (typeof frequency === 'number') {
      outputArrElem.push(frequency);
    } else {
      // frequency is a string
      outputArrElem.push({
        value: frequency == 'Very rare' ? 5000 : 6000,
        displayValue: frequency,
      });
    }
    outputData.push(outputArrElem);
  }

  let newIndex = structuredClone(index);
  newIndex.title = 'JPDB Kanji Freq';
  newIndex.description =
    'Rank-based kanji frequency data from JPDB\nCreated with https://github.com/MarvNC/yomichan-dictionaries';
  newIndex.frequencyMode = 'rank-based';

  saveDict(
    {
      'index.json': newIndex,
      'kanji_meta_bank_1.json': outputData,
    },
    outputFreqZipName
  );
}

async function makeDict() {
  const outputData = [];
  for (const kanji of Object.keys(kanjiData)) {
    const readingsString =
      kanjiData[kanji].readings?.map((readingArr) => readingArr.join('')).join(' ') ?? '';

    const types = kanjiData[kanji].types;
    const usefulTypes = {
      Shinjitai: '新字体',
      Kyūjitai: '旧字体',
      'Extended shinjitai': '拡張新字体',
    };
    const typeString =
      types
        ?.filter((type) => usefulTypes[type])
        .map((type) => usefulTypes[type])
        .join(' ') ?? '';

    const meaningsArr = [];

    // add up to 10 vocab in groups of 2
    const vocab = kanjiData[kanji].vocab;
    if (vocab) {
      meaningsArr.push(...vocab.slice(0, 15));
    }

    if (kanjiData[kanji].composedOf) {
      meaningsArr.push('', '漢字分解:');
      meaningsArr.push(
        ...wrap(kanjiData[kanji].composedOf.join(' '), { width: 8, indent: '', trim: true }).split(
          '\n'
        )
      );
    }

    const stats = {};
    if (kanjiData[kanji].kanken) {
      stats.漢字検定 = kanjiData[kanji].kanken.split('Level ')[1];
    }
    if (kanjiData[kanji].oldForm) {
      stats.旧字体 = kanjiData[kanji].oldForm;
    }
    if (kanjiData[kanji].modernForm) {
      stats.新字体 = kanjiData[kanji].modernForm;
    }

    outputData.push([kanji, '', readingsString, typeString, meaningsArr, stats]);
  }
  let newIndex = structuredClone(index);

  newIndex.title = 'JPDB Kanji';
  newIndex.description =
    'Kanji data from JPDB\nCreated with https://github.com/MarvNC/yomichan-dictionaries';

  saveDict(
    {
      'index.json': newIndex,
      'kanji_bank_1.json': outputData,
      'tag_bank_1.json': await fs.promises.readFile(folderPath + 'tag_bank_1.json'),
    },
    outputKanjiZipName
  );
}
