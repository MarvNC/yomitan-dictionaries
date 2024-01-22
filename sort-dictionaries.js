/* 
By Marv for Yomitan
From https://github.com/MarvNC/yomichan-dictionaries
Last Updated 2024-01-17

Instructions:
Paste this into the browser console of the Yomitan options page and hit enter.
Please look at the `profiles` and `groups` objects below to configure the groups
you want to sort and the order you want them in.
*/

/**
 * Object of profiles with group order and enabled groups.
 * Your default profile is 0, the next profile is 1, so on.
 * In my example I have my first profile for JA, the second for ZH, and the third for YUE.
 * Any groups not in enabledGroups will be disabled.
 * @type {Record<number, {groupOrder: string[], enabledGroups: string[]}>} profiles
 */
const profiles = {
  0: {
    groupOrder: ['jafreq', 'ja', 'zhfreq', 'zh', 'yuefreq', 'yue'],
    enabledGroups: ['jafreq', 'ja', 'zh', 'yue'],
  },
  1: {
    groupOrder: ['zhfreq', 'zh', 'yuefreq', 'yue', 'jafreq', 'ja'],
    enabledGroups: ['zhfreq', 'zh', 'yue'],
  },
  2: {
    groupOrder: ['yuefreq', 'yue', 'zhfreq', 'zh', 'jafreq', 'ja'],
    enabledGroups: ['yuefreq', 'yue', 'zh'],
  },
};

/**
 * Sorted groups of dictionaries' regexes
 * @type {Record<string, Array<RegExp>>} groups
 */
const groups = {
  jafreq: [
    // JA Frequency
    /^JPDB$/,
    /^Innocent Ranked$/,
    /^Novels$/,
    /^Youtube$/,
    /^BCCWJ-LUW$/,
    /^CC100$/,
    /^青空文庫熟語$/,
    /^Wikipedia$/,
  ],
  ja: [
    // JA Pitch
    /^NHK$/,
    /^大辞泉$/,
    /^新明解第八版$/,
    /^大辞林第四版$/,
    /^三省堂国語辞典第八番$/,

    // Primary JA-JA
    /^三省堂国語辞典　第八版$/,
    /^新明解国語辞典　第八版$/,
    /^岩波国語辞典　第八版$/,
    /^広辞苑 第七版$/,

    // JA Differentiation
    /^使い方の分かる 類語例解辞典$/,

    // Other JA-JA
    /^デジタル大辞泉$/,
    /^旺文社国語辞典 第十一版$/,
    /^国語辞典オンライン$/,
    /^明鏡国語辞典　第二版$/,
    /^大辞林　第四版$/,
    /^新選国語辞典　第十版$/,
    /^精選版　日本国語大辞典$/,

    // Misc JA-JA
    /^漢検漢字辞典　第二版$/,
    /^漢字源$/,
    /^故事・ことわざ・慣用句オンライン$/,
    /^四字熟語辞典オンライン$/,
    /^新明解四字熟語辞典$/,
    /^学研 四字熟語辞典$/,
    /^実用日本語表現辞典$/,
    /^Pixiv.*$/,
    /^JA Wikipedia.*$/,
    /^日本語俗語辞書$/,
    /^故事ことわざの辞典$/,
    /^複合語起源$/,
    /^surasura 擬声語$/,
    /^語源由来辞典$/,
    /^weblio古語辞典$/,
    /^全国方言辞典$/,
    /^新語時事用語辞典$/,

    // JA (Rare)
    /^漢字林$/,
    /^福日木健二字熟語$/,
    /^全訳漢辞海$/,
    /^KO字源$/,
    /^YOJI-JUKUGO$/,

    // JA-EN
    /^Jitendex.*$/,
    /^NEW斎藤和英大辞典$/,
    /^新和英$/,

    // JA Names
    /^JMnedict$/,

    // JA Grammar
    /^日本語文法辞典\(全集\)$/,
    /^絵でわかる日本語$/,
    /^JLPT文法解説まとめ$/,
    /^どんなときどう使う 日本語表現文型辞典$/,
    /^毎日のんびり日本語教師$/,

    // JA Kanji Freq
    /^Innocent Corpus Kanji$/,
    /^Wikipedia Kanji$/,
    /^青空文庫漢字$/,
    /^JPDB Kanji Freq$/,

    // JA Kanji Info
    /^漢字辞典オンライン$/,
    /^KANJIDIC.*$/,
    /^JPDB Kanji$/,
    /^mozc Kanji Variants$/,
    /^jitai$/,
    /^TheKanjiMap Kanji Radicals\/Composition$/,
    /^Wiktionary漢字$/,
  ],
  yuefreq: [
    // YUE Freq
    /^Cifu Spoken$/,
    /^Cifu Written$/,
  ],
  yue: [
    // YUE-EN
    /^CantoDict$/,
    /^Canto CEDICT$/,
    /^Words\.hk C-E FS$/,
    /^Words\.hk C-C FS$/,
    /^CE Wiktionary$/,
    /^CC-Canto$/,
  ],
  zhfreq: [
    // ZH Frequency
    /^HSK$/,
    /^BLCUlit$/,
    /^SUBTLEX-CH$/,
    /^BLCUcoll$/,
    /^BLCUmixed$/,
    /^BLCUnews$/,
    /^BLCUsci$/,
  ],
  zh: [
    // ZH-EN
    /^CC-CEDICT(?! Hanzi).*$/,
    /^Wenlin ABC$/,

    // ZH-JA
    /^中日大辞典　第二版$/,

    // ZH-ZH
    /^漢語大詞典$/,
    /^萌典国语辞典$/,
    /^兩岸詞典$/,
    /^牛津英汉汉英词典$/,
    /^五南國語活用辭典$/,
    /^萌典$/,
    /^譯典通英漢雙向字典$/,
    /^现代汉语规范词典$/,
    /^康熙字典$/,
    /^辭源$/,
    /^ZH Wikipedia.*$/,

    // ZH Hanzi Info
    /^CC-CEDICT Hanzi.*$/,
    /^ZH Wiktionary Hanzi$/,
  ],
};

import('./js/pages/settings/settings-controller.js').then(async (SettingsController) => {
  /**
   * @type {import('./ext/js/pages/settings/settings-controller.js').SettingsController} SettingsController
   */
  const settingsController = new SettingsController.SettingsController();

  /**
   * @type {Set<RegExp>}
   */
  const failedToMatchDicts = new Set();
  /**
   * @type {Set<RegExp>}
   */
  const unknownDictionaries = new Set();

  for (const [profileIndex, { groupOrder, enabledGroups }] of Object.entries(profiles)) {
    console.log(`Sorting dictionaries for profile ${profileIndex}...`);

    settingsController.profileIndex = Number(profileIndex);

    /**
     * @type {import('./types/ext/settings').ProfileOptions} ProfileOptions
     */
    let currentOptions;
    try {
      currentOptions = await settingsController.getOptions();
    } catch (error) {
      console.error(`Failed to get options for profile ${profileIndex}!`);
      console.error(error);
      continue;
    }
    const { dictionaries } = currentOptions;

    const originalLength = dictionaries.length;

    const newDictionaries = [];

    for (const group of groupOrder) {
      const groupEnabled = enabledGroups.includes(group);
      for (const dictRegex of groups[group]) {
        let foundCount = 0;
        // Find the dictionaries in dictionaries that match the regex
        const matchedDictionaries = dictionaries.filter((dict) => {
          if (!dict) return false;
          return dictRegex.test(dict.name);
        });
        if (matchedDictionaries.length > 1) {
          console.warn(`Found more than one dictionaries for ${dictRegex}`);
        }
        if (matchedDictionaries.length === 0) {
          failedToMatchDicts.add(dictRegex);
        }
        // Add the dictionaries to the newDictionaries array
        for (const dict of matchedDictionaries) {
          dict.enabled = groupEnabled;
          newDictionaries.push(dict);
          foundCount++;
          const index = dictionaries.indexOf(dict);
          delete dictionaries[index];
        }
      }
    }

    // Get the remaining dictionaries
    for (const dict of dictionaries) {
      if (dict) {
        // console.warn(`Found dictionary not in sort order: ${dict.name}`);
        unknownDictionaries.add(dict.name);
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
  }

  if (failedToMatchDicts.size > 0) {
    console.log(`Failed to match dictionaries:`);
    console.log(failedToMatchDicts);
  }
  if (unknownDictionaries.size > 0) {
    console.log('Unknown dictionaries found:');
    console.log(unknownDictionaries);
  }
});
