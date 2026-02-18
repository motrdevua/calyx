// Action (browser action replacement) click event
chrome.action.onClicked.addListener(function () {
  openNewTab();
});

// Extension install event
chrome.runtime.onInstalled.addListener(function (details) {
  if (details && details.reason && details.reason == 'install') {
    openNewTab();
  }
});

function openNewTab() {
  chrome.tabs.create({
    url: 'chrome://newtab',
  });
}

// Background Proxy for CORS-sensitive requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FETCH_DATA') {
    fetch(request.url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        return response.json();
      })
      .then((data) => sendResponse({ success: true, data }))
      .catch((error) => sendResponse({ success: false, error: error.message }));

    return true; // Keep channel open for async response
  }
});
