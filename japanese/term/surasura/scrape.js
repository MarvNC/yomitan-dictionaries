const fs = require('fs').promises;

const exp = require('constants');
const { getURL, wait } = require('../../../util/scrape');
const saveDict = require('../../../util/saveDict');
const writeJson = require('../../../util/writeJson');

const folderPath = './surasura/';
const saveDataJsonPath = folderPath + 'data.json';
const WAIT_MS = 0;

const domain = 'http://sura-sura.com/';

const jpSentenceExampleEmoji = '🇯🇵';
const jpExtendedInfoEmoji = 'ℹ️';

let data = {};
(async function () {
  const onomatopoeia = await getListOfOnomatopoeia();

  // check for existing data
  try {
    const dataFile = await fs.readFile(saveDataJsonPath);
    data = JSON.parse(dataFile);
    console.log(`Loaded ${Object.keys(data).length} entries from ${saveDataJsonPath}`);
  } catch (error) {
    console.log(`No saved ${saveDataJsonPath}, starting from scratch`);
  }
  for (let i = 0; i < onomatopoeia.length; i++) {
    const onomatopoeiaInfo = onomatopoeia[i];
    const { kana, url } = onomatopoeiaInfo;
    if (data[url]) {
      continue;
    }
    console.log(`Getting ${kana} from ${url}: ${i + 1}/${onomatopoeia.length}`);
    const onomatopoeiaData = await getOnomatopoeiaInfoFromLink(url);
    data[url] = { expression: kana, ...onomatopoeiaData };
    await wait(WAIT_MS);
  }
  await writeJson(data, saveDataJsonPath);
  console.log(`Got ${Object.keys(data).length} entries`);

  // convert to yomichan format
  const termBank = [];
  for (const url in data) {
    const { expression, ...info } = data[url];
    const yomichanEntry = convertToYomichanArray(expression, info);
    termBank.push(yomichanEntry);
  }
  const index = {
    title: 'surasura 擬声語',
    revision: `surasura_${new Date().toISOString()}`,
    format: 3,
    url: 'http://sura-sura.com/',
    description:
      'Onomatopoeia info from http://sura-sura.com/\nParsed/converted by https://github.com/MarvNC/yomichan-dictionaries',
    author: 'surasura, Marv',
    attribution: 'surasura',
  };

  saveDict(
    {
      'term_bank_1.json': termBank,
      'index.json': index,
    },
    '[Monolingual] surasura.zip'
  );
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

/**
 * Takes an expression and its info and converts it to a yomichan term bank entry array
 * @param {string} expression
 * @param {Object} info
 */
function convertToYomichanArray(expression, info) {
  const definitionArray = [];
  const definitionStructuredContent = {};
  definitionStructuredContent.content = [];
  definitionStructuredContent.type = 'structured-content';
  definitionArray.push(definitionStructuredContent);

  const shortglossaryContent = {
    content: info.shortDefinitions.map((definition) => ({ content: definition, tag: 'li' })),
    data: {
      content: 'glossaryShortDefinition',
    },
    lang: 'ja',
    style: {
      listStyleType: 'circle',
    },
    tag: 'ul',
  };
  definitionStructuredContent.content.push(shortglossaryContent);

  if (info.extendedDefinition) {
    const extendedDefContent = {
      content: {
        content: info.extendedDefinition,
        tag: 'li',
      },
      data: {
        content: 'glossaryExtendedDefinition',
      },
      lang: 'ja',
      style: {
        listStyleType: `"${jpExtendedInfoEmoji} "`,
      },
      tag: 'ul',
    };
    definitionStructuredContent.content.push(extendedDefContent);
  }
  if (info.sentenceExamples.length) {
    const sentenceExamplesContent = {
      content: info.sentenceExamples.map((sentence) => ({ content: sentence, tag: 'li' })),
      data: {
        content: 'examples',
      },
      lang: 'ja',
      style: {
        listStyleType: `"${jpSentenceExampleEmoji} "`,
      },
      tag: 'ul',
    };
    definitionStructuredContent.content.push(sentenceExamplesContent);
  }

  const returnArray = [expression, expression, '', '', 0, definitionArray, 0, ''];
  return returnArray;
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
