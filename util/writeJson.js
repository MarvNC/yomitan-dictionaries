const fs = require('fs').promises;

/**
 * Writes object to json with filename
 * @param {*} object 
 * @param {*} filename 
 */
async function writeJson(object, filename) {
  await fs.writeFile(filename, JSON.stringify(object, null, 2));
  console.log(`Wrote ${filename}`);
}

module.exports = writeJson;
