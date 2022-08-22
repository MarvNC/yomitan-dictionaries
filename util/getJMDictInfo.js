const fs = require('fs');
const jszip = require('jszip');
const jmdictPath = './util/jmdict_english.zip';
const termBankRegex = /term_bank_\d+\.json/;

let JMDictData;

/**
 * Gets JMDict data from cache or reads the zip.
 * @returns {Promise<{[key: string]: JMDictEntry}>} JMDict
 */
async function getJMDictData() {
  if (JMDictData) return JMDictData;

  const allEntries = [];

  const jmdictZip = await fs.promises.readFile(jmdictPath);
  const jmdict = await jszip.loadAsync(jmdictZip);
  let fileCount = 0;
  for (const fileName of Object.keys(jmdict.files)) {
    if (termBankRegex.test(fileName)) {
      const termBank = await jmdict.files[fileName].async('string');
      const data = JSON.parse(termBank);
      allEntries.push(...data);
      fileCount++;
    }
  }
  console.log(`Read ${fileCount} term banks with ${allEntries.length} entries.`);

  JMDictData = {};
  for (const entry of allEntries) {
    const [term, reading, tags, deinflectors, popularity, sequence, bigTags] = entry;
    JMDictData[[term, reading]] = {
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

/**
 * Gets a given JMDict entry.
 * @param {string} term
 * @param {string} reading
 * @returns {object} JMDict entry
 */
async function getJMDictEntry(term, reading) {
  const jmdict = await getJMDictData();
  const entry = jmdict[[term, reading]];
  if (entry) return entry;
  const readingEntry = jmdict[[reading, '']];
  if (readingEntry) return readingEntry;
  throw new Error(`No JMDict entry for ${term} ${reading}`);
}

/**
 * Gets deinflectors from JMDict.
 * @param {string} term
 * @param {string} reading
 * @returns {string} deinflectors
 */
async function getDeinflectors(term, reading) {
  try {
    const entry = await getJMDictEntry(term, reading);
    return entry.deinflectors;
  } catch (error) {
    console.error(error);
    return '';
  }
}

/**
 * Gets the on and kun readings of a kanji from KANJIDIC
 * @param {string} kanji
 */
function getKanjiReadings(kanji) {}

module.exports = {
  getDeinflectors,
  getKanjiReadings,
};
