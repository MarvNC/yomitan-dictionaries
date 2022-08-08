# Yomichan Kanji Dictionaries

## Innocent Corpus Kanji Frequency

Uses the [innocent corpus frequency list](https://web.archive.org/web/20190309073023/https://forum.koohii.com/thread-9459.html#pid168613) that can be found at [foosoft](https://foosoft.net/projects/yomichan/index.html) to create a rank-based kanji frequency dictionary. This was created because the existing one is an occurence-based list.

`node convertInnocent.js` with `innocent_corpus.zip` in the same directory to output `innocent_corpus_kanji.zip`.

- The displayed frequency in Yomichan will contain the frequency rank followed by the occurence count, for example `4686 (57)` for 壟 indicating it's the 4686th most common kanji and appeared 57 times total in the 5000+ novels in Innocent Corpus.

## jpdb

Data from https://jpdb.io

`node getJpdbKanji.js scrape` -> scrapes jpdb data to `kanjiData.json`.  
`node getJpdbKanji.js get <kanji>` -> scrapes single kanji data and outputs to terminal.

`node makeDict.js` to create a kanji frequency list from an existing `kanjiData.json`.

## jitai

Convert the data in [jitai](https://github.com/epistularum/jitai) to a Yomichan kanji dictionary.
