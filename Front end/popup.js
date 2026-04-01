const toggle = document.getElementById("toggleSwitch");
const status = document.getElementById("status");

// carregar estado salvo
chrome.storage.local.get(["ativo"], (result) => {
  const ativo = result.ativo || false;
  toggle.checked = ativo;
  status.textContent = ativo ? "Ligado" : "Desligado";
});

// quando clicar no botão
toggle.addEventListener("change", () => {
  const ligado = toggle.checked;

  status.textContent = ligado ? "Ligado" : "Desligado";

  // salvar estado
  chrome.storage.local.set({ ativo: ligado });

  // enviar para o background
  chrome.runtime.sendMessage({ toggle: ligado });

  // enviar para backend
  fetch("http://localhost:3000/api/toggle", {
    method: "POST"
  });
});