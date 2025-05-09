// when extension is installed, disable the action button
chrome.runtime.onInstalled.addListener(() => {
    chrome.action.disable();
});

// when extension on message received, forward to sidebar
chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.type === 'CHAT_MESSAGES') {
        chrome.runtime.sendMessage(msg);
    }
});


// listen for tab status updates
chrome.tabs.onUpdated.addListener(
    (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
        if (changeInfo.status !== "complete" || !tab.url) return;

        try {
            const url = new URL(tab.url);
            // only enable the action button for chatgpt.com
            if (url.host === "chatgpt.com") {
                chrome.action.enable(tabId);
            } else {
                chrome.action.disable(tabId);
            }
        } catch (e) {
            chrome.action.disable(tabId);
        }
    }
);

