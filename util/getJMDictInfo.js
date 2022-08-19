const fs = require('fs');
const jszip = require('jszip');
const jmdictPath = '';

let JMDictData;

async function getJMDictData() {
  if (JMDictData) return JMDictData;

  const jmdict = JSON.parse(fs.readFileSync(jmdictPath));
  for (const entry of jmdict) {

  }
}

function getDeinflectors(term, reading) {
  
}

function getKanjiReadings(kanji) {
  
}

module.exports = {
  getDeinflectors,
  getKanjiReadings,
};
