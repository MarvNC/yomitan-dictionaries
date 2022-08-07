# Yomichan Kanji Dictionaries

## Innocent Corpus Kanji

Uses the [innocent corpus frequency list](https://web.archive.org/web/20190309073023/https://forum.koohii.com/thread-9459.html#pid168613) that can be found at [foosoft](https://foosoft.net/projects/yomichan/index.html) to create a rank-based kanji frequency dictionary.
`node convertInnocent.js` with `innocent_corpus.zip` in the same directory to output `innocent_corpus_kanji.zip`.

## Get JPDB Kanji Data

`node getJpdbKanji.js scrape` -> scrapes jpdb data to kanjiData.json
`node getJpdbKanji.js get <kanji>` -> scrapes single kanji data and outputs to terminal
