const JsonSchemaStaticDocs = require('json-schema-static-docs');

(async () => {
  let jsonSchemaStaticDocs = new JsonSchemaStaticDocs({
    inputPath: 'schemas',
    inputFileGlob: '*.json',
    outputPath: 'docs',
    ajvOptions: {
      allowUnionTypes: true,
    },
  });
  await jsonSchemaStaticDocs.generate();
  console.log('Documents generated.');
})();
// const glob = require('glob');
// (async () => {
//   let files = await glob.sync('schemas/*.json');
//   console.log(files);
// })();
