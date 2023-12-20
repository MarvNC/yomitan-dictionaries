const { Dictionary, DictionaryIndex, KanjiEntry, TermEntry } = require('yomichan-dict-builder');
const JSDom = require('jsdom').JSDOM;
const fs = require('fs');
const path = require('path');

const baseListingPageURL = 'https://ksbookshelf.com/DW/Kanjirin/';

const downloadPageSubdir = 'pages';

(async () => {
  const dictionary = new Dictionary({
    fileName: '[Kanji] Kanjirin.zip',
  });
  const pageUrls = await getPagesFromIndex();

  console.log(`Downloading ${pageUrls.length} pages`);
  for (let i = 0; i < pageUrls.length; i++) {
    const pageUrl = pageUrls[i];
    const fileExisted = await downloadPage(pageUrl);
    if (!fileExisted) {
      console.log(`Downloading ${i + 1}/${pageUrls.length}: ${pageUrl}`);
    }
  }

  console.log('Processing pages');
  const pageFileNames = await fs.promises.readdir(path.join(__dirname, downloadPageSubdir));
  for (let i = 0; i < pageFileNames.length; i++) {
    const pageFileName = pageFileNames[i];
    console.log(`Processing ${i + 1}/${pageFileNames.length}: ${pageFileName}`);
    const pageFilePath = path.join(__dirname, downloadPageSubdir, pageFileName);
    await processPage(pageFilePath, dictionary);
  }

  console.log('Exporting dictionary');

  await dictionary.setIndex({
    title: '漢字林',
    revision: new Date().toISOString().slice(0, 10),
    description: `Kanjirin from https://ksbookshelf.com/DW/Kanjirin
Converted by https://github.com/MarvNC/yomichan-dictionaries`,
    attribution: `K's Bookshelf: https://ksbookshelf.com/DW/Kanjirin`,
    author: `K's Bookshelf, Marv, tism`,
    format: 3,
  });

  await dictionary.addTag({
    name: '部首',
    category: 'misc',
  });
  await dictionary.addTag({
    name: '総画数',
    category: 'misc',
  });

  const stats = await dictionary.export();
  console.log(`Exported ${stats.kanjiCount} entries`);
})();

/**
 * Downloads a page to the download directory
 * @param {string} pageUrl
 */
async function downloadPage(pageUrl) {
  if (!pageUrl) throw new Error('No page URL provided');
  const fileName = pageUrl.split('/').pop();
  if (!fileName) throw new Error('No file name found');
  const filePath = path.join(__dirname, downloadPageSubdir, fileName);
  // Check if file already exists
  if (fs.existsSync(filePath)) {
    return true;
  }

  const dom = await JSDom.fromURL(pageUrl);
  const document = dom.window.document;

  const html = document.documentElement.outerHTML;
  // create directory if it doesn't exist
  await fs.promises.mkdir(downloadPageSubdir, { recursive: true });
  await fs.promises.writeFile(filePath, html);
}

/**
 *
 * @param {string} pageFilePath
 * @param {Dictionary} dictionary
 */
async function processPage(pageFilePath, dictionary) {
  const dom = await JSDom.fromFile(pageFilePath);
  const document = dom.window.document;

  const kanjiDivs = document.querySelectorAll('div.kanjirin_text');
  for (const kanjiInfoDiv of kanjiDivs) {
    // Check if div has id
    if (!kanjiInfoDiv.id) continue;
    const id = kanjiInfoDiv.id;

    const children = [...kanjiInfoDiv.childNodes];

    const kanjiOyaji = children.shift();
    // @ts-ignore
    if (!kanjiOyaji.classList.contains('kanjirin_oyaji')) throw new Error('No kanji oyaji found');
    const kanji = kanjiOyaji?.textContent;
    if (!kanji) throw new Error('No kanji found');

    // Make the kanji entry
    const kanjiEntry = new KanjiEntry(kanji);

    // 𠀽一1+9=総画数10 U+2003D [ハイ、バイ、ロツ、ロチ/] 𢂤
    const nextText = children.shift();
    const nextTextContent = nextText?.textContent;
    if (nextText?.nodeName !== '#text' || !nextTextContent) throw new Error('No next text found');

    // bushu
    const bushu = nextTextContent.charAt(0);

    // stroke count
    const strokeCountRegex = /総画数(\d+)/;
    const strokeCountMatch = strokeCountRegex.exec(nextTextContent) ?? [];
    if (strokeCountMatch?.length < 2) throw new Error('No stroke count found');
    const strokeCount = strokeCountMatch[1];

    // readings
    const readingsRegex = /\[(.*)\/(.*)\]/;
    const readingsMatch = readingsRegex.exec(nextTextContent) ?? [];
    if (readingsMatch?.length < 3) throw new Error('No readings found');
    const replaceCommas = (str) => str.replace(/、/g, ' ');
    const onyomi = replaceCommas(readingsMatch[1]);
    const kunyomi = replaceCommas(readingsMatch[2]);

    kanjiEntry.setOnyomi(onyomi);
    kanjiEntry.setKunyomi(kunyomi);

    // betsuji
    let betsuji;
    if (kanjiInfoDiv.querySelector('.kanjirin_betsuji')) {
      const betsujiSpan = /** @type {HTMLSpanElement}*/ (children.shift());
      if (!betsujiSpan?.classList.contains('kanjirin_betsuji')) throw new Error('No betsuji found');
      betsuji = betsujiSpan.textContent;
    }

    kanjiEntry.setStats({
      部首: bushu,
      総画数: strokeCount,
    });

    let definitionArray = ['【意味】'];
    while (children.length > 0) {
      const child = children.shift();
      switch (child?.nodeName) {
        case '#text':
          if (child.textContent?.trim()) {
            definitionArray.push(child.textContent);
          }
          break;
        case 'SPAN':
          const span = /** @type {HTMLSpanElement} */ (child);
          if (span.classList.contains('kanjirin_notes')) {
            definitionArray.push('【注解】');
          } else if (span.classList.contains('kanjirin_quote')) {
            if (span.textContent?.trim()) {
              definitionArray.push(`◇【出典】${span.textContent.trim()}`);
            }
          } else if (span.classList.contains('kanjirin_remarks')) {
            if (span.textContent?.trim()) {
              definitionArray.push(`【注釈】`, span.textContent.trim());
            }
          } else {
            // No
          }
          break;
      }
    }

    if (betsuji) {
      definitionArray.push('【別字】', betsuji);
    }

    kanjiEntry.addMeaning(definitionArray);

    dictionary.addKanji(kanjiEntry.build());
  }
}

/**
 * @returns {Promise<string[]>} Array of page URLs
 */
async function getPagesFromIndex() {
  const dom = await JSDom.fromURL(baseListingPageURL);
  const document = dom.window.document;
  /**
   * @type {NodeListOf<HTMLAnchorElement>}
   */
  const anchors = document.querySelectorAll('#kanjirin table tr a');
  const pageUrls = [...anchors].map((anchor) => anchor.href);
  return pageUrls;
}
