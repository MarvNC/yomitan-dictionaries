const axios = require('axios');
const { JSDOM } = require('jsdom');

/**
 * Gets page, returns JSDOM object
 * @param {string} url
 * @returns DOM
 */
async function getURL(url, encode = true) {
  if (encode) url = encodeURI(url);
  try {
    const { data } = await axios.get(url, { validateStatus: null });
    const dom = new JSDOM(data, {});
    const { document } = dom.window;
    return document;
  } catch (error) {
    throw new Error(`Error getting ${url}: ${error}`);
  }
}

/**
 * Wait for ms milliseconds
 * @param {int} ms
 * @returns promise
 */
async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { getURL, wait };
