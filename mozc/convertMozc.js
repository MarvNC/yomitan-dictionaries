const fs = require('fs');
const folderPath = 'mozc/';
const saveDict = require('../util/saveDict');

const outputZipName = '[Kanji] mozc Kanji Variants.zip';

let variantRule = fs.readFileSync(folderPath + 'variant_rule.txt', 'utf8');
variantRule = variantRule
  .split('\n\r\n')
  .map((arr) => arr.split('\r\n').filter((str) => str.length > 0));

// clean out 水準 level indicators
variantRule = variantRule.map((arr) => {
  if (arr[0].startsWith('#')) {
    return arr.slice(1);
  } else {
    return arr;
  }
});

// skip rules set at beginning of file
variantRule = variantRule.slice(1);

// hardcode specific reading variants from symbol.tsv
const specificVariants = [
  ['濵	濱', 'まゆはま'],
  ['髙	高', 'はしごだか'],
  ['﨑	崎', 'たつさき'],
  ['𠮷	吉', 'つちよし'],
].map(([kanjis, reading]) => [
  '異体字',
  '# itaiji',
  `# <target> is a variant of <original>. <target> has the specific reading of ${reading}.`,
  kanjis,
]);

variantRule.push(...specificVariants);

const kanjiData = {};
const types = new Set();

for (const arr of variantRule) {
  const type = arr.shift();
  types.add(type);

  // consume/clean description
  let desc = '';

  // delete romaji
  if (arr[0].startsWith('#')) arr.shift();

  while (arr[0].startsWith('#')) {
    desc += arr.shift().replace('# ', '') + '\n';
  }

  for (const pair of arr) {
    const [target, original] = pair.split('\t');
    const kanjiDesc =
      type + '\n' + desc.replace(/<original>/g, original).replace(/<target>/g, target);

    if (!kanjiData[target]) kanjiData[target] = [];
    kanjiData[target].push({
      type: type,
      kanjiDesc,
    });

    if (!kanjiData[original]) kanjiData[original] = [];
    kanjiData[original].push({
      type: null,
      kanjiDesc,
    });
  }
}

const kanjiBankData = [];

for (const key of Object.keys(kanjiData)) {
  const arr = kanjiData[key];
  let description = [];
  for ({ kanjiDesc } of arr) {
    description.push(...kanjiDesc.split('\n'));
  }
  // trim last newline in description
  description = description.slice(0, -1);

  kanjiBankData.push([
    key,
    '',
    '',
    arr
      .map((obj) => obj.type)
      .filter((type) => !!type)
      .join(' '),
    description,
    {},
  ]);
}

const tagBank = Array.from(types).map((type) => [type, 'misc', -10, type, 0]);

const index = {
  title: 'mozc Kanji Variants',
  revision: `mozc_${new Date().toISOString()}`,
  format: 3,
  url: 'https://github.com/google/mozc',
  description: `Data about kanji variants from Google's Japanese IME, mozc.\nCreated with https://github.com/MarvNC/yomichan-dictionaries`,
  author: 'Google, Marv',
  attribution: 'Google',
};

saveDict(
  {
    'index.json': index,
    'kanji_bank_1.json': kanjiBankData,
    'tag_bank_1.json': tagBank,
  },
  outputZipName
);
