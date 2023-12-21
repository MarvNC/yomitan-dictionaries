const { Dictionary, DictionaryIndex } = require('yomichan-dict-builder');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const cifuSourceURL =
  'https://raw.githubusercontent.com/gwinterstein/Cifu/8d5e4903e419193f903823880a7815712072cc80/Lexicon/Cifu-v1.txt';
const sourceFileName = 'Cifu-v1.txt';
const cifuFileName = (type) => `[Yue] Cifu ${type}.zip`;

(async () => {
  await downloadCifu();
  await processCifu();
})();

async function processCifu() {
  const sourceFilePath = path.join(__dirname, sourceFileName);
  const parser = csv({
    separator: '\t',
  });

  const readStream = fs.createReadStream(sourceFilePath);
  readStream.pipe(parser);

  /**
   * Word object
   * @type {Object.<string, {spoken: number, written: number}>}
   */
  const words = {};

  // Iterate through each row
  for await (const row of parser) {
    const word = row['Word'];
    const spoken = parseInt(row['SpokenAdult']);
    const written = parseInt(row['Written']);
    words[word] = {
      spoken,
      written,
    };
  }
  console.log(`Finished reading file with ${Object.keys(words).length} words`);
  /**
   *
   * @param {string} property
   * @returns {Array<[string, number]>}
   */
  const sortByProperty = (property) =>
    Object.entries(words)
      .sort((a, b) => b[1][property] - a[1][property])
      .map(([word, entry]) => [word, entry[property]]);

  for (const type of ['spoken', 'written']) {
    const dict = new Dictionary({
      // @ts-ignore
      fileName: cifuFileName(type),
    });
    const sortedArray = sortByProperty(type);
    let freqRank = 1;
    for (let i = 0; i < sortedArray.length; i++) {
      const [word, count] = sortedArray[i];
      /**
       * @type {import('yomichan-dict-builder/dist/types/yomitan/termbankmeta').FrequencyTerm}
       */
      const frequencyEntry = [
        word,
        'freq',
        {
          value: freqRank,
          displayValue: `${freqRank} (${count.toFixed(0).toString()})`,
        },
      ];
      // If the count is different than the previous term, set the rank to the current index + 1
      if (i > 0 && count !== sortedArray[i - 1][1]) {
        freqRank = i + 1;
      }
      await dict.addTermMeta(frequencyEntry);
    }

    await dict.setIndex({
      title: `Cifu ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      revision: new Date().toISOString().slice(0, 10),
      description: `Cantonese Frequency List from Cifu:
https://github.com/gwinterstein/Cifu
\n${
        type === 'spoken'
          ? `Spoken data from HKCanCor (Luke and Wong, 2015), HKCAC (Leung and Law, 2001), CantoMap (Lai and Winterstein, 2019)`
          : `Written data from 3,841 chapters of amateur novels from the website https://www.shikoto.com/`
      }\nConverted by Marv`,
      attribution: `Lai, Regine and Winterstein, Grégoire (2020) "Cifu: a Frequency Lexicon of Hong Kong Cantonese", in Proceedings of The 12th Language Resources and Evaluation Conference, Marseille: European Language Resources Association, p. 3062--3070.`,
      author: `Regine Lai, Grégoire Winterstein, Marv`,
      format: 3,
      frequencyMode: 'rank-based',
      url: 'https://github.com/MarvNC/yomichan-dictionaries',
    });

    console.log(`Exporting ${type} dictionary`);

    await dict.export();

    console.log(`Exported ${type} dictionary`);
  }
}

/**
 * Downloads the source file to the current directory
 */
async function downloadCifu() {
  // Download the source file to current directory
  const sourceFilePath = path.join(__dirname, sourceFileName);
  // Check if the file already exists
  if (!fs.existsSync(sourceFilePath)) {
    console.log(`Downloading ${sourceFileName}`);
    const response = await fetch(cifuSourceURL);
    const fileContents = await response.text();
    await fs.promises.writeFile(sourceFilePath, fileContents);
  }
}
