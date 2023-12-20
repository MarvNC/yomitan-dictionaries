const { Dictionary, DictionaryIndex, KanjiEntry, TermEntry } = require('yomichan-dict-builder');
const JSDom = require('jsdom').JSDOM;

const baseListingPageURL = 'https://ksbookshelf.com/DW/Kanjirin/';

(async () => {
  const dictionary = new Dictionary({
    fileName: '[Kanji] Kanjirin.zip',
  });
  const pageUrls = await getPagesFromIndex();
  for (const pageUrl of pageUrls) {
    await processPage(pageUrl, dictionary);
  }
})();

/**
 *
 * @param {string} pageUrl
 * @param {Dictionary} dictionary
 */
async function processPage(pageUrl, dictionary) {
  const dom = await JSDom.fromURL(pageUrl);
  const document = dom.window.document;
  const kanjiDivs = document.querySelectorAll('div.kanjirin_text');
  for (const kanjiInfoDiv of kanjiDivs) {
    // Check if div has id
    if (!kanjiInfoDiv.id) continue;

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
    const onyomi = readingsMatch[1];
    const kunyomi = readingsMatch[2];

    // betsuji
    const betsujiSpan = kanjiInfoDiv.querySelector('.kanjirin_betsuji');
    const betsuji = betsujiSpan?.textContent;

    console.log(kanji, bushu, strokeCount, onyomi, kunyomi, betsuji);
    debugger;
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
