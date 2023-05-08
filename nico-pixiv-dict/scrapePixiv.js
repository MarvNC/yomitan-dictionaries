const fs = require('fs').promises;

const { getURL, getJSON, wait } = require('../util/scrape');
const saveDict = require('../util/saveDict');
const writeJson = require('../util/writeJson');
const { debug } = require('console');

const folderPath = './nico-pixiv-dict/';
const saveSummariesJsonPath = folderPath + 'pixivSummaries.json';
const saveArticlesJsonPath = folderPath + 'pixivArticles.json';

const WAIT_MS = 000;

const domain = 'https://dic.pixiv.net/';
const categryPath = 'category/';
const articlePath = 'a/';
const pageJsonPath = (page) => `?json=1&page=${page}`;

const linkCharacter = '⧉';
const relatedArticleCharacter = '📚';
const childArticleCharacter = '➜';

const COUNT_PER_PAGE = 12;

let articlesListSummaries = {};
let articleData = {};
(async function () {
  const categoryURLs = await getListOfCategoryURLs();
  await getListOfArticles(categoryURLs);
  await getArticlesSummaries();
  const processedData = processData();
  makeDict(processedData);
})();

function makeDict(processedData) {
  const debug = true;
  const termBank = [];
  for (const article of Object.keys(processedData)) {
    if (debug) {
      if (termBank.length > 1000) {
        break;
      }
    }
    const articleEntry = processedData[article];
    const termEntry = [];
    termEntry.push(article);
    // no reading (yet)
    termEntry.push('');
    // no tags
    termEntry.push('');
    // no deinflectors
    termEntry.push('');
    // popularity shouldnt be relevant, no overlapping entries
    termEntry.push(0);
    // definitions
    const definitionStructuredContent = {
      type: 'structured-content',
      content: [],
    };
    // make navigation header thing
    const navHeader = {
      tag: 'span',
      content: [],
      data: {
        pixiv: 'nav-header',
      },
    };
    if (articleEntry.parentTree) {
      let parentTree = [...articleEntry.parentTree];
      if (parentTree.length > 5) {
        // get last 5 entries of parent tree
        parentTree = parentTree.slice(-5);
        navHeader.content.push({
          tag: 'span',
          content: '...',
        });
      }
      for (const parent of parentTree) {
        navHeader.content.push({
          tag: 'a',
          href: `?query=${parent}&wildcards=off`,
          content: parent,
        });
        navHeader.content.push({
          tag: 'span',
          content: ' ＞ ',
        });
      }
      // remove last arrow
      navHeader.content.pop();
      definitionStructuredContent.content.push(navHeader);
    }

    // add summary
    if (articleEntry.summary) {
      definitionStructuredContent.content.push({
        tag: 'div',
        content: articleEntry.summary.trim(),
        data: {
          pixiv: 'summary',
        },
      });
    }

    // add related tags 関連記事
    if (articleEntry.related_tags) {
      const relatedTags = {
        tag: 'div',
        content: [
          {
            tag: 'div',
            content: {
              tag: 'ul',
              content: [
                {
                  tag: 'li',
                  content: '関連記事',
                },
              ],
              style: {
                listStyleType: `"${relatedArticleCharacter}"`,
              },
            },
            data: {
              pixiv: 'related-tags-header',
            },
          },
          {
            tag: 'div',
            content: [],
            data: {
              pixiv: 'related-tags-content',
            },
          },
        ],
        data: {
          pixiv: 'related-tags',
        },
      };
      for (const tag of articleEntry.related_tags) {
        relatedTags.content[1].content.push({
          tag: 'a',
          href: `?query=${tag}&wildcards=off`,
          content: tag,
        });
        relatedTags.content[1].content.push({
          tag: 'span',
          content: '・',
        });
      }
      // remove last dot
      relatedTags.content[1].content.pop();
      definitionStructuredContent.content.push(relatedTags);
    }

    // add children
    if (articleEntry.children) {
      const children = {
        tag: 'div',
        content: [
          {
            tag: 'div',
            content: {
              tag: 'ul',
              content: [
                {
                  tag: 'li',
                  content: '子記事',
                },
              ],
              style: {
                listStyleType: `"${childArticleCharacter}"`,
              },
            },
            data: {
              pixiv: 'children-header',
            },
          },
          {
            tag: 'div',
            content: [],
            data: {
              pixiv: 'children-content',
            },
          },
        ],
        data: {
          pixiv: 'children',
        },
      };
      for (const child of articleEntry.children) {
        children.content[1].content.push({
          tag: 'a',
          href: `?query=${child}&wildcards=off`,
          content: child,
        });
        children.content[1].content.push({
          tag: 'span',
          content: '・',
        });
      }
      // remove last dot
      children.content[1].content.pop();
      definitionStructuredContent.content.push(children);
    }

    // add link to article 続きを読む
    definitionStructuredContent.content.push({
      tag: 'ul',
      content: [
        {
          tag: 'li',
          content: [
            {
              tag: 'a',
              href: `${domain}${articlePath}${article}`,
              content: '続きを読む',
            },
          ],
        },
      ],
      data: {
        pixiv: 'continue-reading',
      },
      style: {
        listStyleType: `"${linkCharacter}"`,
      },
    });

    termEntry.push([definitionStructuredContent]);
    // sequence number
    termEntry.push(0);
    // term tags
    termEntry.push('');
    termBank.push(termEntry);
  }
  const index = {
    title: 'PixivLite',
    revision: `pixiv_${new Date().toISOString()}`,
    format: 3,
    url: 'https://dic.pixiv.net/',
    description: `Article summaries scraped from pixiv, ${termBank.length} entries included.
Created with https://github.com/MarvNC/yomichan-dictionaries`,
    author: 'Pixiv&contributors, Marv',
    attribution: 'Pixiv contributors',
    frequencyMode: 'rank-based',
  };
  saveDict(
    {
      'term_bank_1.json': termBank,
      'index.json': index,
    },
    '[Monolingual] PixivLite.zip'
  );
}

/**
 * Creates a yomichan dict using the article summaries
 */
function processData() {
  // Rearrange JSON so all terms are keys and important data as values
  const articleSummaries = {};
  for (const articlesList of Object.values(articlesListSummaries)) {
    if (!articlesList) {
      continue;
    }
    for (const article of articlesList) {
      const { summary, related_tags, parent } = article;
      articleSummaries[article.tag_name] = { summary, related_tags, parent };
    }
  }

  console.log(`Got ${Object.keys(articleSummaries).length} articles`);

  // find parent tree for each and save
  for (const article of Object.keys(articleSummaries)) {
    if (articleSummaries[article].parent && !articleSummaries[article].parentTree) {
      computeFamily(article, articleSummaries);
    }
  }

  console.log(`Done processing data`);
  return articleSummaries;
}

/**
 * Gets the parent tree for a given article, adds it as a child to its parent recursively
 * @param {string} article
 * @param {Object} articleSummaries
 * @param {Set} seen - set of articles currently traversed
 * @returns {string[]} parent tree
 */
function computeFamily(article, articleSummaries, seen = new Set()) {
  // check if already computed
  if (seen.has(article)) {
    return articleSummaries[article].parentTree || [article];
  }
  seen.add(article);

  // null
  if (!articleSummaries[article]) {
    return [article];
  }

  const parent = articleSummaries[article].parent;

  // base case
  if (!parent) {
    return [article];
  }

  // recursive case
  const parentTree = [...computeFamily(parent, articleSummaries, seen)];
  // check for cycles
  if (parentTree.includes(article)) {
    console.log(`Cycle detected for ${article}`);
    return [article];
  }
  parentTree.push(article);
  articleSummaries[article].parentTree = [...parentTree];

  // add self to parent's children if parent exists
  if (articleSummaries[parent]) {
    if (!articleSummaries[parent].children) {
      articleSummaries[parent].children = [];
    }
    if (!articleSummaries[parent].children.includes(article)) {
      articleSummaries[parent].children.push(article);
    }
  }

  return parentTree;
}

/**
 * Gets article summaries from the list of articles using the json api
 * @returns {Promise<Object>} list of article summaries
 */
async function getArticlesSummaries() {
  console.log('Getting article summaries');
  const remainingArticlesKeys = Object.keys(articlesListSummaries).filter(
    (key) => !articlesListSummaries[key]
  );
  const startTime = Date.now();
  for (let i = 0; i < remainingArticlesKeys.length; i++) {
    const listURL = remainingArticlesKeys[i];
    if (articlesListSummaries[listURL]) {
      continue;
    }
    const { articles } = await getJSON(listURL);
    articlesListSummaries[listURL] = articles;

    const remaining = remainingArticlesKeys.length - i;
    const timeElapsed = Date.now() - startTime;
    const timePerArticle = timeElapsed / (i + 1);
    const timeRemaining = remaining * timePerArticle;
    const expectedEndTime = new Date(Date.now() + timeRemaining).toLocaleString();

    console.log(`Got ${listURL}, ${remaining} remaining, expected ${expectedEndTime}`);
    await wait(WAIT_MS);
  }
  await writeJson(articlesListSummaries, saveSummariesJsonPath);
}

/**
 * Gets a list of all articles on pixiv
 * @param {string} categoryURLs - list of category urls to get articles from
 */
async function getListOfArticles(categoryURLs) {
  console.log('Getting list of articles');
  // check saved json, if not populate json with all json paths
  try {
    const categoriesFile = await fs.readFile(saveSummariesJsonPath);
    articlesListSummaries = JSON.parse(categoriesFile);
    console.log(
      `Loaded ${Object.keys(articlesListSummaries).length} categories from ${saveSummariesJsonPath}`
    );
  } catch (error) {
    console.log(`No saved ${saveSummariesJsonPath}, starting from scratch`);

    let totalCount = 0;
    for (const categoryURL of categoryURLs) {
      const { meta } = await getJSON(categoryURL + pageJsonPath(1));
      const { all_count } = meta;
      totalCount += all_count;
      const categoryPageCount = Math.ceil(all_count / COUNT_PER_PAGE);
      for (let i = 1; i <= categoryPageCount; i++) {
        articlesListSummaries[categoryURL + pageJsonPath(i)] = false;
      }
      console.log(`Added ${categoryPageCount} pages from ${categoryURL}`);
    }
    console.log(
      `Saving ${
        Object.keys(articlesListSummaries).length
      } categories to ${saveSummariesJsonPath}, total of ${totalCount} articles`
    );
    await writeJson(articlesListSummaries, saveSummariesJsonPath);
  }
}

/**
 * Gets a list of all header categories on pixiv
 * @returns {Promise<string[]>} list of article category URLs
 */
async function getListOfCategoryURLs() {
  const doc = await getURL(domain);
  const categories = doc.querySelectorAll('#categories a');
  const hrefs = [...categories].map((a) => domain + categryPath + a.title);
  return hrefs;
}

// save on ctrl c
process.on('SIGINT', async () => {
  console.log('Saving...');
  if (articlesListSummaries) {
    console.log('Saving data...');
    await writeJson(articlesListSummaries, saveSummariesJsonPath);
  }
  process.exit(0);
});
