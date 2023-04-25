const csv = require('csvtojson');
const fs = require('fs');

const saveDict = require('../../util/saveDict');

// const saveDict = require('../util/saveDict');
const folderPath = 'cantonese/cantodict/';
const csvPath = 'cantodict.csv';

const READING_TYPE = 'jyutping';

// make three dicts - one for terms, one for characters (as a kanji dict), one for sentence examples for characters/terms.

(async function () {
  const rawCantoDict = await csv().fromFile(folderPath + csvPath);
  const cantodict = {};

  // parse json from relevant fields
  const jsonFields = [
    'cantodict_id',
    'similar',
    'variants',
    'pos',
    'flag',
    'compound_cantodictids',
    'sentence_cantodictids',
    'character_cantodictids',
    'google_frequency',
  ];
  // put into object with cantodict id as key
  for (const entry of rawCantoDict) {
    for (const field of jsonFields) {
      if (entry[field]) {
        entry[field] = JSON.parse(entry[field]);
      }
    }
    cantodict[entry.entry_type + ',' + entry.cantodict_id] = entry;
  }

  const termBank = createTermBank(cantodict);

  const index = {
    title: 'Cantodict',
    revision: `cantodict_${new Date().toISOString()}`,
    format: 3,
    url: 'http://www.cantonese.sheik.co.uk/',
    description: `Cantodict was a Cantonese-English dictionary created and maintained by public contributors. It was abandoned, but the data was archived thanks to awong-dev at https://github.com/awong-dev/cantodict-archive.
Created with https://github.com/MarvNC/yomichan-dictionaries`,
    author: 'Cantodict contributors, Marv',
    attribution: 'Cantodict contributors',
    frequencyMode: 'rank-based',
  };

  saveDict(
    {
      'index.json': index,
      'term_bank_1.json': termBank,
    },
    '[Cantonese] Cantodict.zip'
  );
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
      const termBankEntries = createTermBankEntries(entry, cantodict);
      termBank.push(...termBankEntries);
    }
  }
  return termBank;
}

/**
 * Creates Yomichan term bank entries from a cantodict entry which can be either a term or a character.
 * References the cantodict to get example sentences.
 * @param {Object} entry
 * @param {Object} cantodict
 */
function createTermBankEntries(entry, cantodict) {
  const entries = [];

  const termBankEntry = [];
  termBankEntry.push(entry.chinese);
  termBankEntry.push(entry[READING_TYPE]);
  termBankEntry.push(entry.pos.join(' '));
  termBankEntry.push('');
  termBankEntry.push(entry.google_frequency || 0);
  // TODO: make definition better using structured content to add compounds and example sentences
  termBankEntry.push([entry.definition]);
  // sequence number
  termBankEntry.push(0);
  // tags
  termBankEntry.push('');

  entries.push(termBankEntry);

  // handle variants
  if (entry.variants.length > 0) {
    for (const variant of entry.variants) {
      // copy term bank entry and replace the term with the variant
      const variantEntry = [...termBankEntry];
      variantEntry[0] = variant;
      entries.push(variantEntry);
    }
  }

  return entries;
}

/**
 * Creates a yomichan kanji bank from a character entry.
 * @param {Object} entry
 * @param {Object} cantodict
 */
function createKanjiBankEntry(entry, cantodict) {}
