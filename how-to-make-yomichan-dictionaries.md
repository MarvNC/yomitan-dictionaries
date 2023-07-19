# How Do I Make A Yomichan Dictionary?

I get this question a lot, so here's an overview of how to make your own Yomichan dictionary.

## Read the Schemas

You'll want to get very familiar with the [Yomichan/Yomitan schemas](https://github.com/themoeway/yomitan/tree/master/ext/data/schemas) for dictionaries - these schemas define how Yomichan dictionaries are structured. You can read about [how JSON Schemas work here](https://json-schema.org/). I recommend trying [codebeautify](https://codebeautify.org/jsonviewer/), [json-schema-viewer](https://json-schema-viewer.vercel.app/), and [jsonhero](https://jsonhero.io/) for help breaking down the schemas. For looking at raw json files in the browser, I use [json-viewer](https://github.com/tulios/json-viewer) for a better json viewing experience.

Below is a list of the Yomichan dictionary schemas and what they're used for, as well as the expected filename. Note that for data files with numbers in them, the number starts at 1 and enumerates upwards.

| Schema                                      | Expected Filename                | Usage                                                                                                                                                                                                                                                                                          |
| ------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dictionary-index-schema.json`              | `index.json`                     | The schema for the `index.json` file that contains metadata about the dictionary. **PLEASE ALWAYS PUT AS MUCH DETAIL IN THIS AS POSSIBLE.** Note that this information can be displayed in Yomichan by going to the dictionaries overview page and clicking the three dots, then `Details...`. |
| `dictionary-kanji-bank-v3-schema.json`      | `kanji_bank_${number}.json`      | Contains information used in the kanji viewer - meaning, readings, statistics, and codepoints. Unfortunately a lot of the structuring is hardcoded and can't be customized nearly as much as with term definitions.                                                                            |
| `dictionary-kanji-meta-bank-v3-schema.json` | `kanji_meta-bank_${number}.json` | The meta bank for kanji information. Right now, this is only used to store kanji frequency data.                                                                                                                                                                                               |
| `dictionary-tag-bank-v3-schema.json`        | `tag_bank_${number}.json`        | The tag bank for term information. This is where you'll define tags for kanji and term dictionaries, like for example specifying parts of speech or kanken level. These are generally displayed in Yomichan as grey tags next to the dictionary name.                                          |
| `dictionary-term-bank-v3-schema.json`       | `term_bank_${number}.json`       | The term bank for term information. This is where dictionary readings, definitions, and such are stored.                                                                                                                                                                                       |
| `dictionary-term-meta-bank-v3-schema.json`  | `term_meta_bank_${number}.json`  | Where meta information about terms is stored. This currently includes frequency data and pitch accent data.                                                                                                                                                                                    |

## Packaging A Dictionary

A dictionary is not restricted to being only a kanji dictionary, term dictionary, frequency dictionary, or accent dictionary. It can have multiple types of kanji/term/tag information within the zip file, as is shown in the official test dictionary. Once you have an `index.json` and the relevant data files for your dictionary, you simply zip them up with all the data `.json` files in the root directory of the zip, NOT in subfolders. I recommend zipping them at the highest compression level possible - generally the json data files can be compressed to a fraction of their original size.

## Examples

- The [term origins dictionary](#複合語起源-term-origins) is a small example of a simple dictionary without any bells or whistles.
- The [official test dictionary](https://github.com/themoeway/yomitan/tree/master/test/data/dictionaries/valid-dictionary1) is a great resource to see an example of a dictionary that utilizes the full range of features currently defined in the schema.
- The [latest JMDict](https://github.com/MarvNC/yomichan-dictionaries#jmdict) has complex (and good) formatting.
- Dictionaries made by [stephenmk's jitenbot](https://github.com/stephenmk/jitenbot) like the [jitenon-dictionaries](#jitenon-dictionaries), 大辞林第四版, and 新明解第八版 have very nice formatting.
- Dictionaries made by the dictionary anon like 岩波, 三省堂, 広辞苑 have nice formatting.

## Schema Validation

For schema validation, I recommend configuring [VSCode to validate schemas](https://code.visualstudio.com/docs/languages/json#_json-schemas-and-settings), though you could also use a website like [jsonschemavalidator](https://www.jsonschemavalidator.net/) to test.

## Conjugation

For Japanese terms to be conjugated by Yomichan, they need to have an appropriate part of speech tag (as can be seen in the term bank schema). The part of speech labels are documented on the [official JMDict page here](http://www.edrdg.org/jmdictdb/cgi-bin/edhelp.py?svc=jmdict&sid=#kw_pos). If you're making a Japanese dictionary without too many terms, you might be able to simply copy the parts of speech from JMDict as long as the terms mostly overlap. I have developed an [npm package](https://www.npmjs.com/package/yomichan-dict-reader) that can help with stealing conjugations from JMDict - you can see an example of `getDeinflectorsForTermReading` in the [logic used to create the JP-Mongolian dictionary](https://github.com/MarvNC/yomichan-dictionaries/blob/master/mongolian/scrape.js).
