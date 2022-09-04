// gave up on parsing that confusing xml
// scrape wiktionary kanji pages
const fs = require('fs').promises;

const { getURL, wait } = require('../util/scrape.js');
const writeJson = require('../util/writeJson.js');

const folderPath = './wiktionary/';
const allKanjiFilePath = 'wikipediaKanji.json';
const kanjiDataFilePath = 'kanjiData.json';

const wiktionaryURL = 'https://ja.wiktionary.org';
const kanjiDir = 'wiki%2F%E3%82%AB%E3%83%86%E3%82%B4%E3%83%AA%3A%E6%BC%A2%E5%AD%97';
const startPage = wiktionaryURL + '/' + kanjiDir;

const kanjiUrl = (kanji) => `${wiktionaryURL}/wiki/${kanji}`;
const WAIT_MS = 1000;

(async function () {
  const allKanji = await getAllKanji();
  const kanjiSet = new Set(allKanji);
  console.log(`Total kanji: ${kanjiSet.size}`);
  writeJson(allKanji, folderPath + allKanjiFilePath);
})();

async function getAllKanji() {
  // try reading allKanji.json
  try {
    const allKanjiFile = await fs.readFile(folderPath + allKanjiFilePath);
    return JSON.parse(allKanjiFile);
  } catch (error) {
    console.log(`No saved ${allKanjiFilePath}`);
  }

  const allKanjiArr = [];
  let nextURL = startPage;
  while (nextURL) {
    const { kanji, next } = await getKanjiPage(nextURL);
    allKanjiArr.push(...kanji);
    console.log(`Added ${kanji.length} kanji; total: ${allKanjiArr.length}`);
    nextURL = next;
    await wait(WAIT_MS);
  }
  return allKanjiArr;
}

async function getKanjiPage(url) {
  const avoidCategories = ['!', '*'];

  console.log(`Getting ${url}`);
  const document = await getURL(url, false);
  const categoryHeader = [...document.querySelectorAll('p')].find((p) =>
    p.textContent.includes('このカテゴリには 13,107 ページが含まれており、そのうち以下の')
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

async function getKanji(kanji) {
  const document = await getURL(kanjiUrl(kanji), true);
  const kanjiData = {}

  
}
