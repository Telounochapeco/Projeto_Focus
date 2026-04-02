let ativo = false;

chrome.storage.local.get(["ativo"], (result) => {
  ativo = result.ativo || false;
  atualizarBloqueio();
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.toggle !== undefined) {
    ativo = message.toggle;
    chrome.storage.local.set({ ativo });
    atualizarBloqueio();
  }
});

function atualizarBloqueio() {
  if (ativo) {
    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [
        {
          id: 1,
          priority: 1,
          action: { type: "block" },
          condition: {
            urlFilter: "facebook.com",
            resourceTypes: ["main_frame"]
          }
        },
        {
          id: 2,
          priority: 1,
          action: { type: "block" },
          condition: {
            urlFilter: "reddit.com",
            resourceTypes: ["main_frame"]
          }
        },
        {
          id: 3,
          priority: 1,
          action: { type: "block" },
          condition: {
            urlFilter: "instagram.com",
            resourceTypes: ["main_frame"]
          }
        }
      ],
      removeRuleIds: []
    });
  } else {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1, 2, 3]
    });
  }
}