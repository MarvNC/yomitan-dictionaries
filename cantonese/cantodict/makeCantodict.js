const csv = require('csvtojson');
const fs = require('fs');

// const saveDict = require('.../util/saveDict');
const folderPath = 'cantonese/cantodict/';
const csvPath = 'cantodict.csv';

(async function () {
  const cantodict = await csv().fromFile(folderPath + csvPath);
  const entrytypes = new Set();
  const dialects = new Set();
  const googlefrequencies = new Set();
  for (const entry of cantodict) {
    entrytypes.add(entry.entry_type);
    dialects.add(entry.dialect);
    googlefrequencies.add(entry.google_frequency);
  }
  const exampleSentence = cantodict.find((entry) => entry.entry_type === 'sentence');
})();
