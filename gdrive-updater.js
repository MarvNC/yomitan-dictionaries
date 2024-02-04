const japaneseFolderId = PropertiesService.getScriptProperties().getProperty('japaneseFolderId');
const mandarinFolderId = PropertiesService.getScriptProperties().getProperty('mandarinFolderId');
const cantoneseFolderId = PropertiesService.getScriptProperties().getProperty('cantoneseFolderId');

const githubAccessToken = PropertiesService.getScriptProperties().getProperty('githubAccessToken');
if (!japaneseFolderId || !mandarinFolderId || !githubAccessToken || !cantoneseFolderId) {
  if (!japaneseFolderId) {
    throw new Error('japaneseFolderId not set');
  }
  if (!mandarinFolderId) {
    throw new Error('mandarinFolderId not set');
  }
  if (!cantoneseFolderId) {
    throw new Error('cantoneseFolderId not set');
  }
  if (!githubAccessToken) {
    throw new Error('githubAccessToken not set');
  }
}

function downloadAllRepos() {
  for (const repo of repos) {
    downloadFromGithub(repo);
  }
}

/**
 * @typedef {Object} GithubRepo
 * @property {string} url
 * @property {string} folderId
 * @property {RegExp} includedNameRegex
 * @property {RegExp} removeNameRegex
 * @property {string} fileNamePrefix
 * @property {boolean} [addDate]
 */
/**
 * @type {GithubRepo[]}
 */
const repos = [
  {
    url: 'https://api.github.com/repos/stephenmk/Jitendex/releases/latest',
    folderId: japaneseFolderId,
    includedNameRegex: /yomi/,
    removeNameRegex: /jitendex/,
    fileNamePrefix: '[JA-EN] ',
  },
  {
    url: 'https://api.github.com/repos/themoeway/jmdict-yomitan/releases/latest',
    folderId: japaneseFolderId,
    includedNameRegex: /JMnedict/,
    removeNameRegex: /JMnedict/,
    fileNamePrefix: '[JA-JA Names] ',
    addDate: true,
  },
  {
    url: 'https://api.github.com/repos/themoeway/jmdict-yomitan/releases/latest',
    folderId: japaneseFolderId,
    includedNameRegex: /KANJIDIC_english/,
    removeNameRegex: /KANJIDIC_english/,
    fileNamePrefix: '[Kanji] ',
    addDate: true,
  },
  {
    url: 'https://api.github.com/repos/MarvNC/cc-cedict-yomitan/releases/latest',
    folderId: mandarinFolderId,
    includedNameRegex: /CC\-CEDICT(?!\.Hanzi)/,
    removeNameRegex: /CC\-CEDICT(?!\.Hanzi)/,
    fileNamePrefix: '[ZH-EN] ',
    addDate: true,
  },
  {
    url: 'https://api.github.com/repos/MarvNC/cc-cedict-yomitan/releases/latest',
    folderId: mandarinFolderId,
    includedNameRegex: /CC\-CEDICT\.Hanzi/,
    removeNameRegex: /CC\-CEDICT\.Hanzi/,
    fileNamePrefix: '[Hanzi] ',
    addDate: true,
  },
  {
    url: 'https://api.github.com/repos/MarvNC/wordshk-yomitan/releases/latest',
    folderId: cantoneseFolderId,
    includedNameRegex: /^Words\.hk\.[\d-]+.zip$/,
    removeNameRegex: /^Words\.hk\.[\d-]+.zip$/,
    fileNamePrefix: '[YUE-EN & YUE] ',
    addDate: false,
  },
];

// Function to download jitendex from GitHub and save it to Google Drive
/**
 * @param {GithubRepo} githubRepo
 */
function downloadFromGithub(githubRepo) {
  const headers = {
    Authorization: 'token ' + githubAccessToken,
  };

  const options = {
    headers: headers,
  };

  const releaseInfo = UrlFetchApp.fetch(githubRepo.url, options).getContentText();
  const releaseData = JSON.parse(releaseInfo);

  const assets = releaseData.assets;
  let asset;

  // Find the asset containing the includedNameRegex in its name and download it
  for (let i = 0; i < assets.length; i++) {
    if (assets[i].name.match(githubRepo.includedNameRegex)) {
      asset = assets[i];
      break;
    }
  }

  if (asset.browser_download_url !== '') {
    const response = UrlFetchApp.fetch(asset.browser_download_url);
    const fileBlob = response.getBlob();

    // Remove existing jitendex files
    removeFilesWithSubstring(githubRepo.folderId, githubRepo.removeNameRegex);

    const folder = DriveApp.getFolderById(githubRepo.folderId);
    const createdFile = folder.createFile(fileBlob);
    // Prepend file with to follow naming convention
    let fileName = createdFile.getName();
    // add prefix
    fileName = githubRepo.fileNamePrefix + fileName;

    // Add date to file name if specified
    if (githubRepo.addDate) {
      const date = asset.created_at.split('T')[0];
      // Suffix before file extension
      fileName = fileName.replace(/(\.[\w\d_-]+)$/i, ` (${date})$1`);
    }

    createdFile.setName(fileName);

    Logger.log(`Downloaded ${createdFile.getName()} to Google Drive.`);
  } else {
    Logger.log(`No asset containing ${githubRepo.includedNameRegex} found in the latest release.`);
  }
}

// Remove existing jitendex files
/**
 *
 * @param {string} folderId
 * @param {RegExp} regexToRemove
 */
function removeFilesWithSubstring(folderId, regexToRemove) {
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();

  while (files.hasNext()) {
    const file = files.next();
    if (file.getName().match(regexToRemove)) {
      file.setTrashed(true); // Moves file to the trash
    }
  }
}
