const csv = require('csvtojson');
const fs = require('fs');

const saveDict = require('../util/saveDict');

const folderPath = 'jitai/';

const kyuujitaiTxt = '旧字体.txt';
const hyoujunjitaiTxt = '標準字体.txt';

const outputZipName = '[Kanji] jitai.zip';

(async function () {
  const tsvOptions = { delimiter: '\t' };
  let kyuujitai = await csv(tsvOptions).fromFile(folderPath + kyuujitaiTxt);
  let hyoujunjitai = await csv(tsvOptions).fromFile(folderPath + hyoujunjitaiTxt);

  const outputData = [];

  kyuujitai = kyuujitai.slice(1);
  hyoujunjitai = hyoujunjitai.slice(1);

  console.log(`Parsed ${kyuujitai.length} kyuujitai`);
  console.log(`Parsed ${hyoujunjitai.length} hyoujunjitai`);

  for (const row of kyuujitai) {
    const hasKyuujitai = row.旧unicode !== 'missing';
    // shinjitai form
    const shinjitaiRow = [];
    shinjitaiRow.push(row.新unicode, '', '', '新字体');
    const shinjitaiStats = [];

    if (hasKyuujitai) shinjitaiStats.push('旧字体: ' + row.旧unicode);
    if (row.新note) shinjitaiStats.push('新note: ' + row.新note);
    if (row.旧note) shinjitaiStats.push('旧note: ' + row.旧note);

    shinjitaiRow.push(shinjitaiStats, {});
    outputData.push(shinjitaiRow);

    // kyuujitai form
    if (hasKyuujitai) {
      const kyuujitaiRow = [];
      kyuujitaiRow.push(row.旧unicode, '', '', '旧字体');
      const kyuujitaiStats = [];

      kyuujitaiStats.push('新字体: ' + row.新unicode);
      if (row.新note) kyuujitaiStats.push('新note: ' + row.新note);
      if (row.旧note) kyuujitaiStats.push('旧note: ' + row.旧note);

      kyuujitaiRow.push(kyuujitaiStats, {});
      outputData.push(kyuujitaiRow);
    }
  }

  for (const row of hyoujunjitai) {
    const kakuchou = row.拡張新字体;
    const hyoujun = row.標準字体;

    outputData.push([kakuchou, '', '', '拡張新字体', [`標準字体: ${hyoujun}`], {}]);
    outputData.push([hyoujun, '', '', '標準字体', [`拡張新字体: ${kakuchou}`], {}]);
  }

  const index = {
    title: 'jitai',
    revision: `jitai_${new Date().toISOString()}`,
    format: 3,
    url: 'https://github.com/epistularum/jitai',
    description:
      'Data about 新字体/旧字体 and 標準字体/許容字体 in comparison to each other.\nCreated with https://github.com/MarvNC/yomichan-dictionaries',
    attribution: 'epistularum, Marv',
  };

  saveDict(
    {
      'index.json': index,
      'kanji_bank_1.json': outputData,
      'tag_bank_1.json': await fs.promises.readFile(folderPath + 'tag_bank_1.json'),
    },
    outputZipName
  );
})();
