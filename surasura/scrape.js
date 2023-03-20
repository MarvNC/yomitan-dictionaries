const fs = require('fs').promises;

const { write } = require('fs');
const { getURL, wait } = require('../util/scrape.js');
const writeJson = require('../util/writeJson.js');

const folderPath = './surasura/';
const saveDataJsonPath = folderPath + 'data.json';
const WAIT_MS = 0;

const domain = 'http://sura-sura.com/';

const jpSentenceExampleEmoji = '🇯🇵';
const infoEmoji = 'ℹ️';

let data = [];
(async function () {
  const onomatopoeia = await getListOfOnomatopoeia();
  // check for existing data

  try {
    const dataFile = await fs.readFile(saveDataJsonPath);
    data = JSON.parse(dataFile);
    console.log(`Loaded ${data.length} entries`);
  } catch (error) {
    console.log(`No saved ${saveDataJsonPath}, starting from scratch`);
    const onomatopoeia = await getListOfOnomatopoeia();
    for (let i = 0; i < onomatopoeia.length; i++) {
      const onomatopoeiaInfo = onomatopoeia[i];
      const { kana, url } = onomatopoeiaInfo;
      console.log(`Getting ${kana} from ${url}: ${i + 1}/${onomatopoeia.length}`);
      const onomatopoeiaData = await getOnomatopoeiaInfoFromLink(url);
      data.push({
        expression: kana,
        ...onomatopoeiaData,
      });
      await wait(WAIT_MS);
    }
    await writeJson(data, saveDataJsonPath);
  }
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
 * @returns {Promise<{expression: string, shortDefinitions: string[], extendedDefinition: string, sentenceExamples: string[]}>}
 */
async function getOnomatopoeiaInfoFromLink(url) {
  const document = await getURL(url);
  const postContent = document.querySelector('.post_content');
  const shortDefinitions = [...postContent.querySelectorAll('.none3')].map((el) =>
    el.textContent.replace(/\n/g, '')
  );

  const moreInfoBox = postContent.querySelector('.box005');

  // get extended definition
  let extendedDefinition = '';
  if (moreInfoBox) {
    // the extended definition is the only use of p elems
    extendedDefinition = [...moreInfoBox.querySelectorAll('p')]
      .map((el) => el.textContent.replace(/\n/g, ''))
      .join('\n');
  } else {
    console.log('no more info box');
  }
  const exampleHeader = document.querySelector('div.sita01');

  // get example sentences
  const sentenceExamples = [];
  if (exampleHeader) {
    const sentenceElems = [...exampleHeader.nextElementSibling.querySelectorAll('li')];
    for (const sentenceElem of sentenceElems) {
      const sentence = sentenceElem.textContent.replace(/[「」]/g, '');
      sentenceExamples.push(sentence);
    }
  } else {
    console.log('no example header');
  }
  return {
    shortDefinitions,
    extendedDefinition,
    sentenceExamples,
  };
}

// save on ctrl c
process.on('SIGINT', async () => {
  console.log('Saving...');
  if (data) {
    console.log('Saving data...');
    await writeJson(data, saveDataJsonPath);
  }
  process.exit(0);
});
