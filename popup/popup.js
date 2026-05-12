const focusToggle = document.getElementById("focusToggle");
const siteInput = document.getElementById("siteInput");
const addBtn = document.getElementById("addBtn");
const siteList = document.getElementById("siteList");

function renderSites(sites) {
 siteList.innerHTML = "";
 sites.forEach((site, index) => {
   const li = document.createElement("li");

   const span = document.createElement("span");
   span.textContent = site;

   const btn = document.createElement("button");
   btn.textContent = "X";

   btn.onclick = () => {
     sites.splice(index, 1);
     chrome.storage.local.set({ blockedSites: sites }, () => renderSites(sites));
   };

   li.appendChild(span);
   li.appendChild(btn);
   siteList.appendChild(li);
 });
}

chrome.storage.local.get(["focusMode","blockedSites"], (data) => {
 focusToggle.checked = data.focusMode || false;
 renderSites(data.blockedSites || []);
});

focusToggle.addEventListener("change", () => {
 chrome.storage.local.set({ focusMode: focusToggle.checked });
});

addBtn.addEventListener("click", () => {
 const value = siteInput.value.trim();
 if (!value) return;

 chrome.storage.local.get(["blockedSites"], (data) => {
   const sites = data.blockedSites || [];

   if (!sites.includes(value)) {
     sites.push(value);

     chrome.storage.local.set({ blockedSites: sites }, () => {
       renderSites(sites);
       siteInput.value = "";
     });
   }
 });
});