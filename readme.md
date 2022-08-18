# Yomichan Dictionaries <!-- omit in toc -->

**Downloads can be found in the [Releases](https://github.com/MarvNC/yomichan-kanji-dictionaries/releases) tab**

- [Innocent Corpus Kanji Frequency](#innocent-corpus-kanji-frequency)
- [jpdb](#jpdb)
- [jitai](#jitai)
- [The Kanji Map](#the-kanji-map)
- [複合語起源](#複合語起源)

## Innocent Corpus Kanji Frequency

Uses the [innocent corpus frequency list](https://web.archive.org/web/20190309073023/https://forum.koohii.com/thread-9459.html#pid168613) that is distributed with [Yomichan](https://github.com/FooSoft/yomichan#dictionaries) to create a rank-based kanji frequency dictionary. This was created because the existing one is an occurence-based list and does not display ranks.

- The displayed frequency in Yomichan will contain the frequency rank followed by the occurence count, for example `4686 (57)` for 壟 indicating it's the 4686th most common kanji and appeared 57 times total in the 5000+ novels in Innocent Corpus.

## jpdb

Using data from https://jpdb.io :

- Kanji frequency list, that tells you roughly how common a kanji is.
- Kanji dictionary containing:
  - the 15 most common vocab applicable
  - the kanji decomposition according to jpdb (has inaccuracies because it's meant for memorizing keywords)
  - 漢字検定 level
  - 旧字体/新字体/拡張新字体 character form

![](!images/chrome_%E4%B9%B1_-_Yomichan_Search_-_Google_Chrome_2022-08-10_19-29-01.png)

## jitai

A Yomichan kanji dictionary made using the data from [jitai](https://github.com/epistularum/jitai). This allows you to see information about 旧字体, 新字体, 拡張新字体, and 標準字体 variants from the kanji page in Yomichan.

![](!images/chrome_%E4%B9%B1_-_Yomichan_Search_-_Google_Chrome_2022-08-10_19-28-54.png)

## The Kanji Map

(WIP) A Yomichan kanji dictionary created using the data from [The Kanji Map](https://github.com/gabor-kovacs/the-kanji-map) providing radical information and kanji decompositions.

## 複合語起源

(WIP) Compound kunyomi word origins, for example 陥る -> 落ち入る（おち|いる）. Information comes from anonymous forum posts, so it may not be 100% accurate.

- [Wanikani](https://community.wanikani.com/t/special-kanji-words-derived-from-other-words/35655)
- [shitaraba](https://jbbs.shitaraba.net/bbs/read.cgi/study/10958/1299762655/)
- [5ch](https://academy6.5ch.net/test/read.cgi/gengo/1228873581/)
