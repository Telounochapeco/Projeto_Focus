
chrome.runtime.onInstalled.addListener(() => {
 chrome.storage.local.get(["focusMode","blockedSites","blockedKeywords"], data => {
   chrome.storage.local.set({
     focusMode: data.focusMode ?? false,
     blockedSites: data.blockedSites ?? [],
     blockedKeywords: data.blockedKeywords ?? []
   });
 });
});

chrome.webNavigation.onBeforeNavigate.addListener(async details => {
 if (details.frameId !== 0) return;
 const data = await chrome.storage.local.get(["focusMode","blockedSites","blockedKeywords"]);
 if (!data.focusMode) return;

 const url = details.url.toLowerCase();
 const siteBlocked = (data.blockedSites || []).some(site => url.includes(site.toLowerCase()));
 const keywordBlocked = (data.blockedKeywords || []).some(word => url.includes(word.toLowerCase()));

 if (siteBlocked || keywordBlocked) {
   chrome.tabs.update(details.tabId, {
     url: chrome.runtime.getURL("blocked.html") + "?site=" + encodeURIComponent(details.url)
   });
 }
});
