const axios = require('axios');
const qs = require('qs');
const { JSDOM } = require('jsdom');
const Yomichan = require('yomichan-dict-reader');
const writeJson = require('../util/writeJson');
const saveDict = require('../util/saveDict');
const { wait } = require('../util/scrape');

const JMDictPath = 'util/jmdict_english.zip';
const folderPath = 'mongolian/';
const outputJSONName = 'data.json';

// prettier-ignore
const allSearchTerms = [
  'あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く',
  'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ', 'た',
  'ち', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね',
  'の', 'は', 'ひ', 'ふ', 'へ', 'ほ', 'ま', 'み',
  'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'り',
  'る', 'れ', 'ろ', 'わ', 'を', 'ん', 'が', 'ぎ',
  'ぐ', 'げ', 'ご', 'ざ', 'じ', 'ず', 'ぜ', 'ぞ',
  'だ', 'ぢ', 'づ', 'で', 'ど', 'ば', 'び', 'ぶ',
  'べ', 'ぼ', 'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ', 'っ'
]

const data = (pageNumber, searchTerm) =>
  qs.stringify({
    currentPage: pageNumber.toString(),
    searchRange: '2',
    searchMethod: '4',
    groupId: '10',
    pageSize: '50',
    keyword: searchTerm,
    dicIds: '5',
  });
const config = (data) => ({
  method: 'post',
  url: 'http://hkuri.cneas.tohoku.ac.jp/project1/japanese/listAction',
  headers: {
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9,ja-JP;q=0.8,ja;q=0.7',
    'Cache-Control': 'max-age=0',
    Connection: 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded',
    Cookie:
      'keywordHistory10=%E2%97%87%7C%E6%9A%91%E3%81%84%7C%E6%97%A5%E6%9C%AC; JSESSIONID=68A57B94987976296BFA5E5235A9C357',
    DNT: '1',
    Origin: 'http://hkuri.cneas.tohoku.ac.jp',
    Referer: 'http://hkuri.cneas.tohoku.ac.jp/project1/japanese/listAction',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
  },
  data,
});

(async function () {
  // check for --skip flag
  const skip = process.argv.includes('--skip');
  let allDefinitions = {};
  if (skip) {
    console.log('Skipping scrape');
    // read existing json
    try {
      allDefinitions = require(`./${outputJSONName}`);
    } catch (error) {
      console.log('Error reading existing json');
      console.log(error);
    }
  } else {
    // scrape
    for (const searchTerm of allSearchTerms) {
      const definitions = await getDefinitionsFromSearch(searchTerm);
      const currDefCount = Object.keys(allDefinitions).length;
      Object.assign(allDefinitions, definitions);
      console.log(
        `Got ${Object.keys(definitions).length} definitions for ${searchTerm}, total: ${
          Object.keys(allDefinitions).length
        } with ${Object.keys(allDefinitions).length - currDefCount} new definitions`
      );
    }
    writeJson(allDefinitions, `${folderPath}${outputJSONName}`);
  }

  const yomichan = new Yomichan();
  await yomichan.readDictionary(JMDictPath);
  const finalOutputArray = [];
  for (const [termReading, definition] of Object.entries(allDefinitions)) {
    const [headword, reading] = termReading.split(',');
    const deinflectors = yomichan.getDeinflectorsForTermReading(headword, reading);

    let definitionString = definition.replace(/◇/g, '◇\n◇');
    definitionString = definitionString.replace(/; /g, '\n');

    finalOutputArray.push([headword, reading, '', deinflectors, 1, [definitionString], 1, '']);
  }
  const index = {
    title: 'Japanese-Mongolian/日・モ辞典',
    revision: `JP_Mongolian_${new Date().toISOString()}`,
    format: 3,
    url: 'http://hkuri.cneas.tohoku.ac.jp/',
    description:
      'JP->Mongolian dictionary scraped from http://hkuri.cneas.tohoku.ac.jp/\nParsed/converted by https://github.com/MarvNC/yomichan-dictionaries',
    author: '栗林均, Marv',
    attribution: '栗林均',
  };
  saveDict(
    {
      'term_bank_1.json': finalOutputArray,
      'index.json': index,
    },
    '[JP->Mongolian] Japanese-Mongolian/日・モ辞典.zip'
  );
})();

/**
 * Gets a search term and returns all the definitions for that term.
 * @param {string} searchTerm
 * @returns {object} allDefinitions
 */
async function getDefinitionsFromSearch(searchTerm) {
  console.log(`Getting definitions for ${searchTerm}`);
  const allDefinitions = {};
  const { definitions, lastPageNum } = await getDataFromPage(1, searchTerm);
  for (const definition of definitions) {
    allDefinitions[[definition.headword, definition.reading]] = definition.definition;
  }
  console.log(`Got page 1 of ${lastPageNum} for ${searchTerm}, ${definitions.length} definitions`);
  for (let i = 2; i <= lastPageNum; i++) {
    const { definitions } = await getDataFromPage(i, searchTerm);
    for (const definition of definitions) {
      allDefinitions[[definition.headword, definition.reading]] = definition.definition;
    }
    console.log(
      `Got page ${i} of ${lastPageNum} for ${searchTerm}, ${definitions.length} definitions`
    );
  }
  console.log(
    `Scrape complete! Got ${Object.keys(allDefinitions).length} definitions for ${searchTerm}`
  );
  return allDefinitions;
}

/**
 * Gets a page number and returns all the definitions on that page, as well as the number of the last page.
 * @param {int} pageNumber
 * @param {string} searchTerm
 * @returns definitions, lastPageNum
 */
async function getDataFromPage(pageNumber, searchTerm) {
  try {
    const response = await axios(config(data(pageNumber, searchTerm)));
    const dom = new JSDOM(response.data, {});
    const { document } = dom.window;

    const pageBar = document.querySelector('.pagination');
    let lastPageJS;
    let lastPageNum;
    if (pageBar) {
      lastPageJS = pageBar.lastElementChild.firstElementChild.href;
      lastPageNum = lastPageJS.match(/\((\d+)\)/)[1];
    } else {
      lastPageNum = 1;
    }

    const definitions = [];

    const tbody = document.querySelector('#main table.table-hover tbody');
    const rows = [...tbody.querySelectorAll('tr')];
    for (const row of rows) {
      const tds = [...row.querySelectorAll('td')];
      const reading = tds[1].textContent.trim();
      const headword = tds[2].textContent.trim() || reading;
      const definition = tds[3].textContent.trim();

      definitions.push({ headword, reading, definition });
    }
    return { definitions, lastPageNum };
  } catch (error) {
    console.log(error);
  }
}
