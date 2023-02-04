const fs = require('fs').promises;
const Yomichan = require('yomichan-dict-reader');
const csv = require('csvtojson');
const wrap = require('word-wrap');

const saveDict = require('../util/saveDict');

const index = {
  revision: `thekanjimap_${new Date().toISOString()}`,
  format: 3,
  url: 'https://thekanjimap.com',
  author: 'thekanjimap, Marv',
  attribution: 'thekanjimap',
  description: `Radical entries and kanji decomposition/compositions from thekanjimap.com.
  Created with https://github.com/MarvNC/yomichan-dictionaries`,
  title: 'TheKanjiMap Kanji Radicals/Composition',
};

const tagBank = [['画数', 'misc', -10, '画数', 0]];

(async () => {
  const radicalsJSON = await getRadicals();
  const kanjiJSON = await getKanji();
  saveDict(
    {
      'index.json': index,
      'kanji_bank_1.json': radicalsJSON,
      'kanji_bank_2.json': kanjiJSON,
      'tag_bank_1.json': tagBank,
    },
    '[Kanji] TheKanjiMap.zip'
  );
})();

async function getRadicals() {
  const radicals = await csv().fromFile('thekanjimap/input/kanji-radicals.csv');
  const radicalData = {};
  // store all radical info in an object where each definition is in an array
  for (const radical of radicals) {
    if (!radicalData[radical.Radical]) {
      radicalData[radical.Radical] = [];
    }
    radicalData[radical.Radical].push({
      mainRadical: radical.Radical,
      alternate: radical.Alternate,
      strokes: radical.Strokes,
      examples: radical.Examples,
      meaning: radical.Meaning,
      reading: radical['Reading-J'],
    });
    for (const alternate of radical.Alternate.split('')) {
      if (!radicalData[alternate]) {
        radicalData[alternate] = [];
      }
      radicalData[alternate].push({
        mainRadical: radical.Radical,
        alternate: radical.Alternate,
        strokes: radical.Strokes,
        examples: radical.Examples,
        meaning: radical.Meaning,
        reading: radical['Reading-J'],
      });
    }
  }

  const outputJSON = [];
  for (const currentRadical of Object.keys(radicalData)) {
    // skip radicals that are empty strings
    if (!currentRadical) continue;
    for (const definition of radicalData[currentRadical]) {
      const meaningArr = [];
      let radicalInfo = `部首：${definition.mainRadical}`;
      if (definition.alternate !== '') {
        radicalInfo += ` ${definition.alternate.split('').join('　')}`;
      }
      meaningArr.push(radicalInfo);
      if (definition.meaning !== '') {
        meaningArr.push(`意味：${definition.meaning}`);
      }
      if (definition.reading !== '') {
        meaningArr.push(`読み：${definition.reading}`);
      }
      if (definition.examples !== '') {
        meaningArr.push(`例え：${definition.examples.split(' ').join('　')}`);
      }

      outputJSON.push([
        currentRadical,
        '',
        '',
        '',
        meaningArr,
        {
          画数: definition.strokes,
        },
      ]);
    }
  }
  console.log(`Wrote ${outputJSON.length} radicals`);
  return outputJSON;
}

async function getKanji() {
  const kanjiData = JSON.parse(await fs.readFile('thekanjimap/input/composition.json'));
  const yomichan = new Yomichan();
  const KANJIDICPath = 'util/[Kanji] KANJIDIC (English).zip';
  await yomichan.readKanjiDictionary(KANJIDICPath);
  const outputJSON = [];
  let readingHints = '';
  for (const kanji of Object.keys(kanjiData)) {
    // if no input or output, skip
    if (kanjiData[kanji].in.length === 0 && kanjiData[kanji].out.length === 0) {
      continue;
    }
    const meaningArr = [];
    if (kanjiData[kanji].in.length > 0) {
      meaningArr.push('＝＝＝＝＝分解＝＝＝＝＝');
      meaningArr.push(...wrap(kanjiData[kanji].in.join('　'), { width: 15 }).split('\n'));
    }

    // check for shared readings with included in kanji, and add to reading hints if over 50% usage
    const onyomi = yomichan.getKanjiInfo(kanji, KANJIDICPath)[0]?.onyomi.split(' ') || [];

    if (onyomi.length > 0 && kanjiData[kanji].out.length > 0) {
      const usageCount = {};
      for (const outKanji of kanjiData[kanji].out) {
        for (const outKanjiOnyomi of yomichan
          .getKanjiInfo(outKanji, KANJIDICPath)[0]
          ?.onyomi?.split(' ') || []) {
          if (!usageCount[outKanjiOnyomi]) {
            usageCount[outKanjiOnyomi] = 0;
          }
          usageCount[outKanjiOnyomi]++;
        }
      }
      const sortedUsageCount = Object.entries(usageCount).sort((a, b) => b[1] - a[1]);
      if (sortedUsageCount.length > 0) {
        for (const [reading, usedCount] of sortedUsageCount) {
          const usedPercentage = Math.round((usedCount / kanjiData[kanji].out.length) * 100);
          if (usedPercentage >= 50 && onyomi.includes(reading)) {
            meaningArr.push('＝＝＝＝読みヒント＝＝＝');
            meaningArr.push(`「${reading}」が${usedPercentage}%`);
            readingHints += `${kanji}\t${reading}\t${usedPercentage}%\r\n`;
          }
        }
      }
    }

    if (kanjiData[kanji].out.length > 0) {
      meaningArr.push('＝＝＝＝組み合わせ＝＝＝');
      for (const outKanji of kanjiData[kanji].out) {
        const onyomi = yomichan.getKanjiInfo(outKanji, KANJIDICPath)[0]?.onyomi;
        meaningArr.push(`${outKanji}　${onyomi?.split(' ')?.join('　')}`);
      }
    }

    outputJSON.push([kanji, '', '', '', meaningArr, {}]);
  }
  console.log(`Wrote ${outputJSON.length} kanji`);
  await fs.writeFile('thekanjimap/readingHints.tsv', readingHints);
  return outputJSON;
}
