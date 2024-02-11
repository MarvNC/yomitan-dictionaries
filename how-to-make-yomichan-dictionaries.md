# How Do I Make A Yomichan Dictionary?

I get this question a lot, so here's an overview of how to make your own Yomichan dictionary.

As a prerequisite, you need to be somewhat familiar with JSON and coding in a language of choice.
The general process is as follows:

1. Acquire data (from a website, app, dump, etc.)
2. Parse the data so you can make sense of it
3. Format the data into jsons that are compliant with the Yomichan dictionary schema
4. Export the data into a zip file with the relevant jsons

- [How Do I Make A Yomichan Dictionary?](#how-do-i-make-a-yomichan-dictionary)
  - [Tools](#tools)
  - [Read the Schemas](#read-the-schemas)
  - [Packaging A Dictionary](#packaging-a-dictionary)
  - [Examples](#examples)
  - [Schema Validation](#schema-validation)
  - [Conjugation](#conjugation)
  - [Tag Categories](#tag-categories)

## Tools

- [Yomichan Dictionary Builder](https://github.com/MarvNC/yomichan-dict-builder/) - This is a node
  package I built to help with making dictionaries. It greatly simplifies the process of making
  dictionaries, please try it out if you use TypeScript or JavaScript.
- [hasUTF16SurrogatePairAt](https://www.npmjs.com/package/@stdlib/assert-has-utf16-surrogate-pair-at) -
  This is important for checking if a kanji/hanzi is a surrogate pair. If so, its length is 2 in
  JavaScript so you need to account for that when doing string operations.
- [japanese-furigana-normalize](https://github.com/MarvNC/japanese-furigana-normalize) - This
  package provides a utility function to normalize Japanese readings containing furigana. It is
  particularly useful for creating Yomitan dictionaries and ensuring the readings are properly
  aligned with the kanji characters.

## Read the Schemas

You'll want to get very familiar with the
[Yomichan/Yomitan schemas](https://github.com/themoeway/yomitan/tree/master/ext/data/schemas) for
dictionaries - these schemas define how Yomichan dictionaries are structured. You can read about
[how JSON Schemas work here](https://json-schema.org/). I recommend trying
[codebeautify](https://codebeautify.org/jsonviewer/),
[json-schema-viewer](https://json-schema-viewer.vercel.app/), and [jsonhero](https://jsonhero.io/)
for help breaking down the schemas. For looking at raw json files in the browser, I use
[json-viewer](https://github.com/tulios/json-viewer) for a better json viewing experience.

Below is a list of the Yomichan dictionary schemas and what they're used for, as well as the
expected filename. Note that for data files with numbers in them, the number starts at 1 and
enumerates upwards.

| Schema                                                                                                                                                     | Expected Filename                | Usage                                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`dictionary-index-schema.json`](https://github.com/themoeway/yomitan/tree/master/ext/data/schemas/dictionary-index-schema.json)                           | `index.json`                     | The schema for the `index.json` file that contains metadata about the dictionary. **PLEASE ALWAYS PUT AS MUCH DETAIL IN THIS AS POSSIBLE.** Note that this information can be displayed in Yomichan by going to the dictionaries overview page and clicking the three dots, then `Details...`. |
| [`dictionary-kanji-bank-v3-schema.json`](https://github.com/themoeway/yomitan/tree/master/ext/data/schemas/dictionary-kanji-bank-v3-schema.json)           | `kanji_bank_${number}.json`      | Contains information used in the kanji viewer - meaning, readings, statistics, and codepoints. Unfortunately a lot of the structuring is hardcoded and can't be customized nearly as much as with term definitions.                                                                            |
| [`dictionary-kanji-meta-bank-v3-schema.json`](https://github.com/themoeway/yomitan/tree/master/ext/data/schemas/dictionary-kanji-meta-bank-v3-schema.json) | `kanji_meta-bank_${number}.json` | The meta bank for kanji information. Right now, this is only used to store kanji frequency data.                                                                                                                                                                                               |
| [`dictionary-tag-bank-v3-schema.json`](https://github.com/themoeway/yomitan/tree/master/ext/data/schemas/dictionary-tag-bank-v3-schema.json)               | `tag_bank_${number}.json`        | The tag bank for term information. This is where you'll define tags for kanji and term dictionaries, like for example specifying parts of speech or kanken level. These are generally displayed in Yomichan as grey tags next to the dictionary name.                                          |
| [`dictionary-term-bank-v3-schema.json`](https://github.com/themoeway/yomitan/tree/master/ext/data/schemas/dictionary-term-bank-v3-schema.json)             | `term_bank_${number}.json`       | The term bank for term information. This is where dictionary readings, definitions, and such are stored.                                                                                                                                                                                       |
| [`dictionary-term-meta-bank-v3-schema.json`](https://github.com/themoeway/yomitan/tree/master/ext/data/schemas/dictionary-term-meta-bank-v3-schema.json)   | `term_meta_bank_${number}.json`  | Where meta information about terms is stored. This currently includes frequency data and pitch accent data.                                                                                                                                                                                    |

## Packaging A Dictionary

A dictionary is not restricted to being only a kanji dictionary, term dictionary, frequency
dictionary, or accent dictionary. It can have multiple types of kanji/term/tag information within
the zip file, as is shown in the official test dictionary. Once you have an `index.json` and the
relevant data files for your dictionary, you simply zip them up with all the data `.json` files in
the root directory of the zip, NOT in subfolders. I recommend zipping them at the highest
compression level possible - generally the json data files can be compressed to a fraction of their
original size.

## Examples

- The
  [term origins dictionary](https://github.com/MarvNC/yomichan-dictionaries#複合語起源-term-origins)
  is a small example of a simple dictionary without any bells or whistles.
- The
  [official test dictionary](https://github.com/themoeway/yomitan/tree/master/test/data/dictionaries/valid-dictionary1)
  is a great resource to see an example of a dictionary that utilizes the full range of features
  currently defined in the schema.
- The [latest JMDict](https://github.com/MarvNC/yomichan-dictionaries#jmdict) has complex (and good)
  formatting.
- Dictionaries made by [stephenmk's jitenbot](https://github.com/stephenmk/jitenbot) like the
  [jitenon-dictionaries](#jitenon-dictionaries), 大辞林第四版, and 新明解第八版 have very nice
  formatting.
- Dictionaries made by the dictionary anon like 岩波, 三省堂, 広辞苑 have nice formatting.

## Schema Validation

For schema validation, I recommend configuring
[VSCode to validate schemas](https://code.visualstudio.com/docs/languages/json#_json-schemas-and-settings),
though you could also use a website like [jsonschemavalidator](https://www.jsonschemavalidator.net/)
to test.

If you want to use VSCode to validate schemas, here's the relevant settings JSON value to use
following the above instructions.

```json
  "json.schemas": [
    {
      "fileMatch": ["kanji_bank_*.json"],
      "url": "https://github.com/themoeway/yomitan/raw/master/ext/data/schemas/dictionary-kanji-bank-v3-schema.json"
    },
    {
      "fileMatch": ["kanji_meta_bank_*.json"],
      "url": "https://github.com/themoeway/yomitan/raw/master/ext/data/schemas/dictionary-kanji-meta-bank-v3-schema.json"
    },
    {
      "fileMatch": ["tag_bank_*.json"],
      "url": "https://github.com/themoeway/yomitan/raw/master/ext/data/schemas/dictionary-tag-bank-v3-schema.json"
    },
    {
      "fileMatch": ["term_bank_*.json"],
      "url": "https://github.com/themoeway/yomitan/raw/master/ext/data/schemas/dictionary-term-bank-v3-schema.json"
    },
    {
      "fileMatch": ["term_meta_bank_*.json"],
      "url": "https://github.com/themoeway/yomitan/raw/master/ext/data/schemas/dictionary-term-meta-bank-v3-schema.json"
    }
  ],
```

## Conjugation

For Japanese terms to be conjugated by Yomichan, they need to have an appropriate part of speech tag
(as can be seen in the term bank schema). The part of speech labels are documented on the
[official JMDict page here](http://www.edrdg.org/jmdictdb/cgi-bin/edhelp.py?svc=jmdict&sid=#kw_pos).
If you're making a Japanese dictionary without too many terms, you might be able to simply copy the
parts of speech from JMDict as long as the terms mostly overlap. I have developed an
[npm package](https://www.npmjs.com/package/yomichan-dict-reader) that can help with stealing
conjugations from JMDict - you can see an example of `getDeinflectorsForTermReading` in the
[logic used to create the JP-Mongolian dictionary](https://github.com/MarvNC/yomichan-dictionaries/blob/master/mongolian/scrape.js).

## Tag Categories

There isn't any official documentation on the second item in an array item in the tag bank schema,
but it can be found
[here](https://github.com/themoeway/yomitan/blob/48f1d012ad5045319d4e492dfbefa39da92817b2/ext/css/display.css#L761-L790)
in the Yomitan source code. The tag categories are as follows:

- name
- expression
- popular
- frequent
- archaism
- dictionary
- frequency
- partOfSpeech
- search
- pronunciation-dictionary
- search

The main user-facing effect of choosing a tag category for a tag in the tag bank is that there will
be css applied to change the color of the tag. You can view the colors
[here](https://github.com/themoeway/yomitan/blob/48f1d012ad5045319d4e492dfbefa39da92817b2/ext/css/display.css#L136-L149).
