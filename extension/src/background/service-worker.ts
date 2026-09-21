// This file serves as the background script for the extension.
console.log("ScamCheck background service worker loaded.");

chrome.runtime.onInstalled.addListener(() => {
  console.log("ScamCheck extension installed.");
  chrome.contextMenus.create({
    id: 'analyze-selection',
    title: 'Analyze with ScamCheck',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyze-selection' && info.selectionText) {
    const textToAnalyze = info.selectionText;
    const url = info.pageUrl || tab?.url || '';
    
    // Store in local storage for the popup to read
    chrome.storage.local.set({
      pendingSelection: {
        text: textToAnalyze,
        url: url,
        timestamp: Date.now()
      }
    }, () => {
      // Show badge to indicate pending selection
      chrome.action.setBadgeText({ text: '1' });
      chrome.action.setBadgeBackgroundColor({ color: '#2563eb' });
    });
  }
});
