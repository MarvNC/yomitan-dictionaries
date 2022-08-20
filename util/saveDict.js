const fs = require('fs');
const jszip = require('jszip');
const outputFolder = './dl/'

/**
 * Writes an array of json objects to a zip for a Yomichan dictionary.
 * @param {object} data Data to write in an object with the filenames as keys and the file contents as the value.
 * @param {string} outputZipName 
 */
function saveDict(data, outputZipName) {
  const outputZip = new jszip();
  for (const fileName of Object.keys(data)) {
    outputZip.file(fileName, JSON.stringify(data[fileName]));
  }
  outputZip
    .generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    })
    .then((content) => {
      fs.writeFileSync(outputFolder + outputZipName, content);
    });
  console.log(`Wrote ${outputZipName}`);
}

module.exports = saveDict;
