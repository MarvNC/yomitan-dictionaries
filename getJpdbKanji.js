const axios = require('axios');
const { JSDOM } = require('jsdom');
const fs = require('fs').promises;

const jpdbURL = 'https://jpdb.io/';
const kanjiDir = 'kanji-by-frequency';
const kankenDir = 'kanken-kanji';
const kanjiUrl = (kanji) => `${jpdbURL}kanji/${kanji}?expand=v`;
const VOCAB_LIMIT = 25;
const WAIT_MS = 1500;

const args = process.argv.slice(2);

(async function () {
  if (args.length > 0) {
    switch (args[0]) {
      case 'scrape':
        await scrapeKanji();
        break;
      case 'get':
        if (args.length > 1) {
          console.log(await getKanjiInfo(args[1]));
        } else {
          console.log('need kanji arg');
        }
        break;
    }
  } else {
    console.log('No args');
  }
})();

async function scrapeKanji() {
  let allKanji = {};
  // try reading allKanji.json
  try {
    const allKanjiFile = await fs.readFile('./allKanji.json');
    allKanji = JSON.parse(allKanjiFile);
    console.log('Read existing kanji list from allKanji.json');
  } catch (error) {
    console.log('No saved allKanji.json');
    allKanji = await getAllKanji();
    writeJson(allKanji, 'allKanji.json');
  }

  let kanjiData = {};
  const kanjiKeys = Object.keys(allKanji);

  // get existing saved kanji
  try {
    kanjiData = JSON.parse(await fs.readFile('kanjiData.json'));
    console.log(`Loaded existing kanjiData.json with ${Object.keys(kanjiData).length} kanji`);
  } catch (error) {
    console.log('No saved kanjiData.json');
  }

  for (var i = 0; i < kanjiKeys.length; i++) {
    const kanji = kanjiKeys[i];

    if (kanjiData[kanji]) {
      continue;
    }

    await wait(WAIT_MS);

    console.log(`Getting ${kanji}: ${i}/${kanjiKeys.length}`);
    const info = await getKanjiInfo(kanji[0]);
    kanjiData[kanji] = info;
    if (allKanji[kanji]?.freq) {
      kanjiData[kanji].frequency = allKanji[kanji]?.freq;
    }

    // add new kanji from old/new form
    if (info.newForm || info.oldForm) {
      const newKanji = info.newForm || info.oldForm;
      if (!allKanji[newKanji]) {
        allKanji[newKanji] = {};
        console.log(`found new kanji: ${newKanji}`);
        kanjiKeys.push(newKanji);
        writeJson(allKanji, 'allKanji.json');
      }
    }

    // save every 100 kanji
    if (i % 100 === 0) {
      writeJson(kanjiData, 'kanjiData.json');
    }
  }
  writeJson(kanjiData, `kanjiData.json`);
}

async function writeJson(object, filename) {
  await fs.writeFile(filename, JSON.stringify(object, null, 2));
  console.log(`Wrote ${filename}`);
}

// gets kanji from top 4k and kanken
async function getAllKanji() {
  const allKanji = {};

  // get top 4k kanji
  let document = await getURL(jpdbURL + kanjiDir);
  console.log('getting top 4k kanji');
  let freq = 1;
  for (const anchor of [...document.querySelectorAll('a')]) {
    if (anchor.href.includes('/kanji/')) {
      allKanji[anchor.textContent] = { freq };
      freq++;
    }
  }

  // kanken kanji
  console.log('getting kanken kanji');
  document = await getURL(jpdbURL + kankenDir);
  for (const group of [...document.querySelectorAll('h4')]) {
    const groupTitle = group.textContent.split(' (')[0];
    for (const anchor of [...group.nextElementSibling?.querySelectorAll('a')]) {
      if (anchor.href.includes('/kanji/')) {
        const kanji = anchor.textContent;
        if (!allKanji[kanji]) {
          allKanji[kanji] = {};
        }
        allKanji[kanji].kanken = groupTitle;
      }
    }
  }
  return allKanji;
}

async function getKanjiInfo(kanji) {
  const url = kanjiUrl(kanji);
  const document = await getURL(url);

  const kanjiInfo = {};

  const getHeaderBox = (header) =>
    [...document.querySelectorAll('h6.subsection-label')].find((elem) => elem.textContent == header)
      ?.nextElementSibling;

  const infoTable = getHeaderBox('Info');
  if (infoTable) {
    const getRow = (title) =>
      [...infoTable.querySelectorAll('td')].find((elem) => elem.textContent == title)
        ?.nextElementSibling;

    // freq
    kanjiInfo.frequency = getRow('Frequency')?.textContent;

    // type info
    const kanjiTypes = [...infoTable.querySelectorAll('.space-between')].map((elem) =>
      elem.textContent.replace(' ?', '')
    );
    if (kanjiTypes.length > 0) kanjiInfo.types = kanjiTypes;

    // kanken
    const kanken = getRow('Kanken')?.textContent;
    if (kanken) kanjiInfo.kanken = kanken;

    // new/old forms
    const oldFormElem = getRow('Old form');
    if (oldFormElem) kanjiInfo.oldForm = oldFormElem.textContent;
    const modernFormElem = getRow('Modern form');
    if (modernFormElem) kanjiInfo.modernForm = modernFormElem.textContent;

    // get readings info
    const readingsElems = [...infoTable.querySelectorAll('a')].filter((elem) =>
      elem.href.includes('/kanji-reading/')
    );
    if (readingsElems.length > 0) {
      const readings = [];
      for (const reading of readingsElems) {
        const readingInfo = [];
        readingInfo.push(reading.textContent);
        if (reading.nextElementSibling) {
          readingInfo.push(reading.nextElementSibling.textContent);
        }
        readings.push(readingInfo);
      }
      kanjiInfo.readings = readings;
    }

    // get vocab
    const usedInVocabElems = document.querySelectorAll('.used-in > .jp > a');
    if (usedInVocabElems.length > 0) {
      const usedInVocab = [];
      for (const elem of usedInVocabElems) {
        const vocab = /vocabulary\/\d+\/([^/]+)\//.exec(decodeURI(elem.href))[1];
        usedInVocab.push(vocab);
      }
      kanjiInfo.vocab = usedInVocab.slice(0, VOCAB_LIMIT);
    }

    // get composed of
    const composedOfBox = getHeaderBox('Composed of');
    if (composedOfBox) {
      kanjiInfo.composedOf = [...composedOfBox.querySelectorAll('a')].map(
        (elem) => elem.textContent
      );
    }

    return kanjiInfo;
  } else {
    throw new Error(`${kanji} has no info table`);
  }
}

// get url, return DOM
async function getURL(url) {
  url = encodeURI(url);
  try {
    const { data } = await axios.get(url, { validateStatus: null });
    const dom = new JSDOM(data, {});
    const { document } = dom.window;
    return document;
  } catch (error) {
    console.log(`Error getting ${url}`);
    console.log(error);
  }
}

// returns a promise that waits ms
async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
