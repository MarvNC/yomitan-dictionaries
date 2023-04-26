const axios = require('axios');
const { JSDOM } = require('jsdom');

/**
 * Gets page, returns JSDOM object
 * @param {string} url
 * @returns DOM
 */
async function getURL(url, encode = true) {
  if (encode) url = encodeURI(url);
  let response;
  let waitTime = 10000;
  while (!response) {
    try {
      const { data } = await axios.get(url, { validateStatus: null });
      const dom = new JSDOM(data, {});
      const { document } = dom.window;
      return document;
    } catch (error) {
      console.log(`Error getting ${url}: ${error}`);
      await wait(waitTime);
      waitTime *= 2;
    }
  }
}

/**
 * Gets page, returns JSON object
 * @param {string} url
 * @returns JSON
 */
async function getJSON(url, encode = true) {
  if (encode) url = encodeURI(url);
  let response;
  let waitTime = 10000;
  while (!response) {
    try {
      const { data } = await axios.get(url, { validateStatus: null });
      return data;
    } catch (error) {
      console.log(`Error getting ${url}: ${error}`);
      await wait(waitTime);
      waitTime *= 2;
    }
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

module.exports = { getURL, getJSON, wait };
