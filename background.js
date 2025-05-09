chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  // only enable the action if the URL matches the pattern
  const url = new URL(tab.url);
  if (url.host === "https://chatgpt.com/*") {
    chrome.action.enable(tabId);
  } else {
    chrome.action.disable(tabId);
  }
});
