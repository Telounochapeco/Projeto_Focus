async function loadData() {
  const data = await chrome.storage.local.get(["focusMode", "blockedKeywords"]);
  document.getElementById("focusToggle").checked = !!data.focusMode;
  updateStatus(data.focusMode);
  renderKeywords(data.blockedKeywords || []);
}

function updateStatus(enabled) {
  document.getElementById("status").textContent = enabled ? "Modo Foco Ativado" : "Modo Foco Desativado";
}

function renderKeywords(keywords) {
  const list = document.getElementById("keywordList");
  list.innerHTML = "";
  keywords.forEach((keyword, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${keyword} <button data-index="${index}">X</button>`;
    list.appendChild(li);
  });

  list.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", async () => {
      const { blockedKeywords } = await chrome.storage.local.get("blockedKeywords");
      blockedKeywords.splice(btn.dataset.index, 1);
      await chrome.storage.local.set({ blockedKeywords });
      loadData();
    });
  });
}

document.getElementById("focusToggle").addEventListener("change", (e) => {
  chrome.runtime.sendMessage({ type: "toggleFocus", value: e.target.checked });
  updateStatus(e.target.checked);
});

document.getElementById("addKeyword").addEventListener("click", async () => {
  const input = document.getElementById("keywordInput");
  const keyword = input.value.trim().toLowerCase();
  if (!keyword) return;
  const { blockedKeywords = [] } = await chrome.storage.local.get("blockedKeywords");
  if (!blockedKeywords.includes(keyword)) blockedKeywords.push(keyword);
  await chrome.storage.local.set({ blockedKeywords });
  input.value = "";
  loadData();
});

document.getElementById("clearHistory").addEventListener("click", async () => {
  await chrome.storage.local.set({ history: [] });
});

loadData();
