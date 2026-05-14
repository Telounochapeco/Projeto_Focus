
(async function() {
  const data = await chrome.storage.local.get(["focusMode","blockedKeywords"]);
  if (!data.focusMode) return;
  const keywords = (data.blockedKeywords || []).map(k => k.toLowerCase()).filter(Boolean);
  if (!keywords.length) return;

  function containsBlocked(text) {
    const lower = (text || "").toLowerCase();
    return keywords.some(word => lower.includes(word));
  }

  function processNode(node) {
    if (!node || node.nodeType !== 1) return;
    if (["SCRIPT","STYLE","NOSCRIPT","IFRAME","INPUT","TEXTAREA"].includes(node.tagName)) return;

    const text = node.innerText || node.textContent || "";
    const link = node.href || "";

    if (containsBlocked(text) || containsBlocked(link)) {
      node.style.display = "none";
      return;
    }

    // hide images/videos with blocked alt/title
    const attrs = [node.alt, node.title, node.getAttribute && node.getAttribute("aria-label")].join(" ");
    if (containsBlocked(attrs)) {
      node.style.display = "none";
      return;
    }
  }

  function scanPage() {
    document.querySelectorAll("body *").forEach(processNode);
  }

  // Search box protection
  document.addEventListener("submit", function(e) {
    const formText = (e.target.innerText || "") + " " + Array.from(e.target.querySelectorAll("input")).map(i => i.value).join(" ");
    if (containsBlocked(formText)) {
      e.preventDefault();
      alert("Pesquisa bloqueada pelo FocusFlow.");
    }
  }, true);

  document.addEventListener("input", function(e) {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) {
      if (containsBlocked(e.target.value)) {
        e.target.value = "";
      }
    }
  }, true);

  scanPage();

  const observer = new MutationObserver(() => scanPage());
  observer.observe(document.body, {childList:true, subtree:true});
})();
