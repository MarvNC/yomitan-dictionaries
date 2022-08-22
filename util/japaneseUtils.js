/**
 * Converts hiragana in a string to katakana.
 * @param {string} hiragana
 * @returns {string} katakana
 */
function hiraganaToKatakana(hiragana) {
  return hiragana.replace(/[ぁ-ん]/g, function (match) {
    return String.fromCharCode(match.charCodeAt(0) + 0x60);
  });
}

/**
 * Converts katakana in a string to hiragana.
 * @param {string} katakana
 * @returns {string} hiragana
 */
function katakanaToHiragana(katakana) {
  return katakana.replace(/[ァ-ン]/g, function (match) {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
}

/**
 * Detects if a character is kanji.
 * @param {string} char
 * @returns {boolean}
 */
function isKanji(char) {
  return /[一-龯]/.test(char);
}

/**
 * Detects if a character contains hiragana.
 * @param {string} char
 * @returns {boolean}
 */
function isHiragana(char) {
  return /[ぁ-ゔゞ゛゜ー]/.test(char);
}

/**
 * Detects if a character contains katakana.
 * @param {string} char
 * @returns {boolean}
 */
function isKatakana(char) {
  return /[ァ-ンヾ゛゜ー]/.test(char);
}

/**
 * Detects if a character is a kana.
 * @param {string} char
 * @returns {boolean}
 */
function isKana(char) {
  return isHiragana(char) || isKatakana(char);
}

console.log(normalizeReading('IQサプリ', 'あいきゅーさぷり'));

/**
 * Normalizes a reading to match for things with katakana in the string.
 * @param {string} term
 * @param {string} reading
 * @returns {string} outputReading
 */
function normalizeReading(term, reading) {
  if (isKatakana(term)) {
    const katakanaArr = hiraganaToKatakana(reading).split('');
    // combine like parts of reading
    const hiraganaArr = reading.split('');
    const outputReading = [];

    const termArr = term.split('');
    while (katakanaArr.length > 0) {
      const termChar = termArr.shift();
      if (!isKana(termChar)) {
        // consume kanjis in succession
        while (!isKana(termArr[0])) {
          termArr.shift();
        }
        // consume reading up till kanji is over
        while (
          katakanaArr.length > 0 &&
          katakanaArr[0] !== termArr[0] &&
          hiraganaArr[0] !== termArr[0]
        ) {
          outputReading.push(hiraganaArr.shift());
          katakanaArr.shift();
        }
      }
      // else match kanji/kana to reading
      else if (termChar === katakanaArr[0]) {
        hiraganaArr.shift();
        outputReading.push(katakanaArr.shift());
      } else if (termChar === hiraganaArr[0]) {
        katakanaArr.shift();
        outputReading.push(hiraganaArr.shift());
      } else if (!termChar) {
        katakanaArr.shift();
        outputReading.push(hiraganaArr.shift());
      }
    }

    return outputReading.join('');
  } else {
    return reading;
  }
}

module.exports = {
  hiraganaToKatakana,
  katakanaToHiragana,
  isKanji,
  containsHiragana: isHiragana,
  containsKatakana: isKatakana,
  normalizeReading,
};
