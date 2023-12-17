// TODO: Fix the definition array to be all structured content to avoid random lists in yomitan

const fs = require('fs');
const JSZip = require('jszip');
const path = require('path');
const readline = require('readline');

const TERMS_PER_JSON = 10000;
const linkCharacter = '⧉';

const outputZipName = '[Mono Encyclopedia] Wikipedia.zip';

(async () => {
  // Read argument for file path
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Please provide a file path');
    return;
  }

  const version = process.argv[3];
  if (!version) {
    console.error('Please provide a version');
    return;
  }

  // Read file line by line
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  await makeDict(rl, version);
})();

/**
 * @param {readline.Interface} readLineInterface
 * @param {string} version
 */
async function makeDict(readLineInterface, version) {
  const outputZip = new JSZip();

  let termBank = [];

  let termBankCounter = 1;

  /**
   * Saves an object to the zip as a json file.
   * @param {object} object
   * @param {string} fileName
   */
  function saveToZip(object, fileName) {
    outputZip.file(fileName, JSON.stringify(object));
  }

  for await (const line of readLineInterface) {
    // Chunk the term bank into separate json term banks
    if (termBank.length >= TERMS_PER_JSON) {
      saveToZip(termBank, `term_bank_${termBankCounter}.json`);
      console.log(`Wrote term_bank_${termBankCounter}.json`);
      termBank = [];
      termBankCounter++;
    }

    const termInformation = parseLineToDefinition(line);

    termBank.push(termInformation);
  }

  saveToZip(termBank, `term_bank_${termBankCounter}.json`);

  const index = {
    title: `JA Wikipedia [${version}]`,
    revision: `wikipedia_${new Date().toISOString()}`,
    format: 3,
    url: 'https://ja.wikipedia.org/',
    description: `Wikipedia short abstracts from the DBPedia dataset available at https://databus.dbpedia.org/dbpedia/text/short-abstracts.

Recommended custom CSS:
div.gloss-sc-span[data-sc-jawiki=red] {
  color: #e5007f;
}

Created with https://github.com/MarvNC/yomichan-dictionaries`,
    author: 'Wikipedians, DBPedia, Marv',
    attribution: 'Wikipedia',
  };
  saveToZip(index, 'index.json');

  // save zip
  console.log('Saving zip...');
  outputZip
    .generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    })
    .then((content) => {
      fs.writeFileSync(path.join(__dirname, outputZipName), content);
      console.log(`Writing ${outputZipName}`);
    });
}

/**
 *
 * @param {string} line
 * @returns {import('../types').TermInformation}
 */
function parseLineToDefinition(line) {
  // remove last 6 characters
  line = line.slice(0, -6);
  const [resource, definition] = line.split('> <http://www.w3.org/2000/01/rdf-schema#comment> "');
  let termSlug = resource.split('.dbpedia.org/resource/').pop();
  if (!termSlug) {
    throw new Error(`Could not parse term slug from ${resource}`);
  }
  termSlug = decodeURIComponent(termSlug);
  let termSpecifier = '';
  let term;
  if (termSlug.includes('_(')) {
    termSpecifier = termSlug.split('_(')[1].split(')')[0];
    term = termSlug.split('_(')[0];
  } else {
    term = termSlug;
  }

  const reading = getReadingFromDefinition(definition);

  /**
   * @type {import('../types').DetailedDefinition[]}
   */
  const definitionArray = [];

  /**
   * @type {import('../types').StructuredContent}
   */
  const sc = [];

  if (termSpecifier) {
    /**
     * @type {import('../types').StructuredContent}
     */
    const specifierSCNode = {
      tag: 'div',
      content: `«${termSpecifier}»`,
      data: {
        jawiki: 'red',
      },
      style: {
        fontSize: '1.5em',
      },
    };

    sc.push(specifierSCNode);
  }

  const definitionStrings = definition.split('\\n').map((line) => line.trim());
  /**
   * @type {import('../types').StructuredContentNode}
   */
  const definitionUList = {
    tag: 'ul',
    content: definitionStrings.map((definitionString) => ({
      tag: 'li',
      content: definitionString,
    })),
    data: {
      jawiki: 'abstract',
    },
  };
  sc.push(definitionUList);

  // add continue reading link to article
  /**
   * @type {import('../types').StructuredContentNode}
   */
  const linkSC = {
    tag: 'ul',
    content: [
      {
        tag: 'li',
        content: [
          {
            tag: 'a',
            href: `https://ja.wikipedia.org/wiki/${termSlug}`,
            content: '続きを読む',
          },
        ],
      },
    ],
    data: {
      jawiki: 'continue-reading',
    },
    style: {
      listStyleType: `"${linkCharacter}"`,
    },
  };

  sc.push(linkSC);

  definitionArray.push({
    type: 'structured-content',
    content: sc,
  });

  return [term, reading, '', '', 0, definitionArray, 0, ''];
}

/**
 * @param {string} definition
 * @returns {string}
 */
function getReadingFromDefinition(definition) {
  const bracketRegex = /[(（]([^)）]*)/g;
  const bracketMatches = bracketRegex.exec(definition);
  // @ts-ignore
  if (bracketMatches?.length >= 1) {
    // @ts-ignore
    const bracketContent = bracketMatches[1];
    return parseReadingFromBrackets(bracketContent);
  }
  return '';
}

/**
 * @param {string} bracketContent
 * @returns {string}
 */
function parseReadingFromBrackets(bracketContent) {
  if (!bracketContent) return '';

  const commaRegex = /,|、/g;
  const kanjiRegex = /[一-龯]/g;

  const readings = bracketContent.split(commaRegex);

  const noKanji = readings.filter((reading) => !kanjiRegex.test(reading));

  if (noKanji.length > 0) {
    return noKanji[0];
  }

  return '';
}
