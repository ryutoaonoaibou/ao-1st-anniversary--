const FORM_ENDPOINT = ""; // Formspree等を使う場合、ここに送信先URLを入れてください。

const opening = document.getElementById("opening");
const openButton = document.getElementById("openButton");
const envelopeScene = document.getElementById("envelopeScene");
const envelope = document.getElementById("envelope");
const content = document.getElementById("content");
const form = document.getElementById("letterForm");
const toast = document.getElementById("toast");
const lightFlight = document.getElementById("lightFlight");
const letterText = document.getElementById("letterText");
const letterCount = document.getElementById("letterCount");
const replayButton = document.getElementById("replayButton");

let opened = false;
document.body.classList.add("locked");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 3600);
}

openButton.addEventListener("click", () => {
  if (opened) return;
  opened = true;
  opening.style.transition = "opacity 900ms ease, transform 1200ms ease";
  opening.style.opacity = "0";
  opening.style.transform = "scale(1.035)";
  setTimeout(() => {
    opening.style.display = "none";
    envelopeScene.style.display = "flex";
    requestAnimationFrame(() => envelopeScene.classList.add("fade-in"));
    envelopeScene.setAttribute("aria-hidden", "false");
  }, 850);
});

envelope.addEventListener("click", () => {
  envelope.classList.add("opened");
  envelope.querySelector(".flap").style.transform = "rotateX(180deg)";
  envelope.querySelector(".seal").style.opacity = "0";
  setTimeout(() => {
    envelopeScene.style.transition = "opacity 900ms ease";
    envelopeScene.style.opacity = "0";
    setTimeout(() => {
      envelopeScene.style.display = "none";
      content.style.display = "block";
      content.setAttribute("aria-hidden", "false");
      content.classList.add("fade-in");
      document.body.classList.remove("locked");
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 750);
  }, 850);
});

function countdown() {
  const target = new Date("2026-10-28T00:00:00+09:00").getTime();
  const diff = Math.max(0, target - Date.now());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const vals = { days: d, hours: h, minutes: m, seconds: s };
  Object.entries(vals).forEach(([key, value]) => {
    const a = document.getElementById(key);
    const b = document.getElementById(key + "2");
    if (a) a.textContent = String(value).padStart(2, "0");
    if (b) b.textContent = String(value).padStart(2, "0");
  });
}
countdown();
setInterval(countdown, 1000);

letterText.addEventListener("input", () => {
  letterCount.textContent = `${letterText.value.length} / 500`;
});

function playLetterAnimation() {
  lightFlight.style.left = "50%";
  lightFlight.style.top = "70%";
  lightFlight.style.opacity = "1";
  lightFlight.animate([
    { transform: "translate(-50%, -50%) scale(.7)", opacity: 0 },
    { transform: "translate(-50%, -50%) scale(1.2)", opacity: 1, offset: .18 },
    { transform: "translate(-50%, -50%) translate(-12vw,-35vh) scale(.45)", opacity: .85, offset: .7 },
    { transform: "translate(-50%, -50%) translate(0,-48vh) scale(.1)", opacity: 0 }
  ], { duration: 1800, easing: "cubic-bezier(.2,.75,.25,1)" });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const name = data.get("name").trim();
  const message = data.get("message").trim();

  if (!FORM_ENDPOINT) {
    // プレビュー用。実運用ではFORM_ENDPOINTを設定してください。
    localStorage.setItem("ao-anniversary-last-letter", JSON.stringify({ name, message, savedAt: new Date().toISOString() }));
    playLetterAnimation();
    setTimeout(() => {
      showToast("あなたの言葉を、蒼へ。");
      form.reset();
      letterCount.textContent = "0 / 500";
    }, 700);
    return;
  }

  try {
    const response = await fetch(FORM_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("submit failed");
    playLetterAnimation();
    setTimeout(() => {
      showToast("あなたの言葉を、蒼へ。");
      form.reset();
      letterCount.textContent = "0 / 500";
    }, 700);
  } catch (error) {
    showToast("送信できませんでした。時間をおいてもう一度試してください。");
  }
});

replayButton.addEventListener("click", () => {
  content.style.display = "none";
  content.setAttribute("aria-hidden", "true");
  envelopeScene.style.display = "none";
  envelopeScene.style.opacity = "0";
  envelopeScene.setAttribute("aria-hidden", "true");
  envelope.querySelector(".flap").style.transform = "rotateX(0deg)";
  envelope.querySelector(".seal").style.opacity = "1";
  opening.style.display = "block";
  opening.style.opacity = "1";
  opening.style.transform = "none";
  opened = false;
  document.body.classList.add("locked");
  window.scrollTo({ top: 0, behavior: "instant" });
});
