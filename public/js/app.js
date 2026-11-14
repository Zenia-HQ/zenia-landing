const toast = document.querySelector("[data-toast]");

function showToast(message) {
  if (!toast) return;
  toast.hidden = false;
  toast.textContent = message;
  window.setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

function handleForm(form, okSelector) {
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    form.hidden = true;
    const ok = document.querySelector(okSelector);
    if (ok) ok.hidden = false;
  });
}

handleForm(document.getElementById("form-registro"), "[data-ok-registro]");
handleForm(document.getElementById("form-empresas"), "[data-ok-empresas]");

document.getElementById("cta-compartir")?.addEventListener("click", async () => {
  const text = `Me anoté para probar Zenia, una app de bienestar en español que está arrancando en Argentina. Es gratis y hay pocos cupos: ${window.location.origin}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: "Zenia", text, url: window.location.origin });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }
  window.open(wa, "_blank", "noopener");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      showToast("No se pudo registrar el modo offline");
    });
  });
}
