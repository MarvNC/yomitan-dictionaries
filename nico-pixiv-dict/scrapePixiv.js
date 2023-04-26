const fs = require('fs').promises;

const { getURL, getJSON, wait } = require('../util/scrape');
const saveDict = require('../util/saveDict');
const writeJson = require('../util/writeJson');

const folderPath = './nico-pixiv-dict/';
const saveMetaJsonPath = folderPath + 'pixivMeta.json';
const saveDataJsonPath = folderPath + 'pixivData.json';

const WAIT_MS = 1000;

const domain = 'https://dic.pixiv.net/';
const categryPath = 'category/';
const articlePath = 'a/';
const jsonPath = (page) => `?json=1&page=${page}`;

let articles = {};
let articleData = {};
(async function () {
  // const testJson = await getJSON(
  //   'https://dic.pixiv.net/category/アニメ?json=1&page=9068'
  // );
  const categoryURLs = await getListOfCategoryURLs();
  const articles = await getListOfArticles(categoryURLs);
})();

/**
 * Gets a list of all articles on pixiv
 * @param {string} categoryURLs - list of category urls to get articles from
 */
async function getListOfArticles(categoryURLs) {
  console.log('Getting list of articles');
  const categories = {};
  // check saved json, if not populate json with all json paths
  try {
    const metaFile = await fs.readFile(saveMetaJsonPath);
    categories = JSON.parse(metaFile);
    console.log(`Loaded ${Object.keys(categories).length} categories from ${saveMetaJsonPath}`);
  } catch (error) {
    console.log(`No saved ${saveMetaJsonPath}, starting from scratch`);
    for (const categoryURL of categoryURLs) {
      const { meta } = await getJSON(categoryURL + jsonPath(1));
      const { all_count, count } = meta;
    }
  }
}

/**
 * Gets a list of all header categories on pixiv
 * @returns {Promise<string[]>} list of article category URLs
 */
async function getListOfCategoryURLs() {
  const doc = await getURL(domain);
  const categories = doc.querySelectorAll('#categories a');
  const hrefs = [...categories].map((a) => domain + categryPath + a.title);
  return hrefs;
}
