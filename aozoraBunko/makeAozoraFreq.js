const fs = require('fs');

const saveDict = require('../util/saveDict');

const folderPath = 'aozoraBunko/kanji-jukugo-frequency/';
const kanjiDataFilePath = 'aozoraBunko/aozora-kanji-frequency.txt';

(async function () {
  await makeKanjiFreq();
  await makeJukugoFreq();
})();

async function makeKanjiFreq() {
  const kanjiData = fs.readFileSync(kanjiDataFilePath, 'utf8');
  const lines = kanjiData.split('\n').splice(10);

  const outputData = [];

  for (const line of lines) {
    if (line) {
      const [freqStr, kanji, occurencesStr, percent] = line.split('\t').map((str) => str.trim());
      const [freq, occurences] = [parseInt(freqStr), parseInt(occurencesStr)];
      outputData.push([kanji, 'freq', { value: freq, displayValue: `${freq} (${occurences})` }]);
    }
  }

  const index = {
    title: '青空文庫漢字',
    revision: `aozoraBunko_${new Date().toISOString()}`,
    format: 3,
    url: 'https://www.aozora.gr.jp/',
    description: `Rank-based kanji frequency data from the Aozora Bunko
Data from https://vtrm.net/japanese/kanji-jukugo-frequency/en
Created with https://github.com/MarvNC/yomichan-dictionaries`,
    author: 'vtrm, Marv',
    attribution: '青空文庫',
    frequencyMode: 'rank-based',
  };

  saveDict(
    {
      'index.json': index,
      'kanji_meta_bank_1.json': outputData,
    },
    '[Kanji Frequency] Aozora Bunko.zip'
  );
}

async function makeJukugoFreq() {
  // get all txt files in dir
  const files = fs.readdirSync(folderPath);
  let txtFiles = files.filter((file) => file.endsWith('.txt'));

  console.log(`Reading ${txtFiles.length} files`);

  const allJukugo = {};

  for (let i = 0; i < txtFiles.length; i++) {
    const txt = txtFiles[i];
    const txtPath = folderPath + txt;
    const txtData = fs.readFileSync(txtPath, 'utf16le');

    console.log(`Reading ${txtPath}: index ${i + 1} of ${txtFiles.length}`);

    const lines = txtData.split('\r\n');

    const jukugoLines = lines.slice(2);
    for (const line of jukugoLines) {
      if (line) {
        const [undefined, occurences, jukugo] = line.split(' ').filter((str) => str !== '');
        if (occurences && jukugo) {
          allJukugo[jukugo] = occurences;
        }
      }
    }
  }

  const outputData = [];

  const allJukugoOrdered = Object.entries(allJukugo).sort((a, b) => b[1] - a[1]);
  for (let i = 0; i < allJukugoOrdered.length; i++) {
    const [jukugo, occurences] = allJukugoOrdered[i];

    let rank = i + 1;

    if (i > 0 && allJukugoOrdered[i - 1][1] === occurences) {
      rank = allJukugoOrdered[i - 1][2];
    }
    allJukugoOrdered[i].push(rank);

    outputData.push([
      jukugo,
      'freq',
      {
        value: rank,
        displayValue: `${rank} (${occurences})`,
      },
    ]);
  }

  console.log(`Wrote ${outputData.length} jukugo`);

  const index = {
    title: '青空文庫熟語',
    revision: `aozoraBunko_${new Date().toISOString()}`,
    format: 3,
    url: 'https://www.aozora.gr.jp',
    description: `Rank-based jukugo frequencies made from Aozora Bunko
Data from https://vtrm.net/japanese/kanji-jukugo-frequency/en
Created with https://github.com/MarvNC/yomichan-dictionaries
Caveats:
Jukugo which are absent from the dictionary entries are not reported in the data since the software has no way of knowing whether it encountered a legitimate jukugo or merely a juxtaposition of several words (e.g. when two or more nouns are combined together to form a new noun, or when a jukugo is used as an adverb).

Sometimes a compound word can be either a Sino-Japanese jukugo read in on’yomi, or a native Japanese word read in kun’yomi and sometimes accompanied with okurigana. For example, 蹌踉 can either be a taru-adjective or to-adverb of Chinese origin read そうろう, or the root of a Japanese verb whose dictionary form is 蹌踉めく and which is read よろめく. Keep in mind that the program I wrote doesn’t parse kana and doesn’t try to disambiguate kanji readings. Consequently, occurrences of 蹌踉 read そうろう and 蹌踉 read よろ aren’t distinguished and are grouped together in the statistics. So if you look at the data for kanji 蹌, the line corresponding to 蹌踉 refers to all occurrences of 蹌踉 in the corpus, whatever their respective readings is.

Due to the parsing method used and to the imperfect nature of Chinese characters word segmentation algorithms, there is a small (negligible but non-zero) number of false positives and missed out words.`,
    author: 'vtrm, Marv',
    attribution: '青空文庫',
    frequencyMode: 'rank-based',
  };

  saveDict(
    {
      'index.json': index,
      'term_meta_bank_1.json': outputData,
    },
    '[Freq] Aozora Bunko.zip'
  );
}
