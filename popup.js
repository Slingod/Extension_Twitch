const STATE_KEY = "state:main";

async function forceTick() {
    try {
        await chrome.runtime.sendMessage({ type: "FORCE_TICK" });
    } catch (_) {}
}

async function readState() {
    const obj = await chrome.storage.local.get({ [STATE_KEY]: null });
    return obj[STATE_KEY];
}

function render(state) {
    const root = document.getElementById("list");
    root.innerHTML = "";

    const displayName = state?.displayName || "Streamer";
    const isLive = !!state?.isLive;
    const title = state?.title || "";
    const liveUrl = state?.liveUrl || "https://www.twitch.tv/";

    const statusText = isLive
        ? `${displayName} est en LIVE`
        : `${displayName} n’est pas en LIVE`;

    const sub = isLive && title ? `🎮 ${title}` : "";

    // ✅ Boutons UX :
    // - OFF  => bouton gris + "Ouvrir"
    // - LIVE => bouton rouge + "Rejoindre le live"
    const buttonClass = isLive ? "btnPrimaryLive" : "btnPrimaryOff";
    const buttonText = isLive ? "Rejoindre le live" : "Voir la chaîne";

    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
    <div class="row">
      <div class="dot ${isLive ? "live" : ""}"></div>
      <a class="statusLink ${isLive ? "live" : "offline"}" href="#">
        ${statusText}
      </a>
    </div>

    ${sub ? `<div class="small">${sub}</div>` : ""}

    <div class="actions">
      <button class="${buttonClass}" data-action="open">
        ${buttonText}
      </button>
    </div>
  `;

    div.querySelector(".statusLink").addEventListener("click", (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: liveUrl });
    });

    div.querySelector('[data-action="open"]').addEventListener("click", () => {
        chrome.tabs.create({ url: liveUrl });
    });

    root.appendChild(div);
}

(async function init() {
    await forceTick();
    render(await readState());

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== "local") return;
        if (!changes[STATE_KEY]) return;
        render(changes[STATE_KEY].newValue);
    });
})();
