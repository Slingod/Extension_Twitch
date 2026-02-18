# Live Notifier (Modulable) — Guide complet A à Z (Twitch + Cloudflare + Extension)

Cette extension affiche si un streamer est **LIVE/OFF**, met un **badge** sur l’icône (LIVE/OFF) et envoie une **notification** quand un streamer passe **OFF → LIVE**.

✅ Architecture recommandée (publique / sécurisée) :  
**Extension → Cloudflare Worker (secrets) → Twitch API**

➡️ Le **Client Secret** ne doit **JAMAIS** être dans l’extension (sinon tout le monde peut le récupérer).

---

## Sommaire
- [0) Prérequis](#0-prérequis)
- [1) Créer une App Twitch (Client ID + Secret)](#1-créer-une-app-twitch-client-id--client-secret)
- [2) Créer le Cloudflare Worker (proxy Twitch)](#2-créer-le-cloudflare-worker-proxy-twitch)
    - [2.1 Créer un Worker](#21-créer-un-worker)
    - [2.2 Coller le code du Worker](#22-coller-le-code-du-worker)
    - [2.3 Ajouter les Secrets (Client ID + Secret)](#23-ajouter-les-secrets-client-id--client-secret)
    - [2.4 Tester le Worker](#24-tester-le-worker)
- [3) Installer l’extension en local (mode développeur)](#3-installer-lextension-en-local-mode-développeur)
- [4) Configurer un ou plusieurs streamers](#4-configurer-un-ou-plusieurs-streamers)
- [5) Fréquence de vérification (polling)](#5-fréquence-de-vérification-polling)
- [6) Images & Background (popup)](#6-images--background-popup)
- [7) Publier l’extension (téléchargeable par tout le monde)](#7-publier-lextension-téléchargeable-par-tout-le-monde)
    - [7.1 Publication Chrome Web Store (recommandé)](#71-publication-chrome-web-store-recommandé)
    - [7.2 Publication GitHub (installation manuelle)](#72-publication-github-installation-manuelle)
- [8) Sécurité / Bonnes pratiques](#8-sécurité--bonnes-pratiques)
- [9) Dépannage](#9-dépannage)
- [10) Exemples prêts à coller](#10-exemples-prêts-à-coller)

---

## 0) Prérequis
- Brave/Chrome (mode développeur)
- Compte Twitch
- Compte Cloudflare (gratuit suffit)

---

## 1) Créer une App Twitch (Client ID + Client Secret)

### Où aller
1. Ouvre la console Twitch développeur :  
   https://dev.twitch.tv/console
2. Va dans **Applications**.

### Créer l’application
1. Clique **Enregistrer votre application** (Register your application).
2. Remplis :
    - **Nom** : ce que tu veux (ex: `Live Notifier`)
    - **URL(s) de redirection OAuth** : `http://localhost`
    - **Catégorie** : `Browser Extension` ou `Other`
    - **Type de client** : **Confidentiel**
3. Clique **Créer**.

### Récupérer les infos
Sur la page de l’app, récupère :
- **Client ID**
- **Client Secret** (souvent “Generate / New secret / Regenerate”)

⚠️ Ne poste pas ton Client Secret publiquement, ne le mets pas dans GitHub.

---

## 2) Créer le Cloudflare Worker (proxy Twitch)

Le Worker sert à **cacher ton secret** et à interroger Twitch à ta place.

### 2.1 Créer un Worker
1. Va sur Cloudflare Dashboard : https://dash.cloudflare.com/
2. Menu gauche : **Compute → Workers & Pages**
3. Clique **Create** / **Start building**
4. Choisis **Start with Hello World**
5. Donne un nom (ex: `twitch-live-proxy`)
6. Clique **Deploy**
7. Puis clique **Edit code** (ou **Quick edit** selon l’UI)

> Note : sur certaines pages, le “preview” est en lecture seule au début : c’est normal. Il faut d’abord “Deploy”, puis “Edit code”.

### 2.2 Coller le code du Worker
Dans l’éditeur Cloudflare, remplace tout par le code ci-dessous, puis **Deploy** :

```js
let cachedToken = null;
let cachedExpiry = 0;

async function getAppToken(env) {
  const now = Date.now();
  if (cachedToken && now < cachedExpiry - 60_000) return cachedToken;

  const body = new URLSearchParams({
    client_id: env.TWITCH_CLIENT_ID,
    client_secret: env.TWITCH_CLIENT_SECRET,
    grant_type: "client_credentials"
  });

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body,
    cf: { cacheTtl: 0, cacheEverything: false }
  });

  const json = await res.json();
  cachedToken = json.access_token;
  cachedExpiry = now + (json.expires_in * 1000);
  return cachedToken;
}

function headersBase() {
  return {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store, max-age=0"
  };
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: headersBase() });
    }

    const url = new URL(request.url);
    const login = (url.searchParams.get("login") || "").trim().toLowerCase();
    if (!login) {
      return new Response(JSON.stringify({ error: "missing login" }), {
        status: 400,
        headers: headersBase()
      });
    }

    const token = await getAppToken(env);

    const r = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(login)}`,
      {
        headers: {
          "Client-ID": env.TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${token}`
        },
        cf: { cacheTtl: 0, cacheEverything: false }
      }
    );

    const data = await r.json();
    const live = Array.isArray(data.data) && data.data.length > 0 ? data.data[0] : null;

    const out = {
      isLive: !!live,
      title: live?.title || "",
      game: live?.game_name || "",
      startedAt: live?.started_at || "",
      liveUrl: `https://www.twitch.tv/${login}`
    };

    return new Response(JSON.stringify(out), { headers: headersBase() });
  }
};
```

### 2.3 Ajouter les Secrets (Client ID + Client Secret)
1. Ouvre ton Worker (Workers & Pages → clique ton worker)
2. Onglet **Settings**
3. Section **Variables and Secrets**
4. Clique **+ Add** puis ajoute :
    - Type : **Secret** (ou “Encrypted”)
    - Name : `TWITCH_CLIENT_ID`
    - Value : ton Client ID
5. Re-clique **+ Add** et ajoute :
    - Type : **Secret**
    - Name : `TWITCH_CLIENT_SECRET`
    - Value : ton Client Secret
6. **Save** puis **Deploy** si demandé.

✅ Tu dois voir “Value encrypted”.

### 2.4 Tester le Worker
Ton Worker a une URL comme :
```
https://TON_WORKER.workers.dev/
```

Teste :
```
https://TON_WORKER.workers.dev/?login=slingo__
```

Résultat attendu :
- OFF :
```json
{"isLive":false,"title":"","game":"","startedAt":"","liveUrl":"https://www.twitch.tv/slingo__"}
```

- LIVE :
```json
{"isLive":true,"title":"...","game":"...","startedAt":"...","liveUrl":"https://www.twitch.tv/slingo__"}
```

---

## 3) Installer l’extension en local (mode développeur)

1. Ouvre la page extensions :
    - Brave : `brave://extensions`
    - Chrome : `chrome://extensions`
2. Active **Mode développeur**
3. Clique **Charger l’extension non empaquetée**
4. Sélectionne le dossier racine du projet (celui qui contient `manifest.json`)
5. Quand tu modifies des fichiers :
    - retourne sur `brave://extensions`
    - clique **Recharger / Mettre à jour** sur ta carte d’extension

---

## 4) Configurer un ou plusieurs streamers

Les options sont dans `options.html` / `options.js`.  
Pour ouvrir : `brave://extensions` → ton extension → **Détails** → **Options**.

### 4.1 Config pour 1 streamer
Dans `Streamers (JSON)` colle :

```json
[
  {
    "id": "slingo__",
    "displayName": "Slingo__",
    "platform": "twitch_proxy",
    "login": "slingo__",
    "statusUrl": "https://TON_WORKER.workers.dev/",
    "liveUrl": "https://www.twitch.tv/slingo__",
    "iconUrl": "icons/icon128.png"
  }
]
```

👉 À changer :
- `displayName` : le nom affiché
- `login` : le pseudo Twitch (celui dans l’URL)
- `statusUrl` : l’URL de TON worker Cloudflare
- `liveUrl` : l’URL Twitch

### 4.2 Ajouter plusieurs streamers
```json
[
  {
    "id": "slingo__",
    "displayName": "Slingo__",
    "platform": "twitch_proxy",
    "login": "slingo__",
    "statusUrl": "https://TON_WORKER.workers.dev/",
    "liveUrl": "https://www.twitch.tv/slingo__",
    "iconUrl": "icons/icon128.png"
  },
  {
    "id": "mon_ami",
    "displayName": "Mon Ami",
    "platform": "twitch_proxy",
    "login": "mon_ami",
    "statusUrl": "https://TON_WORKER.workers.dev/",
    "liveUrl": "https://www.twitch.tv/mon_ami",
    "iconUrl": "icons/icon128.png"
  }
]
```

### 4.3 Champs importants
- `id` : identifiant interne unique (ne change pas trop)
- `displayName` : texte affiché
- `platform` : doit être `"twitch_proxy"`
- `login` : login Twitch (souvent en minuscules)
- `statusUrl` : URL Cloudflare Worker
- `liveUrl` : URL Twitch

---

## 5) Fréquence de vérification (polling)
Dans Options :
- **Fréquence (minutes)** : toutes les X minutes, le background vérifie.

Recommandation :
- 1 à 3 minutes (bon compromis)
- évite des valeurs trop basses (pour ne pas spammer)

---

## 6) Images & Background (popup)

Structure classique :
```
icons/
assets/
  bglive.png
popup.html
```

Dans `popup.html`, le chemin doit correspondre au dossier :
```css
background-image: url("assets/bglive.png");
```

Si ton image est ailleurs, adapte le chemin.

---

## 7) Publier l’extension (téléchargeable par tout le monde)

### 7.1 Publication Chrome Web Store (recommandé)
Objectif : que n’importe qui installe en 1 clic.

**Étapes générales :**
1. Crée un compte développeur Chrome Web Store
2. Prépare ton projet :
    - Garde : `manifest.json`, `background.js`, `popup.*`, `options.*`, `icons/`, `assets/`
    - Supprime : fichiers de tests, captures perso, etc.
3. Crée un **.zip** du dossier racine (celui qui contient `manifest.json`)
4. Sur le dashboard développeur du Web Store :
    - Upload le zip
    - Ajoute description + screenshots + icônes
    - Renseigne les infos demandées (permissions, etc.)
    - Publie

**Important (Worker) :**
- Ton extension appelle TON Worker.
- Si tu la publies telle quelle, tous les utilisateurs utiliseront ton Worker.
    - OK si tu acceptes de le maintenir.
    - Sinon, rends `statusUrl` configurable (c’est déjà le cas via Options).

> Si tu veux une extension “grand public” sans Options, la bonne approche est d’héberger ton Worker et de garder un `statusUrl` fixe.  
> Si tu veux une extension “modulable”, garde Options et laisse les gens mettre leur propre Worker.

### 7.2 Publication GitHub (installation manuelle)
Alternative simple :
1. Publie le code sur GitHub
2. Les utilisateurs :
    - téléchargent le zip
    - dézippent
    - chargent l’extension non empaquetée via `chrome://extensions` (mode dev)

✅ gratuit / simple  
❌ pas d’install 1 clic / pas de MAJ auto

---

## 8) Sécurité / Bonnes pratiques
- Ne mets jamais `Client Secret` dans l’extension.
- Les secrets sont UNIQUEMENT dans Cloudflare Worker (Secrets).
- Ne commit jamais des tokens/keys dans GitHub.
- Garde ton Worker simple (une seule route `/?login=`).

---

## 9) Dépannage

### 9.1 Le Worker renvoie toujours `isLive:false` alors que je suis live
- Vérifie le `login` EXACT (celui dans l’URL Twitch)
- Attends 10–30 sec après “Go Live” (parfois petit délai)
- Vérifie que les Secrets sont bien mis (et bien orthographiés)
- Test direct :
  `https://TON_WORKER.workers.dev/?login=TON_LOGIN`

### 9.2 L’extension ne change pas / ne se met pas à jour
- Recharge l’extension : `brave://extensions` → **Recharger**
- Vérifie `host_permissions` dans `manifest.json` :
    - au minimum : `"https://*.workers.dev/*"`
    - idéal : ton domaine exact : `"https://TON_WORKER.workers.dev/*"`

### 9.3 Le background (image) ne s’affiche pas
- Chemin CSS :
    - si fichier : `assets/bglive.png`
    - CSS : `url("assets/bglive.png")`
- Recharge l’extension après modification.

### 9.4 Pas de notifications
- Les notifs apparaissent uniquement quand tu passes OFF → LIVE
- Vérifie la permission `notifications`
- Vérifie les notifications système (Windows / macOS / Linux) et Brave

---

## 10) Exemples prêts à coller

### Exemple pour “monstreamer”
Pour surveiller `https://www.twitch.tv/monstreamer` :

```json
[
  {
    "id": "monstreamer",
    "displayName": "MonStreamer",
    "platform": "twitch_proxy",
    "login": "monstreamer",
    "statusUrl": "https://TON_WORKER.workers.dev/",
    "liveUrl": "https://www.twitch.tv/monstreamer",
    "iconUrl": "icons/icon128.png"
  }
]
```

---

Bon usage 🔥
