chrome.runtime.onInstalled.addListener(() => {
 chrome.storage.local.get(["focusMode","blockedSites","history"], (data) => {
   chrome.storage.local.set({
     focusMode: data.focusMode ?? false,
     blockedSites: data.blockedSites ?? [],
     history: data.history ?? []
   });
 });
});

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
 if (details.frameId !== 0) return;
 const data = await chrome.storage.local.get(["focusMode","blockedSites","history"]);
 if (!data.focusMode) return;

 const url = details.url.toLowerCase();
 const blocked = (data.blockedSites || []).find(site => url.includes(site.toLowerCase()));

 if (blocked) {
   const history = data.history || [];
   history.push({
     url: details.url,
     blockedBy: blocked,
     timestamp: new Date().toISOString(),
     action: "blocked"
   });

   chrome.storage.local.set({ history }, () => {
     chrome.tabs.update(details.tabId, {
       url: chrome.runtime.getURL("blocked.html") + "?site=" + encodeURIComponent(details.url)
     });
   });
 }
});