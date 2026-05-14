
const focusToggle = document.getElementById("focusToggle");
const siteInput = document.getElementById("siteInput");
const keywordInput = document.getElementById("keywordInput");

function renderList(elementId, items, storageKey) {
 const ul = document.getElementById(elementId);
 ul.innerHTML = "";
 items.forEach((item, index) => {
   const li = document.createElement("li");
   li.textContent = item;
   const btn = document.createElement("button");
   btn.textContent = "X";
   btn.onclick = () => {
     items.splice(index,1);
     chrome.storage.local.set({ [storageKey]: items }, loadData);
   };
   li.appendChild(btn);
   ul.appendChild(li);
 });
}

function addItem(input, key) {
 const value = input.value.trim();
 if (!value) return;
 chrome.storage.local.get([key], data => {
   const arr = data[key] || [];
   if (!arr.includes(value)) {
     arr.push(value);
     chrome.storage.local.set({ [key]: arr }, () => {
       input.value = "";
       loadData();
     });
   }
 });
}

function loadData() {
 chrome.storage.local.get(["focusMode","blockedSites","blockedKeywords"], data => {
   focusToggle.checked = data.focusMode || false;
   renderList("siteList", data.blockedSites || [], "blockedSites");
   renderList("keywordList", data.blockedKeywords || [], "blockedKeywords");
 });
}

document.getElementById("addSiteBtn").addEventListener("click", ()=>addItem(siteInput,"blockedSites"));
document.getElementById("addKeywordBtn").addEventListener("click", ()=>addItem(keywordInput,"blockedKeywords"));

focusToggle.addEventListener("change", ()=>{
 chrome.storage.local.set({ focusMode: focusToggle.checked });
});

loadData();
