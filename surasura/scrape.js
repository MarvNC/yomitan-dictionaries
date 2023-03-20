const fs = require('fs').promises;

const { write } = require('fs');
const { getURL, wait } = require('../util/scrape.js');
const writeJson = require('../util/writeJson.js');

const folderPath = './surasura/';
const WAIT_MS = 1000;

const domain = 'http://sura-sura.com/';

(async function () {
  const onomatopoeia = await getListOfOnomatopoeia();
})();

/**
 * Get list of onomatopoeia from surasura.com
 * @returns {Promise<{kana: string, url: string}[]>}
 */
async function getListOfOnomatopoeia() {
  const url = domain + 'sitemaps';
  const document = await getURL(url);
  return [...document.querySelectorAll('#sitemap_list .post-item a[href]')]
    .filter((anchor) => !anchor?.href.includes('category'))
    .map((a) => ({ kana: a.title, url: a.href }));
}

/** Get info for a single onomatopoeia given its url
 * @param {string} url
 * TODO add @return
 */
async function getOnomatopoeiaInfoFromLink(url) {
  const document = await getURL(url);
  const postContent = document.querySelector('.post_content');
  const removeElements = ['.al-c'];
  for (const selector of removeElements) {
    const element = postContent.querySelectorAll(selector);
    element?.remove();
  }
}
