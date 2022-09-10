const saveDict = require('../util/saveDict');
const writeJson = require('../util/writeJson');

const data = require('./kanjiData.json');

const definitionTypes = ['発音', '異体字', '意義', '字源'];
const statTypes = ['部首', '総画'];
const readingMarkers = {
  音読み: 'ーー',
  訓読み: 'ーー',
};

const outputZipName = '[Kanji] Wiktionary.zip';

(async function () {
  // parse/add itaiji
  for (const kanji of Object.keys(data)) {
    const thisKanjiItaiji = parseItaijiString(data[kanji].異体字);
    for (const itaijiKanji of Object.keys(thisKanjiItaiji)) {
      // skip empty kanjis
      if (!itaijiKanji) continue;
      if (!data[itaijiKanji]) {
        data[itaijiKanji] = {};
      }
      if (!data[itaijiKanji].異体字) {
        data[itaijiKanji].異体字 = '';
      }
      if (!data[itaijiKanji].異体字.includes(kanji)) {
        // if kanji not already in itaiji list of that kanji, add it
        if (!data[itaijiKanji].異体字.includes('\n')) {
          data[itaijiKanji].異体字 += '\n';
        }
        data[itaijiKanji].異体字 += kanji + ' ';
      }
    }
  }

  const outputData = [];
  // map new itaiji and save to new json
  for (const kanji of Object.keys(data)) {
    const thisKanjiData = data[kanji];
    let allDefinitionString = '';
    for (const definitionType of definitionTypes) {
      if (thisKanjiData[definitionType]) {
        let definitionString = thisKanjiData[definitionType];
        if (definitionType === '発音') {
          definitionString = definitionString
            .split('\n')
            .map((line) => {
              for (const marker of Object.keys(readingMarkers)) {
                if (readingMarkers[line]) {
                  return readingMarkers[line] + line + readingMarkers[line];
                }
                // if (line.startsWith(marker)) {
                //   return line.replace(marker, readingMarkers[marker] + marker);
                // }
              }
              return line;
            })
            .join('\n');
        }
        allDefinitionString += `========${definitionType}========\n${definitionString}\n`;
      }
    }
    // trim last two newlines
    allDefinitionString = allDefinitionString.slice(0, -1);

    const statObj = {};
    for (const statType of statTypes) {
      if (thisKanjiData[statType]) {
        statObj[statType] = thisKanjiData[statType];
      }
    }

    outputData.push([kanji, '', '', '', allDefinitionString.split('\n'), statObj]);
  }

  const tagBank = statTypes.map((stat) => [stat, 'misc', -10, stat, 0]);

  const index = {
    title: 'Wiktionary漢字',
    revision: `Wiktionary漢字 ${new Date().toISOString()}`,
    format: 3,
    url: 'https://ja.wiktionary.org/wiki/%E3%82%AB%E3%83%86%E3%82%B4%E3%83%AA:%E6%BC%A2%E5%AD%97',
    description:
      'Kanji data from ja.wiktionary.org.\nParsed/converted by https://github.com/MarvNC/yomichan-dictionaries',
    author: 'Wiktionary, Wikimedia Foundation, Marv',
    attribution: 'JA Wiktionary',
  };

  saveDict(
    {
      'kanji_bank_1.json': outputData,
      'tag_bank_1.json': tagBank,
      'index.json': index,
    },
    outputZipName
  );
})();

/**
 * Parses a string of itaiji info to an object with keys for each itaiji and values for the type
 * @param {string} value
 */
function parseItaijiString(value) {
  if (!value) return {};
  const itaiji = {};
  const parenthesesStack = [];
  const chars = value.split('\n')[0].split('');
  // nested parentheses are a thing (article for 鬱) so we have to keep track of all parentheses
  let currentChar = '';
  let currentType = '';
  while (chars.length > 0) {
    const char = chars.shift();
    if (char === '（') {
      currentType += char;
      parenthesesStack.push(char);
    } else if (char === '）') {
      currentType += char;
      parenthesesStack.pop();
      if (parenthesesStack.length === 0) {
        // end of type
        itaiji[currentChar] = currentType;
        currentType = '';
      }
    } else if (char === '、' || char === ',') {
      if (parenthesesStack.length > 0) currentType += char;
    } else if (char === ' ') {
    } else if (parenthesesStack.length === 0) {
      currentChar = char;
      itaiji[currentChar] = '';
    } else {
      currentType += char;
    }
  }
  return itaiji;
}
