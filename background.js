chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    globalSettings: {
      rightClick: true,
      select: true,
      copy: true,
      paste: true
    },
    savedSites: []
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.tabs.sendMessage(tabId, { action: 'checkSettings' }, (response) => {
      if (chrome.runtime.lastError) {
        // コンテンツスクリプトがまだロードされていない場合は無視
        return;
      }
    });
  }
});