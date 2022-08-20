const csv = require('csvtojson');
const fs = require('fs');
const jszip = require('jszip');

const JMDict = require('../util/getJMDictInfo');

const folderPath = 'termOrigins/';

const csvPaths = ['shitaraba.tsv', '5ch.tsv', 'wanikani.tsv'];

const title = '複合語起源'

const outputZipName = `[Other] ${title}.zip`;

(async function () {
  const tsvOptions = { delimiter: '\t' };

  const data = {};

  for (const csvPath of csvPaths) {
    const csvData = await csv(tsvOptions).fromFile(folderPath + 'data/' + csvPath);
    for (const row of csvData) {
      const term = row.言葉;
      const reading = row.読み方;
      const origin = row.起源;

      if (!data[[term, reading]]) data[[term, reading]] = new Set();
      data[[term, reading]].add(origin);
    }
  }

  for (const termReadingPair of Object.keys(data)) {
    const [term, reading] = termReadingPair.split(',');
    const origins = Array.from(data[termReadingPair]);

    // remove duplicate wanikanis without readings
    if (origins.length > 1) {
      for (let i = 0; i < origins.length; i++) {
        const origin = origins[i];
        if (!origin.match(/（|）/)) {
          data[termReadingPair].delete(origin);
          // if it's present in other explanations, delete it
          if (Array.from(data[termReadingPair]).join(' ').includes(origin)) {
            origins.splice(i, 1);
          }
        }
      }
    }
  }

  // output data to tsv
  const tsvOutput = ['言葉	読み方	起源'];
  tsvOutput.push(
    ...Object.keys(data)
      .map((termReadingPair) => {
        const [term, reading] = termReadingPair.split(',');
        const origins = Array.from(data[termReadingPair]);
        return [term, reading, origins.join('、')].join('\t');
      })
      .sort((a, b) => {
        return a.localeCompare(b);
      })
  );
  fs.writeFileSync(folderPath + 'termOrigins.tsv', tsvOutput.join('\n'));

  const outputData = [];

  const index = {
    title,
    revision: `${title}_${new Date().toISOString()}`,
    format: 3,
    url: 'https://github.com/MarvNC/yomichan-dictionaries',
    description: 'TODO',
    attribution: '名無し, 名無し, seanblue, Marv',
  };
})();
