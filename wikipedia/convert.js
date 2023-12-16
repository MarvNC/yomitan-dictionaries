const fs = require('fs');
const path = require('path');
const readline = require('readline');

(async () => {
  // Read argument for file path
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Please provide a file path');
    return;
  }

  // Read file line by line
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const termInformation = parseLineToDefinition(line);
    // Process each line here
  }
})();

/**
 *
 * @param {string} line
 * @returns {import('../types').TermInformation/}
 */
function parseLineToDefinition(line) {
  // remove last 6 characters
  line = line.slice(0, -6);
  const [resource, definition] = line.split('> <http://www.w3.org/2000/01/rdf-schema#comment> "');
  let term = resource.split('.dbpedia.org/resource/').pop();
  term = decodeURIComponent(term);

  console.log(term, definition);

  const bracketRegex = /[(（]([^)）]*)/g;
  const bracketMatches = definition.match(bracketRegex);
  let reading = '';
  if (bracketMatches) {
    const bracketContent = bracketMatches[1];
    console.log(bracketContent);
    const readingRegex = /[^、]+/g;
  }

  debugger;
}
