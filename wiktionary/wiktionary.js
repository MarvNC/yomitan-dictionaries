// gave up on parsing that confusing xml
// scrape wiktionary kanji pages
const fs = require('fs').promises;

const { getURL, wait } = require('../util/scrape.js');
const writeJson = require('../util/writeJson.js');

const folderPath = './wiktionary/';
const allKanjiFilePath = 'wikipediaKanji.json';
const kanjiDataFilePath = 'kanjiData.json';

const wiktionaryURL = 'https://ja.wiktionary.org';
const kanjiDir = 'wiki/カテゴリ:漢字';
const startPage = wiktionaryURL + '/' + kanjiDir;

const kanjiUrl = (kanji) => `${wiktionaryURL}/wiki/${kanji}`;
const WAIT_MS = 1000;

(async function () {
  const allKanji = await getAllKanji();
  const kanjiSet = new Set(allKanji);
  console.log(`Total kanji: ${kanjiSet.size}`);
  writeJson(allKanji, folderPath + allKanjiFilePath);
})();

/**
 * Gets a list of all the kanji in Wiktionary JP
 * @param {boolean} overwrite - whether to re fetch irregardless of an existing saved file
 * @returns
 */
async function getAllKanji(overwrite = false) {
  // fetch from existing file
  if (!overwrite) {
    try {
      const allKanjiFile = await fs.readFile(folderPath + allKanjiFilePath);
      return JSON.parse(allKanjiFile);
    } catch (error) {
      console.log(`No saved ${allKanjiFilePath}`);
    }
  }

  const allKanjiArr = [];
  let nextURL = encodeURI(startPage);
  while (nextURL) {
    const { kanji, next } = await getKanjiPage(nextURL);
    allKanjiArr.push(...kanji);
    console.log(`Added ${kanji.length} kanji; total: ${allKanjiArr.length}`);
    nextURL = next;
    await wait(WAIT_MS);
  }
  return allKanjiArr;
}

/**
 * Gets the kanji on a page of kanji as well as the url of the next page in the list.
 * @param {string} url
 * @returns
 */
async function getKanjiPage(url) {
  const avoidCategories = ['!', '*'];

  console.log(`Getting ${url}`);
  const document = await getURL(url, false);
  const categoryHeader = [...document.querySelectorAll('p')].find((p) =>
    p.textContent.includes('ページが含まれており、そのうち以下の')
  );
  const nextPageURL = [...document.querySelectorAll('a')].find((a) =>
    a.textContent.includes('次のページ')
  );

  const kanjiColumnsElem = categoryHeader?.parentElement?.querySelector('div.mw-content-ltr');
  const kanji = [...kanjiColumnsElem.querySelectorAll('div.mw-category-group')].map((div) => ({
    category: div.firstElementChild.textContent,
    kanjiList: [...div.querySelectorAll('a')].map((a) => a.textContent),
  }));

  const kanjiArr = [];

  for (const { category, kanjiList } of kanji) {
    if (!avoidCategories.includes(category)) {
      kanjiArr.push(...kanjiList);
    }
  }

  return {
    kanji: kanjiArr,
    next: nextPageURL ? wiktionaryURL + nextPageURL : null,
  };
}

/**
 * Gets kanji info from a page on Wiktionary
 * @param {string} kanji
 */
async function getKanji(kanji) {
  const document = await getURL(kanjiUrl(kanji), true);
  const kanjiData = {};

  // const content = document.getElementsByClassName('mw-parser-output')[0];
  const kanjiHeader = document.querySelector('#漢字')?.parentElement;
  const kanjiElems = [];
  let elem = kanjiHeader.nextElementSibling;
  while (elem && elem.tagName !== 'H2') {
    kanjiElems.push(elem);
    elem = elem.nextElementSibling;
  }

  while (kanjiElems.length > 0) {
    let elem = kanjiElems.shift();
    if (elem.tagName === 'P') {
      // skip the 350% large kanji
      continue;
    } else if (elem.tagName === 'UL') {
      // kanji stats
      for (const li of [...elem.querySelectorAll('li')]) {
        let [key, value] = li.textContent.split(':');
        key = key.trim();
        value = value.trim();
        if(key === '異体字'){
          const itaiji = {};
          // TODO: parse itaiji to object/array thing
          for(const char of value.split('')){
            
          }
        }
        kanjiData[key] = value;
      }
    } else if (elem.tagName === 'H3') {
      const header = elem;
      const headerText = header.textContent.replace('[編集]', '').trim();
      const content = kanjiElems.shift();
      kanjiData[headerText] = content.textContent;
    }
  }

  const readingsHeader = document.getElementById('発音(?)')?.parentElement;
  if (readingsHeader) {
    const readingsElem = readingsHeader.nextElementSibling;
    kanjiData['発音'] = readingsElem.textContent;
  }
}
