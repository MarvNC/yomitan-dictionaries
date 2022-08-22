const fs = require('fs');
const jszip = require('jszip');
const jmdictPath = './util/jmdict_english.zip';
const termBankRegex = /term_bank_\d+\.json/;

let JMDictData;

async function getJMDictData() {
  if (JMDictData) return JMDictData;

  const allEntries = [];

  const jmdictZip = await fs.promises.readFile(jmdictPath);
  const jmdict = await jszip.loadAsync(jmdictZip);
  for (const fileName of Object.keys(jmdict.files)) {
    if (termBankRegex.test(fileName)) {
      const termBank = await jmdict.files[fileName].async('string');
      const data = JSON.parse(termBank);
      allEntries.push(...data);
    }
  }

  JMDictData = {};
  for (const entry of allEntries) {
    const [term, reading, tags, deinflectors, popularity, sequence, bigTags] = entry;
    JMDictData[(term, reading)] = {
      reading,
      tags,
      deinflectors,
      popularity,
      sequence,
      bigTags,
    };
  }
  return JMDictData;
}

async function getDeinflectors(term, reading) {
  const jmdict = await getJMDictData();
  const entry = jmdict[(term, reading)];
  if (!entry) {
    throw new Error(`No JMDict entry for ${(term, reading)}`);
  }
  return entry.deinflectors;
}

function getKanjiReadings(kanji) {}

module.exports = {
  getDeinflectors,
  getKanjiReadings,
};
