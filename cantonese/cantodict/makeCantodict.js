const csv = require('csvtojson');
const fs = require('fs');

// const saveDict = require('.../util/saveDict');
const folderPath = 'cantonese/cantodict/';
const csvPath = 'cantodict.csv';

// make three dicts - one for terms, one for characters (as a kanji dict), one for sentence examples for characters/terms.

(async function () {
  const cantodict = await csv().fromFile(folderPath + csvPath);
  const cantodictObj = {};

  // parse json from relevant fields
  const jsonFields = [
    'similar',
    'variants',
    'pos',
    'flag',
    'compound_cantodictids',
    'sentence_cantodictids',
    'character_cantodictids',
  ];
  for (const entry of cantodict) {
    for (const field of jsonFields) {
      entry[field] = JSON.parse(entry[field]);
    }
    cantodictObj[cantodict_id] = entry;
  }

  const exampleSentence = cantodict.find((entry) => entry.entry_type === 'sentence');
  const exampleTerm = cantodict.find((entry) => entry.entry_type === 'compound');
  const exampleCharacter = cantodict.find((entry) => entry.entry_type === 'character');
  debugger;

  const termBank = createTermBank(cantodict);
})();

/**
 * Creates a term bank of all terms from the cantodict object
 * @param {Object} cantodict
 */
function createTermBank(cantodict) {
  const termBank = [];
  for (const key of Object.keys(cantodict)) {
    const entry = cantodict[key];
    if (entry.entry_type === 'compound' || entry.entry_type === 'character') {
      const termBankEntry = createTermBankEntry(entry, cantodict);
      termBank.push(termBankEntry);
    }
  }
  return termBank;
}

/**
 * Creates a term bank entry from a cantodict entry
 * @param {Object} entry
 */
function createTermBankEntry(entry, cantodict) {}
