# Yomichan Dictionaries <!-- omit in toc -->

**Downloads can be found in the [Releases](https://github.com/MarvNC/yomichan-kanji-dictionaries/releases) tab**

- [Term Dictionary](#term-dictionary)
- [Term Frequency](#term-frequency)
  - [jpdb Frequency Dictionary](#jpdb-frequency-dictionary)
- [Kanji Info](#kanji-info)
  - [jpdb Kanji](#jpdb-kanji)
- [Kanji Variants](#kanji-variants)
  - [mozc](#mozc)
  - [jitai](#jitai)
- [Kanji Frequency](#kanji-frequency)
  - [Innocent Corpus Kanji Frequency](#innocent-corpus-kanji-frequency)
  - [jpdb Kanji Frequency](#jpdb-kanji-frequency)

## Term Dictionary

<!-- ### niconico-pixiv slang
Using the information gathered by ncaq, this is a dictionary that can https://github.com/ncaq/dic-nico-intersection-pixiv
-->

<!-- ### 複合語起源

Compound kunyomi word origins, for example 陥る -> 落ち入る（おち|いる）. Information comes from anonymous forum posts, so it may not be 100% accurate.

- [Wanikani](https://community.wanikani.com/t/special-kanji-words-derived-from-other-words/35655)
- [shitaraba](https://jbbs.shitaraba.net/bbs/read.cgi/study/10958/1299762655/)
- [5ch](https://academy6.5ch.net/test/read.cgi/gengo/1228873581/) -->

## Term Frequency

<!--
aozora bunko kanji/jukugo
 -->

### jpdb Frequency Dictionary

A frequency dictionary based on information from https://jpdb.io (found [here](https://github.com/MarvNC/jpdb-freq-list)).

## Kanji Info

### jpdb Kanji

Kanji information from https://jpdb.io:

- the 15 most common vocab applicable
- the kanji decomposition according to jpdb (has inaccuracies because it's meant for memorizing keywords)
- 漢字検定 level
- 旧字体/新字体/拡張新字体 character form

![](!images/chrome_%E4%B9%B1_-_Yomichan_Search_-_Google_Chrome_2022-08-10_19-29-01.png)

<!-- ### The Kanji Map

A Yomichan kanji dictionary created using the data from [The Kanji Map](https://github.com/gabor-kovacs/the-kanji-map) providing radical information and kanji decompositions. -->

## Kanji Variants

### mozc

A kanji dictionary made from the kanji variant information in Google's [mozc](https://github.com/google/mozc) Japanese IME. Includes information about:

- 異体字
- 印刷標準字体
- 簡易慣用字体
- 旧字体
- 略字
- 正字
- 俗字
- 別字
- 本字

### jitai

A Yomichan kanji dictionary made using the data from [jitai](https://github.com/epistularum/jitai). This allows you to see information about 旧字体, 新字体, 拡張新字体, and 標準字体 variants from the kanji page in Yomichan.

![](!images/chrome_%E4%B9%B1_-_Yomichan_Search_-_Google_Chrome_2022-08-10_19-28-54.png)

## Kanji Frequency

### Innocent Corpus Kanji Frequency

Uses the [innocent corpus frequency list](https://web.archive.org/web/20190309073023/https://forum.koohii.com/thread-9459.html#pid168613) that is distributed with [Yomichan](https://github.com/FooSoft/yomichan#dictionaries) to create a rank-based kanji frequency dictionary. This was created because the existing one is an occurence-based list and does not display ranks.

- The displayed frequency in Yomichan will contain the frequency rank followed by the occurence count, for example `4686 (57)` for 壟 indicating it's the 4686th most common kanji and appeared 57 times total in the 5000+ novels in Innocent Corpus.

### jpdb Kanji Frequency

Kanji frequency data from https://jpdb.io.
