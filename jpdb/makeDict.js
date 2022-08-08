const fs = require('fs');
const JSZip = require('jszip');

const kanjiReadingUrl = (kanji, reading) => `${jpdbURL}kanji-reading/${kanji}/${reading}`;
const kanjiData = require('./kanjiData.json');

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
  const outputZip = new JSZip();
  const index = {
    title: 'JPDB Kanji Freq',
    revision: `jpdb_kanji_${new Date().toISOString()}`,
    format: 3,
    url: 'https://jpdb.io',
    description:
      'Rank-based kanji frequency data from JPDB\nCreated with https://github.com/MarvNC/yomichan-kanji-dictionaries',
    attribution: 'jpdb, Marv',
    frequencyMode: 'rank-based',
  };

  const outputZipName = '[Kanji Frequency] JPDB Kanji.zip';

  outputZip.file('index.json', JSON.stringify(index));
  outputZip.file('kanji_meta_bank_1.json', JSON.stringify(outputData));
  outputZip
    .generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    })
    .then((content) => {
      fs.writeFileSync(outputZipName, content);
    });

  console.log(`Wrote ${outputZipName}`);
}

function makeDict() {
  // todo
}
