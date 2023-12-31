/* 
By Marv for Yomitan
From https://github.com/MarvNC/yomichan-dictionaries
Last Updated 2023-12-30

Instructions:
Paste this into the browser console of the Yomitan options page and hit enter.
To match a dictionary by a prefix, set the value of the dictionary to 'prefix' in the order object.
The order object is in order of priority, so the higher up the dictionary is, the higher the priority.
*/

/**
 * Set this to the number of the profile to edit.
 */
const profileToEdit = 0;

/**
 * @type {Record<string, '' | 'prefix'>}
 */
// prettier-ignore
const order = {
  // JA Frequency
  'JPDB': '',
  'Innocent Ranked': '',
  'Novels': '',
  'Youtube': '',
  'BCCWJ-LUW': '',
  'CC100': '',
  '青空文庫熟語': '',
  'Wikipedia': '',
  
  // JA Pitch
  'NHK': '',
  '大辞泉': '',
  '新明解第八版': '',
  '大辞林第四版': '',
  '三省堂国語辞典第八番': '',
  
  // Primary JA-JA
  '三省堂国語辞典　第八版': '',
  '新明解国語辞典　第八版': '',
  '岩波国語辞典　第八版': '',
  '広辞苑 第七版': '',
  
  // JA Differentiation
  '使い方の分かる 類語例解辞典': '',
  '漢字ペディア同訓異義': '',

  // Other JA-JA
  'デジタル大辞泉': '',
  '旺文社国語辞典 第十一版': '',
  '国語辞典オンライン': '',
  '明鏡国語辞典　第二版': '',
  '大辞林　第四版': '',
  '新選国語辞典　第十版': '',
  '精選版　日本国語大辞典': '',
  
  // Misc JA-JA
  '漢字源': '',
  '故事・ことわざ・慣用句オンライン': '',
  '四字熟語辞典オンライン': '',
  '新明解四字熟語辞典': '',
  '学研 四字熟語辞典': '',
  '実用日本語表現辞典': '',
  'Pixiv': 'prefix',
  'JA Wikipedia': 'prefix',
  '日本語俗語辞書': '',
  '故事ことわざの辞典': '',
  '複合語起源': '',
  'surasura 擬声語': '',
  '語源由来辞典': '',
  'weblio古語辞典': '',
  '全国方言辞典': '',
  '新語時事用語辞典': '',
  // JA (Rare)
  '漢検 漢字辞典': '',
  '漢字林': '',
  '福日木健二字熟語': '',
  '漢字ペディア': '',
  '全訳漢辞海': '',
  'KO字源': '',
  'YOJI-JUKUGO': '',
  
  // JA-EN
  'Jitendex': 'prefix',
  'NEW斎藤和英大辞典': '',
  '新和英': '',
  
  // JA Names
  'JMnedict': '',
  
  // JA Grammar
  '日本語文法辞典(全集)': '',
  '絵でわかる日本語': '',
  'JLPT文法解説まとめ': '',
  'どんなときどう使う 日本語表現文型辞典': '',
  '毎日のんびり日本語教師': '',
  
  // JA Kanji Freq
  'Innocent Corpus Kanji': '',
  'Wikipedia Kanji': '',
  '青空文庫漢字': '',
  'JPDB Kanji Freq': '',
  
  // JA Kanji Info
  '漢字辞典オンライン': '',
  'KANJIDIC': 'prefix',
  'JPDB Kanji': '',
  'mozc Kanji Variants': '',
  'jitai': '',
  'TheKanjiMap Kanji Radicals/Composition': '',
  'Wiktionary漢字': '',

  // YUE Freq
  'Cifu Spoken': '',
  'Cifu Written': '',
  
  // YUE-EN
  'CantoDict': '',
  'Canto CEDICT': '',
  'Words.hk C-E FS': '',
  'Words.hk C-C FS': '',
  'CE Wiktionary': '',
  'CC-Canto': '',

  // ZH Hanzi Info
  'CC-CEDICT Hanzi [': 'prefix',
  'ZH Wiktionary Hanzi': '',
  
  // ZH Frequency
  'HSK': '',
  'BLCUlit': '',
  'SUBTLEX-CH': '',
  'BLCUcoll': '',
  'BLCUmixed': '',
  'BLCUnews': '',
  'BLCUsci': '',
  
  // ZH-EN
  'CC-CEDICT [': 'prefix',
  'Wenlin ABC': '',
  
  // ZH-JA
  '中日大辞典　第二版': '',
  
  // ZH-ZH
  '漢語大詞典': '',
  '萌典国语辞典': '',
  '兩岸詞典': '',
  '牛津英汉汉英词典': '',
  '五南國語活用辭典': '',
  '萌典': '',
  '譯典通英漢雙向字典': '',
  '现代汉语规范词典': '',
  '康熙字典': '',
  '辭源': '',
};

import('./js/pages/settings/settings-controller.js').then(async (SettingsController) => {
  /**
   * @type {import('./ext/js/pages/settings/settings-controller.js').SettingsController} SettingsController
   */
  const settingsController = new SettingsController.SettingsController();

  settingsController.profileIndex = profileToEdit;

  /**
   * @type {import('./types/ext/settings').ProfileOptions} ProfileOptions
   */
  const currentOptions = await settingsController.getOptions();
  const { dictionaries } = currentOptions;

  const originalLength = dictionaries.length;

  const newDictionaries = [];

  for (const [key, val] of Object.entries(order)) {
    let foundCount = 0;
    for (const dict of dictionaries) {
      if (!dict) continue;
      const name = dict.name;
      let matched = false;

      switch (val) {
        case 'prefix':
          if (name.startsWith(key)) {
            matched = true;
          }
          break;
        default:
          if (name === key) {
            matched = true;
          }
          break;
      }

      if (matched) {
        newDictionaries.push(dict);
        foundCount++;
        const index = dictionaries.indexOf(dict);
        delete dictionaries[index];
      }
    }
    if (foundCount > 1) {
      console.warn(`Found more than one dictionaries for ${key}`);
    }
    if (foundCount === 0) {
      console.log(`Did not find dictionary: ${key}`);
    }
  }

  // Get the remaining dictionaries
  for (const dict of dictionaries) {
    if (dict) {
      console.warn(`Found dictionary not in sort order: ${dict.name}`);
      newDictionaries.push(dict);
    }
  }

  if (originalLength !== newDictionaries.length) {
    console.error(`Dictionaries length mismatch! Aborting sort...`);
  } else {
    // Go through order and set the priority descending
    let priority = newDictionaries.length * 10;
    for (const dict of newDictionaries) {
      dict.priority = priority;
      priority -= 10;
    }

    await settingsController.modifyProfileSettings([
      {
        action: 'set',
        path: 'dictionaries',
        value: newDictionaries,
      },
    ]);
    console.log(`Updated dictionaries order!`);
  }
});
