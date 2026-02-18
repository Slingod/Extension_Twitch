const ALARM_NAME = "poll-live";

// =========================
// CONFIG À MODIFIER
// =========================
const CONFIG = {
    WORKER_URL: "https://late-lab-301c.slingo-drisca.workers.dev", // sans "/" final
    PUBLIC_KEY: "hClFw3kjhb3YURTUH6xS36iuSufEzCJlRP8B0LgiazM=",   // même valeur que Cloudflare -> PUBLIC_KEY
    CHECK_EVERY_MINUTES: 1,

    STREAMER: {
        id: "slingo__", // (sert juste au texte/notification, pas aux clés)
        displayName: "Slingo__",
        login: "slingo__",
        liveUrl: "https://www.twitch.tv/slingo__",
        iconUrl: "icons/icon128.png",
    },
};
// =========================
// FIN CONFIG
// =========================

// Clés FIXES (pour éviter doublons / erreurs si id change)
const STATE_KEY = "state:main";
const LAST_URL_KEY = "lastLiveUrl:main";
const NOTIF_ID = "live:main";

let tickPromise = null;

function createOrUpdateAlarm(minutes) {
    const m = Math.max(1, Number(minutes || 1));
    chrome.alarms.clear(ALARM_NAME, () => {
        chrome.alarms.create(ALARM_NAME, { periodInMinutes: m });
    });
}

chrome.runtime.onInstalled.addListener(async () => {
    createOrUpdateAlarm(CONFIG.CHECK_EVERY_MINUTES);
    tick().catch(() => {});
});

chrome.runtime.onStartup.addListener(async () => {
    createOrUpdateAlarm(CONFIG.CHECK_EVERY_MINUTES);
    tick().catch(() => {});
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== ALARM_NAME) return;
    await tick();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.type === "FORCE_TICK") {
        tick()
            .then(() => sendResponse({ ok: true }))
            .catch((e) => sendResponse({ ok: false, error: String(e) }));
        return true;
    }
});

chrome.notifications.onClicked.addListener(async (notifId) => {
    if (notifId !== NOTIF_ID) return;
    const obj = await chrome.storage.local.get({ [LAST_URL_KEY]: CONFIG.STREAMER.liveUrl });
    chrome.tabs.create({ url: obj[LAST_URL_KEY] || CONFIG.STREAMER.liveUrl });
});

async function tick() {
    // lock anti double tick
    if (tickPromise) return tickPromise;

    tickPromise = (async () => {
        const result = await checkLive();
        await handleTransitionAndStoreState(result);
        await setBadge(!!result.isLive);
    })();

    try {
        await tickPromise;
    } finally {
        tickPromise = null;
    }
}

async function setBadge(isLive) {
    if (isLive) {
        await chrome.action.setBadgeText({ text: "LIVE" });
        await chrome.action.setBadgeBackgroundColor({ color: [225, 17, 17, 255] });
    } else {
        await chrome.action.setBadgeText({ text: "OFF" });
        await chrome.action.setBadgeBackgroundColor({ color: [120, 120, 120, 255] });
    }
}

async function checkLive() {
    const base = CONFIG.WORKER_URL.trim().replace(/\/$/, "");
    const login = CONFIG.STREAMER.login.trim();

    const url =
        `${base}/?login=${encodeURIComponent(login)}` +
        `&key=${encodeURIComponent(CONFIG.PUBLIC_KEY)}`;

    try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 8000);

        const r = await fetch(url, {
            method: "GET",
            cache: "no-store",
            headers: { "accept": "application/json" },
            signal: controller.signal,
        });

        clearTimeout(t);

        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();

        return {
            isLive: !!data.isLive,
            title: data.title || "",
            game: data.game || "",
            startedAt: data.startedAt || "",
            liveUrl: data.liveUrl || CONFIG.STREAMER.liveUrl,
        };
    } catch (e) {
        return { isLive: false, title: "", game: "", startedAt: "", liveUrl: CONFIG.STREAMER.liveUrl };
    }
}

async function handleTransitionAndStoreState(result) {
    const prevObj = await chrome.storage.local.get({ [STATE_KEY]: { isLive: false } });
    const prev = prevObj[STATE_KEY] || { isLive: false };

    const currIsLive = !!result.isLive;
    const prevIsLive = !!prev.isLive;

    // notif uniquement OFF -> LIVE
    if (currIsLive && !prevIsLive) {
        await chrome.storage.local.set({ [LAST_URL_KEY]: result.liveUrl || CONFIG.STREAMER.liveUrl });

        await chrome.notifications.create(NOTIF_ID, {
            type: "basic",
            iconUrl: CONFIG.STREAMER.iconUrl,
            title: `${CONFIG.STREAMER.displayName} est en LIVE !`,
            message: result.title ? `🎮 ${result.title}` : "Clique pour ouvrir le live.",
        });
    }

    // state lu par le popup
    await chrome.storage.local.set({
        [STATE_KEY]: {
            isLive: currIsLive,
            title: result.title || "",
            game: result.game || "",
            startedAt: result.startedAt || "",
            liveUrl: result.liveUrl || CONFIG.STREAMER.liveUrl,
            displayName: CONFIG.STREAMER.displayName,
            iconUrl: CONFIG.STREAMER.iconUrl,
            lastCheckedAt: Date.now(),
        },
    });
}
