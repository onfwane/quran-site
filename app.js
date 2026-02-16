const ayahBox = document.getElementById("ayahBox");
const simBox  = document.getElementById("simBox");
const jumpInp = document.getElementById("jump");
const goBtn   = document.getElementById("go");

let QURAN = null;
let PHRASES = null;
let PHRASE_VERSES = null;

async function loadQuran() {
  if (QURAN) return;
  const r = await fetch("./data/quran.pretty.json");
  QURAN = await r.json();
}

async function loadMutashabihat() {
  if (PHRASES && PHRASE_VERSES) return;
  const [r1, r2] = await Promise.all([
    fetch("./data/phrases.json"),
    fetch("./data/phrase_verses.json")
  ]);
  PHRASES = await r1.json();
  PHRASE_VERSES = await r2.json();
}

function getAyahText(key) {
  return QURAN?.[key] || null;
}

function renderAyah(key, text) {
  ayahBox.innerHTML = `
    <div class="ayah">${text}</div>
    <div class="small">(${key})</div>
    <button id="btnSim">عرض المتشابهات</button>
  `;

  document.getElementById("btnSim").onclick = () => showSimilar(key);
}

async function showSimilar(key) {
  simBox.innerHTML = "جارٍ تحميل المتشابهات...";
  await loadMutashabihat();

  const phraseIds = PHRASE_VERSES?.[key] || [];
  if (!phraseIds.length) {
    simBox.innerHTML = "لا توجد متشابهات لهذه الآية.";
    return;
  }

  const set = new Set();

  phraseIds.forEach(id => {
    const phrase = PHRASES?.[String(id)];
    if (phrase && phrase.ayah) {
      Object.keys(phrase.ayah).forEach(v => set.add(v));
    }
  });

  set.delete(key);

  const results = Array.from(set).slice(0, 50);

  if (!results.length) {
    simBox.innerHTML = "لم يتم العثور على آيات أخرى.";
    return;
  }

  const list = results.map(v => {
    const t = getAyahText(v) || "";
    return `
      <a href="#" data-k="${v}">
        <div>${t}</div>
        <div class="small">(${v})</div>
      </a>
    `;
  }).join("");

  simBox.innerHTML = `<h3>آيات متشابهة</h3><div class="list">${list}</div>`;

  simBox.querySelectorAll("a").forEach(a => {
    a.onclick = (e) => {
      e.preventDefault();
      navigateTo(a.getAttribute("data-k"));
    };
  });
}

async function navigateTo(key) {
  await loadQuran();
  const text = getAyahText(key);

  if (!text) {
    ayahBox.innerHTML = "لم يتم العثور على الآية.";
    simBox.innerHTML = "";
    return;
  }

  renderAyah(key, text);
}

goBtn.onclick = () => {
  const v = jumpInp.value.trim();
  if (v) navigateTo(v);
};
