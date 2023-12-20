const fs = require('fs').promises;

const saveDict = require('../../../util/saveDict.js');
const writeJson = require('../../../util/writeJson.js');
const { getURL, wait } = require('../../../util/scrape.js');

const data = require('./zhwiktionaryKanji.json');
const hanziDataFilePath = './hanziData.json';
const folderPath = './wiktionary/';

const WAIT_MS = 0;

let hanziData;

(async () => {
  let refetchData = false;
  if (process.argv.includes('--refetchData')) {
    refetchData = true;
    console.log('Refetching hanzi data');
  }

  console.log(`Getting hanzi data for ${data.length} hanzi`);

  // try reading existing hanziData if refetch option not set
  if (!refetchData) {
    hanziData = {};
    try {
      const hanziDataFile = await fs.readFile(folderPath + hanziDataFilePath);
      hanziData = JSON.parse(hanziDataFile);
      console.log(`Loaded ${Object.keys(hanziData).length} hanzi`);
    } catch (error) {
      console.log(error);
      console.log(`No saved ${hanziDataFilePath}`);
      hanziData = {};
    }
  }

  try {
    let firstFetch = Date.now();
    let fetches = 0;
    for (let i = 0; i < data.length; i++) {
      const kanji = data[i];
      if (hanziData[kanji]) {
        continue;
      }
      const dataText = await getHanziUrlData(kanji);
      if (dataText) {
        hanziData[kanji] = dataText;
      }

      fetches++;
      const timePerFetch = (Date.now() - firstFetch) / fetches;
      const estimatedCompletionTime = new Date(Date.now() + (data.length - i) * timePerFetch);
      console.log(
        `Fetched ${kanji} (${i + 1}/${
          data.length
        }) - ETA: ${estimatedCompletionTime.toLocaleString()} - ${(1000 / timePerFetch).toFixed(
          2
        )}/s`
      );

      await wait(WAIT_MS);
    }
  } catch (error) {
    console.log(error);
  }
  console.log(`Completed! Fetched information for ${Object.keys(hanziData).length} hanzi`);
  await writeJson(hanziData, folderPath + hanziDataFilePath);
})();

// save on ctrl c
process.on('SIGINT', async () => {
  console.log('Saving...');
  if (hanziData) {
    console.log('Saving hanzi data');
    await writeJson(hanziData, folderPath + hanziDataFilePath);
  }
  process.exit(0);
});

async function getHanziUrlData(kanji) {
  const url = `https://zh.wiktionary.org/wiki/${kanji}`;
  const document = await getURL(url);
  const contentElem = document.querySelector('.mw-parser-output');
  if (!contentElem) {
    console.log(`No content for ${kanji}`);
    return null;
  }

  // remove misc unneeded elements
  const removeElemSelectors = [
    '.wikitable',
    'style',
    '#toc',
    'table',
    '.mw-editsection',
    '#编码',
    '.sister-wikipedia',
    '.sister-project',
    '.floatright',
    '.NavFrame',
    '.zhpron',
    '#發音',
  ];
  for (const selector of removeElemSelectors) {
    const elems = contentElem.querySelectorAll(selector);
    for (const elem of elems) {
      elem.remove();
    }
  }

  /** Remove sub-sections and their content
   * @param {*} elemSelector
   */
  function removeSubSection(elemSelector) {
    const possibleTagNames = ['H3', 'H4'];
    const elem = contentElem.querySelector(elemSelector);
    if (elem) {
      const parent = elem.parentElement;
      if (possibleTagNames.includes(parent.tagName)) {
        const next = parent.nextElementSibling;
        if (next.tagName === 'UL') {
          next.remove();
        }
        parent.remove();
      }
    }
  }
  removeSubSection('#参考');
  removeSubSection('#來源');

  /**
   * Edit header text to stand out more
   * @param {*} headerElemSelector
   * @param {*} symbol
   * @param {*} count
   */
  function editHeader(headerElemSelector, symbol, count) {
    const elems = contentElem.querySelectorAll(headerElemSelector);
    for (const elem of elems) {
      elem.textContent = symbol.repeat(count) + elem.textContent + symbol.repeat(count);
    }
  }
  editHeader('h2', '＝', 6);
  editHeader('h3', 'ー', 6);

  const rawText = contentElem.textContent;
  // remove duplicate newlines, trim every line
  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line);
  // add url at the beginning
  const finalText = [url, ...lines].join('\n');

  return finalText;
}
