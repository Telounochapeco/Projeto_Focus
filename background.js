const DEFAULT_DATA = {
  focusMode: false,
  blockedKeywords: [],
  history: []
};

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get(["focusMode", "blockedKeywords", "history"]);
  await chrome.storage.local.set({ ...DEFAULT_DATA, ...current });
  await updateDynamicRules();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes.blockedKeywords || changes.focusMode)) {
    updateDynamicRules();
  }
});

async function addHistory(entry) {
  const { history = [] } = await chrome.storage.local.get("history");
  history.unshift({ ...entry, timestamp: new Date().toISOString() });
  await chrome.storage.local.set({ history: history.slice(0, 1000) });
}

async function updateDynamicRules() {
  const { focusMode, blockedKeywords = [] } = await chrome.storage.local.get(["focusMode", "blockedKeywords"]);
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map(r => r.id);

  if (!focusMode || blockedKeywords.length === 0) {
    if (removeRuleIds.length) {
      await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds });
    }
    return;
  }

  const rules = blockedKeywords.map((keyword, index) => ({
    id: index + 1,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { extensionPath: `/blocked.html?keyword=${encodeURIComponent(keyword)}` }
    },
    condition: {
      urlFilter: keyword,
      resourceTypes: ["main_frame"]
    }
  }));

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules: rules
  });
}

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;
  const { focusMode, blockedKeywords = [] } = await chrome.storage.local.get(["focusMode", "blockedKeywords"]);
  if (!focusMode) return;

  const matched = blockedKeywords.find(k => details.url.toLowerCase().includes(k.toLowerCase()));
  if (matched) {
    await addHistory({ url: details.url, action: "blocked", keyword: matched });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "toggleFocus") {
    chrome.storage.local.set({ focusMode: message.value });
    addHistory({ action: message.value ? "focus_enabled" : "focus_disabled" });
    sendResponse({ success: true });
  }
});
